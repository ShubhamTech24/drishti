import fetch from 'node-fetch';
import FormData from 'form-data';

const PYTHON_AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000';

export async function analyzeCrowdWithPython(imageBuffer: Buffer) {
  try {
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: 'frame.jpg',
      contentType: 'image/jpeg'
    });

    const response = await fetch(`${PYTHON_AI_SERVICE_URL}/analyze/crowd`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Python AI service error: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Transform Python response to match our analysis format
    return {
      riskLevel: result.analysis.risk_level,
      crowdDensity: result.analysis.crowd_density,
      personCount: result.analysis.person_count,
      densityRatio: result.analysis.density_ratio,
      confidence: result.analysis.analysis_confidence,
      behaviorAnalysis: result.analysis.behavior_analysis,
      recommendations: result.analysis.recommendations,
      summary: `Crowd analysis detected ${result.analysis.crowd_density} density with ${result.analysis.person_count} people`,
      details: result.analysis
    };
  } catch (error) {
    console.error('Python AI service error:', error);
    // Fallback to mock response
    return {
      riskLevel: 'medium',
      crowdDensity: 'medium',
      personCount: 45,
      densityRatio: 0.3,
      confidence: 0.7,
      behaviorAnalysis: { movement_pattern: 'normal' },
      recommendations: ['Continue monitoring'],
      summary: 'Fallback analysis - Python service unavailable',
      details: { error: 'Python service connection failed' }
    };
  }
}

export async function transcribeAudioWithPython(audioBuffer: Buffer) {
  try {
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'audio.wav',
      contentType: 'audio/wav'
    });

    const response = await fetch(`${PYTHON_AI_SERVICE_URL}/analyze/audio`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Python AI service error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.transcription || 'Audio transcription unavailable';
  } catch (error) {
    console.error('Python audio service error:', error);
    return 'Python audio service unavailable';
  }
}

export async function compareFacesWithPython(features1: number[], features2: number[]) {
  try {
    const response = await fetch(`${PYTHON_AI_SERVICE_URL}/compare/faces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        features1,
        features2
      })
    });

    if (!response.ok) {
      throw new Error(`Python AI service error: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      similarity: result.similarity_score,
      isMatch: result.is_match,
      confidence: result.confidence_level
    };
  } catch (error) {
    console.error('Python face comparison error:', error);
    return {
      similarity: 0.5,
      isMatch: false,
      confidence: 'low'
    };
  }
}