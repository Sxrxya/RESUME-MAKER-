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
    if first_name or second_name:
        name_display = f"{first_name} {second_name}".strip()
    else:
        name_display = "&lt;FIRSTNAME&gt; &lt;SECONDNAME&gt;"

    city = _escape_html(personal.get("city_country", ""))
    linkedin = _escape_html(personal.get("linkedin_url", ""))
    phone = _escape_html(personal.get("phone", ""))
    email = _escape_html(personal.get("email", ""))

    contact_parts = []
    contact_parts.append(city if city else "City, State (Or Country If Applying Outside India)")

    linkedin_val = linkedin if linkedin else "LinkedIn"
    contact_parts.append(f'<a href="https://{linkedin_val}" style="color:#0000ff;text-decoration:underline;">{linkedin_val}</a>')

    contact_parts.append(phone if phone else "+91 12233 34455")

    email_val = email if email else "youremail@youremail.com"
    contact_parts.append(f'<a href="mailto:{email_val}" style="color:#0000ff;text-decoration:underline;">{email_val}</a>')

    contact_line = " | ".join(contact_parts)

    summary_text = _escape_html(prof.get("summary", ""))
    if not summary_text:
        summary_text = "My Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui sunt in culpa qui Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero, Cras id dui trebur"

    skills_text = _escape_html(prof.get("skills", ""))
    if not skills_text:
        skills_text = "Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris, praesent adipiscing , ahteegnas, ayevo, veniam, quis, nulla pari."

    # Build education HTML (ensure all 3 entries render)
    default_edu = [
        {"university": "ABC University", "city_country": "City, Country", "program": "Program Name", "gpa": "(GPA – X.X)", "graduation_date": "mon YYYY", "relevant_courses": "{Relevant Courses: if any}"},
        {"university": "ABC University", "city_country": "City, Country", "program": "Program Name", "gpa": "", "graduation_date": "mon YYYY", "relevant_courses": "{Relevant Courses: if any}"},
        {"university": "ABC University", "city_country": "City, Country", "program": "Program Name", "gpa": "", "graduation_date": "mon YYYY", "relevant_courses": "{Relevant Courses: if any}"}
    ]
    edu_html = ""
    for i in range(3):
        edu = education[i] if i < len(education) and education[i] else default_edu[i]
        uni = _escape_html(edu.get("university", "") or default_edu[i]["university"])
        edu_city = _escape_html(edu.get("city_country", "") or default_edu[i]["city_country"])
        program = _escape_html(edu.get("program", "") or default_edu[i]["program"])
        gpa = _escape_html(edu.get("gpa", "") or (default_edu[i]["gpa"] if i == 0 else ""))
        grad_date = _escape_html(edu.get("graduation_date", "") or default_edu[i]["graduation_date"])
        courses = _escape_html(edu.get("relevant_courses", "") or default_edu[i]["relevant_courses"])

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
    default_res = [
        {"title": "Research Paper /Project Name", "organization": "ABC University", "additional_info": "with additional information (if any)", "start_date": "Mon YYYY", "end_date": "Mon YYYY", "bullet_1": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem Aenean viverra .", "bullet_2": "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad pellentesque habitant morbi tristique senectus"},
        {"title": "Research Paper /Project Name", "organization": "ABC University", "additional_info": "with additional information (if any)", "start_date": "Mon YYYY", "end_date": "Mon YYYY", "bullet_1": "Minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae In hac habitasse platea dictumst ramuklihtnes.", "bullet_2": "Consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur At vero eos et accusamus et iusto el praesent libero Sed cursus ante"},
        {"title": "Research Paper /Project Name", "organization": "ABC University", "additional_info": "with  additional information (if any)", "start_date": "Mon YYYY", "end_date": "Mon YYYY", "bullet_1": "Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent curabitur at lacus ac velit ornare lobortis.", "bullet_2": "Per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor ahtews."}
    ]
    res_html = ""
    for i in range(3):
        res = research[i] if i < len(research) and research[i] else default_res[i]
        title = _escape_html(res.get("title", "") or default_res[i]["title"])
        org = _escape_html(res.get("organization", "") or default_res[i]["organization"])
        additional = _escape_html(res.get("additional_info", "") or default_res[i]["additional_info"])
        start = _escape_html(res.get("start_date", "") or default_res[i]["start_date"])
        end = _escape_html(res.get("end_date", "") or default_res[i]["end_date"])
        b1 = _escape_html(res.get("bullet_1", "") or default_res[i]["bullet_1"])
        b2 = _escape_html(res.get("bullet_2", "") or default_res[i]["bullet_2"])

        dates = f"{start} – {end}"

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

    # Build experience HTML (ensure all 3 entries render)
    default_exp = [
        {"company": "XYZ Company", "domain": "Domain/Industry", "role": "Role Name", "start_date": "Mon YYYY", "end_date": "Mon YYYY", "bullets": ["Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh.Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra per inceptos himenaeos."]},
        {"company": "XYZ Company", "domain": "Domain/Industry", "role": "Role Name", "start_date": "Mon YYYY", "end_date": "Mon YYYY", "bullets": ["Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. et malesuada fames ac turpis .", "Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor,"]},
        {"company": "XYZ Company", "domain": "Domain/Industry", "role": "Role Name", "start_date": "Mon YYYY", "end_date": "Mon YYYY", "bullets": ["In hac habitasse platea dictumst. Curabitur at lacus ac velit ornare lobortis. Curabitur a felis in nunc fringilla tristique. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Vivamus quis mi. Phasellus a est. Phasellus magna quis ligula lacinia aliquet."]}
    ]
    exp_html = ""
    for i in range(3):
        exp = experience[i] if i < len(experience) and experience[i] else default_exp[i]
        company = _escape_html(exp.get("company", "") or default_exp[i]["company"])
        domain = _escape_html(exp.get("domain", "") or default_exp[i]["domain"])
        role = _escape_html(exp.get("role", "") or default_exp[i]["role"])
        start = _escape_html(exp.get("start_date", "") or default_exp[i]["start_date"])
        end = _escape_html(exp.get("end_date", "") or default_exp[i]["end_date"])
        bullets = exp.get("bullets", []) or default_exp[i]["bullets"]

        dates = f"{start} – {end}"

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
    default_ach = {
        "awards": "Aenean imperdiet. Etiam ultricies nisi vel augue.Curabitur ullamcorper ultricies nisi. Nam eget dui Etiam rhoncus .",
        "leadership_1": "Leadership Role, Community/Club Name: Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id mperdiet feugiat, pede. pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis gesta.",
        "leadership_2": "Leadership Role, Community/ Club Name: Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo alujnam ahtews uhsnayirp",
        "achievement": "Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. op urallan rahknayhba.",
        "community_1": "Role, Community/ Club Name: Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum fringilla pede sit amet augue. Nullam sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec.",
        "community_2": "Career Counsellor, DAV Group of Schools: ellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce id purus.Ut varius tincidunt libero. Phasellus dolor. Maecenas vestibulum mollis diam.",
        "interests": "In dui magna, posuere eget, vestibulum et, tempor auctor, justo, Proin sapien ipsum, porta a, auctor quis, euiql."
    }

    awards_text = _escape_html(achievements.get("awards", "") or default_ach["awards"])
    lead1 = _escape_html(achievements.get("leadership_1", "") or default_ach["leadership_1"])
    lead2 = _escape_html(achievements.get("leadership_2", "") or default_ach["leadership_2"])
    ach_text = _escape_html(achievements.get("achievement", "") or default_ach["achievement"])
    comm1 = _escape_html(achievements.get("community_1", "") or default_ach["community_1"])
    comm2 = _escape_html(achievements.get("community_2", "") or default_ach["community_2"])
    interests = _escape_html(achievements.get("interests", "") or default_ach["interests"])

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
