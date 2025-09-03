
from flask import Flask, request, jsonify
import cv2
import numpy as np
from PIL import Image
import io
import base64
import json

app = Flask(__name__)

# Example: Simple crowd density estimation using OpenCV
@app.route('/analyze-crowd', methods=['POST'])
def analyze_crowd():
    try:
        # Get image data from request
        data = request.json
        image_data = base64.b64decode(data['image'])
        
        # Convert to OpenCV format
        image = Image.open(io.BytesIO(image_data))
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Simple people detection using Haar cascades
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        body_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_fullbody.xml')
        
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        bodies = body_cascade.detectMultiScale(gray, 1.1, 4)
        
        # Estimate crowd density
        people_count = max(len(faces), len(bodies))
        
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
        
        return jsonify({
            "crowd_density": density,
            "estimated_people": people_count,
            "risk_level": risk,
            "detected_behaviors": [],
            "confidence": 0.8
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Audio transcription using speech recognition
@app.route('/transcribe-audio', methods=['POST'])
def transcribe_audio():
    try:
        import speech_recognition as sr
        
        # Get audio file from request
        audio_file = request.files['audio']
        
        # Initialize recognizer
        r = sr.Recognizer()
        
        # Use the audio file as the audio source
        with sr.AudioFile(audio_file) as source:
            audio = r.record(source)
        
        # Recognize speech using Google Speech Recognition
        text = r.recognize_google(audio, language='hi-IN')  # Hindi
        
        return jsonify({"text": text})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
