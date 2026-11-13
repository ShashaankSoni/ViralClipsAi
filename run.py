import os
import sys
import uvicorn
from pathlib import Path

# Add backend to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR / "backend"))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "127.0.0.1")
    print("=" * 60)
    print("🚀 VIRALCLIP STUDIO - AI Shorts & Reels Generator")
    print(f"👉 API Server: http://{host}:{port}")
    print(f"👉 Swagger Docs: http://{host}:{port}/docs")
    print("=" * 60)
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=True)
