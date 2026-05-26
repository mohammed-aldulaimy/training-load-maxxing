import uvicorn
import os

if __name__ == "__main__":
    print("[BACKEND] Starting Athlete Dashboard Backend Service...")
    # Run the Uvicorn web server in reload mode
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
