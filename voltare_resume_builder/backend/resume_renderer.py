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
    name_display = f"&lt;Firstname&gt; &lt;Secondname&gt;"
    if first_name or second_name:
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
    contact_line = " | ".join(contact_parts) if contact_parts else "City, State (Or Country) | LinkedIn | +91 12233 34455 | youremail@youremail.com"

    summary_text = _escape_html(prof.get("summary", ""))
    skills_text = _escape_html(prof.get("skills", ""))

    # Build education HTML
    edu_html = ""
    for i, edu in enumerate(education):
        uni = _escape_html(edu.get("university", ""))
        edu_city = _escape_html(edu.get("city_country", ""))
        program = _escape_html(edu.get("program", ""))
        gpa = _escape_html(edu.get("gpa", ""))
        grad_date = _escape_html(edu.get("graduation_date", ""))
        courses = _escape_html(edu.get("relevant_courses", ""))
        
        if not uni:
            continue

        program_line = program
        if gpa:
            program_line += f"  ({gpa})"

        edu_html += f'''
        <div class="edu-entry">
            <div class="entry-row">
                <span class="entry-left"><strong>{uni}</strong> {f'<span class="courses-inline">{{{courses}}}</span>' if courses else ''}</span>
                <span class="entry-right"><strong>{edu_city}</strong></span>
            </div>
            <div class="entry-row">
                <span class="entry-left"><em>{program_line}</em></span>
                <span class="entry-right"><em>{grad_date}</em></span>
            </div>
            {f'<div class="relevant-courses"><em>{{{courses}}}</em></div>' if courses and i > 0 else ''}
        </div>'''

    # Build research HTML
    res_html = ""
    for i, res in enumerate(research):
        title = _escape_html(res.get("title", ""))
        org = _escape_html(res.get("organization", ""))
        additional = _escape_html(res.get("additional_info", ""))
        start = _escape_html(res.get("start_date", ""))
        end = _escape_html(res.get("end_date", ""))
        b1 = _escape_html(res.get("bullet_1", ""))
        b2 = _escape_html(res.get("bullet_2", ""))

        if not title:
            continue

        dates = f"{start}– {end}" if start and end else ""

        res_html += f'''
        <div class="research-entry">
            <div class="entry-row">
                <span class="entry-left"><strong>{title}</strong>, <em>{org}</em></span>
                <span class="entry-right"><strong>{dates}</strong></span>
            </div>
            {f'<div class="additional-info"><em>{additional}</em></div>' if additional else ''}
            {f'<div class="bullet">● {b1}</div>' if b1 else ''}
            {f'<div class="bullet">● {b2}</div>' if b2 else ''}
        </div>'''

    # Build experience HTML
    exp_html = ""
    for i, exp in enumerate(experience):
        company = _escape_html(exp.get("company", ""))
        domain = _escape_html(exp.get("domain", ""))
        role = _escape_html(exp.get("role", ""))
        start = _escape_html(exp.get("start_date", ""))
        end = _escape_html(exp.get("end_date", ""))
        bullets = exp.get("bullets", [])

        if not company:
            continue

        dates = f"{start} – {end}" if start and end else ""

        exp_html += f'''
        <div class="experience-entry">
            <div class="entry-row">
                <span class="entry-left"><strong>{company},</strong> <em>{domain}, {role}</em></span>
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
        ach_html += f'<div class="ach-line"><strong>Leadership: (i)</strong>{lead1}</div>\n'
    if lead2:
        ach_html += f'<div class="ach-line"><strong>(ii)</strong>{lead2}</div>\n'
    if ach_text:
        ach_html += f'<div class="ach-line indent"><strong>○ Achievement(if any)</strong>: {ach_text}</div>\n'
    if comm1:
        ach_html += f'<div class="ach-line"><strong>Community: (i) Role, Community/ Club Name</strong>: {comm1}</div>\n'
    if comm2:
        ach_html += f'<div class="ach-line"><strong>(ii)Career Counsellor, DAV Group of Schools:</strong> {comm2}</div>\n'
    if interests:
        ach_html += f'<div class="ach-line"><strong>Interests :</strong> {interests}</div>\n'

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Cormorant+SC:wght@700&display=swap');

@page {{
    size: 8.5in 11in;
    margin: 0;
}}

* {{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}}

body {{
    font-family: 'Cormorant Garamond', 'Georgia', serif;
    font-size: 9pt;
    line-height: 1.25;
    color: #000000;
    background: white;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
}}

.resume-page {{
    width: 8.5in;
    height: 11in;
    position: relative;
    overflow: hidden;
    background: white;
    margin: 0 auto;
}}

.background-fill {{
    position: absolute;
    left: 0.363in;
    top: 0;
    right: 0.352in;
    bottom: 0;
    background-color: #f7f3ef;
    z-index: 0;
}}

.watermark {{
    position: absolute;
    left: 0.828in;
    top: 2.282in;
    width: 6.86in;
    height: 6.437in;
    opacity: 0.12;
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
    padding: 0.278in 0.813in 0.208in 0.639in;
    width: 100%;
    height: 100%;
}}

.name {{
    font-family: 'Cormorant SC', 'Georgia', serif;
    font-size: 22pt;
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 2pt;
    line-height: 1.1;
}}

.contact-info {{
    text-align: center;
    font-size: 9pt;
    margin-bottom: 6pt;
    line-height: 1.3;
}}

.contact-info a {{
    color: #0000ff;
    text-decoration: underline;
}}

.section-heading {{
    font-family: 'Cormorant Garamond', serif;
    font-size: 11pt;
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 3pt;
    margin-bottom: 0;
    padding-bottom: 2pt;
    border-bottom: 0.72pt solid #000000;
    line-height: 1.2;
}}

.section-body {{
    margin-top: 2pt;
}}

.summary-text {{
    text-align: justify;
    font-size: 9pt;
    line-height: 1.25;
    margin-bottom: 2pt;
}}

.skills-line {{
    font-size: 9pt;
    margin-bottom: 2pt;
}}

.edu-entry {{
    margin-bottom: 2pt;
}}

.entry-row {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 9pt;
    line-height: 1.25;
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
    line-height: 1.25;
}}

.research-entry, .experience-entry {{
    margin-bottom: 2pt;
}}

.additional-info {{
    font-size: 9pt;
    font-style: italic;
    line-height: 1.25;
}}

.bullet {{
    font-size: 9pt;
    line-height: 1.25;
    padding-left: 10pt;
    text-indent: 0;
}}

.ach-line {{
    font-size: 9pt;
    line-height: 1.2;
}}

.ach-line.indent {{
    padding-left: 12pt;
}}

.courses-inline {{
    font-style: italic;
    font-weight: normal;
}}
</style>
</head>
<body>
<div class="resume-page">
    <div class="background-fill"></div>
    
    {"<div class='watermark'><img src='" + watermark_src + "' alt='watermark'></div>" if watermark_src else ""}
    
    <div class="content">
        <div class="name">{name_display}</div>
        <div class="contact-info">{contact_line}</div>

        <div class="section-heading">PROFESSIONAL SUMMARY</div>
        <div class="section-body">
            <div class="summary-text">{summary_text if summary_text else "My Lorem ipsum dolor sit amet, consectetur adipiscing elit..."}</div>
            <div class="skills-line"><strong>Skills</strong>: {skills_text if skills_text else "Integer ante arcu, accumsan a, consectetuer eget..."}</div>
        </div>

        <div class="section-heading">EDUCATION</div>
        <div class="section-body">
            {edu_html if edu_html else '<div class="edu-entry"><div class="entry-row"><span class="entry-left"><strong>ABC University</strong></span><span class="entry-right"><strong>City, Country</strong></span></div><div class="entry-row"><span class="entry-left"><em>Program Name</em></span><span class="entry-right"><em>mon YYYY</em></span></div></div>'}
        </div>

        <div class="section-heading">RESEARCH/PROJECT EXPERIENCE</div>
        <div class="section-body">
            {res_html if res_html else '<div class="research-entry"><div class="entry-row"><span class="entry-left"><strong>Research Paper /Project Name</strong>, <em>ABC University</em></span><span class="entry-right"><strong>Mon YYYY– Mon YYYY</strong></span></div></div>'}
        </div>

        <div class="section-heading">PROFESSIONAL EXPERIENCE</div>
        <div class="section-body">
            {exp_html if exp_html else '<div class="experience-entry"><div class="entry-row"><span class="entry-left"><strong>XYZ Company,</strong> <em>Domain/Industry, Role Name</em></span><span class="entry-right"><strong>Mon YYYY – Mon YYYY</strong></span></div></div>'}
        </div>

        <div class="section-heading">ACHIEVEMENT AND LEADERSHIP</div>
        <div class="section-body">
            {ach_html if ach_html else '<div class="ach-line"><strong>Awards(if any):</strong> Awards description.</div>'}
        </div>
    </div>
</div>
</body>
</html>'''

    return html


def get_preview_html(data: dict, watermark_base64: str = "") -> str:
    """Get HTML suitable for Streamlit preview with embedded watermark."""
    return render_resume_html(data, watermark_base64=watermark_base64)
