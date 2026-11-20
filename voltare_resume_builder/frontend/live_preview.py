"""Live resume preview component for Streamlit."""
import base64
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def get_watermark_base64(watermark_path: str) -> str:
    """Read watermark PNG and return base64 string."""
    if not os.path.exists(watermark_path):
        return ""
    with open(watermark_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def render_live_preview(st, resume_data: dict, watermark_path: str):
    """Render the live resume preview in Streamlit."""
    import streamlit.components.v1 as components
    from backend.resume_renderer import render_resume_html

    # Get watermark as base64 for embedding
    wm_b64 = get_watermark_base64(watermark_path)

    # Generate HTML
    html = render_resume_html(resume_data, watermark_base64=wm_b64)

    # Wrap in a scaled container for preview
    preview_html = f"""<!DOCTYPE html>
<html>
<head>
<style>
    body {{
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        background: #2a2a2a;
    }}
    .page-wrapper {{
        transform-origin: top center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        background: white;
    }}
</style>
</head>
<body>
<div class="page-wrapper">
{html}
</div>
</body>
</html>"""

    # Display using Streamlit components
    components.html(preview_html, height=1050, scrolling=True)
