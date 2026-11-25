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

# Exact reference content from 'Voltare Resume Format.docx (1).pdf'
SAMPLE_CANDIDATE_DATA = {
    "first_name": "<FIRSTNAME>",
    "second_name": "<LASTNAME>",
    "city_country": "City, State (Or Country If Applying Outside India)",
    "linkedin_url": "LinkedIn",
    "phone": "+91 12233 34455",
    "email": "youremail@youremail.com",
    "summary": "My Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui sunt in culpa qui Phasellus ullamcorper ipsum rutrum nunc. Nunc nonummy metus. Vestibulum volutpat pretium libero, Cras id dui trebur",
    "skills": "Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris, praesent adipiscing , ahteegnas, ayevo, veniam, quis, nulla pari.",
    "edu_1_university": "ABC University",
    "edu_1_city": "City, Country",
    "edu_1_program": "Program Name",
    "edu_1_gpa": "(GPA – X.X)",
    "edu_1_date": "mon YYYY",
    "edu_1_courses": "{Relevant Courses: if any}",
    "edu_2_university": "ABC University",
    "edu_2_city": "City, Country",
    "edu_2_program": "Program Name",
    "edu_2_gpa": "",
    "edu_2_date": "mon YYYY",
    "edu_2_courses": "{Relevant Courses: if any}",
    "edu_3_university": "ABC University",
    "edu_3_city": "City, Country",
    "edu_3_program": "Program Name",
    "edu_3_gpa": "",
    "edu_3_date": "mon YYYY",
    "edu_3_courses": "{Relevant Courses: if any}",
    "res_1_title": "Research Paper /Project Name",
    "res_1_org": "ABC University",
    "res_1_additional": "with additional information (if any)",
    "res_1_start": "Mon YYYY",
    "res_1_end": "Mon YYYY",
    "res_1_b1": "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem Aenean viverra .",
    "res_1_b2": "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad pellentesque habitant morbi tristique senectus",
    "res_2_title": "Research Paper /Project Name",
    "res_2_org": "ABC University",
    "res_2_additional": "with additional information (if any)",
    "res_2_start": "Mon YYYY",
    "res_2_end": "Mon YYYY",
    "res_2_b1": "Minim veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae In hac habitasse platea dictumst ramuklihtnes.",
    "res_2_b2": "Consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur At vero eos et accusamus et iusto el praesent libero Sed cursus ante",
    "res_3_title": "Research Paper /Project Name",
    "res_3_org": "ABC University",
    "res_3_additional": "with  additional information (if any)",
    "res_3_start": "Mon YYYY",
    "res_3_end": "Mon YYYY",
    "res_3_b1": "Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent curabitur at lacus ac velit ornare lobortis.",
    "res_3_b2": "Per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor ahtews.",
    "exp_1_company": "XYZ Company",
    "exp_1_domain": "Domain/Industry",
    "exp_1_role": "Role Name",
    "exp_1_start": "Mon YYYY",
    "exp_1_end": "Mon YYYY",
    "exp_1_b1": "Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh.Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra per inceptos himenaeos.",
    "exp_2_company": "XYZ Company",
    "exp_2_domain": "Domain/Industry",
    "exp_2_role": "Role Name",
    "exp_2_start": "Mon YYYY",
    "exp_2_end": "Mon YYYY",
    "exp_2_b1": "Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. et malesuada fames ac turpis .",
    "exp_2_b2": "Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor,",
    "exp_3_company": "XYZ Company",
    "exp_3_domain": "Domain/Industry",
    "exp_3_role": "Role Name",
    "exp_3_start": "Mon YYYY",
    "exp_3_end": "Mon YYYY",
    "exp_3_b1": "In hac habitasse platea dictumst. Curabitur at lacus ac velit ornare lobortis. Curabitur a felis in nunc fringilla tristique. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Vivamus quis mi. Phasellus a est. Phasellus magna quis ligula lacinia aliquet.",
    "awards": "Aenean imperdiet. Etiam ultricies nisi vel augue.Curabitur ullamcorper ultricies nisi. Nam eget dui Etiam rhoncus .",
    "leadership_1": "Leadership Role, Community/Club Name: Aenean ut eros et nisl sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id imperdiet feugiat, pede. Pellentesque habitant morbi tristique senectus et netus.",
    "leadership_2": "Leadership Role, Community/Club Name: Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non, auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere.",
    "achievement": "Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. op urallan rahknayhba.",
    "community_1": "Role, Community/Club Name: Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum fringilla pede sit amet augue. Nullam sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero.",
    "community_2": "Career Counsellor, DAV Group of Schools: Pellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce id purus. Ut varius tincidunt libero.",
    "interests": "In dui magna, posuere eget, vestibulum et, tempor auctor, justo, Proin sapien ipsum, porta a, auctor quis, euiql."
}


