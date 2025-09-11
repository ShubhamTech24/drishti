from flask import Flask, request
import os
import cv2
import numpy as np
from collections import OrderedDict

# --- Centroid Tracker ---
class CentroidTracker:
    def __init__(self, max_disappeared=40, max_distance=50):
        self.next_object_id = 0
        self.objects = OrderedDict()
        self.disappeared = OrderedDict()
        self.max_disappeared = max_disappeared
        self.max_distance = max_distance
        self.total_count = 0

    def register(self, centroid):
        self.objects[self.next_object_id] = centroid
        self.disappeared[self.next_object_id] = 0
        self.total_count += 1
        self.next_object_id += 1

    def deregister(self, object_id):
        del self.objects[object_id]
        del self.disappeared[object_id]

    def update(self, rects):
        if len(rects) == 0:
            for object_id in list(self.disappeared.keys()):
                self.disappeared[object_id] += 1
                if self.disappeared[object_id] > self.max_disappeared:
                    self.deregister(object_id)
            return self.objects, self.total_count

        input_centroids = np.zeros((len(rects), 2), dtype="int")
        for (i, (x1, y1, x2, y2)) in enumerate(rects):
            cX = int((x1 + x2) / 2.0)
            cY = int((y1 + y2) / 2.0)
            input_centroids[i] = (cX, cY)

        if len(self.objects) == 0:
            for i in range(0, len(input_centroids)):
                self.register(input_centroids[i])
        else:
            object_ids = list(self.objects.keys())
            object_centroids = list(self.objects.values())
            D = np.linalg.norm(np.array(object_centroids)[:, None] - input_centroids, axis=2)
            rows = D.min(axis=1).argsort()
            cols = D.argmin(axis=1)[rows]

            used_rows, used_cols = set(), set()
            for (row, col) in zip(rows, cols):
                if row in used_rows or col in used_cols:
                    continue
                if D[row, col] > self.max_distance:
                    continue
                object_id = object_ids[row]
                self.objects[object_id] = input_centroids[col]
                self.disappeared[object_id] = 0
                used_rows.add(row)
                used_cols.add(col)

            unused_cols = set(range(0, len(input_centroids))).difference(used_cols)
            for col in unused_cols:
                self.register(input_centroids[col])

            unused_rows = set(range(0, len(object_ids))).difference(used_rows)
            for row in unused_rows:
                object_id = object_ids[row]
                self.disappeared[object_id] += 1
                if self.disappeared[object_id] > self.max_disappeared:
                    self.deregister(object_id)

        return self.objects, self.total_count


# --- Crowd Counter ---
class CrowdDensityCounter:
    def __init__(self):
        self.hog = cv2.HOGDescriptor()
        self.hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
        self.tracker = CentroidTracker()

    def detect_persons(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        boxes, _ = self.hog.detectMultiScale(gray, winStride=(8, 8), padding=(8, 8), scale=1.05)
        persons = [(x, y, x + w, y + h) for (x, y, w, h) in boxes]
        return persons

    def process_video(self, video_path):
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return -1

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            persons = self.detect_persons(frame)
            _, total_unique = self.tracker.update(persons)
            cv2.putText(frame,
                        f"Current: {len(persons)} | Total Unique: {total_unique}",
                        (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.8,
                        (0, 0, 255),
                        2)
            cv2.imshow("Crowd Density Counter", frame)
            if cv2.waitKey(25) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()
        return self.tracker.total_count


# --- Flask App ---
app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Serve index.html directly
@app.route("/", methods=["GET"])
def index():
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.route("/", methods=["POST"])
def upload_file():
    if "video" not in request.files or request.files["video"].filename == "":
        with open("index.html", "r", encoding="utf-8") as f:
            return f.read().replace("{{result}}", "❌ Please upload a video")

    file = request.files["video"]
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    counter = CrowdDensityCounter()
    unique_count = counter.process_video(filepath)

    with open("index.html", "r", encoding="utf-8") as f:
        return f.read().replace("{{result}}", f"✅ Unique people counted: {unique_count}")

if __name__ == "__main__":
    app.run(debug=True)
