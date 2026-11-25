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

def render_flexible_html(data: Dict[str, Any], watermark_base64: str = "", layout_overrides: Optional[Dict[str, Any]] = None, is_non_technical: bool = False) -> str:
    validation = validate_flexible_resume(data)
    density = validation.density_mode or "balanced"

    personal = data.get("personal", {})
    first_name = _escape(personal.get("first_name", ""))
    last_name = _escape(personal.get("last_name", ""))
    full_name = f"{first_name} {last_name}".strip()

    contact_items = []
    if personal.get("city_state"):
        contact_items.append(f"<span class='flex-contact-item'>{_escape(personal.get('city_state'))}</span>")
    if personal.get("phone"):
        contact_items.append(f"<span class='flex-contact-item'>{_escape(personal.get('phone'))}</span>")
    if personal.get("email"):
        em = _escape(personal.get("email"))
        contact_items.append(f"<span class='flex-contact-item'><a href='mailto:{em}' class='flex-contact-link'>{em}</a></span>")
    if personal.get("linkedin"):
        raw_li = personal.get("linkedin").strip()
        href_li = raw_li if raw_li.startswith("http") else f"https://{raw_li}"
        contact_items.append(f"<span class='flex-contact-item'><a href='{href_li}' target='_blank' class='flex-contact-link'>LinkedIn</a></span>")
    if personal.get("portfolio"):
        raw_port = personal.get("portfolio").strip()
        href_port = raw_port if raw_port.startswith("http") else f"https://{raw_port}"
        port_lower = raw_port.lower()
        if "github.com" in port_lower:
            port_label = "GitHub"
        elif "behance.net" in port_lower or "dribbble.com" in port_lower:
            port_label = "Portfolio"
        else:
            port_label = "Website"
        contact_items.append(f"<span class='flex-contact-item'><a href='{href_port}' target='_blank' class='flex-contact-link'>{port_label}</a></span>")

    contact_html = ' <span class="flex-bullet-sep">•</span> '.join(contact_items)

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
    tools_label = "Tools &amp; Business Software:" if is_non_technical else "Tools &amp; Software:"
    lang_label = "Languages &amp; Communication:" if is_non_technical else "Languages &amp; Tech:"
    domain_label = "Industry Knowledge:" if is_non_technical else "Domain Knowledge:"

    if skills.get("concepts"):
        skill_rows.append(f"<div class='skill-row'><strong>Core Competencies:</strong> <span>{_escape(skills.get('concepts'))}</span></div>")
    if skills.get("tools_cloud"):
        skill_rows.append(f"<div class='skill-row'><strong>{tools_label}</strong> <span>{_escape(skills.get('tools_cloud'))}</span></div>")
    if skills.get("languages"):
        skill_rows.append(f"<div class='skill-row'><strong>{lang_label}</strong> <span>{_escape(skills.get('languages'))}</span></div>")
    if skills.get("frameworks"):
        skill_rows.append(f"<div class='skill-row'><strong>{domain_label}</strong> <span>{_escape(skills.get('frameworks'))}</span></div>")

    skills_html = ""
    if skill_rows:
        skills_html = f"""
        <section class="sec">
            <h2 class="sec-title">Skills</h2>
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

    # Adaptive Page Composition: calculate exact parameters matching client-side engine
    capacity = validation.capacity_percent
    if capacity < 75:
        slack_ratio = min(1.0, max(0.0, (75 - capacity) / 45))
        padding_y = int(38 + 8 * slack_ratio)
        sec_gap = int(14 + 7 * slack_ratio)
        item_gap = int(6 + 4 * slack_ratio)
        lh = round(1.22 + 0.10 * slack_ratio, 2)
        summary_lh = round(1.24 + 0.12 * slack_ratio, 2)
        bullet_gap = int(3 + 3 * slack_ratio)
        skill_gap = int(3 + 3 * slack_ratio)
        fs = round(13.5 + 0.6 * slack_ratio, 1)
        h2_margin = int(4 + 3 * slack_ratio)
    elif capacity > 95:
        comp_ratio = min(1.0, max(0.0, (capacity - 95) / 25))
        padding_y = int(38 - 8 * comp_ratio)
        sec_gap = int(14 - 5 * comp_ratio)
        item_gap = int(6 - 3 * comp_ratio)
        lh = round(1.22 - 0.08 * comp_ratio, 2)
        summary_lh = round(1.24 - 0.08 * comp_ratio, 2)
        bullet_gap = max(1, int(3 - 1.5 * comp_ratio))
        skill_gap = max(2, int(3 - 1 * comp_ratio))
        fs = round(13.5 - 0.8 * comp_ratio, 1)
        h2_margin = int(4 - 1 * comp_ratio)
    else:
        padding_y = 34
        sec_gap = 13
        item_gap = 5
        lh = 1.20
        summary_lh = 1.22
        bullet_gap = 2.5
        skill_gap = 2.5
        fs = 13.2
        h2_margin = 4

    # Sync exact layout overrides computed by the frontend DOM fitter for 100% Preview-to-PDF parity
    if layout_overrides:
        css_vars = layout_overrides.get("cssVariables") or {}
        def _num(val, fallback):
            if val is None:
                return fallback
            try:
                return float(str(val).replace("px", "").strip())
            except (ValueError, TypeError):
                return fallback

        if layout_overrides.get("paddingY") is not None:
            padding_y = int(round(_num(layout_overrides.get("paddingY"), padding_y)))
        fs = _num(css_vars.get("--flex-font-size"), fs)
        lh = _num(css_vars.get("--flex-line-height"), lh)
        summary_lh = _num(css_vars.get("--flex-summary-lh"), summary_lh)
        sec_gap = _num(css_vars.get("--flex-sec-gap"), sec_gap)
        item_gap = _num(css_vars.get("--flex-item-gap"), item_gap)
        bullet_gap = _num(css_vars.get("--flex-bullet-gap"), bullet_gap)
        skill_gap = _num(css_vars.get("--flex-skill-row-gap"), skill_gap)
        h2_margin = _num(css_vars.get("--flex-h2-margin"), h2_margin)

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
            padding: {padding_y}px 44px;
            background: #fff;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            background-size: 500px auto;
            background-repeat: no-repeat;
            background-position: center;
            display: flex;
            flex-direction: column;
            --gap: {sec_gap}px;
            --item-gap: {item_gap}px;
            --lh: {lh};
            --summary-lh: {summary_lh};
            --bullet-gap: {bullet_gap}px;
            --skill-gap: {skill_gap}px;
            --fs: {fs}px;
            --h2-margin: {h2_margin}px;
            {watermark_css}
        }}
        .sections-box {{
            display: flex;
            flex-direction: column;
            gap: var(--gap, 14px);
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
            gap: 4px 6px;
            line-height: 1.35;
        }}
        .flex-contact-item {{
            display: inline-flex;
            align-items: center;
            white-space: nowrap;
        }}
        .flex-contact-link {{
            color: #7D1128 !important;
            text-decoration: underline !important;
            text-underline-offset: 2px;
            font-weight: 500;
        }}
        .flex-bullet-sep {{
            color: #7D1128;
            font-size: 10px;
            user-select: none;
            padding: 0 1px;
        }}
        .sec {{
            margin-bottom: 0;
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
            margin-bottom: var(--h2-margin, 4px);
            line-height: 1.2;
        }}
        .summary-body {{
            font-size: var(--fs);
            line-height: var(--summary-lh, var(--lh));
            text-align: justify;
            color: #2b2b2b;
        }}
        .skills-box {{
            display: flex;
            flex-direction: column;
            gap: var(--skill-gap, 3px);
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
            margin-bottom: var(--bullet-gap, 2px);
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
    <script>
    window.addEventListener('DOMContentLoaded', () => {{
        const sheet = document.querySelector('.sheet');
        const hdr = sheet && sheet.querySelector('header');
        const box = sheet && sheet.querySelector('.sections-box');
        if (!sheet || !hdr || !box) return;

        const targetHeight = 1123;
        const safeCeiling = 1105;
        const cs = getComputedStyle(sheet);
        const measureUsed = () => {{
            const s = getComputedStyle(sheet);
            return hdr.offsetHeight + box.offsetHeight + parseFloat(s.paddingTop) + parseFloat(s.paddingBottom);
        }};

        let used = measureUsed();
        const coverage = used / targetHeight;
        // If content covers >= 65% and still leaves > 22px empty space in PDF renderer, fine-tune up to ~98% fill
        if (coverage >= 0.65 && (safeCeiling - used) > 22) {{
            const baseFs = parseFloat(cs.getPropertyValue('--fs')) || 13.2;
            const baseLh = parseFloat(cs.getPropertyValue('--lh')) || 1.20;
            const baseSumLh = parseFloat(cs.getPropertyValue('--summary-lh')) || 1.22;
            const baseGap = parseFloat(cs.getPropertyValue('--gap')) || 13;
            const baseItem = parseFloat(cs.getPropertyValue('--item-gap')) || 5;
            const baseBul = parseFloat(cs.getPropertyValue('--bullet-gap')) || 2.5;
            const basePadY = parseFloat(cs.paddingTop) || 34;

            const applyRatio = (r) => {{
                const lerp = (a, b) => a + (b - a) * r;
                sheet.style.setProperty('--fs', lerp(baseFs, 15.0).toFixed(2) + 'px');
                sheet.style.setProperty('--lh', lerp(baseLh, 1.38).toFixed(2));
                sheet.style.setProperty('--summary-lh', lerp(baseSumLh, 1.42).toFixed(2));
                sheet.style.setProperty('--gap', Math.round(lerp(baseGap, 24)) + 'px');
                sheet.style.setProperty('--item-gap', Math.round(lerp(baseItem, 11)) + 'px');
                sheet.style.setProperty('--bullet-gap', lerp(baseBul, 5).toFixed(1) + 'px');
                const py = Math.round(lerp(basePadY, 44));
                sheet.style.paddingTop = py + 'px';
                sheet.style.paddingBottom = py + 'px';
            }};

            let low = 0, high = 1, best = 0;
            for (let i = 0; i < 8; i++) {{
                const mid = (low + high) / 2;
                applyRatio(mid);
                if (measureUsed() <= safeCeiling) {{
                    best = mid;
                    low = mid;
                }} else {{
                    high = mid;
                }}
            }}
            applyRatio(best);
        }}
    }});
    </script>
</body>
</html>"""
