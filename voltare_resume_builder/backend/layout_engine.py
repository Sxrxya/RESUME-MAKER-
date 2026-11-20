"""Layout validation engine for Voltare resume."""
import json
import os

CONFIG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "config")


def _load_config(filename: str) -> dict:
    path = os.path.join(CONFIG_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


FIELD_LIMITS = _load_config("field_limits.json")
TEMPLATE_CONFIG = _load_config("template_config.json")

CONTENT_WIDTH = TEMPLATE_CONFIG["margins"]["content_width_pts"]
BODY_FONT_SIZE = TEMPLATE_CONFIG["typography"]["body_size"]
LINE_HEIGHT = TEMPLATE_CONFIG["typography"]["line_height"]

# Approximate characters per line at 9pt Cormorant Garamond in ~507pt width
CHARS_PER_LINE = 90
LINE_HEIGHT_PTS = BODY_FONT_SIZE * LINE_HEIGHT  # ~11.25pt per line


def estimate_text_lines(text: str, font_size: float = BODY_FONT_SIZE, container_width: float = CONTENT_WIDTH) -> int:
    if not text.strip():
        return 0
    # Scale chars per line by container width ratio
    cpl = int(CHARS_PER_LINE * (container_width / CONTENT_WIDTH))
    total_lines = 0
    for paragraph in text.split("\n"):
        paragraph = paragraph.strip()
        if not paragraph:
            total_lines += 1
        else:
            total_lines += max(1, -(-len(paragraph) // cpl))
    return total_lines


def check_section_overflow(section: str, data: dict) -> dict:
    sections = TEMPLATE_CONFIG.get("sections", {})
    result = {"fits": True, "overflow_px": 0, "errors": []}
    
    if section == "professional_summary":
        config = sections.get("professional_summary_body", {})
        available_height = config.get("y_end", 140) - config.get("y_start", 82)
        summary = data.get("professional_summary", {}).get("summary", "")
        skills = data.get("professional_summary", {}).get("skills", "")
        lines = estimate_text_lines(summary) + estimate_text_lines(skills) + 1  # +1 for skills label
        needed = lines * LINE_HEIGHT_PTS
        if needed > available_height:
            result["fits"] = False
            result["overflow_px"] = needed - available_height
            result["errors"].append(f"Professional summary content exceeds allocated space by {needed - available_height:.0f}pt")
    
    elif section == "education":
        config_start = sections.get("education_body", {}).get("y_start", 165)
        config_end = sections.get("education_body", {}).get("y_end", 272)
        available_height = config_end - config_start
        total_lines = 0
        for entry in data.get("education", []):
            if entry.get("university", "").strip():
                total_lines += 2  # university + program lines
                if entry.get("relevant_courses", "").strip():
                    total_lines += 1
                total_lines += 1  # spacing
        needed = total_lines * LINE_HEIGHT_PTS
        if needed > available_height:
            result["fits"] = False
            result["overflow_px"] = needed - available_height
            result["errors"].append(f"Education content exceeds allocated space by {needed - available_height:.0f}pt")
    
    elif section == "research":
        config_start = sections.get("research_body", {}).get("y_start", 284)
        config_end = sections.get("research_body", {}).get("y_end", 475)
        available_height = config_end - config_start
        total_lines = 0
        for entry in data.get("research_projects", []):
            if entry.get("title", "").strip():
                total_lines += 1  # title line
                if entry.get("additional_info", "").strip():
                    total_lines += 1
                total_lines += estimate_text_lines(entry.get("bullet_1", ""))
                total_lines += estimate_text_lines(entry.get("bullet_2", ""))
                total_lines += 1  # spacing
        needed = total_lines * LINE_HEIGHT_PTS
        if needed > available_height:
            result["fits"] = False
            result["overflow_px"] = needed - available_height
            result["errors"].append(f"Research content exceeds allocated space by {needed - available_height:.0f}pt")
    
    elif section == "experience":
        config_start = sections.get("experience_body", {}).get("y_start", 487)
        config_end = sections.get("experience_body", {}).get("y_end", 623)
        available_height = config_end - config_start
        total_lines = 0
        for entry in data.get("professional_experience", []):
            if entry.get("company", "").strip():
                total_lines += 1  # company header
                for bullet in entry.get("bullets", []):
                    total_lines += estimate_text_lines(bullet)
                total_lines += 1  # spacing
        needed = total_lines * LINE_HEIGHT_PTS
        if needed > available_height:
            result["fits"] = False
            result["overflow_px"] = needed - available_height
            result["errors"].append(f"Professional experience exceeds allocated space by {needed - available_height:.0f}pt")

    return result


def validate_layout(data: dict) -> dict:
    errors = []
    warnings = []

    for section in ["professional_summary", "education", "research", "experience"]:
        check = check_section_overflow(section, data)
        if not check["fits"]:
            errors.extend(check["errors"])

    # Check total page height
    total_ok = len(errors) == 0
    
    return {
        "valid": total_ok,
        "errors": errors,
        "warnings": warnings
    }


def get_validation_summary(data: dict) -> list:
    messages = []
    layout = validate_layout(data)
    for err in layout["errors"]:
        messages.append({"type": "error", "message": err})
    for warn in layout["warnings"]:
        messages.append({"type": "warning", "message": warn})
    
    if layout["valid"]:
        messages.append({"type": "success", "message": "All layout checks passed. Resume fits on one page."})
    
    return messages
