"""
Unit tests for Mode 2: Voltare Flexible Resume Builder validation engine.
"""
import unittest
from backend.flexible_validation import (
    validate_flexible_resume,
    SUMMARY_MIN_CHARS,
    TOTAL_A4_POINTS
)
from backend.flexible_renderer import render_flexible_html

class TestFlexibleValidation(unittest.TestCase):
    def setUp(self):
        self.valid_data = {
            "personal": {
                "first_name": "Aakash",
                "last_name": "Sharma",
                "email": "aakash@example.com",
                "phone": "+91 98765 43210",
                "city_state": "Bengaluru, Karnataka",
                "linkedin": "linkedin.com/in/aakash",
            },
            "summary": (
                "Driven Software Engineer with strong expertise in full-stack web development, "
                "distributed backend systems, and modern cloud deployment. Proven track record of "
                "building scalable, fault-tolerant REST APIs and collaborating with cross-functional teams."
            ),
            "education": [
                {
                    "institution": "National Institute of Technology",
                    "degree": "B.Tech Computer Science",
                    "grad_date": "2024",
                },
                {
                    "institution": "Delhi Public School",
                    "degree": "CBSE Class XII",
                    "grad_date": "2020",
                }
            ],
            "projects": [
                {
                    "title": "Distributed Task Scheduler",
                    "tech_stack": "Python, Redis, Docker",
                    "bullet_1": "Engineered scalable distributed background task runner using Redis pub/sub.",
                    "bullet_2": "Designed retry strategies with exponential backoff reducing failure rate."
                }
            ],
            "skills": {
                "languages": "Python, JavaScript, SQL",
                "frameworks": "React, FastAPI, Docker",
            },
            "experience": []  # 0 experience should be 100% allowed for freshers!
        }

    def test_valid_fresher_resume_passes(self):
        result = validate_flexible_resume(self.valid_data)
        self.assertTrue(result.is_valid, f"Expected valid, got errors: {result.errors}")
        self.assertGreaterEqual(result.progress_percent, 80)
        self.assertTrue(result.can_download_pdf)
        self.assertLessEqual(result.capacity_percent, 100)

    def test_summary_threshold_enforced(self):
        # Summary with less than 150 characters should fail validation
        short_data = dict(self.valid_data)
        short_data["summary"] = "Too short summary."
        result = validate_flexible_resume(short_data)
        self.assertFalse(result.is_valid)
        summary_errors = [e for e in result.errors if e.field == "summary"]
        self.assertTrue(len(summary_errors) > 0)
        self.assertIn("at least 150 characters", summary_errors[0].message)

    def test_education_two_mandatory_enforced(self):
        # Only 1 education entry provided
        one_edu = dict(self.valid_data)
        one_edu["education"] = [self.valid_data["education"][0]]
        result = validate_flexible_resume(one_edu)
        self.assertFalse(result.is_valid)
        edu_errors = [e for e in result.errors if "education" in e.section.lower()]
        self.assertTrue(len(edu_errors) > 0)

    def test_project_one_mandatory_enforced(self):
        no_proj = dict(self.valid_data)
        no_proj["projects"] = []
        result = validate_flexible_resume(no_proj)
        self.assertFalse(result.is_valid)
        proj_errors = [e for e in result.errors if "project" in e.section.lower()]
        self.assertTrue(len(proj_errors) > 0)

    def test_page_budget_overflow_detected(self):
        # Add massive text to test budget overflow
        overflow_data = dict(self.valid_data)
        overflow_data["experience"] = [
            {
                "company": f"Company {i}",
                "role": "Senior Engineer",
                "bullet_1": "Extensive paragraph describing massive accomplishments and system design details spanning many lines of text in the document " * 6,
                "bullet_2": "Another long bullet point detailing performance optimizations, microservice migrations, and team mentorship " * 6,
            }
            for i in range(1, 4)
        ]
        result = validate_flexible_resume(overflow_data)
        self.assertGreater(result.capacity_percent, 100)
        self.assertEqual(result.density_mode, "overflow")
        self.assertIsNotNone(result.trim_suggestion)

    def test_render_flexible_html_fresher(self):
        html = render_flexible_html(self.valid_data)
        self.assertIn("Aakash Sharma", html)
        self.assertIn("Distributed Task Scheduler", html)
        self.assertIn("National Institute of Technology", html)
        self.assertIn("density-", html)
        # Verify Professional Experience section heading is absent when experience is 0
        self.assertNotIn("<h2>Professional Experience</h2>", html)
        self.assertNotIn('<h2 class="sec-title">Professional Experience</h2>', html)

if __name__ == "__main__":
    unittest.main()
