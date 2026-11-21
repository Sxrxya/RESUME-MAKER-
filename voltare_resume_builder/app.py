"""
VOLTARE — Official Resume Builder
Main Streamlit Application

A controlled resume generation platform for Voltare Consultancy.
Candidates enter information into predefined fields and receive
a professional PDF in the official Voltare resume format.
"""
import streamlit as st
import os
import sys
import time

# Add project root to path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

from frontend.branding import apply_branding, render_header
from frontend.candidate_form import render_candidate_form, load_sample_data, clear_form_data, init_form_data
from frontend.live_preview import render_live_preview, get_watermark_base64
from frontend.components import validation_message
from backend.resume_renderer import render_resume_html
from backend.validation import validate_all
from backend.layout_engine import validate_layout, get_validation_summary
from backend.watermark_extractor import get_watermark_path, verify_watermark_exists

# ─────────────────────────────────────────────────────────
# Page Configuration
# ─────────────────────────────────────────────────────────
st.set_page_config(
    page_title="VOLTARE — Official Resume Builder",
    page_icon="✦",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Apply Voltare branding
apply_branding(st)

# ─────────────────────────────────────────────────────────
# Header
# ─────────────────────────────────────────────────────────
render_header(st)

# ─────────────────────────────────────────────────────────
# Watermark check
# ─────────────────────────────────────────────────────────
WATERMARK_PATH = get_watermark_path()
if not verify_watermark_exists():
    st.error("⚠️ Original Voltare watermark not found. Please ensure `templates/assets/original_watermark.png` exists.")
    st.stop()

# Initialize form with official reference template data on first load
init_form_data(st)

# ─────────────────────────────────────────────────────────
# Two-panel layout
# ─────────────────────────────────────────────────────────
left_col, right_col = st.columns([1, 1], gap="large")

# ─────────────────────────────────────────────────────────
# LEFT PANEL — Candidate Input Form
# ─────────────────────────────────────────────────────────
with left_col:
    st.markdown("## ✍️ Candidate Information")
    
    col_btn1, col_btn2 = st.columns([1, 1])
    with col_btn1:
        if st.button("📋 Load Official Template Data", use_container_width=True):
            load_sample_data(st)
            st.rerun()
    with col_btn2:
        if st.button("🧹 Clear Form", use_container_width=True):
            clear_form_data(st)
            st.rerun()

    st.markdown(
        '*<span style="color:#888;font-size:12px;">Fill in all required fields '
        '(marked with 🔴). Character limits are strictly enforced.</span>*',
        unsafe_allow_html=True,
    )

    # Render the entire form
    resume_data = render_candidate_form(st)

    # ─────────────────────────────────────────────────────
    # Validation & PDF Generation
    # ─────────────────────────────────────────────────────
    st.markdown("---")
    st.markdown("### 📋 Validation & Export")

    # Run validations
    char_validation = validate_all(resume_data)
    layout_validation = validate_layout(resume_data)
    layout_messages = get_validation_summary(resume_data)

    # Display validation status
    if char_validation.is_valid and layout_validation["valid"]:
        validation_message(st, "✅ All validations passed. Resume is ready for export.", is_error=False)
    else:
        shown_errors = set()
        if not char_validation.is_valid:
            for err in char_validation.errors:
                msg = f"❌ {err.section}: {err.message}"
                if msg not in shown_errors:
                    shown_errors.add(msg)
                    validation_message(st, msg, is_error=True)
        if not layout_validation["valid"]:
            for err in layout_validation["errors"]:
                msg = f"❌ {err}"
                if msg not in shown_errors:
                    shown_errors.add(msg)
                    validation_message(st, msg, is_error=True)

    # PDF Generation button
    all_valid = char_validation.is_valid and layout_validation["valid"]

    if st.button("📄 Generate PDF Resume", disabled=not all_valid, use_container_width=True):
        with st.spinner("Generating PDF..."):
            try:
                # Generate HTML
                html_content = render_resume_html(resume_data, watermark_path=WATERMARK_PATH)

                # Try Playwright PDF generation
                try:
                    from backend.pdf_generator import generate_pdf_sync, verify_pdf

                    output_path = os.path.join(PROJECT_ROOT, "generated", "voltare_resume.pdf")
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)

                    generate_pdf_sync(html_content, output_path)

                    # Verify the PDF
                    verification = verify_pdf(output_path)
                    if verification["valid"]:
                        with open(output_path, "rb") as f:
                            pdf_bytes = f.read()

                        first_name = resume_data.get("personal_info", {}).get("first_name", "Candidate")
                        second_name = resume_data.get("personal_info", {}).get("second_name", "")
                        filename = f"Voltare_Resume_{first_name}_{second_name}.pdf".replace(" ", "_")

                        st.download_button(
                            label="⬇️ Download PDF Resume",
                            data=pdf_bytes,
                            file_name=filename,
                            mime="application/pdf",
                            use_container_width=True,
                        )
                        st.success("✅ PDF generated successfully!")
                    else:
                        for err in verification["errors"]:
                            st.error(f"PDF verification failed: {err}")

                except ImportError:
                    # Playwright not installed — offer HTML download
                    st.warning(
                        "⚠️ Playwright is not installed. Install it with:\n"
                        "```\npip install playwright\nplaywright install chromium\n```\n"
                        "Offering HTML download as an alternative."
                    )

                    first_name = resume_data.get("personal_info", {}).get("first_name", "Candidate")
                    second_name = resume_data.get("personal_info", {}).get("second_name", "")
                    filename = f"Voltare_Resume_{first_name}_{second_name}.html".replace(" ", "_")

                    st.download_button(
                        label="⬇️ Download HTML Resume (Print to PDF)",
                        data=html_content,
                        file_name=filename,
                        mime="text/html",
                        use_container_width=True,
                    )
                    st.info(
                        "💡 Open the HTML file in Chrome/Edge, press **Ctrl+P**, "
                        "set Paper Size to **Letter**, enable **Background graphics**, "
                        "set Margins to **None**, and save as PDF."
                    )

                except Exception as e:
                    st.error(f"PDF generation failed: {str(e)}")
                    # Fallback to HTML download
                    st.download_button(
                        label="⬇️ Download HTML Resume (Fallback)",
                        data=html_content,
                        file_name="Voltare_Resume.html",
                        mime="text/html",
                        use_container_width=True,
                    )

            except Exception as e:
                st.error(f"Error: {str(e)}")

    if not all_valid:
        st.markdown(
            '<div class="validation-error">⚠️ Fix all validation errors above before generating PDF.</div>',
            unsafe_allow_html=True,
        )

# ─────────────────────────────────────────────────────────
# RIGHT PANEL — Live Resume Preview
# ─────────────────────────────────────────────────────────
with right_col:
    st.markdown("## 📄 Live Resume Preview")
    st.markdown(
        '*<span style="color:#888;font-size:12px;">This preview updates as you type. '
        "The exported PDF will match this preview exactly.</span>*",
        unsafe_allow_html=True,
    )

    render_live_preview(st, resume_data, WATERMARK_PATH)

# ─────────────────────────────────────────────────────────
# Footer
# ─────────────────────────────────────────────────────────
st.markdown("---")
st.markdown(
    '<div style="text-align:center;color:#555;font-size:11px;font-family:\'Cormorant Garamond\',serif;">'
    "VOLTARE Consultancy — Official Resume Builder &nbsp;|&nbsp; "
    "All resumes follow the standardized Voltare format &nbsp;|&nbsp; "
    '<a href="https://www.voltare.in/" style="color:#c9a84c;">voltare.in</a>'
    "</div>",
    unsafe_allow_html=True,
)
