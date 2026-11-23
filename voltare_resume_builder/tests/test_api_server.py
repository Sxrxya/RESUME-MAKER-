import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.api_server import app
from frontend.candidate_form import SAMPLE_CANDIDATE_DATA

client = TestClient(app)


class TestApiServer(unittest.TestCase):
    def test_health(self):
        response = client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["watermark_exists"])

    def test_config(self):
        response = client.get("/api/config")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("limits", data)
        self.assertIn("sample_data", data)
        self.assertTrue(data["watermark_exists"])

    def test_validate_sample_data(self):
        # Build structured data from SAMPLE_CANDIDATE_DATA
        p = SAMPLE_CANDIDATE_DATA
        structured = {
            "personal_info": {
                "first_name": p["first_name"],
                "second_name": p["second_name"],
                "city_country": p["city_country"],
                "linkedin_url": p["linkedin_url"],
                "phone": p["phone"],
                "email": p["email"],
            },
            "professional_summary": {
                "summary": p["summary"],
                "skills": p["skills"],
            },
            "education": [
                {
                    "university": p["edu_1_university"],
                    "city_country": p["edu_1_city"],
                    "program": p["edu_1_program"],
                    "gpa": p["edu_1_gpa"],
                    "graduation_date": p["edu_1_date"],
                    "relevant_courses": p["edu_1_courses"],
                },
                {
                    "university": p["edu_2_university"],
                    "city_country": p["edu_2_city"],
                    "program": p["edu_2_program"],
                    "gpa": p["edu_2_gpa"],
                    "graduation_date": p["edu_2_date"],
                    "relevant_courses": p["edu_2_courses"],
                },
                {
                    "university": p["edu_3_university"],
                    "city_country": p["edu_3_city"],
                    "program": p["edu_3_program"],
                    "gpa": p["edu_3_gpa"],
                    "graduation_date": p["edu_3_date"],
                    "relevant_courses": p["edu_3_courses"],
                },
            ],
            "research_projects": [
                {
                    "title": p["res_1_title"],
                    "organization": p["res_1_org"],
                    "additional_info": p["res_1_additional"],
                    "start_date": p["res_1_start"],
                    "end_date": p["res_1_end"],
                    "bullet_1": p["res_1_b1"],
                    "bullet_2": p["res_1_b2"],
                },
                {
                    "title": p["res_2_title"],
                    "organization": p["res_2_org"],
                    "additional_info": p["res_2_additional"],
                    "start_date": p["res_2_start"],
                    "end_date": p["res_2_end"],
                    "bullet_1": p["res_2_b1"],
                    "bullet_2": p["res_2_b2"],
                },
                {
                    "title": p["res_3_title"],
                    "organization": p["res_3_org"],
                    "additional_info": p["res_3_additional"],
                    "start_date": p["res_3_start"],
                    "end_date": p["res_3_end"],
                    "bullet_1": p["res_3_b1"],
                    "bullet_2": p["res_3_b2"],
                },
            ],
            "professional_experience": [
                {
                    "company": p["exp_1_company"],
                    "domain": p["exp_1_domain"],
                    "role": p["exp_1_role"],
                    "start_date": p["exp_1_start"],
                    "end_date": p["exp_1_end"],
                    "bullets": [p["exp_1_b1"]],
                },
                {
                    "company": p["exp_2_company"],
                    "domain": p["exp_2_domain"],
                    "role": p["exp_2_role"],
                    "start_date": p["exp_2_start"],
                    "end_date": p["exp_2_end"],
                    "bullets": [p["exp_2_b1"], p["exp_2_b2"]],
                },
                {
                    "company": p["exp_3_company"],
                    "domain": p["exp_3_domain"],
                    "role": p["exp_3_role"],
                    "start_date": p["exp_3_start"],
                    "end_date": p["exp_3_end"],
                    "bullets": [p["exp_3_b1"]],
                },
            ],
            "achievements_leadership": {
                "awards": p["awards"],
                "leadership_1": p["leadership_1"],
                "leadership_2": p["leadership_2"],
                "achievement": p["achievement"],
                "community_1": p["community_1"],
                "community_2": p["community_2"],
                "interests": p["interests"],
            },
        }

        response = client.post("/api/validate", json={"data": structured})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["is_valid"])

    def test_preview(self):
        response = client.post("/api/preview", json={"data": {}})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("html", data)
        self.assertIn("resume-page", data["html"])


if __name__ == "__main__":
    unittest.main()

