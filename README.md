# VOLTARE — Official Single-Page Resume Builder

Production developer handover & technical documentation for **Voltare Consultancy** (`VOLTARE — Talent, Elevated`).

---

## 1. Product Overview & The 3 Builder Modes

Voltare Resume Builder generates strictly **single-page A4 portrait (`596pt × 842pt` / `794px × 1123px` at 96 DPI)** vector PDF resumes with the official Voltare soft-mask pale-pink watermark, live DOM auto-fit, and strict contact/overflow validation.

| Mode ID | UI Name | State Key (`App.jsx`) | Preview Component | Backend Renderer | Validator |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `standard` | **Standard Voltare Format** | `formData` (`voltare_standard_v1`) | `LiveResumePreview.jsx` | `backend/resume_renderer.py` | `App.jsx` + `backend/validation.py` |
| `flexible` | **Voltare Technical Resume** | `technicalData` (`voltare_tech_v1`) | `FlexibleResumePreview.jsx` (`isNonTechnical=false`) | `backend/flexible_renderer.py` (`is_non_technical=False`) | `utils/flexibleValidation.js` + `backend/flexible_validation.py` |
| `non_technical` | **Voltare Non-Technical Resume** | `nonTechData` (`voltare_nontech_v1`) | `FlexibleResumePreview.jsx` (`isNonTechnical=true`) | `backend/flexible_renderer.py` (`is_non_technical=True`) | `utils/flexibleValidation.js` + `backend/flexible_validation.py` |

### Mode Isolation & Key Differences
- **Mode 1 (`standard`):** Official strict Voltare template (Times New Roman / Garamond, ` | ` contact separator, sections: Summary/Skills, Education, Research/Project Experience, Professional Experience, Achievement & Leadership).
- **Mode 2 (`flexible` — Technical):** Software/engineering candidates (`Aakash Sharma` preset). Skills matrix renders `Core Competencies`, `Tools & Software`, `Languages & Tech`, `Domain Knowledge`. Experience is optional (`0` allowed for freshers).
- **Mode 3 (`non_technical` — Non-Technical):** Business, Finance, Consulting, HR & Ops (`Rohan Mehta` preset). Skills matrix renders `Core Competencies`, `Tools & Business Software`, `Languages & Communication`, `Industry Knowledge`.
- **State Isolation:** `technicalData`, `nonTechData`, and `formData` are independent React states persisted separately in `localStorage`, so switching modes never overwrites edits in another mode.

---

## 2. Complete Repository & File-by-File Map

