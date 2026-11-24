"""
Flexible Resume HTML Renderer for Voltare Resume Builder (Mode 2).
Generates standalone A4 HTML with dynamic auto-spacing and embedded base64 watermark.
"""
import os
import base64
from typing import Dict, Any, Optional
from backend.flexible_validation import validate_flexible_resume

def _escape(text: Optional[str]) -> str:
    if not text:
        return ""
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )

def render_flexible_html(data: Dict[str, Any], watermark_base64: str = "") -> str:
    validation = validate_flexible_resume(data)
    density = validation.density_mode or "balanced"

    personal = data.get("personal", {})
    first_name = _escape(personal.get("first_name", "YOUR"))
    last_name = _escape(personal.get("last_name", "NAME"))
    full_name = f"{first_name} {last_name}".strip()

    contact_items = []
    if personal.get("city_state"):
        contact_items.append(f"<span>{_escape(personal.get('city_state'))}</span>")
    if personal.get("phone"):
        contact_items.append(f"<span>{_escape(personal.get('phone'))}</span>")
    if personal.get("email"):
        contact_items.append(f"<a href='mailto:{_escape(personal.get('email'))}' style='color:#7D1128;text-decoration:none;'>{_escape(personal.get('email'))}</a>")
    if personal.get("linkedin"):
        li = _escape(personal.get("linkedin").replace("https://", "").replace("http://", ""))
        contact_items.append(f"<a href='https://{li}' target='_blank' style='color:#7D1128;text-decoration:none;'>{li}</a>")
    if personal.get("portfolio"):
        port = _escape(personal.get("portfolio").replace("https://", "").replace("http://", ""))
        contact_items.append(f"<a href='https://{port}' target='_blank' style='color:#7D1128;text-decoration:none;'>{port}</a>")

    contact_html = ' <span style="color:#7D1128;font-size:9px;">•</span> '.join(contact_items)

    # Summary
    summary = data.get("summary", "").strip()
    summary_html = ""
    if summary:
        summary_html = f"""
        <section class="sec">
            <h2 class="sec-title">Professional Summary</h2>
            <p class="summary-body">{_escape(summary)}</p>
        </section>
        """

    # Skills
    skills = data.get("skills", {})
    skill_rows = []
    if skills.get("languages"):
        skill_rows.append(f"<div class='skill-row'><strong>Languages:</strong> <span>{_escape(skills.get('languages'))}</span></div>")
    if skills.get("frameworks"):
        skill_rows.append(f"<div class='skill-row'><strong>Frameworks & Web:</strong> <span>{_escape(skills.get('frameworks'))}</span></div>")
    if skills.get("tools_cloud"):
        skill_rows.append(f"<div class='skill-row'><strong>Tools & Cloud:</strong> <span>{_escape(skills.get('tools_cloud'))}</span></div>")
    if skills.get("concepts"):
        skill_rows.append(f"<div class='skill-row'><strong>Core Concepts:</strong> <span>{_escape(skills.get('concepts'))}</span></div>")

    skills_html = ""
    if skill_rows:
        skills_html = f"""
        <section class="sec">
            <h2 class="sec-title">Technical Skills</h2>
            <div class="skills-box">
                {''.join(skill_rows)}
            </div>
        </section>
        """

    # Projects
    projects = [p for p in data.get("projects", []) if p.get("title") or p.get("bullet_1")]
    project_blocks = []
    for proj in projects:
        title = _escape(proj.get("title", ""))
        stack = _escape(proj.get("tech_stack", ""))
        stack_html = f" | <em>{stack}</em>" if stack else ""
        date_range = _escape(proj.get("date_range", ""))
        link = _escape(proj.get("link", ""))
        link_html = f"<div class='link'><a href='https://{link.replace('https://', '')}' target='_blank'>{link}</a></div>" if link else ""

        bullets = []
        if proj.get("bullet_1"):
            bullets.append(f"<li>{_escape(proj.get('bullet_1'))}</li>")
        if proj.get("bullet_2"):
            bullets.append(f"<li>{_escape(proj.get('bullet_2'))}</li>")

        project_blocks.append(f"""
        <div class="item">
            <div class="topline">
                <div><strong>{title}</strong>{stack_html}</div>
                {f'<span class="date">{date_range}</span>' if date_range else ''}
            </div>
            {link_html}
            <ul class="bullets">{''.join(bullets)}</ul>
        </div>
        """)

    projects_html = ""
    if project_blocks:
        projects_html = f"""
        <section class="sec">
            <h2 class="sec-title">Projects</h2>
            <div class="items">{''.join(project_blocks)}</div>
        </section>
        """

    # Experience (rendered ONLY if candidate has experience)
    experience = [e for e in data.get("experience", []) if e.get("company") or e.get("role") or e.get("bullet_1")]
    exp_blocks = []
    for exp in experience:
        comp = _escape(exp.get("company", ""))
        loc = _escape(exp.get("location", ""))
        role = _escape(exp.get("role", ""))
        start_d = _escape(exp.get("start_date", ""))
        end_d = _escape(exp.get("end_date", ""))
        dates = f"{start_d} – {end_d}" if start_d or end_d else ""

        bullets = []
        if exp.get("bullet_1"):
            bullets.append(f"<li>{_escape(exp.get('bullet_1'))}</li>")
        if exp.get("bullet_2"):
            bullets.append(f"<li>{_escape(exp.get('bullet_2'))}</li>")
        if exp.get("bullet_3"):
            bullets.append(f"<li>{_escape(exp.get('bullet_3'))}</li>")

        exp_blocks.append(f"""
        <div class="item">
            <div class="topline">
                <strong>{comp}</strong>
                {f'<span class="loc">{loc}</span>' if loc else ''}
            </div>
            <div class="subline">
                <span class="role">{role}</span>
                {f'<span class="date">{dates}</span>' if dates else ''}
            </div>
            <ul class="bullets">{''.join(bullets)}</ul>
        </div>
        """)

    exp_html = ""
    if exp_blocks:
        exp_html = f"""
        <section class="sec">
            <h2 class="sec-title">Professional Experience</h2>
            <div class="items">{''.join(exp_blocks)}</div>
        </section>
        """

    # Education
    education = [e for e in data.get("education", []) if e.get("institution") or e.get("degree")]
    edu_blocks = []
    for edu in education:
        inst = _escape(edu.get("institution", ""))
        loc = _escape(edu.get("location", ""))
        deg = _escape(edu.get("degree", ""))
        gpa = _escape(edu.get("gpa", ""))
        gpa_html = f" ({gpa})" if gpa else ""
        gdate = _escape(edu.get("grad_date", ""))
        hl = _escape(edu.get("highlights", ""))
        hl_html = f"<div class='edu-hl'>{hl}</div>" if hl else ""

        edu_blocks.append(f"""
        <div class="item">
            <div class="topline">
                <strong>{inst}</strong>
                {f'<span class="loc">{loc}</span>' if loc else ''}
            </div>
            <div class="subline">
                <span class="role">{deg}{gpa_html}</span>
                {f'<span class="date">{gdate}</span>' if gdate else ''}
            </div>
            {hl_html}
        </div>
        """)

    edu_html = ""
    if edu_blocks:
        edu_html = f"""
        <section class="sec">
            <h2 class="sec-title">Education</h2>
            <div class="items">{''.join(edu_blocks)}</div>
        </section>
        """

    # Certifications
    certs = data.get("certifications", "").strip()
    certs_html = ""
    if certs:
        certs_html = f"""
        <section class="sec">
            <h2 class="sec-title">Certifications &amp; Honors</h2>
            <p class="summary-body">{_escape(certs)}</p>
        </section>
        """

    # Custom Section (with user's custom heading, 2 subheads, and bullets)
    custom = data.get("custom_section", {})
    custom_title = custom.get("title", "").strip()
    custom_html = ""
    if custom_title:
        sub_blocks = []
        for sub_key in ["subhead_1", "subhead_2"]:
            sub = custom.get(sub_key, {})
            stitle = _escape(sub.get("title", "").strip())
            sdate = _escape(sub.get("subtitle_or_date", "").strip())
            sdate_html = f'<span class="date">{sdate}</span>' if sdate else ''
            b1 = _escape(sub.get("bullet_1", "").strip())
            b2 = _escape(sub.get("bullet_2", "").strip())

            if stitle or b1:
                bullets = []
                if b1: bullets.append(f"<li>{b1}</li>")
                if b2: bullets.append(f"<li>{b2}</li>")
                sub_blocks.append(f"""
                <div class="item">
                    <div class="topline">
                        <strong>{stitle}</strong>
                        {sdate_html}
                    </div>
                    <ul class="bullets">{''.join(bullets)}</ul>
                </div>
                """)

        if sub_blocks:
            custom_html = f"""
            <section class="sec">
                <h2 class="sec-title">{_escape(custom_title)}</h2>
                <div class="items">{''.join(sub_blocks)}</div>
            </section>
            """

    watermark_css = f"background-image: url('data:image/png;base64,{watermark_base64}');" if watermark_base64 else ""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Voltare Resume - {full_name}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Cormorant+SC:wght@600;700&display=swap" rel="stylesheet">
    <style>
        @page {{
            size: A4 portrait;
            margin: 0;
        }}
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            background: #f7f3ef;
            font-family: 'Cormorant Garamond', 'Georgia', serif;
            color: #222;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }}
        .sheet {{
            width: 794px;
            height: 1123px;
            max-height: 1123px;
            margin: 20px auto;
            padding: 38px 44px;
            background: #fff;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            background-size: 500px auto;
            background-repeat: no-repeat;
            background-position: center;
            display: flex;
            flex-direction: column;
            {watermark_css}
        }}
        .sections-box {{
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }}
        .sheet.density-spacious {{
            --gap: 16px;
            --item-gap: 9px;
            --lh: 1.28;
            --fs: 14px;
        }}
        .sheet.density-balanced {{
            --gap: 12px;
            --item-gap: 7px;
            --lh: 1.20;
            --fs: 13.5px;
        }}
        .sheet.density-compact {{
            --gap: 9px;
            --item-gap: 4px;
            --lh: 1.14;
            --fs: 13px;
        }}
        .sheet.density-overflow {{
            --gap: 7px;
            --item-gap: 3px;
            --lh: 1.10;
            --fs: 12.5px;
        }}
        header {{
            text-align: center;
            margin-bottom: var(--gap);
            border-bottom: 1.5px solid #7D1128;
            padding-bottom: 8px;
        }}
        h1 {{
            font-family: 'Cormorant SC', 'Georgia', serif;
            font-size: 26px;
            font-weight: 700;
            color: #7D1128;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            line-height: 1.1;
            margin-bottom: 4px;
        }}
        .contact {{
            font-size: 12.5px;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            gap: 6px;
            line-height: 1.2;
        }}
        .sec {{
            margin-bottom: var(--gap);
            page-break-inside: avoid;
        }}
        .sec-title {{
            font-family: 'Cormorant SC', 'Georgia', serif;
            font-size: 13.5px;
            font-weight: 700;
            color: #7D1128;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            border-bottom: 1px solid #7D1128;
            padding-bottom: 2px;
            margin-bottom: 4px;
            line-height: 1.2;
        }}
        .summary-body {{
            font-size: var(--fs);
            line-height: var(--lh);
            text-align: justify;
            color: #2b2b2b;
        }}
        .skills-box {{
            display: flex;
            flex-direction: column;
            gap: 3px;
            font-size: var(--fs);
            line-height: var(--lh);
        }}
        .skill-row {{
            display: flex;
            gap: 6px;
        }}
        .skill-row strong {{
            min-width: 140px;
            flex-shrink: 0;
            color: #111;
        }}
        .items {{
            display: flex;
            flex-direction: column;
            gap: var(--item-gap);
        }}
        .item {{
            display: flex;
            flex-direction: column;
        }}
        .topline {{
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: var(--fs);
            line-height: var(--lh);
        }}
        .topline strong {{
            color: #111;
        }}
        .subline {{
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: calc(var(--fs) - 0.5px);
            color: #444;
            line-height: var(--lh);
        }}
        .loc, .date {{
            font-weight: 600;
            color: #444;
            font-size: calc(var(--fs) - 0.5px);
            white-space: nowrap;
        }}
        .role {{
            font-style: italic;
            color: #333;
        }}
        .link {{
            font-size: calc(var(--fs) - 1px);
            margin: 1px 0;
        }}
        .link a {{
            color: #1d5f82;
            text-decoration: none;
        }}
        .bullets {{
            margin: 3px 0 0 16px;
            padding: 0;
            font-size: var(--fs);
            line-height: var(--lh);
            color: #2b2b2b;
        }}
        .bullets li {{
            margin-bottom: 2px;
        }}
        .edu-hl {{
            font-size: calc(var(--fs) - 1px);
            color: #555;
            margin-top: 2px;
        }}
        @media print {{
            body {{
                background: #fff;
            }}
            .sheet {{
                margin: 0;
                box-shadow: none;
                page-break-after: avoid;
            }}
        }}
    </style>
</head>
<body>
    <div class="sheet density-{density}">
        <header>
            <h1>{full_name}</h1>
            <div class="contact">{contact_html}</div>
        </header>
        <div class="sections-box">
            {summary_html}
            {skills_html}
            {projects_html}
            {exp_html}
            {edu_html}
            {certs_html}
            {custom_html}
        </div>
    </div>
</body>
</html>"""
