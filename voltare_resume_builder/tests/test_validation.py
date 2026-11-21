"""Tests for the Voltare resume builder validation engine."""
import sys
import os
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from backend.validation import (
    validate_character_limits,
    validate_required_fields,
    validate_line_counts,
    validate_all,
    get_char_count_display,
    get_remaining_chars,
    get_field_limit,
)


def _make_data(**overrides):
    """Create a minimal valid resume data dict."""
    data = {
        "personal_info": {
            "first_name": "John",
            "second_name": "Doe",
            "city_country": "Mumbai, India",
            "linkedin_url": "linkedin.com/in/johndoe",
            "phone": "+91 98765 43210",
            "email": "john@example.com",
        },
        "professional_summary": {
            "summary": "A professional summary.",
            "skills": "Python, SQL, Excel",
        },
        "education": [
            {"university": "MIT", "city_country": "Boston, US", "program": "MS CS",
             "gpa": "3.9", "graduation_date": "May 2024", "relevant_courses": ""},
            {"university": "IIT Delhi", "city_country": "Delhi, India", "program": "BTech",
             "gpa": "", "graduation_date": "Jun 2022", "relevant_courses": ""},
            {"university": "School", "city_country": "City", "program": "HSC",
             "gpa": "", "graduation_date": "2018", "relevant_courses": ""},
        ],
        "research_projects": [
            {"title": "Project A", "organization": "MIT", "additional_info": "",
             "start_date": "Jan 2024", "end_date": "May 2024",
             "bullet_1": "Did something.", "bullet_2": "Did something else."},
            {"title": "Project B", "organization": "IIT", "additional_info": "",
             "start_date": "Jan 2023", "end_date": "May 2023",
             "bullet_1": "Built a system.", "bullet_2": "Published results."},
            {"title": "Project C", "organization": "Lab", "additional_info": "",
             "start_date": "Jun 2022", "end_date": "Dec 2022",
             "bullet_1": "Designed framework.", "bullet_2": "Tested thoroughly."},
        ],
        "professional_experience": [
            {"company": "Google", "domain": "Tech", "role": "SDE",
             "start_date": "Jun 2024", "end_date": "Present", "bullets": ["Developed APIs."]},
            {"company": "Amazon", "domain": "E-Commerce", "role": "SDE-2",
             "start_date": "Jan 2023", "end_date": "May 2024",
             "bullets": ["Led team.", "Improved latency."]},
            {"company": "Startup", "domain": "FinTech", "role": "Intern",
             "start_date": "May 2022", "end_date": "Dec 2022", "bullets": ["Built dashboard."]},
        ],
        "achievements_leadership": {
            "awards": "Dean's List",
            "leadership_1": "President, Coding Club",
            "leadership_2": "VP, Student Council",
            "achievement": "Won hackathon",
            "community_1": "Volunteer, Red Cross",
            "community_2": "Mentor, Youth Program",
            "interests": "Hiking, Chess, Reading",
        },
    }
    for key, value in overrides.items():
        keys = key.split(".")
        d = data
        for k in keys[:-1]:
            d = d[k]
        d[keys[-1]] = value
    return data


class TestCharacterLimits(unittest.TestCase):
    def test_valid_data_passes(self):
        data = _make_data()
        result = validate_character_limits(data)
        self.assertTrue(result.is_valid)

    def test_exceeding_first_name(self):
        data = _make_data()
        limit = get_field_limit("personal", "first_name")["max_chars"]
        data["personal_info"]["first_name"] = "A" * (limit + 5)
        result = validate_character_limits(data)
        self.assertFalse(result.is_valid)

    def test_exceeding_summary(self):
        data = _make_data()
        limit = get_field_limit("professional_summary", "summary")["max_chars"]
        data["professional_summary"]["summary"] = "X" * (limit + 50)
        result = validate_character_limits(data)
        self.assertFalse(result.is_valid)


class TestRequiredFields(unittest.TestCase):
    def test_valid_data_passes(self):
        data = _make_data()
        result = validate_required_fields(data)
        self.assertTrue(result.is_valid)

    def test_missing_first_name(self):
        data = _make_data()
        data["personal_info"]["first_name"] = ""
        result = validate_required_fields(data)
        self.assertFalse(result.is_valid)

    def test_missing_email(self):
        data = _make_data()
        data["personal_info"]["email"] = "   "
        result = validate_required_fields(data)
        self.assertFalse(result.is_valid)


class TestLineCountValidation(unittest.TestCase):
    def test_short_summary_passes(self):
        data = _make_data()
        result = validate_line_counts(data)
        self.assertTrue(result.is_valid)

    def test_long_summary_fails(self):
        data = _make_data()
        # Exceeds max lines (5 lines)
        data["professional_summary"]["summary"] = ("X" * 125 + "\n") * 6
        result = validate_line_counts(data)
        self.assertFalse(result.is_valid)


class TestHelpers(unittest.TestCase):
    def test_char_count_display(self):
        result = get_char_count_display("hello", 10)
        self.assertIn("5 / 10", result)
        self.assertIn("5 remaining", result)

    def test_remaining_chars(self):
        self.assertEqual(get_remaining_chars("abc", 10), 7)
        self.assertEqual(get_remaining_chars("", 20), 20)

    def test_get_field_limit(self):
        limit = get_field_limit("personal", "first_name")
        self.assertIn("max_chars", limit)
        self.assertGreater(limit["max_chars"], 0)


class TestFullValidation(unittest.TestCase):
    def test_valid_data(self):
        data = _make_data()
        result = validate_all(data)
        self.assertTrue(result.is_valid)

    def test_multiple_errors(self):
        data = _make_data()
        data["personal_info"]["first_name"] = ""
        data["personal_info"]["email"] = ""
        data["professional_summary"]["summary"] = "X" * 500
        result = validate_all(data)
        self.assertFalse(result.is_valid)
        self.assertGreater(len(result.errors), 1)


if __name__ == "__main__":
    unittest.main()
