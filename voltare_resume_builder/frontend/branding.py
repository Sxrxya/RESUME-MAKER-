"""Voltare.in-inspired branding for the Streamlit application."""

BRAND_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Cormorant+SC:wght@700&display=swap');

/* Main app background */
.stApp {
    background-color: #0d0d0d !important;
}

/* Sidebar */
section[data-testid="stSidebar"] {
    background-color: #1a1a1a !important;
    border-right: 1px solid #2a2a2a;
}

section[data-testid="stSidebar"] .stMarkdown h1,
section[data-testid="stSidebar"] .stMarkdown h2,
section[data-testid="stSidebar"] .stMarkdown h3 {
    color: #c9a84c !important;
    font-family: 'Cormorant SC', serif !important;
}

/* Headers */
h1, h2, h3 {
    font-family: 'Cormorant SC', serif !important;
    color: #c9a84c !important;
    letter-spacing: 1px;
}

h1 {
    font-size: 2.2rem !important;
    border-bottom: 2px solid #c9a84c;
    padding-bottom: 10px;
    margin-bottom: 20px !important;
}

/* Body text */
p, span, label, .stMarkdown {
    color: #e0e0e0 !important;
    font-family: 'Cormorant Garamond', serif !important;
}

/* Text inputs */
.stTextInput > div > div > input,
.stTextArea > div > div > textarea {
    background-color: #1e1e1e !important;
    color: #e0e0e0 !important;
    border: 1px solid #333333 !important;
    border-radius: 4px !important;
    font-family: 'Cormorant Garamond', serif !important;
    font-size: 14px !important;
    transition: border-color 0.3s ease;
}

.stTextInput > div > div > input:focus,
.stTextArea > div > div > textarea:focus {
    border-color: #c9a84c !important;
    box-shadow: 0 0 0 1px #c9a84c33 !important;
}

/* Labels */
.stTextInput label, .stTextArea label, .stSelectbox label {
    color: #c9a84c !important;
    font-family: 'Cormorant SC', serif !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    letter-spacing: 0.5px;
}

/* Buttons */
.stButton > button {
    background-color: #c9a84c !important;
    color: #0d0d0d !important;
    border: none !important;
    font-family: 'Cormorant SC', serif !important;
    font-weight: 700 !important;
    font-size: 16px !important;
    letter-spacing: 1px;
    padding: 8px 24px !important;
    border-radius: 4px !important;
    transition: all 0.3s ease;
    text-transform: uppercase;
}

.stButton > button:hover {
    background-color: #d4b85c !important;
    box-shadow: 0 4px 12px rgba(201, 168, 76, 0.3) !important;
}

/* Download button */
.stDownloadButton > button {
    background-color: #c9a84c !important;
    color: #0d0d0d !important;
    border: none !important;
    font-family: 'Cormorant SC', serif !important;
    font-weight: 700 !important;
    font-size: 18px !important;
    padding: 12px 32px !important;
    width: 100% !important;
    letter-spacing: 2px;
    text-transform: uppercase;
}

.stDownloadButton > button:hover {
    background-color: #d4b85c !important;
    box-shadow: 0 6px 20px rgba(201, 168, 76, 0.4) !important;
}

/* Tabs */
.stTabs [data-baseweb="tab-list"] {
    background-color: #1a1a1a;
    border-radius: 4px;
    gap: 2px;
}

.stTabs [data-baseweb="tab"] {
    color: #888888 !important;
    font-family: 'Cormorant SC', serif !important;
    font-size: 13px !important;
    font-weight: 600;
    padding: 8px 16px;
    background-color: transparent;
}

.stTabs [aria-selected="true"] {
    color: #c9a84c !important;
    border-bottom: 2px solid #c9a84c !important;
    background-color: #222222 !important;
}

/* Expander */
.streamlit-expanderHeader {
    background-color: #1a1a1a !important;
    color: #c9a84c !important;
    font-family: 'Cormorant SC', serif !important;
    border: 1px solid #2a2a2a !important;
    border-radius: 4px !important;
}

.streamlit-expanderContent {
    background-color: #151515 !important;
    border: 1px solid #2a2a2a !important;
    border-top: none !important;
}

/* Character counter */
.char-counter {
    font-size: 11px !important;
    color: #666666 !important;
    font-family: 'Cormorant Garamond', serif !important;
    margin-top: -8px;
    margin-bottom: 8px;
}

.char-counter.warning {
    color: #e6a817 !important;
}

.char-counter.danger {
    color: #e63946 !important;
}

/* Validation messages */
.validation-error {
    color: #e63946 !important;
    font-size: 12px !important;
    padding: 4px 8px;
    background-color: #e6394611;
    border-left: 3px solid #e63946;
    margin: 4px 0;
    border-radius: 2px;
}

.validation-success {
    color: #2ecc71 !important;
    font-size: 12px !important;
    padding: 4px 8px;
    background-color: #2ecc7111;
    border-left: 3px solid #2ecc71;
    margin: 4px 0;
    border-radius: 2px;
}

/* Required field indicator */
.required-indicator {
    color: #e63946 !important;
    font-weight: bold;
}

/* Section divider */
.section-divider {
    border: none;
    border-top: 1px solid #2a2a2a;
    margin: 20px 0;
}

/* Preview container */
.preview-container {
    background: #ffffff;
    border-radius: 4px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    overflow: hidden;
}

/* Scrollbar */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
    background: #333333;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: #c9a84c;
}

/* Columns gap */
[data-testid="column"] {
    padding: 0 10px;
}

/* Alert/info boxes */
.stAlert {
    background-color: #1a1a1a !important;
    border: 1px solid #2a2a2a !important;
    color: #e0e0e0 !important;
}

/* Select box */
.stSelectbox > div > div {
    background-color: #1e1e1e !important;
    color: #e0e0e0 !important;
    border-color: #333333 !important;
}

/* Metric styling */
[data-testid="stMetricValue"] {
    color: #c9a84c !important;
    font-family: 'Cormorant SC', serif !important;
}

/* Hide streamlit branding */
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}

/* Top header bar */
.voltare-header {
    text-align: center;
    padding: 20px 0 10px 0;
    border-bottom: 1px solid #2a2a2a;
    margin-bottom: 20px;
}

.voltare-header h1 {
    font-family: 'Cormorant SC', serif !important;
    color: #c9a84c !important;
    font-size: 2.5rem !important;
    letter-spacing: 8px;
    margin: 0 !important;
    border: none !important;
    padding: 0 !important;
}

.voltare-header .subtitle {
    color: #888888 !important;
    font-family: 'Cormorant Garamond', serif !important;
    font-size: 14px !important;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-top: 4px;
}
</style>
"""


def apply_branding(st):
    """Apply Voltare branding CSS to the Streamlit app."""
    st.markdown(BRAND_CSS, unsafe_allow_html=True)


def render_header(st):
    """Render the Voltare branding header."""
    st.markdown('''
    <div class="voltare-header">
        <h1>VOLTARE</h1>
        <div class="subtitle">Official Resume Builder</div>
    </div>
    ''', unsafe_allow_html=True)
