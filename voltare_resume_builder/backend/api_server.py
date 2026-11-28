"""
FastAPI Backend API Server for Voltare Resume Builder
Connects the existing Python backend services (validation, layout engine,
HTML renderer, PDF generator) to the React.js frontend.
"""
import os
import re
import sys
import uuid
import base64
import tempfile
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.background import BackgroundTask
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
from backend.resume_masker import mask_resume_file
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
    is_non_technical: Optional[bool] = False


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
        file_id = uuid.uuid4().hex
        output_path = os.path.join(tempfile.gettempdir(), f"voltare_{file_id}.pdf")

        generate_pdf_sync(html_content, output_path)
        verification = verify_pdf(output_path)

        first_name = resume_data.get("personal_info", {}).get("first_name", "Candidate")
        second_name = resume_data.get("personal_info", {}).get("second_name", "")
        download_name = f"Voltare_Resume_{first_name}_{second_name}.pdf".replace(" ", "_")

        return {
            "success": True,
            "verification": verification,
            "filename": download_name,
            "download_url": f"/api/download-pdf?id={file_id}&fn={download_name}",
        }
    except Exception as e:
        # Return error details so frontend can offer HTML fallback
        raise HTTPException(status_code=500, detail=str(e))


def _cleanup_file(path: str) -> None:
    try:
        if os.path.exists(path):
            os.remove(path)
    except OSError:
        pass


