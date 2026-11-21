"""Tests for PDF generation and resume rendering."""
import sys
import os
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from backend.resume_renderer import render_resume_html, _escape_html
from backend.watermark_extractor import get_watermark_path, get_watermark_base64


class TestHTMLEscaping(unittest.TestCase):
    def test_ampersand(self):
        self.assertEqual(_escape_html("A & B"), "A &amp; B")

    def test_angle_brackets(self):
        self.assertEqual(_escape_html("<script>"), "&lt;script&gt;")

    def test_empty_string(self):
        self.assertEqual(_escape_html(""), "")

    def test_none_returns_empty(self):
        self.assertEqual(_escape_html(None), "")


class TestResumeRendering(unittest.TestCase):
    def _make_data(self):
        return {
            "personal_info": {
                "first_name": "John", "second_name": "Doe",
                "city_country": "Mumbai, India",
                "linkedin_url": "linkedin.com/in/johndoe",
                "phone": "+91 98765 43210",
                "email": "john@example.com",
            },
            "professional_summary": {
                "summary": "Experienced developer.",
                "skills": "Python, JavaScript",
            },
            "education": [
                {"university": "MIT", "city_country": "Boston, US",
                 "program": "MS CS", "gpa": "3.9",
                 "graduation_date": "May 2024", "relevant_courses": "ML, AI"},
                {"university": "IIT", "city_country": "Delhi",
                 "program": "BTech", "gpa": "",
                 "graduation_date": "Jun 2022", "relevant_courses": ""},
                {"university": "School", "city_country": "City",
                 "program": "HSC", "gpa": "",
                 "graduation_date": "2018", "relevant_courses": ""},
            ],
            "research_projects": [
                {"title": "Project A", "organization": "MIT",
                 "additional_info": "Advisor: Prof X",
                 "start_date": "Jan 2024", "end_date": "May 2024",
                 "bullet_1": "Built system.", "bullet_2": "Published paper."},
                {"title": "Project B", "organization": "IIT",
                 "additional_info": "",
                 "start_date": "Jun 2023", "end_date": "Dec 2023",
                 "bullet_1": "Designed framework.", "bullet_2": "Tested it."},
                {"title": "Project C", "organization": "Lab",
                 "additional_info": "",
                 "start_date": "Jan 2022", "end_date": "May 2022",
                 "bullet_1": "Analyzed data.", "bullet_2": "Wrote report."},
            ],
            "professional_experience": [
                {"company": "Google", "domain": "Tech", "role": "SDE",
                 "start_date": "Jun 2024", "end_date": "Present",
                 "bullets": ["Developed APIs."]},
                {"company": "Amazon", "domain": "Commerce", "role": "SDE-2",
                 "start_date": "Jan 2023", "end_date": "May 2024",
                 "bullets": ["Led team.", "Improved latency."]},
                {"company": "Startup", "domain": "FinTech", "role": "Intern",
                 "start_date": "May 2022", "end_date": "Dec 2022",
                 "bullets": ["Built dashboard."]},
            ],
            "achievements_leadership": {
                "awards": "Dean's List 2023",
                "leadership_1": "President, Coding Club",
                "leadership_2": "VP, Student Council",
                "achievement": "Won national hackathon",
                "community_1": "Volunteer, Red Cross",
                "community_2": "Mentor, Youth Program",
                "interests": "Hiking, Chess, Reading",
            },
        }

    def test_html_contains_name(self):
        html = render_resume_html(self._make_data())
        self.assertIn("John", html)
        self.assertIn("Doe", html)

    def test_html_contains_sections(self):
        html = render_resume_html(self._make_data())
        self.assertIn("PROFESSIONAL SUMMARY", html)
        self.assertIn("EDUCATION", html)
        self.assertIn("RESEARCH/PROJECT EXPERIENCE", html)
        self.assertIn("PROFESSIONAL EXPERIENCE", html)
        self.assertIn("ACHIEVEMENT AND LEADERSHIP", html)

    def test_html_contains_cormorant_font(self):
        html = render_resume_html(self._make_data())
        self.assertIn("Cormorant SC", html)

    def test_html_contains_page_size(self):
        html = render_resume_html(self._make_data())
        self.assertIn("210mm", html)
        self.assertIn("297mm", html)

    def test_html_contains_background_color(self):
        html = render_resume_html(self._make_data())
        self.assertIn("#f7f3ef", html)

    def test_html_contains_bullets(self):
        html = render_resume_html(self._make_data())
        self.assertIn("●", html)

    def test_html_with_watermark(self):
        wm_b64 = get_watermark_base64()
        html = render_resume_html(self._make_data(), watermark_base64=wm_b64)
        self.assertIn("watermark", html)
        self.assertIn("data:image/png;base64,", html)

    def test_empty_data_renders(self):
        html = render_resume_html({})
        self.assertIn("PROFESSIONAL SUMMARY", html)
        self.assertGreater(len(html), 1000)

    def test_special_chars_escaped(self):
        data = self._make_data()
        data["personal_info"]["first_name"] = "O'Brien & <Co>"
        html = render_resume_html(data)
        self.assertNotIn("<Co>", html)
        self.assertIn("&amp;", html)

    def test_html_has_correct_structure(self):
        html = render_resume_html(self._make_data())
        self.assertIn("<!DOCTYPE html>", html)
        self.assertIn("<html", html)
        self.assertIn("</html>", html)
        self.assertIn("resume-page", html)


if __name__ == "__main__":
    unittest.main()
