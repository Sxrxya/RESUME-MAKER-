"""
FastAPI Backend API Server for Voltare Resume Builder
Connects the existing Python backend services (validation, layout engine,
HTML renderer, PDF generator) to the React.js frontend.
"""
import os
import sys
import base64
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Add project root to path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.resume_renderer import render_resume_html
from backend.validation import validate_all
from backend.layout_engine import validate_layout, get_validation_summary
from backend.watermark_extractor import get_watermark_path, get_watermark_base64, verify_watermark_exists
from backend.pdf_generator import generate_pdf_sync, verify_pdf
from backend.flexible_validation import validate_flexible_resume
from backend.flexible_renderer import render_flexible_html
from frontend.candidate_form import SAMPLE_CANDIDATE_DATA, LIMITS

app = FastAPI(
    title="Voltare Resume Builder API",
    description="Backend API serving the Voltare Resume Builder React application",
    version="1.0.0",
)

# Enable CORS for local React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WATERMARK_PATH = get_watermark_path()
GENERATED_DIR = os.path.join(PROJECT_ROOT, "generated")
os.makedirs(GENERATED_DIR, exist_ok=True)


class ResumePayload(BaseModel):
    data: Dict[str, Any]
    layout_overrides: Optional[Dict[str, Any]] = None


@app.get("/api/health")
def health_check():
    """Health check and watermark status."""
    watermark_exists = verify_watermark_exists()
    return {
        "status": "healthy",
        "watermark_exists": watermark_exists,
    }


@app.get("/api/config")
def get_config():
    """Return field limits, sample template data, and watermark info."""
    watermark_b64 = get_watermark_base64()
    return {
        "limits": LIMITS,
        "sample_data": SAMPLE_CANDIDATE_DATA,
        "watermark_base64": watermark_b64,
        "watermark_exists": bool(watermark_b64),
    }


@app.post("/api/validate")
def validate_resume(payload: ResumePayload):
    """
    Validate candidate resume against character limits, required fields,
    line budgets, and single-page layout overflow.
    """
    resume_data = payload.data
    char_validation = validate_all(resume_data)
    layout_validation = validate_layout(resume_data)
    summary_messages = get_validation_summary(resume_data)

    char_errors = [
        {"field": err.field, "message": err.message, "section": err.section}
        for err in char_validation.errors
    ]

    all_valid = char_validation.is_valid and layout_validation.get("valid", False)

    return {
        "is_valid": all_valid,
        "char_valid": char_validation.is_valid,
        "layout_valid": layout_validation.get("valid", False),
        "char_errors": char_errors,
        "layout_errors": layout_validation.get("errors", []),
        "layout_warnings": layout_validation.get("warnings", []),
        "summary": summary_messages,
    }


@app.post("/api/preview")
def get_preview(payload: ResumePayload):
    """Generate and return the full HTML resume with embedded watermark."""
    watermark_b64 = get_watermark_base64()
    html = render_resume_html(payload.data, watermark_base64=watermark_b64)
    return {"html": html}


@app.post("/api/generate-pdf")
def generate_pdf_endpoint(payload: ResumePayload):
    """
    Generate PDF using backend Playwright engine and verify with PyMuPDF.
    """
    resume_data = payload.data
    char_validation = validate_all(resume_data)
    layout_validation = validate_layout(resume_data)

    if not (char_validation.is_valid and layout_validation.get("valid", False)):
        errors = [f"{e.section}: {e.message}" for e in char_validation.errors] + layout_validation.get("errors", [])
        raise HTTPException(status_code=400, detail={"message": "Validation failed", "errors": errors})

    try:
        html_content = render_resume_html(resume_data, watermark_path=WATERMARK_PATH, layout_overrides=payload.layout_overrides)
        output_filename = "voltare_resume.pdf"
        output_path = os.path.join(GENERATED_DIR, output_filename)

        generate_pdf_sync(html_content, output_path)
        verification = verify_pdf(output_path)

        first_name = resume_data.get("personal_info", {}).get("first_name", "Candidate")
        second_name = resume_data.get("personal_info", {}).get("second_name", "")
        download_name = f"Voltare_Resume_{first_name}_{second_name}.pdf".replace(" ", "_")

        return {
            "success": True,
            "verification": verification,
            "filename": download_name,
            "download_url": f"/api/download-pdf?fn={download_name}",
        }
    except Exception as e:
        # Return error details so frontend can offer HTML fallback
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/download-pdf")
def download_pdf(fn: Optional[str] = None):
    """Download the generated PDF file."""
    output_path = os.path.join(GENERATED_DIR, "voltare_resume.pdf")
    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Generated PDF not found. Please generate it first.")

    filename = fn or "Voltare_Resume.pdf"
    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename=filename,
    )


