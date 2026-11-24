"""
Flexible Validation Engine for Mode 2: Voltare Flexible Resume Builder.
Implements the same rules and budget calculations on the Python backend.
"""
import re
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field

SUMMARY_MIN_CHARS = 150
SUMMARY_MAX_CHARS = 600
TOTAL_A4_POINTS = 720
CHARS_PER_LINE = 110


@dataclass
class FlexibleValidationError:
    field: str
    message: str
    section: str


@dataclass
class FlexibleValidationResult:
    is_valid: bool = True
    errors: List[FlexibleValidationError] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    recommendations: List[Dict[str, str]] = field(default_factory=list)
    progress_percent: int = 0
    can_download_pdf: bool = False
    capacity_percent: int = 0
    density_mode: str = "balanced"
    trim_suggestion: Optional[str] = None


def estimate_text_points(text: Optional[str], line_pitch: int = 13) -> int:
    if not text or not text.strip():
        return 0
    lines = max(1, (len(text.strip()) + CHARS_PER_LINE - 1) // CHARS_PER_LINE)
    return lines * line_pitch


def validate_flexible_resume(data: Dict[str, Any]) -> FlexibleValidationResult:
    result = FlexibleValidationResult()
    errors: List[FlexibleValidationError] = []
    warnings: List[str] = []
    total_points = 0

    # 1. Personal Info (Mandatory)
    personal = data.get("personal", {})
    total_points += 46  # header banner
    for field_key, field_name in [
        ("first_name", "First name"),
        ("last_name", "Last name"),
        ("email", "Email address"),
        ("phone", "Phone number"),
        ("city_state", "Location (City, State/Country)"),
    ]:
        val = personal.get(field_key, "").strip()
        if not val:
            errors.append(FlexibleValidationError(field=field_key, message=f"{field_name} is required.", section="personal"))

    email = personal.get("email", "").strip()
    if email and not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        errors.append(FlexibleValidationError(field="email", message="Please enter a valid email address.", section="personal"))

    # 2. Professional Summary (Mandatory: Minimum 150 characters)
    summary = data.get("summary", "").strip()
    total_points += 20  # Section heading
    if not summary:
        errors.append(FlexibleValidationError(field="summary", message="Professional Summary is required.", section="summary"))
    elif len(summary) < SUMMARY_MIN_CHARS:
        errors.append(FlexibleValidationError(
            field="summary",
            message=f"Professional Summary must be at least {SUMMARY_MIN_CHARS} characters (currently {len(summary)} chars).",
            section="summary"
        ))
    total_points += estimate_text_points(summary, line_pitch=14)

    # 3. Education (2 Mandatory, 1 Optional, Max 3)
    education = data.get("education", [])
    total_points += 22  # heading
    valid_edu_count = 0
    for idx, edu in enumerate(education):
        entry_num = idx + 1
        inst = edu.get("institution", "").strip()
        degree = edu.get("degree", "").strip()
        grad_date = edu.get("grad_date", "").strip()

        if entry_num <= 2:
            if not inst:
                errors.append(FlexibleValidationError(field=f"edu_{entry_num}_inst", message=f"Education #{entry_num}: Institution is required.", section="education"))
            if not degree:
                errors.append(FlexibleValidationError(field=f"edu_{entry_num}_degree", message=f"Education #{entry_num}: Degree is required.", section="education"))
            if not grad_date:
                errors.append(FlexibleValidationError(field=f"edu_{entry_num}_date", message=f"Education #{entry_num}: Graduation date is required.", section="education"))
            if inst and degree:
                valid_edu_count += 1
        elif inst or degree:
            if not inst or not degree:
                errors.append(FlexibleValidationError(field=f"edu_{entry_num}_incomplete", message=f"Education #{entry_num} is incomplete.", section="education"))
            else:
                valid_edu_count += 1

        if inst or degree or entry_num <= 2:
            total_points += 32
            if edu.get("highlights"):
                total_points += estimate_text_points(edu.get("highlights"), 12)

    if valid_edu_count < 2:
        errors.append(FlexibleValidationError(field="edu_count", message=f"At least 2 Education entries are required (found {valid_edu_count}).", section="education"))

    # 4. Projects (1 Mandatory, Max 3)
    projects = data.get("projects", [])
    total_points += 22  # heading
    valid_proj_count = 0
    for idx, proj in enumerate(projects):
        proj_num = idx + 1
        title = proj.get("title", "").strip()
        b1 = proj.get("bullet_1", "").strip()
        b2 = proj.get("bullet_2", "").strip()

        if proj_num == 1:
            if not title:
                errors.append(FlexibleValidationError(field="proj_1_title", message="Project #1 title is required.", section="projects"))
            if not b1:
                errors.append(FlexibleValidationError(field="proj_1_b1", message="Project #1 needs at least 1 bullet point.", section="projects"))
            if title and b1:
                valid_proj_count += 1
        elif title or b1 or b2:
            if not title or not b1:
                errors.append(FlexibleValidationError(field=f"proj_{proj_num}_incomplete", message=f"Project #{proj_num} is incomplete.", section="projects"))
            else:
                valid_proj_count += 1

        if title or b1 or proj_num == 1:
            total_points += 20
            if b1:
                total_points += estimate_text_points(b1, 13) + 4
            if b2:
                total_points += estimate_text_points(b2, 13) + 4

    if valid_proj_count < 1:
        errors.append(FlexibleValidationError(field="proj_count", message="At least 1 project is required.", section="projects"))

    # 5. Skills
    skills = data.get("skills", {})
    total_points += 22
    for skill_key in ["languages", "frameworks", "tools_cloud", "concepts"]:
        if skills.get(skill_key, "").strip():
            total_points += 14

    # 6. Experience (100% Optional)
    experience = data.get("experience", [])
    active_exp = 0
    if experience:
        total_points += 22
        for idx, exp in enumerate(experience):
            exp_num = idx + 1
            comp = exp.get("company", "").strip()
            role = exp.get("role", "").strip()
            b1 = exp.get("bullet_1", "").strip()
            if comp or role or b1:
                if not comp:
                    errors.append(FlexibleValidationError(field=f"exp_{exp_num}_company", message=f"Experience #{exp_num}: Company is required.", section="experience"))
                if not role:
                    errors.append(FlexibleValidationError(field=f"exp_{exp_num}_role", message=f"Experience #{exp_num}: Role is required.", section="experience"))
                total_points += 20
                if b1:
                    total_points += estimate_text_points(b1, 13) + 4
                if exp.get("bullet_2"):
                    total_points += estimate_text_points(exp.get("bullet_2"), 13) + 4
                active_exp += 1

    # 7. Custom Section (Optional with 2 subheadings and bullets)
    custom = data.get("custom_section", {})
    if custom.get("title", "").strip():
        total_points += 22
        sub1 = custom.get("subhead_1", {})
        if sub1.get("title", "").strip():
            total_points += 18
            if sub1.get("bullet_1"):
                total_points += estimate_text_points(sub1.get("bullet_1"), 13) + 4
            if sub1.get("bullet_2"):
                total_points += estimate_text_points(sub1.get("bullet_2"), 13) + 4
        sub2 = custom.get("subhead_2", {})
        if sub2.get("title", "").strip():
            total_points += 18
            if sub2.get("bullet_1"):
                total_points += estimate_text_points(sub2.get("bullet_1"), 13) + 4
            if sub2.get("bullet_2"):
                total_points += estimate_text_points(sub2.get("bullet_2"), 13) + 4

    # Capacity and Density
    capacity_percent = round((total_points / TOTAL_A4_POINTS) * 100)
    density_mode = "balanced"
    if capacity_percent < 70:
        density_mode = "spacious"
    elif capacity_percent <= 92:
        density_mode = "balanced"
    elif capacity_percent <= 100:
        density_mode = "compact"
    else:
        density_mode = "overflow"
        excess_lines = max(1, (total_points - TOTAL_A4_POINTS) // 13)
        trim_sugg = f"Resume overflows single-page limit by ~{excess_lines} lines. Consider trimming bullet points."
        result.trim_suggestion = trim_sugg
        warnings.append(trim_sugg)

    # Progress Score Calculation (0-100)
    score = 0
    if personal.get("first_name") and personal.get("last_name") and personal.get("email") and personal.get("phone"):
        score += 20
    if len(summary) >= SUMMARY_MIN_CHARS:
        score += 20
    elif len(summary) > 0:
        score += int((len(summary) / SUMMARY_MIN_CHARS) * 15)
    if valid_edu_count >= 2:
        score += 25
    if valid_proj_count >= 1:
        score += 20
    if any(skills.get(k) for k in ["languages", "frameworks", "tools_cloud"]):
        score += 10
    if active_exp > 0:
        score += 5
    elif score >= 95:
        score = 100

    progress_percent = min(100, score)
    can_download_pdf = (progress_percent >= 80 and len(errors) == 0 and capacity_percent <= 108)

    result.is_valid = (len(errors) == 0)
    result.errors = errors
    result.warnings = warnings
    result.progress_percent = progress_percent
    result.can_download_pdf = can_download_pdf
    result.capacity_percent = capacity_percent
    result.density_mode = density_mode

    return result
