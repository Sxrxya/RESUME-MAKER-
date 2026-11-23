"""Validation engine for Voltare resume builder."""
import json
import os
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

CONFIG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "config")

def _load_field_limits() -> dict:
    path = os.path.join(CONFIG_DIR, "field_limits.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

FIELD_LIMITS = _load_field_limits()

CHARS_PER_LINE = 130  # Calibrated from reference PDF (539pt column with 10pt font)


@dataclass
class ValidationError:
    field: str
    message: str
    section: str


@dataclass
class ValidationResult:
    is_valid: bool = True
    errors: List[ValidationError] = field(default_factory=list)

    def add_error(self, field_name: str, message: str, section: str):
        self.errors.append(ValidationError(field=field_name, message=message, section=section))
        self.is_valid = False

    def merge(self, other: "ValidationResult"):
        self.errors.extend(other.errors)
        if not other.is_valid:
            self.is_valid = False


def get_field_limit(section: str, field_name: str) -> dict:
    limits = FIELD_LIMITS.get(section, {})
    if "entry_fields" in limits:
        return limits["entry_fields"].get(field_name, {})
    if "entries" in limits:
        for entry in limits["entries"]:
            fields = entry.get("fields", {})
            if field_name in fields:
                return fields[field_name]
    return limits.get(field_name, {})


def get_char_count_display(text: str, max_chars: int) -> str:
    current = len(text)
    remaining = max_chars - current
    return f"{current} / {max_chars} characters ({remaining} remaining)"


def get_remaining_chars(text: str, max_chars: int) -> int:
    return max_chars - len(text)


def validate_character_limits(data: dict) -> ValidationResult:
    result = ValidationResult()
    
    # Personal info
    personal = data.get("personal_info", {})
    personal_limits = FIELD_LIMITS.get("personal", {})
    for field_name, limit_config in personal_limits.items():
        value = personal.get(field_name, "")
        max_chars = limit_config.get("max_chars", 999)
        if len(value) > max_chars:
            result.add_error(field_name, f"Exceeds {max_chars} character limit ({len(value)} chars)", "Personal Information")

    # Professional summary
    prof = data.get("professional_summary", {})
    prof_limits = FIELD_LIMITS.get("professional_summary", {})
    for field_name, limit_config in prof_limits.items():
        value = prof.get(field_name, "")
        max_chars = limit_config.get("max_chars", 999)
        if len(value) > max_chars:
            result.add_error(field_name, f"Exceeds {max_chars} character limit ({len(value)} chars)", "Professional Summary")

    # Education
    edu_limits = FIELD_LIMITS.get("education", {}).get("entry_fields", {})
    for i, entry in enumerate(data.get("education", [])):
        for field_name, limit_config in edu_limits.items():
            value = entry.get(field_name, "")
            max_chars = limit_config.get("max_chars", 999)
            if len(value) > max_chars:
                result.add_error(f"education_{i+1}_{field_name}", f"Exceeds {max_chars} character limit", f"Education Entry {i+1}")

    # Research projects
    res_limits = FIELD_LIMITS.get("research_projects", {}).get("entry_fields", {})
    for i, entry in enumerate(data.get("research_projects", [])):
        for field_name, limit_config in res_limits.items():
            value = entry.get(field_name, "")
            max_chars = limit_config.get("max_chars", 999)
            if len(value) > max_chars:
                result.add_error(f"research_{i+1}_{field_name}", f"Exceeds {max_chars} character limit", f"Research Entry {i+1}")

    # Professional experience
    exp_entries = FIELD_LIMITS.get("professional_experience", {}).get("entries", [])
    for i, entry in enumerate(data.get("professional_experience", [])):
        if i < len(exp_entries):
            exp_fields = exp_entries[i].get("fields", {})
            for field_name, limit_config in exp_fields.items():
                if field_name.startswith("bullet_"):
                    bullet_idx = int(field_name.split("_")[1]) - 1
                    bullets = entry.get("bullets", [])
                    value = bullets[bullet_idx] if bullet_idx < len(bullets) else ""
                else:
                    value = entry.get(field_name, "")
                max_chars = limit_config.get("max_chars", 999)
                if len(value) > max_chars:
                    result.add_error(f"experience_{i+1}_{field_name}", f"Exceeds {max_chars} character limit", f"Experience Entry {i+1}")

    # Achievements
    ach = data.get("achievements_leadership", {})
    ach_limits = FIELD_LIMITS.get("achievements_leadership", {})
    for field_name, limit_config in ach_limits.items():
        value = ach.get(field_name, "")
        max_chars = limit_config.get("max_chars", 999)
        if len(value) > max_chars:
            result.add_error(field_name, f"Exceeds {max_chars} character limit", "Achievements & Leadership")

    return result


def validate_required_fields(data: dict) -> ValidationResult:
    result = ValidationResult()

    personal = data.get("personal_info", {})
    personal_limits = FIELD_LIMITS.get("personal", {})
    for field_name, limit_config in personal_limits.items():
        if limit_config.get("required") and not personal.get(field_name, "").strip():
            result.add_error(field_name, f"{limit_config.get('label', field_name)} is required", "Personal Information")

    prof = data.get("professional_summary", {})
    prof_limits = FIELD_LIMITS.get("professional_summary", {})
    for field_name, limit_config in prof_limits.items():
        if limit_config.get("required") and not prof.get(field_name, "").strip():
            result.add_error(field_name, f"{limit_config.get('label', field_name)} is required", "Professional Summary")

    edu_limits = FIELD_LIMITS.get("education", {}).get("entry_fields", {})
    for i, entry in enumerate(data.get("education", [])):
        # Education 1 is required; Education 2 and 3 are optional unless the user started filling them in
        has_content = any(entry.get(k, "").strip() for k in edu_limits.keys())
        if i == 0 or has_content:
            for field_name, limit_config in edu_limits.items():
                if limit_config.get("required") and not entry.get(field_name, "").strip():
                    result.add_error(f"education_{i+1}_{field_name}", f"{limit_config.get('label', field_name)} is required", f"Education Entry {i+1}")

    res_limits = FIELD_LIMITS.get("research_projects", {}).get("entry_fields", {})
    for i, entry in enumerate(data.get("research_projects", [])):
        # Project 1 is compulsory; Project 2 and Project 3 are optional unless filled
        has_content = any(entry.get(k, "").strip() for k in res_limits.keys())
        if i == 0 or has_content:
            for field_name, limit_config in res_limits.items():
                if limit_config.get("required") and not entry.get(field_name, "").strip():
                    result.add_error(f"research_{i+1}_{field_name}", f"{limit_config.get('label', field_name)} is required", f"Research Entry {i+1}")

    # Professional Experience: Entry 1 is mandatory; Entries 2 and 3 are optional
    exp_entries_config = FIELD_LIMITS.get("professional_experience", {}).get("entries", [])
    for i, entry in enumerate(data.get("professional_experience", [])):
        if i < len(exp_entries_config):
            cfg_fields = exp_entries_config[i].get("fields", {})
            has_company = bool(entry.get("company", "").strip())
            has_role = bool(entry.get("role", "").strip())
            has_bullets = any(b.strip() for b in entry.get("bullets", []) if isinstance(b, str))
            has_content = has_company or has_role or has_bullets or bool(entry.get("domain", "").strip())

            # Experience 1 is strictly mandatory; Experience 2 and 3 are optional
            if i == 0 or has_content:
                for field_name, limit_config in cfg_fields.items():
                    if limit_config.get("required"):
                        if field_name.startswith("bullet_"):
                            b_idx = int(field_name.split("_")[1]) - 1
                            bullets = entry.get("bullets", [])
                            val = bullets[b_idx].strip() if b_idx < len(bullets) and isinstance(bullets[b_idx], str) else ""
                        else:
                            val = entry.get(field_name, "").strip()
                        if not val:
                            result.add_error(f"experience_{i+1}_{field_name}", f"{limit_config.get('label', field_name)} is required", f"Experience Entry {i+1}")

    return result


def estimate_lines(text: str, chars_per_line: int = CHARS_PER_LINE) -> int:
    if not text.strip():
        return 0
    lines = 0
    for paragraph in text.split("\n"):
        if not paragraph.strip():
            lines += 1
        else:
            lines += max(1, -(-len(paragraph) // chars_per_line))  # ceiling division
    return lines


def validate_line_counts(data: dict) -> ValidationResult:
    """Validate line counts with helpful character-shortening guidance."""
    result = ValidationResult()

    prof = data.get("professional_summary", {})
    summary = prof.get("summary", "")
    summary_limit = FIELD_LIMITS.get("professional_summary", {}).get("summary", {})
    max_lines = summary_limit.get("max_lines", 5)
    est_lines = estimate_lines(summary)
    if est_lines > max_lines:
        excess = est_lines - max_lines
        approx_chars = excess * CHARS_PER_LINE
        result.add_error("summary", f"Exceeds limit by {excess} line(s). Please shorten by approximately {approx_chars} characters.", "Professional Summary")

    skills = prof.get("skills", "")
    skills_limit = FIELD_LIMITS.get("professional_summary", {}).get("skills", {})
    max_lines = skills_limit.get("max_lines", 2)
    est_skills = estimate_lines(skills)
    if est_skills > max_lines:
        excess = est_skills - max_lines
        approx_chars = excess * CHARS_PER_LINE
        result.add_error("skills", f"Exceeds maximum {max_lines} line(s). Please shorten by approximately {approx_chars} characters.", "Professional Summary")

    return result


def validate_all(data: dict) -> ValidationResult:
    result = ValidationResult()
    result.merge(validate_required_fields(data))
    result.merge(validate_character_limits(data))
    result.merge(validate_line_counts(data))
    return result
