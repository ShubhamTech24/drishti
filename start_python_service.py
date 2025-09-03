#!/usr/bin/env python3
"""
Startup script for Drishti Python AI Service
"""

import subprocess
import sys
import os

def main():
    """Start the Python AI service"""
    print("🕉️  Starting Drishti Python AI Service for Mahakumbh 2028...")
    
    # Change to python_services directory
    service_dir = os.path.join(os.path.dirname(__file__), 'python_services')
    
    # Start the FastAPI service with uvicorn
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "ai_service:app", 
            "--host", "0.0.0.0", 
            "--port", "8000",
            "--reload"
        ], cwd=service_dir, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start Python service: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 Python AI service stopped")

if __name__ == "__main__":
    main()