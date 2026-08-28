"""
Vercel Serverless Function Entry Point for AgriConnect FastAPI Application.
Exposes the ASGI app instance for Vercel's Python runtime.
"""
import sys
import os

# Ensure the backend directory is in the Python module search path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import the FastAPI application instance from backend/main.py
from main import app
