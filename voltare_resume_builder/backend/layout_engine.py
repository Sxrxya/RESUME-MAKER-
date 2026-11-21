"""Layout validation engine for Voltare resume.
Enforces character and line budgets without exposing pixel or point measurements to candidates.
"""
import json
import os

CONFIG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "config")


def _load_config(filename: str) -> dict:
    path = os.path.join(CONFIG_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


FIELD_LIMITS = _load_config("field_limits.json")
TEMPLATE_CONFIG = _load_config("template_config.json")

# Calibrated from the official reference PDF: 539pt column holds ~130 characters per line
CHARS_PER_LINE = 130


def estimate_text_lines(text: str, chars_per_line: int = CHARS_PER_LINE) -> int:
    """Estimate rendered lines using paragraph structure and average character width."""
    if not text or not text.strip():
        return 0
    total_lines = 0
    for paragraph in text.split("\n"):
        p = paragraph.strip()
        if not p:
            total_lines += 1
        else:
            total_lines += max(1, -(-len(p) // chars_per_line))
    return total_lines


def check_section_overflow(section: str, data: dict) -> dict:
    """Validate section content against allocated line budgets."""
    result = {"fits": True, "errors": []}

    if section == "professional_summary":
        summary = data.get("professional_summary", {}).get("summary", "").strip()
        skills = data.get("professional_summary", {}).get("skills", "").strip()

        summary_lines = estimate_text_lines(summary, CHARS_PER_LINE)
        max_summary_lines = FIELD_LIMITS.get("professional_summary", {}).get("summary", {}).get("max_lines", 5)
        if summary_lines > max_summary_lines:
            excess = summary_lines - max_summary_lines
            approx_chars = excess * CHARS_PER_LINE
            result["fits"] = False
            result["errors"].append(
                f"Professional Summary: Exceeds limit by {excess} line(s). Please shorten by approximately {approx_chars} characters."
            )

        skills_lines = estimate_text_lines(skills, CHARS_PER_LINE)
        max_skills_lines = FIELD_LIMITS.get("professional_summary", {}).get("skills", {}).get("max_lines", 2)
        if skills_lines > max_skills_lines:
            excess = skills_lines - max_skills_lines
            approx_chars = excess * CHARS_PER_LINE
            result["fits"] = False
            result["errors"].append(
                f"Skills: Exceeds maximum {max_skills_lines} line(s). Please shorten by approximately {approx_chars} characters."
            )

    elif section == "education":
        entries = data.get("education", [])
        for i, entry in enumerate(entries):
            idx = i + 1
            courses = entry.get("relevant_courses", "").strip()
            if len(courses) > 85:
                result["fits"] = False
                result["errors"].append(
                    f"Education Entry {idx}: Relevant courses exceeds limit by {len(courses) - 85} character(s) (Max 85 characters)."
                )

    elif section == "research":
        entries = data.get("research_projects", [])
        for i, entry in enumerate(entries):
            idx = i + 1
            for b_num in [1, 2]:
                bullet = entry.get(f"bullet_{b_num}", "").strip()
                lines = estimate_text_lines(bullet, CHARS_PER_LINE)
                if lines > 3:
                    excess = lines - 3
                    approx_chars = excess * CHARS_PER_LINE
                    result["fits"] = False
                    result["errors"].append(
                        f"Research Project {idx} (Bullet {b_num}): Exceeds 3-line limit. Please shorten by approximately {approx_chars} characters."
                    )

    elif section == "experience":
        entries = data.get("professional_experience", [])
        for i, entry in enumerate(entries):
            idx = i + 1
            bullets = entry.get("bullets", [])
            for b_idx, bullet in enumerate(bullets):
                b_num = b_idx + 1
                lines = estimate_text_lines(bullet.strip(), CHARS_PER_LINE)
                if lines > 3:
                    excess = lines - 3
                    approx_chars = excess * CHARS_PER_LINE
                    result["fits"] = False
                    result["errors"].append(
                        f"Professional Experience {idx} (Bullet {b_num}): Exceeds 3-line limit. Please shorten by approximately {approx_chars} characters."
                    )

    elif section == "achievements_leadership":
        ach = data.get("achievements_leadership", {})
        for field_name in ["leadership_1", "leadership_2", "community_1", "community_2"]:
            val = ach.get(field_name, "").strip()
            lines = estimate_text_lines(val, CHARS_PER_LINE)
            if lines > 3:
                excess = lines - 3
                approx_chars = excess * CHARS_PER_LINE
                label = field_name.replace("_", " ").title()
                result["fits"] = False
                result["errors"].append(
                    f"Achievements & Leadership ({label}): Exceeds line budget. Please shorten by approximately {approx_chars} characters."
                )

    return result


def validate_layout(data: dict) -> dict:
    """Validate all sections for layout fit using human-readable line and character budgets."""
    errors = []
    warnings = []

    for section in ["professional_summary", "education", "research", "experience", "achievements_leadership"]:
        check = check_section_overflow(section, data)
        if not check["fits"]:
            errors.extend(check["errors"])

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
    }


def get_validation_summary(data: dict) -> list:
    """Get a list of human-readable validation messages."""
    messages = []
    layout = validate_layout(data)
    for err in layout["errors"]:
        messages.append({"type": "error", "message": err})
    for warn in layout["warnings"]:
        messages.append({"type": "warning", "message": warn})

    if layout["valid"]:
        messages.append({"type": "success", "message": "All layout checks passed. Resume fits on one page."})

    return messages
