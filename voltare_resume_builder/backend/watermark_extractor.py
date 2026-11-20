"""Watermark extraction and processing for Voltare resume builder."""
import base64
import os
from typing import Optional


def get_watermark_path() -> str:
    """Get the path to the original watermark image."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, "templates", "assets", "original_watermark.png")


def get_watermark_base64() -> str:
    """Get the watermark image as a base64 string."""
    path = get_watermark_path()
    if not os.path.exists(path):
        return ""
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def verify_watermark_exists() -> bool:
    """Check if the watermark file exists."""
    return os.path.exists(get_watermark_path())


def get_watermark_info() -> dict:
    """Get information about the watermark image."""
    path = get_watermark_path()
    if not os.path.exists(path):
        return {"exists": False}
    
    try:
        from PIL import Image
        with Image.open(path) as img:
            return {
                "exists": True,
                "path": path,
                "width": img.width,
                "height": img.height,
                "mode": img.mode,
                "format": img.format,
            }
    except ImportError:
        return {
            "exists": True,
            "path": path,
            "size_bytes": os.path.getsize(path),
        }
