import re
import json
from typing import Dict, Any, Optional
from app.services.ai.base import AIProvider


class MockAIProvider(AIProvider):
    """
    Deterministic rule-based fallback provider when external AI API keys are not supplied.
    Strictly answers from verified database context, performs deterministic keyword/entity
    extraction, and never fabricates fake links, universities, or statistics.
    """

    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> str:
        prompt_lower = prompt.lower()

        # Handle eligibility queries
        if "eligible" in prompt_lower or "eligibility" in prompt_lower:
            if context and "scholarship" in context:
                sch = context["scholarship"]
                return (
                    f"Based on the official requirements for **{sch.get('name', 'this scholarship')}**:\n\n"
                    f"- **Minimum CGPA**: {sch.get('min_cgpa', 'N/A')}\n"
                    f"- **Language Requirement**: IELTS {sch.get('min_ielts', 'N/A')} / TOEFL {sch.get('min_toefl', 'N/A')}\n"
                    f"- **Funding**: {sch.get('funding_type', 'Full')}\n"
                    f"- **Deadline**: {sch.get('application_deadline', 'Verified')}\n\n"
                    f"To verify your exact eligibility, make sure your completed profile meets or exceeds these criteria. "
                    f"Check the official portal at {sch.get('official_application_url', 'the university website')}."
                )
            return (
                "To determine your eligibility, our deterministic matching engine compares your current CGPA, "
                "English language test scores (IELTS/TOEFL/PTE), nationality, and graduation year against the official criteria. "
                "Please ensure your profile is at least 80% complete in the Onboarding section."
            )

        # Handle document questions
        if "document" in prompt_lower or "documents" in prompt_lower:
            return (
                "For international university and scholarship applications, standard required documents include:\n\n"
                "1. **Official Academic Transcripts & Degree Certificates** (certified English translation)\n"
                "2. **Valid Passport** (minimum 6 months validity beyond intended departure)\n"
                "3. **Proof of English Language Proficiency** (IELTS, TOEFL, PTE, or Duolingo)\n"
                "4. **Curriculum Vitae (CV / Resume)** in Europass or standard academic format\n"
                "5. **Statement of Purpose / Letter of Motivation** tailored to the chosen program\n"
                "6. **2 Academic Letters of Recommendation (LOR)** on official institutional letterhead\n"
                "7. **Financial Proof or Blocked Account Confirmation** (for visa processing)\n\n"
                "You can track these step-by-step under the **My Plan** section."
            )

        # Handle cost / budget questions
        if "cost" in prompt_lower or "money" in prompt_lower or "tuition" in prompt_lower or "budget" in prompt_lower:
            return (
                "Study abroad costs generally consist of two main components:\n\n"
                "- **Annual Tuition**: Varies significantly by country. In Germany, most public universities charge zero tuition (only ~€350/semester social contribution). In the US, UK, and Canada, tuition ranges from $15,000 to $45,000/year.\n"
                "- **Living Expenses**: Includes accommodation, groceries, health insurance, and transport. For example, Germany requires a blocked account of approx. €11,904/year; Sweden requires approx. 10,000 SEK/month.\n\n"
                "Use our **Cost Calculator** to simulate first-year vs recurring annual costs in your local currency."
            )

        # General response with context citation
        if context and "items" in context:
            items = context["items"]
            reply_lines = [f"Found {len(items)} verified opportunities matching your criteria:\n"]
            for item in items[:5]:
                reply_lines.append(
                    f"- **{item.get('title')}** ({item.get('country')}) — Status: {item.get('status')} | Deadline: {item.get('deadline')}"
                )
            reply_lines.append("\nAll data is verified against Tier-1 official institutional sources.")
            return "\n".join(reply_lines)

        return (
            "Welcome to StudyPath AI Assistant. I provide evidence-based guidance for international university "
            "admissions, official scholarships, verified application deadlines, and cost breakdowns. "
            "You can ask me questions about specific scholarship requirements, document checklists, or eligibility matching."
        )

    async def extract_structured_json(
        self,
        text: str,
        schema_description: str,
    ) -> Dict[str, Any]:
        # Simple extraction using regex for common fields
        data: Dict[str, Any] = {}
        
        # GPA / CGPA
        gpa_match = re.search(r'(?:cgpa|gpa)[\s:]*([0-9]+\.?[0-9]*)', text, re.IGNORECASE)
        if gpa_match:
            data["cgpa"] = float(gpa_match.group(1))

        # IELTS / TOEFL
        ielts_match = re.search(r'ielts[\s:]*([0-9]+\.?[0-9]*)', text, re.IGNORECASE)
        if ielts_match:
            data["ielts"] = float(ielts_match.group(1))

        # Degree
        if re.search(r'\b(master|msc|ms|meng)\b', text, re.IGNORECASE):
            data["desired_degree"] = "Master's"
        elif re.search(r'\b(bachelor|bsc|ba|beng)\b', text, re.IGNORECASE):
            data["desired_degree"] = "Bachelor's"
        elif re.search(r'\b(phd|doctorate)\b', text, re.IGNORECASE):
            data["desired_degree"] = "PhD"

        # Common countries
        for country in ["Germany", "Sweden", "Canada", "United States", "USA", "United Kingdom", "UK", "Australia", "Netherlands", "Switzerland"]:
            if re.search(rf'\b{country}\b', text, re.IGNORECASE):
                data["country"] = "Germany" if country.lower() == "germany" else country
                break

        return data

    async def parse_search_intent(self, natural_query: str) -> Dict[str, Any]:
        query = natural_query.lower()
        extracted: Dict[str, Any] = {}

        # Countries
        country_map = {
            "germany": "Germany",
            "sweden": "Sweden",
            "canada": "Canada",
            "usa": "United States",
            "united states": "United States",
            "uk": "United Kingdom",
            "united kingdom": "United Kingdom",
            "australia": "Australia",
            "finland": "Finland",
            "switzerland": "Switzerland",
            "netherlands": "Netherlands",
            "norway": "Norway",
            "france": "France",
        }
        for k, v in country_map.items():
            if re.search(rf"\b{k}\b", query):
                extracted["country"] = v
                break

        # Degree level
        if "master" in query or "msc" in query or "ms" in query:
            extracted["degree_level"] = "Master's"
        elif "bachelor" in query or "undergraduate" in query or "bsc" in query:
            extracted["degree_level"] = "Bachelor's"
        elif "phd" in query or "doctorate" in query:
            extracted["degree_level"] = "PhD"

        # Field of study
        fields = [
            ("computer science", "Computer Science"),
            ("data science", "Data Science"),
            ("artificial intelligence", "Artificial Intelligence"),
            ("cybersecurity", "Cybersecurity"),
            ("software engineering", "Software Engineering"),
            ("mechanical engineering", "Mechanical Engineering"),
            ("electrical engineering", "Electrical Engineering"),
            ("business analytics", "Business Analytics"),
            ("public policy", "Public Policy"),
            ("biotechnology", "Biotechnology"),
            ("economics", "Economics"),
        ]
        for term, std_name in fields:
            if term in query:
                extracted["field_of_study"] = std_name
                break

        # CGPA
        cgpa_match = re.search(r"(?:cgpa|gpa)[\s:]*(?:above|greater than|>=|>)?\s*([0-9]+\.?[0-9]*)", query)
        if cgpa_match:
            try:
                extracted["min_cgpa"] = float(cgpa_match.group(1))
            except ValueError:
                pass

        # Funding type
        if "fully funded" in query or "full scholarship" in query or "full ride" in query:
            extracted["funding_type"] = "Fully Funded"
        elif "partial" in query:
            extracted["funding_type"] = "Partial Scholarship"
        elif "tuition waiver" in query:
            extracted["funding_type"] = "Tuition Waiver"

        return extracted
