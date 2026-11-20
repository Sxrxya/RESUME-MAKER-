"""Candidate input form for Voltare resume builder."""
import json
import os
import sys

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from frontend.components import limited_text_input, limited_text_area, section_header

CONFIG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "config")


def _load_limits():
    path = os.path.join(CONFIG_DIR, "field_limits.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


LIMITS = _load_limits()


def render_personal_info(st):
    """Render personal information fields."""
    section_header(st, "Personal Information", "Your basic contact details")

    p = LIMITS["personal"]
    col1, col2 = st.columns(2)

    with col1:
        first_name = limited_text_input(
            st, "first_name", p["first_name"]["label"],
            p["first_name"]["max_chars"], required=True,
            placeholder=p["first_name"]["placeholder"],
        )
    with col2:
        second_name = limited_text_input(
            st, "second_name", p["second_name"]["label"],
            p["second_name"]["max_chars"], required=True,
            placeholder=p["second_name"]["placeholder"],
        )

    city_country = limited_text_input(
        st, "city_country", p["city_country"]["label"],
        p["city_country"]["max_chars"], required=True,
        placeholder=p["city_country"]["placeholder"],
    )

    linkedin_url = limited_text_input(
        st, "linkedin_url", p["linkedin_url"]["label"],
        p["linkedin_url"]["max_chars"], required=True,
        placeholder=p["linkedin_url"]["placeholder"],
    )

    col3, col4 = st.columns(2)
    with col3:
        phone = limited_text_input(
            st, "phone", p["phone"]["label"],
            p["phone"]["max_chars"], required=True,
            placeholder=p["phone"]["placeholder"],
        )
    with col4:
        email = limited_text_input(
            st, "email", p["email"]["label"],
            p["email"]["max_chars"], required=True,
            placeholder=p["email"]["placeholder"],
        )

    return {
        "first_name": first_name,
        "second_name": second_name,
        "city_country": city_country,
        "linkedin_url": linkedin_url,
        "phone": phone,
        "email": email,
    }


def render_professional_summary(st):
    """Render professional summary fields."""
    section_header(st, "Professional Summary", "A concise overview of your professional profile")

    p = LIMITS["professional_summary"]

    summary = limited_text_area(
        st, "summary", p["summary"]["label"],
        p["summary"]["max_chars"],
        max_lines=p["summary"].get("max_lines"),
        required=True,
        placeholder=p["summary"]["placeholder"],
        height=120,
    )

    skills = limited_text_input(
        st, "skills", p["skills"]["label"],
        p["skills"]["max_chars"], required=True,
        placeholder=p["skills"]["placeholder"],
    )

    return {"summary": summary, "skills": skills}


def render_education(st):
    """Render education section with exactly 3 entries."""
    section_header(st, "Education", "Exactly 3 education entries required")

    p = LIMITS["education"]["entry_fields"]
    entries = []

    tabs = st.tabs(["Education 1", "Education 2", "Education 3"])

    for i, tab in enumerate(tabs):
        with tab:
            idx = i + 1
            col1, col2 = st.columns([2, 1])
            with col1:
                university = limited_text_input(
                    st, f"edu_{idx}_university", p["university"]["label"],
                    p["university"]["max_chars"], required=True,
                    placeholder=p["university"]["placeholder"],
                )
            with col2:
                city = limited_text_input(
                    st, f"edu_{idx}_city", p["city_country"]["label"],
                    p["city_country"]["max_chars"], required=True,
                    placeholder=p["city_country"]["placeholder"],
                )

            col3, col4 = st.columns([2, 1])
            with col3:
                program = limited_text_input(
                    st, f"edu_{idx}_program", p["program"]["label"],
                    p["program"]["max_chars"], required=True,
                    placeholder=p["program"]["placeholder"],
                )
            with col4:
                gpa = limited_text_input(
                    st, f"edu_{idx}_gpa", p["gpa"]["label"],
                    p["gpa"]["max_chars"], required=False,
                    placeholder=p["gpa"]["placeholder"],
                )

            col5, col6 = st.columns([1, 2])
            with col5:
                grad_date = limited_text_input(
                    st, f"edu_{idx}_date", p["graduation_date"]["label"],
                    p["graduation_date"]["max_chars"], required=True,
                    placeholder=p["graduation_date"]["placeholder"],
                )
            with col6:
                courses = limited_text_input(
                    st, f"edu_{idx}_courses", p["relevant_courses"]["label"],
                    p["relevant_courses"]["max_chars"], required=False,
                    placeholder=p["relevant_courses"]["placeholder"],
                )

            entries.append({
                "university": university,
                "city_country": city,
                "program": program,
                "gpa": gpa,
                "graduation_date": grad_date,
                "relevant_courses": courses,
            })

    return entries


def render_research_projects(st):
    """Render research/project section with exactly 3 entries."""
    section_header(st, "Research / Project Experience", "Exactly 3 entries, 2 bullet points each")

    p = LIMITS["research_projects"]["entry_fields"]
    entries = []

    tabs = st.tabs(["Project 1", "Project 2", "Project 3"])

    for i, tab in enumerate(tabs):
        with tab:
            idx = i + 1
            title = limited_text_input(
                st, f"res_{idx}_title", p["title"]["label"],
                p["title"]["max_chars"], required=True,
                placeholder=p["title"]["placeholder"],
            )

            col1, col2 = st.columns(2)
            with col1:
                org = limited_text_input(
                    st, f"res_{idx}_org", p["organization"]["label"],
                    p["organization"]["max_chars"], required=True,
                    placeholder=p["organization"]["placeholder"],
                )
            with col2:
                additional = limited_text_input(
                    st, f"res_{idx}_additional", p["additional_info"]["label"],
                    p["additional_info"]["max_chars"], required=False,
                    placeholder=p["additional_info"]["placeholder"],
                )

            col3, col4 = st.columns(2)
            with col3:
                start = limited_text_input(
                    st, f"res_{idx}_start", p["start_date"]["label"],
                    p["start_date"]["max_chars"], required=True,
                    placeholder=p["start_date"]["placeholder"],
                )
            with col4:
                end = limited_text_input(
                    st, f"res_{idx}_end", p["end_date"]["label"],
                    p["end_date"]["max_chars"], required=True,
                    placeholder=p["end_date"]["placeholder"],
                )

            bullet_1 = limited_text_area(
                st, f"res_{idx}_b1", p["bullet_1"]["label"],
                p["bullet_1"]["max_chars"],
                max_lines=p["bullet_1"].get("max_lines"),
                required=True,
                placeholder=p["bullet_1"]["placeholder"],
                height=70,
            )

            bullet_2 = limited_text_area(
                st, f"res_{idx}_b2", p["bullet_2"]["label"],
                p["bullet_2"]["max_chars"],
                max_lines=p["bullet_2"].get("max_lines"),
                required=True,
                placeholder=p["bullet_2"]["placeholder"],
                height=70,
            )

            entries.append({
                "title": title,
                "organization": org,
                "additional_info": additional,
                "start_date": start,
                "end_date": end,
                "bullet_1": bullet_1,
                "bullet_2": bullet_2,
            })

    return entries


def render_professional_experience(st):
    """Render professional experience with exactly 3 entries (1, 2, 1 bullets)."""
    section_header(st, "Professional Experience", "3 entries: 1 bullet, 2 bullets, 1 bullet")

    exp_configs = LIMITS["professional_experience"]["entries"]
    entries = []

    tabs = st.tabs(["Experience 1 (1 bullet)", "Experience 2 (2 bullets)", "Experience 3 (1 bullet)"])

    for i, tab in enumerate(tabs):
        with tab:
            idx = i + 1
            fields = exp_configs[i]["fields"]
            num_bullets = exp_configs[i]["num_bullets"]

            col1, col2 = st.columns([2, 1])
            with col1:
                company = limited_text_input(
                    st, f"exp_{idx}_company", fields["company"]["label"],
                    fields["company"]["max_chars"], required=True,
                    placeholder=fields["company"]["placeholder"],
                )
            with col2:
                domain = limited_text_input(
                    st, f"exp_{idx}_domain", fields["domain"]["label"],
                    fields["domain"]["max_chars"], required=True,
                    placeholder=fields["domain"]["placeholder"],
                )

            col3, col4 = st.columns(2)
            with col3:
                role = limited_text_input(
                    st, f"exp_{idx}_role", fields["role"]["label"],
                    fields["role"]["max_chars"], required=True,
                    placeholder=fields["role"]["placeholder"],
                )
            with col4:
                col5, col6 = st.columns(2)
                with col5:
                    start = limited_text_input(
                        st, f"exp_{idx}_start", fields["start_date"]["label"],
                        fields["start_date"]["max_chars"], required=True,
                        placeholder=fields["start_date"]["placeholder"],
                    )
                with col6:
                    end = limited_text_input(
                        st, f"exp_{idx}_end", fields["end_date"]["label"],
                        fields["end_date"]["max_chars"], required=True,
                        placeholder=fields["end_date"]["placeholder"],
                    )

            bullets = []
            for b in range(1, num_bullets + 1):
                bullet_key = f"bullet_{b}"
                bullet = limited_text_area(
                    st, f"exp_{idx}_b{b}", fields[bullet_key]["label"],
                    fields[bullet_key]["max_chars"],
                    max_lines=fields[bullet_key].get("max_lines"),
                    required=True,
                    placeholder=fields[bullet_key]["placeholder"],
                    height=70,
                )
                bullets.append(bullet)

            entries.append({
                "company": company,
                "domain": domain,
                "role": role,
                "start_date": start,
                "end_date": end,
                "bullets": bullets,
            })

    return entries


def render_achievements_leadership(st):
    """Render achievements and leadership section."""
    section_header(st, "Achievement & Leadership", "Awards, leadership roles, achievements, community involvement")

    p = LIMITS["achievements_leadership"]

    awards = limited_text_area(
        st, "awards", p["awards"]["label"],
        p["awards"]["max_chars"], required=False,
        placeholder=p["awards"]["placeholder"], height=60,
    )

    st.markdown("**Leadership Entries**")
    leadership_1 = limited_text_area(
        st, "leadership_1", p["leadership_1"]["label"],
        p["leadership_1"]["max_chars"], required=False,
        placeholder=p["leadership_1"]["placeholder"], height=60,
    )

    leadership_2 = limited_text_area(
        st, "leadership_2", p["leadership_2"]["label"],
        p["leadership_2"]["max_chars"], required=False,
        placeholder=p["leadership_2"]["placeholder"], height=60,
    )

    achievement = limited_text_area(
        st, "achievement", p["achievement"]["label"],
        p["achievement"]["max_chars"], required=False,
        placeholder=p["achievement"]["placeholder"], height=60,
    )

    st.markdown("**Community Entries**")
    community_1 = limited_text_area(
        st, "community_1", p["community_1"]["label"],
        p["community_1"]["max_chars"], required=False,
        placeholder=p["community_1"]["placeholder"], height=60,
    )

    community_2 = limited_text_area(
        st, "community_2", p["community_2"]["label"],
        p["community_2"]["max_chars"], required=False,
        placeholder=p["community_2"]["placeholder"], height=60,
    )

    interests = limited_text_input(
        st, "interests", p["interests"]["label"],
        p["interests"]["max_chars"], required=False,
        placeholder=p["interests"]["placeholder"],
    )

    return {
        "awards": awards,
        "leadership_1": leadership_1,
        "leadership_2": leadership_2,
        "achievement": achievement,
        "community_1": community_1,
        "community_2": community_2,
        "interests": interests,
    }


def render_candidate_form(st):
    """Render the complete candidate input form and return all data."""
    form_tabs = st.tabs([
        "👤 Personal", "📝 Summary", "🎓 Education",
        "🔬 Research", "💼 Experience", "🏆 Achievements",
    ])

    with form_tabs[0]:
        personal = render_personal_info(st)
    with form_tabs[1]:
        prof_summary = render_professional_summary(st)
    with form_tabs[2]:
        education = render_education(st)
    with form_tabs[3]:
        research = render_research_projects(st)
    with form_tabs[4]:
        experience = render_professional_experience(st)
    with form_tabs[5]:
        achievements = render_achievements_leadership(st)

    return {
        "personal_info": personal,
        "professional_summary": prof_summary,
        "education": education,
        "research_projects": research,
        "professional_experience": experience,
        "achievements_leadership": achievements,
    }
