
import sys
import base64
import json
import cv2
import numpy as np
from PIL import Image
import io

def analyze_crowd(image_data):
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Load pre-trained models
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Convert to grayscale
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        people_count = len(faces)
        
        # Determine crowd density and risk
        if people_count < 5:
            density = "low"
            risk = "none"
        elif people_count < 15:
            density = "medium"
            risk = "low"
        elif people_count < 30:
            density = "high"
            risk = "medium"
        else:
            density = "critical"
            risk = "high"
        
        # Detect potential behaviors (simplified)
        behaviors = []
        if people_count > 20:
            behaviors.append("congestion")
        if people_count > 40:
            behaviors.append("potential_stampede_risk")
        
        result = {
            "crowd_density": density,
            "estimated_people": people_count,
            "risk_level": risk,
            "detected_behaviors": behaviors,
            "confidence": 0.75
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    # Read base64 image data from stdin
    image_data = sys.stdin.read().strip()
    analyze_crowd(image_data)