```text
├── README.md                                  # This handover & architecture guide
├── package.json                               # Root convenience build script
└── voltare_resume_builder/
    ├── Dockerfile                             # Python 3.11-slim + libatomic1 + Playwright Chromium container
    ├── .dockerignore                          # Excludes node_modules, dist, __pycache__, generated/
    ├── railway.toml                           # Forces Railway DOCKERFILE builder
    ├── requirements.txt                       # FastAPI, Uvicorn, Pydantic, Pillow, PyMuPDF, Jinja2, Playwright
    ├── app.py / main.py                       # Legacy Streamlit entry point
    ├── config/
    │   ├── field_limits.json                  # Mode 1 max_chars, max_lines, and required flags
    │   └── template_config.json               # Mode 1 exact A4 coordinates & divider geometry
    ├── backend/
    │   ├── api_server.py                      # FastAPI server: REST endpoints, /tmp/<uuid> PDFs, static dist mount
    │   ├── resume_data.py                     # Mode 1 structured data models
    │   ├── validation.py                      # Mode 1 backend validator (required fields, email/phone/LinkedIn, lines)
    │   ├── layout_engine.py                   # Mode 1 line-budget calculation
    │   ├── resume_renderer.py                 # Mode 1 HTML/CSS generator with layout_overrides & URL sanitization
    │   ├── flexible_validation.py             # Mode 2 & 3 validator (150+ char summary, 3 edu, 1 proj, contacts)
    │   ├── flexible_renderer.py               # Mode 2 & 3 HTML/CSS generator (Tech vs Non-Tech labels, DOM fitter)
    │   ├── pdf_generator.py                   # Playwright Chromium PDF export (Windows Proactor thread-safe) & PyMuPDF verify
    │   ├── watermark_extractor.py             # Loads templates/assets/original_watermark.png & base64 encodes it
    │   └── template_parser.py                 # Reference PDF geometry inspector
    ├── templates/assets/
    │   └── original_watermark.png             # Official Voltare wing watermark PNG
    ├── frontend/                              # Legacy Streamlit UI modules (candidate_form.py, components.py, etc.)
    ├── frontend_react/
    │   ├── package.json                       # React 19, Vite 8
    │   ├── vite.config.js                     # Dev server (port 3000) proxying /api -> http://localhost:8000
    │   ├── vercel.json                        # Production rewrite proxying /api/* -> Railway backend URL
    │   ├── public/
    │   │   ├── voltare_logo.png               # Top header "VOLTARE — Talent, Elevated" logo
    │   │   └── original_watermark.png         # Client-side preview watermark
    │   └── src/
    │       ├── App.jsx                        # Master state, localStorage autosave, 3-mode routing, 1-click PDF download
    │       ├── main.jsx / index.css / App.css # React mount & base styles
    │       ├── styles/voltare.css             # Complete UI + A4 sheet + print + overflow-wrap styles
    │       ├── constants/
    │       │   ├── limits.js                  # Mode 1 SAMPLE_CANDIDATE_DATA, EMPTY_FORM_DATA, LIMITS, toStructuredData()
    │       │   └── flexibleLimits.js          # Mode 2 & 3 limits (minEducation: 3), SAMPLE_FLEXIBLE_DATA, SAMPLE_NON_TECH_DATA
    │       ├── utils/
    │       │   ├── contactValidation.js       # Shared email, phone (7-15 digits), LinkedIn, & dangerous scheme sanitizer
    │       │   ├── flexibleValidation.js      # Client validator for Mode 2 & 3
    │       │   └── layout/
    │       │       ├── pageMeasurement.js     # Measures real rendered DOM heights inside 794x1123px A4 sheet
    │       │       ├── verticalExpansion.js   # Expansion bounds (13.2px->15.0px, lh 1.20->1.38) & computeExpansionAtRatio()
    │       │       ├── verticalCompression.js # Safe compression bounds (down to 12.2px, lh 1.12)
    │       │       ├── layoutOptimizer.js     # Binary-search DOM solver (8 iterations, >=65% auto-fit to 95-98%)
    │       │       ├── visualBalance.js       # Top/Mid/Bottom thirds density analyzer
    │       │       └── overflowDetection.js   # Detects unrecoverable A4 overflow (>1127px)
    │       └── components/
    │           ├── Header.jsx                 # Renders /voltare_logo.png + "Official Resume Builder"
    │           ├── Footer.jsx                 # Voltare Consultancy footer
    │           ├── ModeSwitcher.jsx           # 3-mode selector cards
    │           ├── Tabs.jsx / SectionHeader.jsx / Toast.jsx / ValidationMessage.jsx
    │           ├── LimitedTextInput.jsx / LimitedTextArea.jsx  # Enforces maxChars + live remaining counter
    │           ├── LiveResumePreview.jsx      # Mode 1 preview + binary-search DOM fitter + overflow banner
    │           ├── ValidationExport.jsx       # Mode 1 6-pill completion tracker + 1-click PDF blob download
    │           ├── FlexibleResumePreview.jsx  # Mode 2/3 preview + layoutOptimizer + overflow banner
    │           ├── FlexibleExportPanel.jsx    # Mode 2/3 8-pill completion tracker + 1-click PDF blob download
    │           ├── form/                      # Mode 1 forms (PersonalInfo, ProfessionalSummary, Education, ResearchProjects, ProfessionalExperience, AchievementsLeadership)
    │           └── flexible_form/             # Mode 2/3 forms (FlexiblePersonalInfo, FlexibleSummary, FlexibleEducation, FlexibleProjects, FlexibleSkills, FlexibleExperience, FlexibleCertifications, FlexibleCustomSection)
    └── tests/
        ├── test_api_server.py
        ├── test_candidate_form.py
        ├── test_character_limits.py
        ├── test_flexible_validation.py
        ├── test_layout.py
        ├── test_pdf.py
        ├── test_validation.py
        └── test_watermark.py
```

