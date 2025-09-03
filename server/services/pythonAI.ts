
import { spawn } from "child_process";
import path from "path";

export async function analyzeCrowdWithPython(imageBuffer: Buffer): Promise<{
  crowd_density: string;
  estimated_people: number;
  risk_level: string;
  detected_behaviors: string[];
  confidence: number;
}> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'python_ai', 'crowd_analysis.py');
    const python = spawn('python3', [pythonScript]);
    
    let result = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        try {
          const analysis = JSON.parse(result);
          resolve(analysis);
        } catch (e) {
          reject(new Error(`Failed to parse Python output: ${e}`));
        }
      } else {
        reject(new Error(`Python script failed: ${error}`));
      }
    });
    
    // Send image data to Python script
    python.stdin.write(imageBuffer.toString('base64'));
    python.stdin.end();
  });
}

export async function transcribeAudioWithPython(audioBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'python_ai', 'audio_transcription.py');
    const python = spawn('python3', [pythonScript]);
    
    let result = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        resolve(result.trim());
      } else {
        reject(new Error(`Python transcription failed: ${error}`));
      }
    });
    
    python.stdin.write(audioBuffer.toString('base64'));
    python.stdin.end();
  });
}