@app.post("/api/download-html")
def download_html(payload: ResumePayload):
    """Download the standalone HTML resume with embedded watermark for printing."""
    resume_data = payload.data
    watermark_b64 = get_watermark_base64()
    html_content = render_resume_html(resume_data, watermark_base64=watermark_b64)

    first_name = resume_data.get("personal_info", {}).get("first_name", "Candidate")
    second_name = resume_data.get("personal_info", {}).get("second_name", "")
    filename = f"Voltare_Resume_{first_name}_{second_name}.html".replace(" ", "_")

    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }
    return Response(content=html_content, media_type="text/html", headers=headers)


@app.post("/api/generate-flexible-pdf")
def generate_flexible_pdf_endpoint(payload: ResumePayload):
    """
    Generate single-page PDF for Mode 2 & Mode 3 using backend Playwright engine.
    """
    resume_data = payload.data
    validation = validate_flexible_resume(resume_data)

    if not validation.is_valid:
        errors = [f"{e.section}: {e.message}" for e in validation.errors]
        raise HTTPException(status_code=400, detail={"message": "Validation failed", "errors": errors})

    try:
        watermark_b64 = get_watermark_base64()
        html_content = render_flexible_html(resume_data, watermark_base64=watermark_b64, layout_overrides=payload.layout_overrides)
        output_filename = "voltare_flexible_resume.pdf"
        output_path = os.path.join(GENERATED_DIR, output_filename)

        generate_pdf_sync(html_content, output_path)

        first_name = resume_data.get("personal", {}).get("first_name", "Candidate")
        last_name = resume_data.get("personal", {}).get("last_name", "")
        download_name = f"Voltare_Resume_{first_name}_{last_name}.pdf".replace(" ", "_")

        return {
            "success": True,
            "filename": download_name,
            "download_url": f"/api/download-flexible-pdf?fn={download_name}",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/download-flexible-pdf")
def download_flexible_pdf(fn: Optional[str] = None):
    """Download the generated flexible PDF file."""
    output_path = os.path.join(GENERATED_DIR, "voltare_flexible_resume.pdf")
    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Generated PDF not found. Please generate it first.")

    filename = fn or "Voltare_Resume.pdf"
    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename=filename,
    )


@app.post("/api/validate-flexible")
def validate_flexible_endpoint(payload: ResumePayload):
    """Validate flexible resume data and return budget metrics."""
    result = validate_flexible_resume(payload.data)
    return {
        "is_valid": result.is_valid,
        "errors": [{"field": e.field, "message": e.message, "section": e.section} for e in result.errors],
        "warnings": result.warnings,
        "recommendations": result.recommendations,
        "progress_percent": result.progress_percent,
        "can_download_pdf": result.can_download_pdf,
        "capacity_percent": result.capacity_percent,
        "density_mode": result.density_mode,
        "trim_suggestion": result.trim_suggestion,
    }


@app.post("/api/render-flexible-html")
def render_flexible_html_endpoint(payload: ResumePayload):
    """Render standalone HTML for flexible resume with embedded watermark."""
    watermark_b64 = get_watermark_base64()
    html_content = render_flexible_html(payload.data, watermark_base64=watermark_b64)
    return {"html": html_content}


@app.post("/api/download-flexible-html")
def download_flexible_html(payload: ResumePayload):
    """Download the standalone flexible HTML resume for printing or archiving."""
    resume_data = payload.data
    watermark_b64 = get_watermark_base64()
    html_content = render_flexible_html(resume_data, watermark_base64=watermark_b64)

    first_name = resume_data.get("personal", {}).get("first_name", "Candidate")
    last_name = resume_data.get("personal", {}).get("last_name", "")
    filename = f"Voltare_Flexible_Resume_{first_name}_{last_name}.html".replace(" ", "_")

    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }
    return Response(content=html_content, media_type="text/html", headers=headers)



# Serve built React static files if dist exists
REACT_DIST_DIR = os.path.join(PROJECT_ROOT, "frontend_react", "dist")
if os.path.exists(REACT_DIST_DIR):
    app.mount("/", StaticFiles(directory=REACT_DIST_DIR, html=True), name="static")
else:
    @app.get("/")
    def root_fallback():
        return {
            "name": "Voltare Resume Builder API",
            "status": "online",
            "docs": "/docs",
            "message": "Frontend build (dist) not found. Run 'npm run build' inside voltare_resume_builder/frontend_react, or run 'streamlit run app.py' for the Streamlit interface."
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)        