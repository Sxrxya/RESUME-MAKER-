"""Resume HTML renderer for Voltare resume builder."""
import json
import os
import base64
from typing import Optional

CONFIG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "config")

def _load_config(filename: str) -> dict:
    path = os.path.join(CONFIG_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def _escape_html(text: str) -> str:
    """Escape HTML special characters."""
    if not text:
        return ""
    return (text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace('"', "&quot;"))


def render_resume_html(data: dict, watermark_path: str = "", watermark_base64: str = "") -> str:
    """Render complete resume as HTML string."""
    
    personal = data.get("personal_info", {})
    prof = data.get("professional_summary", {})
    education = data.get("education", [{}, {}, {}])
    research = data.get("research_projects", [{}, {}, {}])
    experience = data.get("professional_experience", [{}, {}, {}])
    achievements = data.get("achievements_leadership", {})

    # Determine watermark source
    if watermark_base64:
        watermark_src = f"data:image/png;base64,{watermark_base64}"
    elif watermark_path and os.path.exists(watermark_path):
        with open(watermark_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
        watermark_src = f"data:image/png;base64,{b64}"
    else:
        watermark_src = ""

    first_name = _escape_html(personal.get("first_name", ""))
    second_name = _escape_html(personal.get("second_name", ""))
    name_display = f"{first_name} {second_name}".strip()

    city = _escape_html(personal.get("city_country", ""))
    linkedin = _escape_html(personal.get("linkedin_url", ""))
    phone = _escape_html(personal.get("phone", ""))
    email = _escape_html(personal.get("email", ""))

    contact_parts = []
    if city:
        contact_parts.append(city)
    if linkedin:
        contact_parts.append(f'<a href="https://{linkedin}" style="color:#0000ff;text-decoration:underline;">{linkedin}</a>')
    if phone:
        contact_parts.append(phone)
    if email:
        contact_parts.append(f'<a href="mailto:{email}" style="color:#0000ff;text-decoration:underline;">{email}</a>')

    contact_line = " | ".join(contact_parts)

    summary_text = _escape_html(prof.get("summary", ""))
    skills_text = _escape_html(prof.get("skills", ""))

    # Build education HTML (ensure all 3 entries render)
    edu_html = ""
    for i in range(3):
        edu = education[i] if i < len(education) and education[i] else {}
        uni = _escape_html(edu.get("university", ""))
        edu_city = _escape_html(edu.get("city_country", ""))
        program = _escape_html(edu.get("program", ""))
        gpa = _escape_html(edu.get("gpa", ""))
        grad_date = _escape_html(edu.get("graduation_date", ""))
        courses = _escape_html(edu.get("relevant_courses", ""))

        program_line = program
        if gpa:
            program_line += f"  {gpa}"

        edu_html += f'''
        <div class="edu-entry">
            <div class="entry-row">
                <span class="entry-left"><strong>{uni}</strong> {f'<span class="courses-inline">{courses}</span>' if courses and i == 0 else ''}</span>
                <span class="entry-right"><strong>{edu_city}</strong></span>
            </div>
            <div class="entry-row">
                <span class="entry-left"><em>{program_line}</em></span>
                <span class="entry-right"><strong><em>{grad_date}</em></strong></span>
            </div>
            {f'<div class="relevant-courses"><em>{courses}</em></div>' if courses and i > 0 else ''}
        </div>'''

    # Build research HTML (ensure all 3 entries render)
    res_html = ""
    for i in range(3):
        res = research[i] if i < len(research) and research[i] else {}
        title = _escape_html(res.get("title", ""))
        org = _escape_html(res.get("organization", ""))
        additional = _escape_html(res.get("additional_info", ""))
        start = _escape_html(res.get("start_date", ""))
        end = _escape_html(res.get("end_date", ""))
        b1 = _escape_html(res.get("bullet_1", ""))
        b2 = _escape_html(res.get("bullet_2", ""))

        dates = f"{start} – {end}" if start or end else ""
        heading = ", ".join(
            value for value in (
                f"<strong>{title}</strong>" if title else "",
                f"<em>{org}</em>" if org else "",
            ) if value
        )

        res_html += f'''
        <div class="research-entry">
            <div class="entry-row">
                <span class="entry-left">{heading}</span>
                <span class="entry-right"><strong>{dates}</strong></span>
            </div>
            {f'<div class="additional-info"><em>{additional}</em></div>' if additional else ''}
            {f'<div class="bullet">● {b1}</div>' if b1 else ''}
            {f'<div class="bullet">● {b2}</div>' if b2 else ''}
        </div>'''

    # Build experience HTML (ensure all 3 entries render)
    exp_html = ""
    for i in range(3):
        exp = experience[i] if i < len(experience) and experience[i] else {}
        company = _escape_html(exp.get("company", ""))
        domain = _escape_html(exp.get("domain", ""))
        role = _escape_html(exp.get("role", ""))
        start = _escape_html(exp.get("start_date", ""))
        end = _escape_html(exp.get("end_date", ""))
        bullets = exp.get("bullets", []) or []

        dates = f"{start} – {end}" if start or end else ""
        role_details = ", ".join(value for value in (domain, role) if value)
        experience_heading = ", ".join(
            value for value in (
                f"<strong>{company}</strong>" if company else "",
                f"<em>{role_details}</em>" if role_details else "",
            ) if value
        )

        exp_html += f'''
        <div class="experience-entry">
            <div class="entry-row">
                <span class="entry-left">{experience_heading}</span>
                <span class="entry-right"><strong>{dates}</strong></span>
            </div>'''
        for bullet in bullets:
            b_text = _escape_html(bullet) if bullet else ""
            if b_text:
                exp_html += f'\n            <div class="bullet">● {b_text}</div>'
        exp_html += '\n        </div>'

    # Build achievements HTML
    awards_text = _escape_html(achievements.get("awards", ""))
    lead1 = _escape_html(achievements.get("leadership_1", ""))
    lead2 = _escape_html(achievements.get("leadership_2", ""))
    ach_text = _escape_html(achievements.get("achievement", ""))
    comm1 = _escape_html(achievements.get("community_1", ""))
    comm2 = _escape_html(achievements.get("community_2", ""))
    interests = _escape_html(achievements.get("interests", ""))

    ach_html = ""
    if awards_text:
        ach_html += f'<div class="ach-line"><strong>Awards(if any):</strong> {awards_text}</div>\n'
    if lead1:
        if not lead1.lower().startswith("leadership"):
            lead1 = f"Leadership: (i){lead1}"
        ach_html += f'<div class="ach-line">{lead1}</div>\n'
    if lead2:
        if not lead2.startswith("(ii)"):
            lead2 = f"(ii){lead2}"
        ach_html += f'<div class="ach-line">{lead2}</div>\n'
    if ach_text:
        ach_html += f'<div class="ach-line indent"><strong>○ Achievement(if any):</strong> {ach_text}</div>\n'
    if comm1:
        if not comm1.lower().startswith("community"):
            comm1 = f"Community: (i) {comm1}"
        ach_html += f'<div class="ach-line">{comm1}</div>\n'
    if comm2:
        if not comm2.startswith("(ii)"):
            comm2 = f"(ii){comm2}"
        ach_html += f'<div class="ach-line">{comm2}</div>\n'
    if interests:
        ach_html += f'<div class="ach-line"><strong>Interests :</strong> {interests}</div>\n'

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@700&display=swap');

@page {{
    size: 210mm 297mm;
    margin: 0;
}}

*, *:before, *:after {{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}}

html {{
    background-color: #f7f3ef !important;
}}

body {{
    font-family: 'Times New Roman', Times, serif;
    font-size: 10pt;
    line-height: 1.15;
    color: #000000;
    background-color: #f7f3ef !important;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
}}

.resume-page {{
    width: 596pt;
    height: 842pt;
    position: relative;
    overflow: hidden;
    background-color: #f7f3ef !important;
    margin: 0 auto;
    box-sizing: border-box;
}}

.watermark {{
    position: absolute;
    left: 35.65pt;
    top: 174.57pt;
    width: 524.25pt;
    height: 492.75pt;
    opacity: 0.95;
    z-index: 1;
    pointer-events: none;
}}

.watermark img {{
    width: 100%;
    height: 100%;
    object-fit: contain;
}}

.content {{
    position: relative;
    z-index: 2;
    padding: 28pt 36pt 20pt 21pt;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
}}

.name {{
    font-family: 'Cormorant SC', 'Georgia', serif;
    font-size: 19pt;
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 3pt;
    line-height: 1.1;
}}

.contact-info {{
    font-family: 'Times New Roman', Times, serif;
    text-align: center;
    font-size: 10pt;
    margin-bottom: 5pt;
    line-height: 1.2;
}}

.contact-info a {{
    color: #0000ff;
    text-decoration: underline;
}}

.section-heading {{
    font-family: 'Times New Roman', Times, serif;
    font-size: 11pt;
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 5pt;
    margin-bottom: 0;
    padding-bottom: 1.5pt;
    border-bottom: 1.0pt solid #000000;
    line-height: 1.15;
}}

.section-body {{
    margin-top: 2.5pt;
}}

.summary-text {{
    font-family: 'Garamond', 'Georgia', serif;
    text-align: justify;
    font-size: 10pt;
    line-height: 1.15;
    margin-bottom: 2pt;
}}

.skills-line {{
    font-family: 'Garamond', 'Georgia', serif;
    font-size: 10pt;
    margin-bottom: 2pt;
    line-height: 1.15;
}}

.edu-entry {{
    margin-bottom: 2.5pt;
    font-family: 'Times New Roman', Times, serif;
    font-size: 10pt;
}}

.entry-row {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 10pt;
    line-height: 1.15;
}}

.entry-left {{
    flex: 1;
}}

.entry-right {{
    text-align: right;
    white-space: nowrap;
    margin-left: 10pt;
}}

.relevant-courses {{
    font-size: 9pt;
    font-style: italic;
    line-height: 1.15;
}}

.research-entry, .experience-entry {{
    margin-bottom: 2.5pt;
    font-family: 'Times New Roman', Times, serif;
    font-size: 10pt;
}}

.additional-info {{
    font-size: 10pt;
    font-style: italic;
    line-height: 1.15;
}}

.bullet {{
    font-size: 10pt;
    line-height: 1.15;
    padding-left: 10pt;
    text-indent: 0;
    text-align: justify;
}}

.ach-line {{
    font-family: 'Times New Roman', Times, serif;
    font-size: 10pt;
    line-height: 1.15;
    margin-bottom: 1pt;
    text-align: justify;
}}

.ach-line.indent {{
    padding-left: 12pt;
}}

.courses-inline {{
    font-style: italic;
    font-weight: normal;
    font-size: 9pt;
}}
</style>
</head>
<body>
<div class="resume-page">
    {"<div class='watermark'><img src='" + watermark_src + "' alt='watermark'></div>" if watermark_src else ""}
    
    <div class="content">
        <div class="name">{name_display}</div>
        <div class="contact-info">{contact_line}</div>

        <div class="section-heading">PROFESSIONAL SUMMARY</div>
        <div class="section-body">
            <div class="summary-text">{summary_text}</div>
            <div class="skills-line"><strong>Skills:</strong> {skills_text}</div>
        </div>

        <div class="section-heading">EDUCATION</div>
        <div class="section-body">
            {edu_html}
        </div>

        <div class="section-heading">RESEARCH/PROJECT EXPERIENCE</div>
        <div class="section-body">
            {res_html}
        </div>

        <div class="section-heading">PROFESSIONAL EXPERIENCE</div>
        <div class="section-body">
            {exp_html}
        </div>

        <div class="section-heading">ACHIEVEMENT AND LEADERSHIP</div>
        <div class="section-body">
            {ach_html}
        </div>
    </div>
</div>
</body>
</html>'''

    return html


def get_preview_html(data: dict, watermark_base64: str = "") -> str:
    """Get HTML suitable for Streamlit preview with embedded watermark."""
    return render_resume_html(data, watermark_base64=watermark_base64)
