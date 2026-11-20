"""Template parser for loading and processing resume template configuration."""
import json
import os


CONFIG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "config")


def load_template_config() -> dict:
    """Load the template configuration."""
    path = os.path.join(CONFIG_DIR, "template_config.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_field_limits() -> dict:
    """Load field limit configuration."""
    path = os.path.join(CONFIG_DIR, "field_limits.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_section_boundaries() -> dict:
    """Get Y-position boundaries for each resume section."""
    config = load_template_config()
    dividers = config.get("dividers", {}).get("positions_y", {})
    return {
        "professional_summary": {
            "y_start": config["sections"]["professional_summary_heading"]["y_start"],
            "y_end": dividers.get("after_professional_summary", 80),
        },
        "education": {
            "y_start": config["sections"]["education_heading"]["y_start"],
            "y_end": dividers.get("after_education", 272),
        },
        "research": {
            "y_start": config["sections"]["research_heading"]["y_start"],
            "y_end": dividers.get("after_research_projects", 475),
        },
        "experience": {
            "y_start": config["sections"]["experience_heading"]["y_start"],
            "y_end": dividers.get("after_professional_experience", 623),
        },
        "achievements": {
            "y_start": config["sections"]["achievements_heading"]["y_start"],
            "y_end": config["sections"]["achievements_body"]["y_end"],
        },
    }


def get_typography() -> dict:
    """Get typography settings from template config."""
    config = load_template_config()
    return config.get("typography", {})


def get_page_dimensions() -> dict:
    """Get page dimensions from template config."""
    config = load_template_config()
    return config.get("page", {})
