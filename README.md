# VOLTARE — Strict-Format One-Page Resume Builder

Official controlled resume generation platform for **Voltare Consultancy**.

Candidates enter their information into predefined input fields. The application validates character and line budgets in real time to ensure content fits strictly onto **exactly one A4 portrait page** while preserving the authentic Voltare soft-mask pale-pink watermark, typography, section ordering, and dividers.

---

## 🚀 Features

- **Exact Single-Page A4 Guarantee**: Strict character and line limit validation prevents overflow beyond the single page.
- **Authentic Voltare Watermark**: Preserves the original 8-bit soft-mask pale-pink wing watermark behind text.
- **Real-Time Live Preview**: Two-panel Streamlit desktop interface displaying immediate updates as you type.
- **Pixel-Free Candidate Validation**: Validation reports clear, actionable guidance strictly in **characters** and **lines** (no technical pixel or point jargon).
- **Production PDF Generation**: High-fidelity Chromium/Playwright PDF rendering with automated PyMuPDF page-budget verification.
- **Dual Design Systems**:
  - **Resume Document**: Exact reproduction of the official Voltare PDF layout and typography.
  - **Application UI**: Dark luxury branding inspired by [voltare.in](https://www.voltare.in/) (obsidian `#0d0d0d`, warm gold `#c9a84c`, Cormorant SC).

---

## 🛠️ Project Structure

```
├── .gitignore
├── README.md
├── reference_resume.pdf
└── voltare_resume_builder/
    ├── app.py                      # Main Streamlit application
    ├── requirements.txt            # Python dependencies
    ├── README.md                   # Builder-specific documentation
    ├── backend/
    │   ├── resume_data.py          # Data models
    │   ├── validation.py           # Character and line validation engine
    │   ├── layout_engine.py        # Line budget and space verification
    │   ├── resume_renderer.py      # HTML/CSS generator with watermark
    │   ├── pdf_generator.py        # Playwright PDF export & PyMuPDF check
    │   ├── watermark_extractor.py  # Soft-mask alpha extractor
    │   └── template_parser.py      # Geometry parser
    ├── config/
    │   ├── field_limits.json       # Centralized character and line budgets
    │   └── template_config.json    # Exact layout coordinates & dividers
    ├── frontend/
    │   ├── branding.py             # Voltare.in styling & CSS
    │   ├── candidate_form.py       # Streamlit input forms & default template data
    │   ├── components.py           # Input widgets with live character counters
    │   └── live_preview.py         # Real-time resume preview renderer
    ├── templates/
    │   └── assets/
    │       └── original_watermark.png
    └── tests/                      # 53 comprehensive unit tests
```

---

## 💻 Quick Start

### 1. Install Dependencies

```bash
cd voltare_resume_builder
pip install -r requirements.txt
playwright install chromium
```

### 2. Run the Application

```bash
streamlit run app.py
```

Open `http://localhost:8501` in your browser.

---

## 🧪 Run Unit Tests

```bash
cd voltare_resume_builder
python -m unittest discover -s tests -p "test_*.py"
```