@app.get("/api/download-pdf")
def download_pdf(id: Optional[str] = None, fn: Optional[str] = None):
    """Download the generated PDF file (per-request temp file with automatic cleanup)."""
    if id and re.fullmatch(r"[a-f0-9]{32}", id):
        output_path = os.path.join(tempfile.gettempdir(), f"voltare_{id}.pdf")
        cleanup = BackgroundTask(_cleanup_file, output_path)
    else:
        output_path = os.path.join(GENERATED_DIR, "voltare_resume.pdf")
        cleanup = None

    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Generated PDF not found. Please generate it first.")

    filename = fn or "Voltare_Resume.pdf"
    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename=filename,
        background=cleanup,
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
        html_content = render_flexible_html(
            resume_data,
            watermark_base64=watermark_b64,
            layout_overrides=payload.layout_overrides,
            is_non_technical=bool(payload.is_non_technical),
        )
        file_id = uuid.uuid4().hex
        output_path = os.path.join(tempfile.gettempdir(), f"voltare_flex_{file_id}.pdf")

        generate_pdf_sync(html_content, output_path)

        first_name = resume_data.get("personal", {}).get("first_name", "Candidate")
        last_name = resume_data.get("personal", {}).get("last_name", "")
        download_name = f"Voltare_Resume_{first_name}_{last_name}.pdf".replace(" ", "_")

        return {
            "success": True,
            "filename": download_name,
            "download_url": f"/api/download-flexible-pdf?id={file_id}&fn={download_name}",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/download-flexible-pdf")
def download_flexible_pdf(id: Optional[str] = None, fn: Optional[str] = None):
    """Download the generated flexible PDF file (per-request temp file with automatic cleanup)."""
    if id and re.fullmatch(r"[a-f0-9]{32}", id):
        output_path = os.path.join(tempfile.gettempdir(), f"voltare_flex_{id}.pdf")
        cleanup = BackgroundTask(_cleanup_file, output_path)
    else:
        output_path = os.path.join(GENERATED_DIR, "voltare_flexible_resume.pdf")
        cleanup = None

    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Generated PDF not found. Please generate it first.")

    filename = fn or "Voltare_Resume.pdf"
    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename=filename,
        background=cleanup,
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


# ============================================================================
# Admin Authentication & Resume Masking Workspace Endpoints
# ============================================================================

MASKED_STORE: Dict[str, Dict[str, Any]] = {}
MASKED_DIR = os.path.join(tempfile.gettempdir(), "voltare_masked")
os.makedirs(MASKED_DIR, exist_ok=True)


class AdminLoginRequest(BaseModel):
    username: str
    password: str


@app.post("/api/admin/login")
def admin_login(payload: AdminLoginRequest):
    """
    Validate administrator credentials.
    Current development credentials:
    Username: Akashvoltare (case-insensitive)
    Password: U002 or u002 (case-insensitive)
    """
    u = payload.username.strip()
    p = payload.password.strip()
    if u.lower() == "akashvoltare" and p.upper() == "U002":
        session_token = uuid.uuid4().hex
        return {
            "success": True,
            "token": session_token,
            "username": "Akashvoltare",
            "role": "administrator",
            "message": "Authentication successful"
        }
    raise HTTPException(status_code=401, detail="Invalid administrator credentials")


@app.post("/api/admin/mask-resumes")
async def mask_resumes_endpoint(files: List[UploadFile] = File(...)):
    """
    Upload between 1 and 10 resumes (PDF, DOCX) and automatically mask personal information:
    - Phone Number (last 5 digits masked)
    - LinkedIn Profile (profile name masked, URL preserved)
    - Email Address (username before @ masked, domain preserved)
    - GitHub Profile (username masked, URL preserved)
    """
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No resume files uploaded. Please upload at least 1 file.")

    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 resumes can be uploaded and processed simultaneously.")

    results = []
    for file in files:
        filename = file.filename or "resume.pdf"
        name_root, ext = os.path.splitext(filename)
        ext_lower = ext.lower()

        if ext_lower not in [".pdf", ".docx", ".doc"]:
            results.append({
                "file_id": None,
                "original_filename": filename,
                "masked_filename": None,
                "file_type": ext_lower.replace(".", "").upper() or "UNKNOWN",
                "status": "error",
                "error": f"Unsupported format '{ext}'. Only PDF and DOCX files are supported.",
                "stats": None,
                "download_url": None,
            })
            continue

        try:
            content = await file.read()
            if not content:
                results.append({
                    "file_id": None,
                    "original_filename": filename,
                    "masked_filename": None,
                    "file_type": ext_lower.replace(".", "").upper(),
                    "status": "error",
                    "error": "The uploaded file is empty.",
                    "stats": None,
                    "download_url": None,
                })
                continue

            mask_res = mask_resume_file(filename, content)
            file_id = mask_res["file_id"]
            masked_filename = mask_res["masked_filename"]
            masked_bytes = mask_res["masked_bytes"]

            # Save masked output file to disk
            out_path = os.path.join(MASKED_DIR, f"{file_id}_{masked_filename}")
            with open(out_path, "wb") as f_out:
                f_out.write(masked_bytes)

            # Record in metadata store for secure retrieval
            MASKED_STORE[file_id] = {
                "path": out_path,
                "filename": masked_filename,
                "content_type": (
                    "application/pdf"
                    if ext_lower == ".pdf"
                    else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ),
            }

            results.append({
                "file_id": file_id,
                "original_filename": filename,
                "masked_filename": masked_filename,
                "file_type": mask_res["file_type"],
                "original_size": mask_res["original_size"],
                "masked_size": mask_res["masked_size"],
                "status": "success",
                "stats": mask_res["stats"],
                "download_url": f"/api/admin/download-masked/{file_id}",
            })
        except Exception as e:
            results.append({
                "file_id": None,
                "original_filename": filename,
                "masked_filename": None,
                "file_type": ext_lower.replace(".", "").upper(),
                "status": "error",
                "error": f"Masking error: {str(e)}",
                "stats": None,
                "download_url": None,
            })

    successful_count = sum(1 for r in results if r["status"] == "success")

    return {
        "success": True,
        "total_uploaded": len(files),
        "total_processed": len(results),
        "successful_count": successful_count,
        "failed_count": len(results) - successful_count,
        "results": results,
    }


@app.get("/api/admin/download-masked/{file_id}")
def download_masked_file(file_id: str):
    """
    Download an individually processed masked resume.
    Preserves original filename with '_Masked' before file extension.
    """
    meta = MASKED_STORE.get(file_id)
    if not meta or not os.path.exists(meta["path"]):
        raise HTTPException(status_code=404, detail="Masked resume file not found or expired.")

    return FileResponse(
        path=meta["path"],
        media_type=meta["content_type"],
        filename=meta["filename"],
    )


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