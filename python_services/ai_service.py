"""
AI Service for Mahakumbh 2028 Crowd Monitoring System
Provides computer vision and AI analysis endpoints
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from PIL import Image
import io
import base64
from typing import Dict, List, Any
import json
import os
from scipy.spatial.distance import cosine
from sklearn.cluster import DBSCAN
import requests

app = FastAPI(
    title="Drishti AI Service",
    description="AI-powered crowd monitoring and analysis for Mahakumbh 2028",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CrowdAnalyzer:
    """Advanced crowd analysis using computer vision"""
    
    def __init__(self):
        # Initialize Haar Cascade for person detection
        try:
            self.person_cascade = cv2.CascadeClassifier('haarcascade_fullbody.xml')
            self.face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
        except:
            # Fallback to basic detection if cascades not available
            self.person_cascade = None
            self.face_cascade = None
    
    def analyze_crowd_density(self, image: np.ndarray) -> Dict[str, Any]:
        """Analyze crowd density in image"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Detect people and faces using Haar Cascade if available
        people = []
        faces = []
        
        if self.person_cascade is not None:
            people = self.person_cascade.detectMultiScale(
                gray, 
                scaleFactor=1.1, 
                minNeighbors=3,
                minSize=(30, 30)
            )
        
        if self.face_cascade is not None:
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(20, 20)
            )
        
        height, width = image.shape[:2]
        total_area = height * width
        
        # Calculate crowd metrics
        person_count = max(len(people), len(faces))
        crowd_area = sum([w * h for (x, y, w, h) in people])
        density_ratio = crowd_area / total_area if total_area > 0 else 0
        
        # Determine density level
        if density_ratio > 0.6 or person_count > 50:
            density_level = "critical"
            risk_level = "high"
        elif density_ratio > 0.4 or person_count > 30:
            density_level = "high"
            risk_level = "medium"
        elif density_ratio > 0.2 or person_count > 15:
            density_level = "medium"
            risk_level = "low"
        else:
            density_level = "low"
            risk_level = "none"
        
        # Detect potential crowd behavior issues
        behavior_analysis = self._analyze_crowd_behavior(people, faces, image)
        
        return {
            "crowd_density": density_level,
            "person_count": person_count,
            "density_ratio": round(density_ratio, 3),
            "risk_level": risk_level,
            "analysis_confidence": 0.85,
            "behavior_analysis": behavior_analysis,
            "recommendations": self._generate_recommendations(density_level, risk_level, behavior_analysis)
        }
    
    def _analyze_crowd_behavior(self, people, faces, image: np.ndarray) -> Dict[str, Any]:
        """Analyze crowd movement and behavior patterns"""
        behavior = {
            "movement_pattern": "normal",
            "congestion_areas": [],
            "potential_bottlenecks": False,
            "panic_indicators": False
        }
        
        if len(people) > 0:
            # Analyze clustering
            centers = [(x + w//2, y + h//2) for (x, y, w, h) in people]
            if len(centers) > 5:
                clustering = DBSCAN(eps=50, min_samples=3).fit(centers)
                unique_clusters = len(set(clustering.labels_)) - (1 if -1 in clustering.labels_ else 0)
                
                if unique_clusters > 3:
                    behavior["movement_pattern"] = "clustered"
                    behavior["congestion_areas"] = [f"Zone {i+1}" for i in range(unique_clusters)]
                
                # Check for potential bottlenecks
                if len(people) > 20 and unique_clusters < 2:
                    behavior["potential_bottlenecks"] = True
        
        return behavior
    
    def _generate_recommendations(self, density: str, risk: str, behavior: Dict) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if density == "critical":
            recommendations.extend([
                "IMMEDIATE: Deploy crowd control volunteers",
                "Activate emergency protocols",
                "Consider temporary entry restrictions"
            ])
        elif density == "high":
            recommendations.extend([
                "Increase volunteer presence in area",
                "Monitor for bottleneck formation",
                "Prepare contingency measures"
            ])
        elif density == "medium":
            recommendations.append("Continue regular monitoring")
        
        if behavior.get("potential_bottlenecks"):
            recommendations.append("Address potential bottleneck points")
        
        if behavior.get("movement_pattern") == "clustered":
            recommendations.append("Guide crowd distribution to reduce clustering")
        
        return recommendations

class FaceRecognitionService:
    """Face recognition for lost person identification"""
    
    def __init__(self):
        try:
            self.face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
        except:
            self.face_cascade = None
    
    def extract_face_features(self, image: np.ndarray) -> List[Dict]:
        """Extract facial features from image"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 5)
        
        face_data = []
        for (x, y, w, h) in faces:
            face_roi = gray[y:y+h, x:x+w]
            # Simple feature extraction using histogram
            features = cv2.calcHist([face_roi], [0], None, [256], [0, 256]).flatten()
            
            face_data.append({
                "bbox": [int(x), int(y), int(w), int(h)],
                "features": features.tolist(),
                "confidence": 0.8
            })
        
        return face_data
    
    def compare_faces(self, features1: List[float], features2: List[float]) -> float:
        """Compare two face feature vectors"""
        if len(features1) != len(features2):
            return 0.0
        
        # Use cosine similarity
        similarity = 1 - cosine(features1, features2)
        return max(0.0, similarity)

# Initialize services
crowd_analyzer = CrowdAnalyzer()
face_service = FaceRecognitionService()

@app.get("/")
async def root():
    return {"message": "Drishti AI Service - Mahakumbh 2028", "status": "active"}

@app.post("/analyze/crowd")
async def analyze_crowd(file: UploadFile = File(...)):
    """Analyze crowd density and behavior in uploaded image"""
    try:
        # Read and process image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        image_array = np.array(image)
        
        # Convert RGB to BGR for OpenCV
        if len(image_array.shape) == 3:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
        
        # Perform crowd analysis
        analysis = crowd_analyzer.analyze_crowd_density(image_array)
        
        return {
            "success": True,
            "analysis": analysis,
            "timestamp": "2025-01-22T12:00:00Z"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze/faces")
async def analyze_faces(file: UploadFile = File(...)):
    """Extract facial features for lost person identification"""
    try:
        # Read and process image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        image_array = np.array(image)
        
        # Convert RGB to BGR for OpenCV
        if len(image_array.shape) == 3:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
        
        # Extract face features
        faces = face_service.extract_face_features(image_array)
        
        return {
            "success": True,
            "faces_detected": len(faces),
            "face_data": faces,
            "timestamp": "2025-01-22T12:00:00Z"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face analysis failed: {str(e)}")

@app.post("/compare/faces")
async def compare_faces(face_data: Dict[str, Any]):
    """Compare face features for lost person matching"""
    try:
        features1 = face_data.get("features1", [])
        features2 = face_data.get("features2", [])
        
        if not features1 or not features2:
            raise HTTPException(status_code=400, detail="Missing face features")
        
        similarity = face_service.compare_faces(features1, features2)
        
        # Determine match confidence
        match_threshold = 0.8
        is_match = similarity >= match_threshold
        confidence_level = "high" if similarity > 0.9 else "medium" if similarity > 0.7 else "low"
        
        return {
            "success": True,
            "similarity_score": round(similarity, 3),
            "is_match": is_match,
            "confidence_level": confidence_level,
            "match_threshold": match_threshold
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face comparison failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Drishti AI Service",
        "version": "1.0.0",
        "capabilities": [
            "crowd_density_analysis",
            "behavior_detection", 
            "face_recognition",
            "lost_person_matching"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)