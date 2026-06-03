import os
import sys

_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
_VENV_PYTHON = os.path.join(_BACKEND_DIR, ".venv", "bin", "python3.14")


def _reexec_in_venv_if_needed() -> None:
    if not os.path.isfile(_VENV_PYTHON):
        return
    if os.path.realpath(sys.executable) == os.path.realpath(_VENV_PYTHON):
        return
    os.execv(_VENV_PYTHON, [_VENV_PYTHON, os.path.abspath(__file__), *sys.argv[1:]])


_reexec_in_venv_if_needed()

import uvicorn

if __name__ == "__main__":
    print("[BACKEND] Starting Athlete Dashboard Backend Service...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
