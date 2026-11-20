"""Tests for layout validation engine."""
import sys
import os
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from backend.layout_engine import (
    estimate_text_lines,
    check_section_overflow,
    validate_layout,
    get_validation_summary,
)


class TestEstimateTextLines(unittest.TestCase):
    def test_empty_text(self):
        self.assertEqual(estimate_text_lines(""), 0)

    def test_short_text(self):
        self.assertEqual(estimate_text_lines("Hello world"), 1)

    def test_long_text_wraps(self):
        text = "A" * 180  # ~2 lines at 90 chars per line
        self.assertEqual(estimate_text_lines(text), 2)

    def test_multiple_paragraphs(self):
        text = "Line one.\nLine two.\nLine three."
        self.assertEqual(estimate_text_lines(text), 3)

    def test_very_long_paragraph(self):
        text = "A" * 400  # ~5 lines
        lines = estimate_text_lines(text)
        self.assertGreaterEqual(lines, 4)
        self.assertLessEqual(lines, 6)


class TestSectionOverflow(unittest.TestCase):
    def _make_data(self):
        return {
            "professional_summary": {"summary": "Short.", "skills": "Python"},
            "education": [
                {"university": "U", "city_country": "C", "program": "P",
                 "gpa": "", "graduation_date": "2024", "relevant_courses": ""}
                for _ in range(3)
            ],
            "research_projects": [
                {"title": "T", "organization": "O", "additional_info": "",
                 "start_date": "J", "end_date": "D",
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
        }

    def test_normal_data_fits(self):
        data = self._make_data()
        result = check_section_overflow("professional_summary", data)
        self.assertTrue(result["fits"])

    def test_overflow_summary(self):
        data = self._make_data()
        data["professional_summary"]["summary"] = ("X" * 85 + " ") * 10  # very long
        result = check_section_overflow("professional_summary", data)
        self.assertFalse(result["fits"])

    def test_normal_education_fits(self):
        data = self._make_data()
        result = check_section_overflow("education", data)
        self.assertTrue(result["fits"])


class TestValidateLayout(unittest.TestCase):
    def test_valid_layout(self):
        data = {
            "professional_summary": {"summary": "Short.", "skills": "Python"},
            "education": [
                {"university": "U", "city_country": "C", "program": "P",
                 "gpa": "", "graduation_date": "2024", "relevant_courses": ""}
                for _ in range(3)
            ],
            "research_projects": [
                {"title": "T", "organization": "O", "additional_info": "",
                 "start_date": "J", "end_date": "D",
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
        }
        result = validate_layout(data)
        self.assertTrue(result["valid"])


class TestValidationSummary(unittest.TestCase):
    def test_summary_returns_messages(self):
        data = {
            "professional_summary": {"summary": "Short.", "skills": "Python"},
            "education": [],
            "research_projects": [],
            "professional_experience": [],
        }
        messages = get_validation_summary(data)
        self.assertIsInstance(messages, list)
        self.assertGreater(len(messages), 0)


if __name__ == "__main__":
    unittest.main()
