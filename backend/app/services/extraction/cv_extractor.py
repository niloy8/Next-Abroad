import re
from typing import Dict, Any, List
from app.services.ai import get_ai_provider


class CVExtractor:
    @staticmethod
    async def extract_from_text(cv_text: str) -> Dict[str, Any]:
        """
        Extracts structured profile information from CV text.
        Uses AI provider with deterministic fallback.
        Does NOT silently overwrite; returns structured payload for user review.
        """
        ai_provider = get_ai_provider()
        schema_desc = """
        {
          "full_name": string or null,
          "email": string or null,
          "phone": string or null,
          "current_degree": string or null,
          "desired_degree": string or null,
          "field_of_study": string or null,
          "institution": string or null,
          "cgpa": float or null,
          "grading_scale": float or null,
          "graduation_year": integer or null,
          "english_test": string or null,
          "english_score": float or null,
          "skills": list of strings,
          "projects": list of {"title": string, "description": string},
          "research_publications": list of strings,
          "work_experience": list of {"role": string, "company": string, "duration": string},
          "certifications": list of strings
        }
        """

        try:
            extracted = await ai_provider.extract_structured_json(cv_text, schema_desc)
            if extracted and isinstance(extracted, dict) and (extracted.get("cgpa") or extracted.get("skills")):
                return extracted
        except Exception:
            pass

        # Robust rule-based / regex extraction fallback
        extracted: Dict[str, Any] = {
            "full_name": None,
            "email": None,
            "current_degree": None,
            "desired_degree": "Master's",
            "field_of_study": None,
            "institution": None,
            "cgpa": None,
            "grading_scale": 4.0,
            "graduation_year": None,
            "english_test": "Not taken yet",
            "english_score": None,
            "skills": [],
            "projects": [],
            "research_publications": [],
            "work_experience": [],
            "certifications": [],
        }

        # Email
        email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", cv_text)
        if email_match:
            extracted["email"] = email_match.group(0)

        # CGPA
        cgpa_match = re.search(r"(?:cgpa|gpa)[\s:]*([0-9]\.[0-9]{1,2})", cv_text, re.IGNORECASE)
        if cgpa_match:
            try:
                extracted["cgpa"] = float(cgpa_match.group(1))
            except ValueError:
                pass

        # English test
        ielts_match = re.search(r"ielts[\s:]*([0-9]\.?[0-9]?)", cv_text, re.IGNORECASE)
        if ielts_match:
            extracted["english_test"] = "IELTS"
            try:
                extracted["english_score"] = float(ielts_match.group(1))
            except ValueError:
                pass
        else:
            toefl_match = re.search(r"toefl[\s:]*([0-9]{2,3})", cv_text, re.IGNORECASE)
            if toefl_match:
                extracted["english_test"] = "TOEFL"
                try:
                    extracted["english_score"] = float(toefl_match.group(1))
                except ValueError:
                    pass

        # Degree & Field
        if re.search(r"\b(computer science|software engineering|data science|informatics)\b", cv_text, re.IGNORECASE):
            match = re.search(r"\b(computer science|software engineering|data science|informatics)\b", cv_text, re.IGNORECASE)
            extracted["field_of_study"] = match.group(0).title()
            extracted["current_degree"] = "Bachelor's"
            extracted["desired_degree"] = "Master's"
        elif re.search(r"\b(electrical engineering|mechanical engineering)\b", cv_text, re.IGNORECASE):
            match = re.search(r"\b(electrical engineering|mechanical engineering)\b", cv_text, re.IGNORECASE)
            extracted["field_of_study"] = match.group(0).title()
            extracted["current_degree"] = "Bachelor's"

        # Year
        year_match = re.search(r"\b(202[0-9])\b", cv_text)
        if year_match:
            extracted["graduation_year"] = int(year_match.group(1))

        # Skills discovery
        common_skills = [
            "Python", "JavaScript", "TypeScript", "React", "Node.js", "Java", "C++",
            "SQL", "PostgreSQL", "Machine Learning", "Deep Learning", "TensorFlow",
            "PyTorch", "Docker", "Git", "Linux", "Data Structures", "Algorithms",
            "FastAPI", "Cloud Computing", "AWS", "Azure"
        ]
        found_skills = [s for s in common_skills if re.search(rf"\b{re.escape(s)}\b", cv_text, re.IGNORECASE)]
        extracted["skills"] = found_skills

        return extracted