---

## 3. Local Development & Build Setup

### Prerequisites
- **Python 3.11+**
- **Node.js 20+**
- **Playwright Chromium** (`playwright install chromium`)

### Install & Run
```bash
# 1. Install Python dependencies & Chromium
cd voltare_resume_builder
pip install -r requirements.txt
playwright install chromium

# 2. Install Frontend dependencies
cd frontend_react
npm install
```

- **Development (Hot Reload):**
  - Terminal 1 (Backend): `cd voltare_resume_builder && python -m uvicorn backend.api_server:app --port 8000 --reload`
  - Terminal 2 (Frontend): `cd voltare_resume_builder/frontend_react && npm run dev` → Open `http://localhost:3000`
- **Production Local Preview:**
  - `cd voltare_resume_builder/frontend_react && npm run build`
  - `cd .. && python -m uvicorn backend.api_server:app --port 8000` → Open `http://localhost:8000`

*(Note: On Windows, `backend/pdf_generator.py` runs Playwright inside a dedicated `threading.Thread` with `WindowsProactorEventLoopPolicy` to avoid FastAPI event-loop conflicts.)*

---

## 4. End-to-End Request & 1-Click PDF Flow

1. User edits any field → `App.jsx` autosaves to `localStorage` (`voltare_mode_v1`, `voltare_standard_v1`, `voltare_tech_v1`, `voltare_nontech_v1`).
2. `useLayoutEffect` in `LiveResumePreview.jsx` (Mode 1) or `FlexibleResumePreview.jsx` (Mode 2 & 3) measures actual DOM heights and computes `layout_overrides` (and `isOverflowing`).
3. Clicking **Download Single-Page PDF**:
   - Sends `POST /api/generate-pdf` (Mode 1) or `POST /api/generate-flexible-pdf` (Mode 2 & 3) with `{ data, layout_overrides, is_non_technical }`.
   - Backend validates, renders HTML with exact `layout_overrides`, runs Playwright `page.pdf(format="A4", margin=0, prefer_css_page_size=True)` into `/tmp/voltare_<uuid>.pdf`, and returns `download_url`.
   - Frontend fetches `download_url` as a binary `Blob` and triggers `<a download="Voltare_Resume_....pdf">` — **strictly 1-click `.pdf` download** (no `window.print()`, no Save-As pop-up).
   - Backend deletes the temp `/tmp` file via `BackgroundTask` after serving.

---

## 5. Adaptive Single-Page Engine & Preview-to-PDF Parity

