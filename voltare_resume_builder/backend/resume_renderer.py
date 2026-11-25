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


def calculate_resume_density(data: dict) -> dict:
    """Calculate content density score and return adaptive CSS variables."""
    personal = data.get("personal_info", {})
    prof = data.get("professional_summary", {})
    education = data.get("education", [])
    research = data.get("research_projects", [])
    experience = data.get("professional_experience", [])
    achievements = data.get("achievements_leadership", {})

    total_lines = 0

    # Header lines
    if personal.get("first_name") or personal.get("second_name"):
        total_lines += 2
    if any(personal.get(k) for k in ["city_country", "linkedin_url", "phone", "email"]):
        total_lines += 1

    # Professional Summary & Skills
    summary = prof.get("summary", "").strip()
    if summary:
        total_lines += max(1, len(summary) // 110 + 1)
    skills = prof.get("skills", "").strip()
    if skills:
        total_lines += max(1, len(skills) // 110 + 1)

    # Education (heading + entries)
    active_edu = 0
    for edu in education:
        if edu.get("university") or edu.get("program"):
            active_edu += 1
            total_lines += 2
            if edu.get("relevant_courses"):
                total_lines += 1
    if active_edu:
        total_lines += 1

    # Research
    active_res = 0
    for res in research:
        if res.get("title") or res.get("organization") or res.get("bullet_1"):
            active_res += 1
            total_lines += 1
            if res.get("additional_info"):
                total_lines += 1
            if res.get("bullet_1"):
                total_lines += max(1, len(res.get("bullet_1", "")) // 110 + 1)
            if res.get("bullet_2"):
                total_lines += max(1, len(res.get("bullet_2", "")) // 110 + 1)
    if active_res:
        total_lines += 1

    # Experience
    active_exp = 0
    for exp in experience:
        bullets = exp.get("bullets", [])
        if exp.get("company") or exp.get("role") or any(bullets):
            active_exp += 1
            total_lines += 1
            for b in bullets:
                if b and isinstance(b, str):
                    total_lines += max(1, len(b) // 110 + 1)
    if active_exp:
        total_lines += 1

    # Achievements
    active_ach = 0
    for k in ["awards", "leadership_1", "leadership_2", "achievement", "community_1", "community_2", "interests"]:
        val = achievements.get(k, "").strip()
        if val:
            active_ach += 1
            total_lines += max(1, len(val) // 110 + 1)
    if active_ach:
        total_lines += 1

    # Dynamic scaling tiers to ensure full, balanced vertical distribution on A4
    if total_lines <= 26:
        # Low content: spacious scaling (e.g. only 1 experience, fewer projects)
        return {
            "density": "spacious",
            "total_lines": total_lines,
            "line_height": "1.32",
            "section_margin_top": "14pt",
            "section_body_margin": "4.5pt",
            "entry_margin_bottom": "7pt",
            "bullet_margin_bottom": "3pt",
            "content_padding": "34pt 36pt 28pt 21pt",
            "font_size": "10.2pt",
            "summary_margin_bottom": "4pt",
        }
    elif total_lines <= 38:
        # Medium content: balanced scaling
        return {
            "density": "balanced",
            "total_lines": total_lines,
            "line_height": "1.23",
            "section_margin_top": "9pt",
            "section_body_margin": "3.5pt",
            "entry_margin_bottom": "4.5pt",
            "bullet_margin_bottom": "1.5pt",
            "content_padding": "28pt 36pt 22pt 21pt",
            "font_size": "10pt",
            "summary_margin_bottom": "3pt",
        }
    else:
        # High content: compact baseline to prevent page overflow
        return {
            "density": "compact",
            "total_lines": total_lines,
            "line_height": "1.15",
            "section_margin_top": "5pt",
            "section_body_margin": "2.5pt",
            "entry_margin_bottom": "2.5pt",
            "bullet_margin_bottom": "0pt",
            "content_padding": "26pt 36pt 18pt 21pt",
            "font_size": "10pt",
            "summary_margin_bottom": "2pt",
        }


def render_resume_html(data: dict, watermark_path: str = "", watermark_base64: str = "", layout_overrides: dict = None) -> str:
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

    # Build education HTML (skip empty entries)
    edu_html = ""
    for i in range(len(education)):
        edu = education[i] if i < len(education) and education[i] else {}
        uni = _escape_html(edu.get("university", ""))
        edu_city = _escape_html(edu.get("city_country", ""))
        program = _escape_html(edu.get("program", ""))
        gpa = _escape_html(edu.get("gpa", ""))
        grad_date = _escape_html(edu.get("graduation_date", ""))
        courses = _escape_html(edu.get("relevant_courses", ""))

        if not uni and not program and not edu_city:
            continue

        # Degree near institution name on Row 1
        inst_parts = [f"<strong>{uni}</strong>"] if uni else []
        if program:
            inst_parts.append(f"<em>{program}</em>")
        inst_line = " — ".join(inst_parts)

        # Specialization below on Row 2 with GPA
        sub_parts = []
        if courses:
            sub_parts.append(f"<em>{courses}</em>")
        if gpa:
            sub_parts.append(f"<span>{gpa}</span>")
        sub_line = "  ".join(sub_parts)

        edu_html += f'''
        <div class="edu-entry">
            <div class="entry-row">
                <span class="entry-left">{inst_line}</span>
                <span class="entry-right"><strong>{edu_city}</strong></span>
            </div>
            <div class="entry-row">
                <span class="entry-left">{sub_line}</span>
                <span class="entry-right"><strong><em>{grad_date}</em></strong></span>
            </div>
        </div>'''

    # Build research HTML (skip empty entries)
    res_html = ""
    for i in range(len(research)):
        res = research[i] if i < len(research) and research[i] else {}
        title = _escape_html(res.get("title", ""))
        org = _escape_html(res.get("organization", ""))
        additional = _escape_html(res.get("additional_info", ""))
        start = _escape_html(res.get("start_date", ""))
        end = _escape_html(res.get("end_date", ""))
        b1 = _escape_html(res.get("bullet_1", ""))
        b2 = _escape_html(res.get("bullet_2", ""))

        if not title and not org and not b1 and not b2:
            continue

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

    # Build experience HTML (skip empty entries)
    exp_html = ""
    for i in range(len(experience)):
        exp = experience[i] if i < len(experience) and experience[i] else {}
        company = _escape_html(exp.get("company", ""))
        domain = _escape_html(exp.get("domain", ""))
        role = _escape_html(exp.get("role", ""))
        start = _escape_html(exp.get("start_date", ""))
        end = _escape_html(exp.get("end_date", ""))
        bullets = exp.get("bullets", []) or []

        if not company and not role and not any(bullets):
            continue

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

    summary_section = f'''
        <div class="section-heading">PROFESSIONAL SUMMARY</div>
        <div class="section-body">
            {f'<div class="summary-text">{summary_text}</div>' if summary_text else ''}
            {f'<div class="skills-line"><strong>Skills:</strong> {skills_text}</div>' if skills_text else ''}
        </div>''' if (summary_text or skills_text) else ""

    edu_section = f'''
        <div class="section-heading">EDUCATION</div>
        <div class="section-body">
            {edu_html}
        </div>''' if edu_html.strip() else ""

    res_section = f'''
        <div class="section-heading">RESEARCH/PROJECT EXPERIENCE</div>
        <div class="section-body">
            {res_html}
        </div>''' if res_html.strip() else ""

    exp_section = f'''
        <div class="section-heading">PROFESSIONAL EXPERIENCE</div>
        <div class="section-body">
            {exp_html}
        </div>''' if exp_html.strip() else ""

    ach_section = f'''
        <div class="section-heading">ACHIEVEMENT AND LEADERSHIP</div>
        <div class="section-body">
            {ach_html}
        </div>''' if ach_html.strip() else ""

    # Compute adaptive density configuration & apply exact frontend DOM overrides if provided
    density = calculate_resume_density(data)
    if layout_overrides:
        for k in [
            "line_height",
            "section_margin_top",
            "section_body_margin",
            "entry_margin_bottom",
            "bullet_margin_bottom",
            "content_padding",
            "font_size",
            "summary_margin_bottom",
        ]:
            if layout_overrides.get(k):
                density[k] = str(layout_overrides[k])

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@700&display=swap');

:root {{
    --line-height: {density['line_height']};
    --section-margin-top: {density['section_margin_top']};
    --section-body-margin: {density['section_body_margin']};
    --entry-margin-bottom: {density['entry_margin_bottom']};
    --bullet-margin-bottom: {density['bullet_margin_bottom']};
    --content-padding: {density['content_padding']};
    --font-size: {density['font_size']};
    --summary-margin-bottom: {density['summary_margin_bottom']};
}}

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
    font-size: var(--font-size);
    line-height: var(--line-height);
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
    padding: var(--content-padding);
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
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
    font-size: var(--font-size);
    margin-bottom: 5pt;
    line-height: var(--line-height);
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
    margin-top: var(--section-margin-top);
    margin-bottom: 0;
    padding-bottom: 1.5pt;
    border-bottom: 1.0pt solid #000000;
    line-height: 1.15;
}}

.section-body {{
    margin-top: var(--section-body-margin);
}}

.summary-text {{
    font-family: 'Garamond', 'Georgia', serif;
    text-align: justify;
    font-size: var(--font-size);
    line-height: var(--line-height);
    margin-bottom: var(--summary-margin-bottom);
}}

.skills-line {{
    font-family: 'Garamond', 'Georgia', serif;
    font-size: var(--font-size);
    margin-bottom: var(--summary-margin-bottom);
    line-height: var(--line-height);
}}

.edu-entry {{
    margin-bottom: var(--entry-margin-bottom);
    font-family: 'Times New Roman', Times, serif;
    font-size: var(--font-size);
}}

.entry-row {{
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: var(--font-size);
    line-height: var(--line-height);
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
    line-height: var(--line-height);
}}

.research-entry, .experience-entry {{
    margin-bottom: var(--entry-margin-bottom);
    font-family: 'Times New Roman', Times, serif;
    font-size: var(--font-size);
}}

.additional-info {{
    font-size: var(--font-size);
    font-style: italic;
    line-height: var(--line-height);
}}

.bullet {{
    font-size: var(--font-size);
    line-height: var(--line-height);
    margin-bottom: var(--bullet-margin-bottom);
    padding-left: 10pt;
    text-indent: 0;
    text-align: justify;
}}

.ach-line {{
    font-family: 'Times New Roman', Times, serif;
    font-size: var(--font-size);
    line-height: var(--line-height);
    margin-bottom: var(--bullet-margin-bottom);
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
        {f'<div class="contact-info">{contact_line}</div>' if contact_line else '<div class="contact-info"></div>'}

        <div class="section-heading">PROFESSIONAL SUMMARY</div>
        <div class="section-body">
            {f'<div class="summary-text">{summary_text}</div>' if summary_text else ''}
            {f'<div class="skills-line"><strong>Skills:</strong> {skills_text}</div>' if skills_text else ''}
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
