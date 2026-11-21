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
    """Render the live resume preview in Streamlit with zero white margins/borders."""
    import streamlit.components.v1 as components
    from backend.resume_renderer import render_resume_html

    # Get watermark as base64 for embedding
    wm_b64 = get_watermark_base64(watermark_path)

    # Generate HTML
    html = render_resume_html(resume_data, watermark_base64=wm_b64)

    # Inject preview container styling to ensure zero white borders around the page
    # and provide a clean dark backdrop with authentic paper drop shadow
    preview_wrapper = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    *, *:before, *:after {{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }}
    html, body {{
        background-color: #0d0d0d !important;
        margin: 0;
        padding: 10px 0;
        width: 100%;
        display: flex;
        justify-content: center;
        overflow-x: auto;
    }}
    .preview-sheet {{
        background-color: #f7f3ef !important;
        box-shadow: 0 4px 25px rgba(0, 0, 0, 0.7);
        border: none !important;
    }}
</style>
</head>
<body>
<div class="preview-sheet">
{html}
</div>
</body>
</html>"""

    # Display using Streamlit components
    components.html(preview_wrapper, height=1150, scrolling=True)