def init_form_data(st):
    """Initialize empty fields and clear any untouched sample defaults from older sessions."""
    if st.session_state.get("_form_data_initialized"):
        return

    for key, sample_value in SAMPLE_CANDIDATE_DATA.items():
        if key not in st.session_state or st.session_state[key] == sample_value:
            st.session_state[key] = ""
    st.session_state["_form_data_initialized"] = True


def load_sample_data(st):
    """Load sample data into session state."""
    for key, val in SAMPLE_CANDIDATE_DATA.items():
        st.session_state[key] = val
    st.session_state["_form_data_initialized"] = True


def clear_form_data(st):
    """Clear all form data from session state."""
    for key in SAMPLE_CANDIDATE_DATA:
        st.session_state[key] = ""


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

    tabs = st.tabs([
        "Experience 1 (Mandatory - 1 bullet)",
        "Experience 2 (Optional - 2 bullets)",
        "Experience 3 (Optional - 1 bullet)",
    ])

    for i, tab in enumerate(tabs):
        with tab:
            idx = i + 1
            fields = exp_configs[i]["fields"]
            num_bullets = exp_configs[i]["num_bullets"]
            is_required = (i == 0)

            col1, col2 = st.columns([2, 1])
            with col1:
                company = limited_text_input(
                    st, f"exp_{idx}_company", fields["company"]["label"],
                    fields["company"]["max_chars"], required=is_required,
                    placeholder=fields["company"]["placeholder"],
                )
            with col2:
                domain = limited_text_input(
                    st, f"exp_{idx}_domain", fields["domain"]["label"],
                    fields["domain"]["max_chars"], required=is_required,
                    placeholder=fields["domain"]["placeholder"],
                )

            col3, col4, col5 = st.columns([2, 1, 1])
            with col3:
                role = limited_text_input(
                    st, f"exp_{idx}_role", fields["role"]["label"],
                    fields["role"]["max_chars"], required=is_required,
                    placeholder=fields["role"]["placeholder"],
                )
            with col4:
                start = limited_text_input(
                    st, f"exp_{idx}_start", fields["start_date"]["label"],
                    fields["start_date"]["max_chars"], required=is_required,
                    placeholder=fields["start_date"]["placeholder"],
                )
            with col5:
                end = limited_text_input(
                    st, f"exp_{idx}_end", fields["end_date"]["label"],
                    fields["end_date"]["max_chars"], required=is_required,
                    placeholder=fields["end_date"]["placeholder"],
                )

            bullets = []
            for b in range(1, num_bullets + 1):
                bullet_key = f"bullet_{b}"
                bullet = limited_text_area(
                    st, f"exp_{idx}_b{b}", fields[bullet_key]["label"],
                    fields[bullet_key]["max_chars"],
                    max_lines=fields[bullet_key].get("max_lines"),
                    required=is_required,
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
        placeholder=p["awards"]["placeholder"], height=70,
    )

    st.markdown("**Leadership Entries**")
    leadership_1 = limited_text_area(
        st, "leadership_1", p["leadership_1"]["label"],
        p["leadership_1"]["max_chars"], required=False,
        placeholder=p["leadership_1"]["placeholder"], height=70,
    )

    leadership_2 = limited_text_area(
        st, "leadership_2", p["leadership_2"]["label"],
        p["leadership_2"]["max_chars"], required=False,
        placeholder=p["leadership_2"]["placeholder"], height=70,
    )

    achievement = limited_text_area(
        st, "achievement", p["achievement"]["label"],
        p["achievement"]["max_chars"], required=False,
        placeholder=p["achievement"]["placeholder"], height=70,
    )

    st.markdown("**Community Entries**")
    community_1 = limited_text_area(
        st, "community_1", p["community_1"]["label"],
        p["community_1"]["max_chars"], required=False,
        placeholder=p["community_1"]["placeholder"], height=70,
    )

    community_2 = limited_text_area(
        st, "community_2", p["community_2"]["label"],
        p["community_2"]["max_chars"], required=False,
        placeholder=p["community_2"]["placeholder"], height=70,
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
