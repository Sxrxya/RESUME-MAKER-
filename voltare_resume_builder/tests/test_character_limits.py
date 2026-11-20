"""Tests for character limit enforcement."""
import sys
import os
import json
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from backend.validation import FIELD_LIMITS, validate_character_limits


class TestCharacterLimitsConfig(unittest.TestCase):
    """Verify the field_limits.json configuration is consistent."""

    def test_all_personal_fields_have_max_chars(self):
        for field, config in FIELD_LIMITS["personal"].items():
            self.assertIn("max_chars", config, f"Personal field '{field}' missing max_chars")
            self.assertGreater(config["max_chars"], 0)

    def test_all_education_fields_have_max_chars(self):
        for field, config in FIELD_LIMITS["education"]["entry_fields"].items():
            self.assertIn("max_chars", config, f"Education field '{field}' missing max_chars")

    def test_all_research_fields_have_max_chars(self):
        for field, config in FIELD_LIMITS["research_projects"]["entry_fields"].items():
            self.assertIn("max_chars", config, f"Research field '{field}' missing max_chars")

    def test_all_experience_entries_have_fields(self):
        for i, entry in enumerate(FIELD_LIMITS["professional_experience"]["entries"]):
            self.assertIn("num_bullets", entry, f"Experience entry {i} missing num_bullets")
            self.assertIn("fields", entry, f"Experience entry {i} missing fields")

    def test_experience_bullet_counts(self):
        entries = FIELD_LIMITS["professional_experience"]["entries"]
        self.assertEqual(entries[0]["num_bullets"], 1)
        self.assertEqual(entries[1]["num_bullets"], 2)
        self.assertEqual(entries[2]["num_bullets"], 1)

    def test_education_num_entries(self):
        self.assertEqual(FIELD_LIMITS["education"]["num_entries"], 3)

    def test_research_num_entries(self):
        self.assertEqual(FIELD_LIMITS["research_projects"]["num_entries"], 3)


class TestMaxLengthEnforcement(unittest.TestCase):
    """Test that exact-maximum-length strings pass and over-maximum fail."""

    def _make_valid_data(self):
        return {
            "personal_info": {
                "first_name": "John", "second_name": "Doe",
                "city_country": "City", "linkedin_url": "url",
                "phone": "+91", "email": "a@b.com",
            },
            "professional_summary": {"summary": "Summary.", "skills": "Skill1"},
            "education": [
                {"university": "U", "city_country": "C", "program": "P",
                 "gpa": "", "graduation_date": "2024", "relevant_courses": ""}
                for _ in range(3)
            ],
            "research_projects": [
                {"title": "T", "organization": "O", "additional_info": "",
                 "start_date": "Jan", "end_date": "Dec",
                 "bullet_1": "B1", "bullet_2": "B2"}
                for _ in range(3)
            ],
            "professional_experience": [
                {"company": "C", "domain": "D", "role": "R",
                 "start_date": "S", "end_date": "E", "bullets": ["B"]},
                {"company": "C", "domain": "D", "role": "R",
                 "start_date": "S", "end_date": "E", "bullets": ["B1", "B2"]},
                {"company": "C", "domain": "D", "role": "R",
                 "start_date": "S", "end_date": "E", "bullets": ["B"]},
            ],
            "achievements_leadership": {
                "awards": "", "leadership_1": "", "leadership_2": "",
                "achievement": "", "community_1": "", "community_2": "",
                "interests": "",
            },
        }

    def test_exact_max_length_passes(self):
        data = self._make_valid_data()
        # First name at exactly 20 chars
        data["personal_info"]["first_name"] = "A" * 20
        result = validate_character_limits(data)
        self.assertTrue(result.is_valid)

    def test_one_over_max_length_fails(self):
        data = self._make_valid_data()
        data["personal_info"]["first_name"] = "A" * 21
        result = validate_character_limits(data)
        self.assertFalse(result.is_valid)

    def test_summary_at_max(self):
        data = self._make_valid_data()
        data["professional_summary"]["summary"] = "X" * 450  # exactly max
        result = validate_character_limits(data)
        self.assertTrue(result.is_valid)

    def test_summary_over_max(self):
        data = self._make_valid_data()
        data["professional_summary"]["summary"] = "X" * 451
        result = validate_character_limits(data)
        self.assertFalse(result.is_valid)


if __name__ == "__main__":
    unittest.main()
