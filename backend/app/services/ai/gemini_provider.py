import json
import logging
import httpx
from typing import Dict, Any, Optional, List
from app.services.ai.base import AIProvider
from app.services.ai.mock_provider import MockAIProvider

logger = logging.getLogger(__name__)


class GeminiProvider(AIProvider):
    def __init__(self, api_key: str, model_name: str = "gemini-3.5-flash-lite"):
        self.api_key = api_key
        self.model_name = model_name
        self.fallback_provider = MockAIProvider()

    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> str:
        if not self.api_key:
            return await self.fallback_provider.generate_response(prompt, system_instruction, context)

        # Build prompt contents
        contents = []
        if context:
            context_str = f"Verified Context Information:\n{json.dumps(context, indent=2, ensure_ascii=False)}\n\n"
            contents.append({"parts": [{"text": context_str + prompt}]})
        else:
            contents.append({"parts": [{"text": prompt}]})

        payload: Dict[str, Any] = {"contents": contents}
        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

        # Candidate models to try in order of priority (Lite models have generous separate quotas)
        models_to_try: List[str] = [self.model_name]
        for fallback_model in [
            "gemini-3.5-flash-lite",
            "gemini-3.1-flash-lite",
            "gemini-3-flash-preview",
            "gemini-3.6-flash",
            "gemini-flash-latest",
        ]:
            if fallback_model not in models_to_try:
                models_to_try.append(fallback_model)

        last_error = None
        async with httpx.AsyncClient(timeout=45.0) as client:
            for current_model in models_to_try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{current_model}:generateContent?key={self.api_key}"
                try:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts:
                                return parts[0].get("text", "")
                        logger.warning(f"Gemini {current_model} returned empty candidates.")
                    else:
                        last_error = f"HTTP {resp.status_code}: {resp.text[:200]}"
                        logger.warning(f"Gemini {current_model} returned {resp.status_code}. Trying next available model...")
                except Exception as e:
                    last_error = str(e)
                    logger.warning(f"Gemini {current_model} request failed ({e}). Trying next model...")

        logger.error(f"All Gemini models exhausted. Last error: {last_error}. Falling back to rule-based engine.")
        return await self.fallback_provider.generate_response(prompt, system_instruction, context)

    async def extract_structured_json(
        self,
        text: str,
        schema_description: str,
    ) -> Dict[str, Any]:
        prompt = (
            f"Extract structured information from the following text according to this schema:\n"
            f"{schema_description}\n\n"
            f"Return ONLY valid raw JSON with no Markdown backticks or markdown fences:\n\n"
            f"{text}"
        )
        try:
            response_text = await self.generate_response(prompt)
            # Clean potential markdown backticks
            clean = response_text.strip()
            if clean.startswith("```json"):
                clean = clean[7:]
            if clean.startswith("```"):
                clean = clean[3:]
            if clean.endswith("```"):
                clean = clean[:-3]
            return json.loads(clean.strip())
        except Exception as e:
            logger.warning(f"Failed to parse LLM structured JSON response ({e}), using mock extractor.")
            return await self.fallback_provider.extract_structured_json(text, schema_description)

    async def parse_search_intent(self, natural_query: str) -> Dict[str, Any]:
        schema = (
            '{"country": string or null, "degree_level": string or null, '
            '"field_of_study": string or null, "min_cgpa": float or null, '
            '"funding_type": string or null, "max_budget": float or null}'
        )
        try:
            return await self.extract_structured_json(natural_query, schema)
        except Exception as e:
            logger.warning(f"Failed to parse search intent via Gemini: {e}")
            return await self.fallback_provider.parse_search_intent(natural_query)

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
        """
        Dynamically research active, real-world study and scholarship opportunities
        matching student origin, destination country, academic credentials, and 2027 intakes.
        """
        dest_desc = f"in {destination_country}" if destination_country and destination_country != "All" else "across top international study destinations (Germany, Sweden, Canada, UK, USA, Australia, Switzerland)"
        target_deg = degree_level or "Master's"
        target_fld = field_of_study or "Computer Science"
        prompt = (
            f"You are NextAbroad's real-time international education opportunity researcher.\n"
            f"Conduct comprehensive research for a student with the following profile:\n"
            f"- Citizenship / Origin Country: {origin_country}\n"
            f"- Target Destination: {dest_desc}\n"
            f"- Intended Degree Level: {target_deg}\n"
            f"- Field of Study: {target_fld}\n"
            f"- Student Academic Standing: CGPA {cgpa} / 4.0\n"
            f"- English Proficiency: IELTS {ielts}\n"
            f"{f'- Search Query Context: {query}' if query else ''}\n\n"
            f"CRITICAL REQUIREMENTS:\n"
            f"1. Intake cycle MUST be upcoming 2027 or 2028 intakes. Application deadlines MUST be between October 2026 and August 2027 (e.g. '2026-11-15', '2027-01-15', '2027-05-31'). STRICTLY DO NOT return any past deadlines (e.g. no early 2026 dates).\n"
            f"2. Use real, existing universities, government ministries, or international scholarship foundations.\n"
            f"3. Official portal URLs must be authentic domains (e.g. .edu, .gov, .de, .se, .ac.uk, .ca, .ch, .au).\n"
            f"4. Provide exact student visa part-time work rights and post-graduation work visa provisions for the destination country.\n"
            f"5. Return 4 to 6 top verified opportunities.\n\n"
            f"Return ONLY a valid JSON array of objects with the exact schema below and NO markdown formatting:\n"
            f"[\n"
            f"  {{\n"
            f'    "title": "Program or Scholarship Full Name",\n'
            f'    "organization": "University or Granting Body",\n'
            f'    "country": "Country Name",\n'
            f'    "degree_level": "{target_deg}",\n'
            f'    "field_of_study": "{target_fld}",\n'
            f'    "funding_type": "Fully Funded",\n'
            f'    "status": "OPEN",\n'
            f'    "deadline": "YYYY-MM-DD",\n'
            f'    "tuition_annual": 0.0,\n'
            f'    "living_cost_annual": 12000.0,\n'
            f'    "currency": "EUR",\n'
            f'    "official_portal_url": "https://...",\n'
            f'    "min_cgpa": 3.0,\n'
            f'    "min_ielts": 6.5,\n'
            f'    "visa_work_rights": "Part-time student work rights description",\n'
            f'    "post_study_work_visa": "Post study work authorization duration",\n'
            f'    "match_explanation": "Specific explanation of why this student is eligible based on CGPA and origin"\n'
            f"  }}\n"
            f"]"
        )

        try:
            raw_text = await self.generate_response(prompt)
            clean = raw_text.strip()
            if clean.startswith("```json"):
                clean = clean[7:]
            if clean.startswith("```"):
                clean = clean[3:]
            if clean.endswith("```"):
                clean = clean[:-3]
            parsed = json.loads(clean.strip())
            if isinstance(parsed, list) and len(parsed) > 0:
                logger.info(f"Gemini live research returned {len(parsed)} verified opportunities.")
                return parsed
        except Exception as e:
            logger.warning(f"Gemini opportunity research failed ({e}), falling back to verified catalog.")

        return await self.fallback_provider.research_opportunities(
            origin_country=origin_country,
            destination_country=destination_country,
            degree_level=degree_level,
            field_of_study=field_of_study,
            cgpa=cgpa,
            ielts=ielts,
            query=query,
        )

