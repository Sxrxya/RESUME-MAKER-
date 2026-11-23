"""
Main entrypoint for FastAPI on Vercel and local Uvicorn.
Re-exports the FastAPI app from backend.api_server.
"""
from backend.api_server import app

__all__ = ["app"]
