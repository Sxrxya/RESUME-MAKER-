# VOLTARE — STRICT-FORMAT ONE-PAGE RESUME BUILDER

A controlled, production-quality resume generation platform for **Voltare Consultancy** built with Python and Streamlit.

---

## Overview

Unlike conventional resume builders that grant candidates creative freedom over layouts, styling, sections, or lengths, this application enforces strict corporate compliance:
- **Exactly One Page** (US Letter / A4 portrait proportions derived directly from the official PDF reference).
- **Exact Layout & Geometry**: Reconstructed from programmatic inspection of the official reference PDF (`612 x 792 pt`, exact divider lines, margins, and content boundaries).
- **Original Pink Voltare Watermark**: Extracted at full native resolution (`2055 x 1929 px`) and placed at the precise PDF coordinates (`bbox: [59.64, 164.28, 553.56, 627.72]`) behind text with exact transparency.
- **Strict Character & Visual-Space Limits**: Dual validation system ensuring candidates never overflow their allocated vertical height or character budgets.
- **Voltare.in Brand Identity**: Application UI styled with a warm cream background (`#F7F3EF`), burgundy accents (`#7D1128`), and classic typography (`Cormorant SC` and `Cormorant Garamond`).
- **Blank Form by Default**: Candidate fields start empty; use **Load Official Template Data** to fill them with sample content.

---

## Project Structure

```
voltare_resume_builder/
│
├── app.py                      # Main Streamlit application
├── requirements.txt            # Python dependencies
├── README.md                   # Project documentation
│
├── config/
│   ├── field_limits.json       # Centralized character, line, and field restrictions
│   └── template_config.json    # Exact PDF geometry, margins, dividers, and typography
│
├── backend/
│   ├── __init__.py
│   ├── resume_data.py          # Pydantic v2 data models with fixed allocations
│   ├── pdf_inspector.py        # PyMuPDF-based geometry and element inspector
│   ├── watermark_extractor.py  # Watermark verification and base64 processor
│   ├── template_parser.py      # Template metrics and section boundary parser
│   ├── validation.py           # Character, required field, and line validation engine
│   ├── layout_engine.py        # Height allocation and visual-space measurement
│   ├── resume_renderer.py      # HTML/CSS generator with Google Fonts & watermark
│   └── pdf_generator.py        # Playwright & PyMuPDF PDF compilation and verification
│
├── frontend/
│   ├── __init__.py
│   ├── branding.py             # Voltare.in brand CSS and headers
│   ├── components.py           # Custom input components with live remaining counters
│   ├── candidate_form.py       # Predefined 6-section candidate input form
│   └── live_preview.py         # Real-time scaled HTML/CSS preview renderer
│
├── templates/
│   ├── resume.html             # Resume HTML template
│   ├── resume.css              # Resume styling rules matching original PDF
│   └── assets/
│       └── original_watermark.png # Extracted authentic Voltare wing watermark
│
├── tests/
│   ├── test_validation.py       # Tests for character limits, required fields, line counts
│   ├── test_character_limits.py # Boundary tests for max length constraints
│   ├── test_layout.py           # Tests for height allocation and overflow detection
│   ├── test_watermark.py        # Watermark integrity, format, and dimension tests
│   └── test_pdf.py              # HTML structure, escaping, and rendering tests
│
└── generated/                  # Output directory for compiled PDFs
```

---

## Fixed Resume Sections & Allocations

1. **Personal Information**: First Name, Second Name, City/Country, LinkedIn URL, Phone, Email.
2. **Professional Summary**: Summary (max 450 chars / 4 lines) + Skills (max 200 chars / 1 line).
3. **Education**: Exactly 3 entries (University, City/Country, Program, GPA, Graduation Date, Relevant Courses).
4. **Research / Project Experience**: Exactly 3 entries, each with Title, University/Org, Additional Info, Dates, and exactly 2 bullet points.
5. **Professional Experience**: Exactly 3 entries with fixed bullet counts:
   - Entry 1: 1 bullet
   - Entry 2: 2 bullets
   - Entry 3: 1 bullet
6. **Achievement and Leadership**: Awards, 2 Leadership entries, Achievement, 2 Community entries, Interests.

---

## Dual Validation System

1. **Character Validation**:
   - Every input field has an enforced `max_chars` threshold.
   - Interactive UI components display live counts (`X / Y characters (Z remaining)`).
   - Warnings appear when approaching limits, and errors block PDF export if exceeded.

2. **Visual Space Validation (`backend/layout_engine.py`)**:
   - Simulates text line wrapping (~90 characters per line at 9pt Cormorant Garamond across the 507pt content width).
   - Calculates total vertical height occupied by each section.
   - Verifies against calibrated dividers:
     - Professional Summary: `Y=80.02 → 152.70`
     - Education: `Y=152.70 → 272.00`
     - Research: `Y=272.00 → 475.15`
     - Experience: `Y=475.15 → 622.57`
     - Achievements: `Y=622.57 → 780.00`
   - Rejects generation if content spills beyond allocated section boundaries.

---

## Installation & Running

### 1. Install dependencies:
```bash
pip install -r requirements.txt
```

### 2. (Optional for headless Playwright PDF export):
```bash
playwright install chromium
```
*Note: If Playwright is not installed, the application automatically provides high-fidelity direct HTML download with 1-click browser Print-to-PDF instructions.*

### 3. Launch the Streamlit application:
```bash
python -m streamlit run app.py
```

### 4. Run the comprehensive test suite:
```bash
python -m unittest discover tests
```
*(All 53 unit tests pass covering validation, character limits, layout limits, watermark extraction, and PDF rendering).*
