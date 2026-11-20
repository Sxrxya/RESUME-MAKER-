"""Pydantic data models for Voltare resume."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List


class PersonalInfo(BaseModel):
    first_name: str = Field(default="", max_length=20)
    second_name: str = Field(default="", max_length=20)
    city_country: str = Field(default="", max_length=40)
    linkedin_url: str = Field(default="", max_length=60)
    phone: str = Field(default="", max_length=20)
    email: str = Field(default="", max_length=40)


class ProfessionalSummary(BaseModel):
    summary: str = Field(default="", max_length=450)
    skills: str = Field(default="", max_length=200)


class EducationEntry(BaseModel):
    university: str = Field(default="", max_length=50)
    city_country: str = Field(default="", max_length=30)
    program: str = Field(default="", max_length=50)
    gpa: Optional[str] = Field(default="", max_length=15)
    graduation_date: str = Field(default="", max_length=15)
    relevant_courses: Optional[str] = Field(default="", max_length=80)


class ResearchEntry(BaseModel):
    title: str = Field(default="", max_length=60)
    organization: str = Field(default="", max_length=40)
    additional_info: Optional[str] = Field(default="", max_length=60)
    start_date: str = Field(default="", max_length=12)
    end_date: str = Field(default="", max_length=12)
    bullet_1: str = Field(default="", max_length=220)
    bullet_2: str = Field(default="", max_length=220)


class ProfessionalExperienceEntry(BaseModel):
    company: str = Field(default="", max_length=40)
    domain: str = Field(default="", max_length=30)
    role: str = Field(default="", max_length=30)
    start_date: str = Field(default="", max_length=12)
    end_date: str = Field(default="", max_length=12)
    bullets: List[str] = Field(default_factory=list)


class AchievementsLeadership(BaseModel):
    awards: Optional[str] = Field(default="", max_length=180)
    leadership_1: Optional[str] = Field(default="", max_length=220)
    leadership_2: Optional[str] = Field(default="", max_length=220)
    achievement: Optional[str] = Field(default="", max_length=180)
    community_1: Optional[str] = Field(default="", max_length=220)
    community_2: Optional[str] = Field(default="", max_length=220)
    interests: Optional[str] = Field(default="", max_length=180)


class ResumeData(BaseModel):
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    professional_summary: ProfessionalSummary = Field(default_factory=ProfessionalSummary)
    education: List[EducationEntry] = Field(default_factory=lambda: [EducationEntry() for _ in range(3)])
    research_projects: List[ResearchEntry] = Field(default_factory=lambda: [ResearchEntry() for _ in range(3)])
    professional_experience: List[ProfessionalExperienceEntry] = Field(
        default_factory=lambda: [
            ProfessionalExperienceEntry(bullets=[""]),
            ProfessionalExperienceEntry(bullets=["", ""]),
            ProfessionalExperienceEntry(bullets=[""]),
        ]
    )
    achievements_leadership: AchievementsLeadership = Field(default_factory=AchievementsLeadership)

    @classmethod
    def get_empty(cls) -> "ResumeData":
        return cls()
