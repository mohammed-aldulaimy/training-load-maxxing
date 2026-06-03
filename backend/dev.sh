#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [[ -n "${PYTHON:-}" && -x "${PYTHON}" ]]; then
  :
elif [[ -x /usr/bin/python3.14 ]]; then
  PYTHON=/usr/bin/python3.14
elif command -v python3.14 >/dev/null 2>&1; then
  PYTHON="$(command -v python3.14)"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON="$(command -v python3)"
else
  echo "Python 3 not found. Install python3.14 and retry." >&2
  exit 1
fi

if [[ ! -x .venv/bin/python3.14 ]]; then
  echo "Creating virtual environment..."
  "$PYTHON" -m venv .venv
fi

if ! .venv/bin/python3.14 -c "import google.generativeai" >/dev/null 2>&1; then
  echo "Installing dependencies..."
  .venv/bin/python3.14 -m pip install -r requirements.txt
fi

exec .venv/bin/python3.14 run.py
