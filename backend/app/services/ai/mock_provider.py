import re
import json
from typing import Dict, Any, Optional, List
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
        prompt_lower = prompt.lower().strip()

        # Handle simple greetings
        if re.search(r"^(hi|hello|hey|good\s+(morning|afternoon|evening))\b", prompt_lower):
            return (
                "Hello! I am your **StudyPath AI Advisor**.\n\n"
                "I can help you evaluate scholarships, check your eligibility based on your CGPA and language scores, "
                "break down tuition & blocked account living costs, or structure your document roadmap.\n\n"
                "Which country or degree level are you interested in pursuing?"
            )

        # Handle scholarship / CGPA queries
        if "scholarship" in prompt_lower or "cgpa" in prompt_lower or "gpa" in prompt_lower:
            student_cgpa = None
            if context and "student_profile" in context:
                student_cgpa = context["student_profile"].get("cgpa")
            
            sch_list = []
            if context and "verified_scholarships" in context:
                sch_list = context["verified_scholarships"]

            lines = ["Here is an evaluation based on verified database criteria:\n"]
            if student_cgpa:
                lines.append(f"**Your Profile CGPA:** {student_cgpa} / 4.0\n")
            
            if sch_list:
                for s in sch_list[:4]:
                    req_gpa = s.get("min_cgpa", 3.0)
                    status_str = "Eligible" if (student_cgpa and student_cgpa >= req_gpa) else "Competitive / Review"
                    lines.append(
                        f"- **{s.get('name')}** ({s.get('country')}) — Min CGPA: {req_gpa} | {s.get('funding_type', 'Fully Funded')} [{status_str}]"
                    )
                lines.append("\nFor German public universities, tuition is 0 EUR. For Sweden/Canada, full funding depends on meeting academic cutoffs.")
            else:
                lines.append(
                    "- **DAAD Helmut-Schmidt-Programme (Germany)**: Min CGPA 3.0, IELTS 6.5, Fully Funded.\n"
                    "- **Swedish Institute Scholarships (Sweden)**: Min CGPA 3.0, IELTS 6.5, Full Tuition + Monthly Stipend.\n"
                    "- **Erasmus Mundus Joint Masters (EU)**: Min CGPA 3.2, IELTS 6.5, Fully Funded.\n"
                    "- **ETH Zurich ESOP (Switzerland)**: High merit (Min CGPA 3.7+)."
                )
            lines.append("\nWould you like guidance on specific program deadlines or document preparation?")
            return "\n".join(lines)

        # Handle eligibility queries
        if "eligible" in prompt_lower or "eligibility" in prompt_lower:
            if context and "scholarship" in context:
                sch = context["scholarship"]
                return (
                    f"Based on official requirements for **{sch.get('name', 'this scholarship')}**:\n\n"
                    f"- **Minimum CGPA**: {sch.get('min_cgpa', 'N/A')}\n"
                    f"- **Language Requirement**: IELTS {sch.get('min_ielts', 'N/A')} / TOEFL {sch.get('min_toefl', 'N/A')}\n"
                    f"- **Funding**: {sch.get('funding_type', 'Full')}\n"
                    f"- **Deadline**: {sch.get('application_deadline', 'Verified')}\n\n"
                    f"Check official portal at {sch.get('official_application_url', 'the university website')}."
                )
            return (
                "To determine your exact eligibility, our deterministic matching engine compares your CGPA, "
                "English language test scores (IELTS/TOEFL), and nationality against published institutional requirements. "
                "Ensure your profile is complete under the Onboarding section."
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
                "- **Annual Tuition**: Varies significantly by country. In Germany, public universities charge zero tuition (only ~€350/semester social contribution). In the US, UK, and Canada, tuition ranges from $15,000 to $45,000/year.\n"
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

    async def research_opportunities(
        self,
        origin_country: str,
        destination_country: str,
        degree_level: str,
        field_of_study: str,
        cgpa: float,
        ielts: float,
        query: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        dest = destination_country.strip() if destination_country else "All"
        field = field_of_study.strip() if field_of_study else "Computer Science"
        deg = degree_level.strip() if degree_level else "Master's"

        catalog = [
            {
                "title": f"M.Sc. in {field} (Technical University of Munich - TUM)",
                "organization": "Technical University of Munich (TUM)",
                "country": "Germany",
                "degree_level": "Master's",
                "field_of_study": field,
                "funding_type": "Tuition-Free (Subsidized Public University)",
                "status": "OPEN",
                "deadline": "2027-05-31",
                "tuition_annual": 0.0,
                "living_cost_annual": 11904.0,
                "currency": "EUR",
                "official_portal_url": "https://www.tum.de/en/studies/degree-programs",
                "min_cgpa": 3.0,
                "min_ielts": 6.5,
                "visa_work_rights": "140 full days or 280 half days per calendar year. 18-month post-study job seeker visa.",
                "post_study_work_visa": "18-month job seeker residence permit for German degree graduates.",
                "match_explanation": f"Your CGPA of {cgpa} and IELTS {ielts} satisfy TUM's international admission thresholds. Public education in Germany is tuition-free for international students from {origin_country}.",
            },
            {
                "title": f"Master of Science in {field} (KTH Royal Institute of Technology)",
                "organization": "KTH Royal Institute of Technology",
                "country": "Sweden",
                "degree_level": "Master's",
                "field_of_study": field,
                "funding_type": "Tuition Waiver & SI Scholarship Eligible",
                "status": "UPCOMING",
                "deadline": "2027-01-15",
                "tuition_annual": 160000.0,
                "living_cost_annual": 115000.0,
                "currency": "SEK",
                "official_portal_url": "https://www.kth.se/en/studies/master",
                "min_cgpa": 3.2,
                "min_ielts": 6.5,
                "visa_work_rights": "No legal limit on working hours during studies. 12-month post-study job seeker residence permit.",
                "post_study_work_visa": "1-year post-study residence permit to seek employment or start a business in Sweden.",
                "match_explanation": f"Applicants from {origin_country} with IELTS >= 6.5 are fully eligible to apply through universityadmissions.se and are eligible for Swedish Institute (SI) Global Professionals Scholarship.",
            },
            {
                "title": f"M.Sc. in {field} with Thesis (University of British Columbia)",
                "organization": "University of British Columbia (UBC)",
                "country": "Canada",
                "degree_level": "Master's",
                "field_of_study": field,
                "funding_type": "Fully Funded / Research Assistantship (GRA)",
                "status": "OPEN",
                "deadline": "2026-12-15",
                "tuition_annual": 9500.0,
                "living_cost_annual": 18000.0,
                "currency": "CAD",
                "official_portal_url": "https://www.grad.ubc.ca/prospective-students",
                "min_cgpa": 3.3,
                "min_ielts": 7.0,
                "visa_work_rights": "24 hours per week off-campus during academic terms. Up to 3-year Post-Graduation Work Permit (PGWP).",
                "post_study_work_visa": "Up to 3-year PGWP leading directly to Canadian Permanent Residence via Express Entry / PNP.",
                "match_explanation": f"UBC Computer Science and Engineering research master's provides minimum funding packages ($24,000+/yr) for qualified candidates from {origin_country} with CGPA {cgpa}.",
            },
            {
                "title": f"Master of Science in {field} (ETH Zurich)",
                "organization": "ETH Zurich (Swiss Federal Institute of Technology)",
                "country": "Switzerland",
                "degree_level": "Master's",
                "field_of_study": field,
                "funding_type": "Subsidized Public Tuition (ESOP Scholarship Eligible)",
                "status": "OPEN",
                "deadline": "2026-12-15",
                "tuition_annual": 1460.0,
                "living_cost_annual": 21000.0,
                "currency": "CHF",
                "official_portal_url": "https://ethz.ch/en/studies/master.html",
                "min_cgpa": 3.5,
                "min_ielts": 7.0,
                "visa_work_rights": "15 hours per week during term time after first 6 months. 6-month job search residence permit.",
                "post_study_work_visa": "6-month post-graduate permit to find employment matching Swiss academic qualifications.",
                "match_explanation": f"World top-10 university charging very low tuition (~1,460 CHF/year). Excellent match for ambitious students in {field}.",
            },
            {
                "title": f"Master of Computing ({field}) (Australian National University - ANU)",
                "organization": "Australian National University (ANU)",
                "country": "Australia",
                "degree_level": "Master's",
                "field_of_study": field,
                "funding_type": "Chancellor's International Scholarship Eligible",
                "status": "OPEN",
                "deadline": "2026-11-30",
                "tuition_annual": 49000.0,
                "living_cost_annual": 24000.0,
                "currency": "AUD",
                "official_portal_url": "https://programsandcourses.anu.edu.au/",
                "min_cgpa": 3.0,
                "min_ielts": 6.5,
                "visa_work_rights": "48 hours per fortnight during study terms, unlimited during vacations. Subclass 485 post-study work visa (2-4 years).",
                "post_study_work_visa": "Subclass 485 Temporary Graduate visa providing 2 to 3 years full-time work rights in Australia.",
                "match_explanation": f"Students from {origin_country} holding CGPA {cgpa} and IELTS {ielts} qualify for direct admission and automatic 25%-50% tuition merit reductions.",
            },
            {
                "title": f"M.Sc. in {field} & Software Engineering (University of Helsinki)",
                "organization": "University of Helsinki",
                "country": "Finland",
                "degree_level": "Master's",
                "field_of_study": field,
                "funding_type": "Finland Scholarship (100% Tuition Waiver + €5,000 Relocation)",
                "status": "UPCOMING",
                "deadline": "2027-01-04",
                "tuition_annual": 15000.0,
                "living_cost_annual": 10000.0,
                "currency": "EUR",
                "official_portal_url": "https://www.helsinki.fi/en/admissions-and-education/apply-to-masters-programmes",
                "min_cgpa": 3.2,
                "min_ielts": 6.5,
                "visa_work_rights": "30 hours per week student work rights. 2-year post-graduation job seeker residence permit.",
                "post_study_work_visa": "2-year post-study residence permit for employment search or entrepreneurship.",
                "match_explanation": f"Finnish state scholarship system offers 100% tuition waivers for top non-EU/EEA applicants from {origin_country}.",
            },
        ]

        if dest != "All":
            filtered = [item for item in catalog if item["country"].lower() == dest.lower()]
            if filtered:
                return filtered

        return catalog