- **Mode 1 (`LiveResumePreview.jsx`):** Uses `last.offsetTop + last.offsetHeight + paddingBottom` (ignoring `.resume-content`'s `height: 100%`). When natural coverage `>= 65%`, binary-searches `10.0pt → 11.3pt` and `1.16 → 1.38` line-height up to `pageHeight - 16`. When overflowing, compresses down to `8.8pt` / `1.07` lh; if still overflowing, blocks PDF export.
- **Mode 2 & 3 (`utils/layout/`):** Binary-searches `computeExpansionAtRatio(0..1)` (`13.2px → 15.0px`, `1.20 → 1.38` lh, `13px → 24px` section gap, `34px → 44px` vertical padding) targeting `<= 1105px` (`98.4%` A4 fill) whenever coverage `>= 65%`.
- **Word Wrapping:** `overflow-wrap: anywhere; word-break: break-word;` is enforced in `voltare.css`, `resume_renderer.py`, and `flexible_renderer.py` so unbroken strings wrap cleanly inside margins.

---

## 6. Validation, Security & Mandatory Rules

- **All 3 Education Entries Mandatory (All 3 Modes):** College/University, 12th/Higher Secondary, and 10th/Secondary are required across Mode 1, Mode 2, and Mode 3.
- **Mode 2 & 3 Rules:** Personal Details required, Professional Summary `>= 150` chars, `>= 1` Project required, Work Experience optional (`0` allowed for freshers).
- **Contact & Security Validation (`contactValidation.js`, `validation.py`, `flexible_validation.py`):**
  - Email must match `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`.
  - Phone allows only `[+\d\s\-()]` with `7–15` digits.
  - LinkedIn must match `linkedin.com/...`; `javascript:`, `data:`, and `vbscript:` schemes are stripped/blocked in both React and Python renderers.
- **Destructive Action Guards:** `Clear` and `Load Full Sample` prompt `window.confirm(...)` whenever the active form already has user data.

---

## 7. Backend API Reference (`backend/api_server.py`)

| Method & Path | Purpose | Key Request Fields | Response |
| :--- | :--- | :--- | :--- |
| `GET /api/health` | Health & watermark check | — | `{"status":"healthy","watermark_exists":true}` |
| `GET /api/config` | Mode 1 limits & watermark | — | `{ limits, sample_data, watermark_base64 }` |
| `POST /api/validate` | Mode 1 validation | `{ data }` | `{ is_valid, char_errors, layout_errors }` |
| `POST /api/preview` | Mode 1 HTML preview | `{ data, layout_overrides }` | `{ html }` |
| `POST /api/generate-pdf` | Mode 1 PDF export | `{ data, layout_overrides }` | `{ success, verification, filename, download_url }` |
| `GET /api/download-pdf` | Serves Mode 1 `/tmp` PDF | `?id=<uuid>&fn=<name>` | `application/pdf` (auto-deletes temp file) |
| `POST /api/validate-flexible` | Mode 2/3 validation | `{ data }` | `{ is_valid, errors, progress_percent, can_download_pdf }` |
| `POST /api/render-flexible-html` | Mode 2/3 HTML preview | `{ data, layout_overrides, is_non_technical }` | `{ html }` |
| `POST /api/generate-flexible-pdf` | Mode 2/3 PDF export | `{ data, layout_overrides, is_non_technical }` | `{ success, filename, download_url }` |
| `GET /api/download-flexible-pdf` | Serves Mode 2/3 `/tmp` PDF | `?id=<uuid>&fn=<name>` | `application/pdf` (auto-deletes temp file) |

---

## 8. Testing & Verification

```bash
# Backend unit tests
cd voltare_resume_builder
python tests/test_flexible_validation.py
python tests/test_validation.py
python tests/test_candidate_form.py
python tests/test_layout.py

# Frontend production build
cd frontend_react
npm run build
```

---

## 9. Production Deployment (Vercel + Railway)

- **Backend (Railway Docker):**
  - Repo: `Sxrxya/RESUME-MAKER-` (`main`), **Root Directory:** `/voltare_resume_builder`, **Builder:** `Dockerfile` (`railway.toml`), **Networking Port:** `8080` (matches Railway's injected `$PORT`).
  - Live URL: `https://resume-maker-production-637df510.up.railway.app`
- **Frontend (Vercel):**
  - Repo: `Sxrxya/RESUME-MAKER-` (`main`), **Root Directory:** `voltare_resume_builder/frontend_react`, **Preset:** `Vite` (`npm run build` → `dist`).
  - `frontend_react/vercel.json` rewrites `/api/:path*` → `https://resume-maker-production-637df510.up.railway.app/api/:path*` so relative `/api/*` calls work with zero CORS issues.
- **Auto-Deploy:** Any `git push origin main` automatically rebuilds and updates both Vercel and Railway.
