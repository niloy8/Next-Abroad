import json
import logging
import httpx
from typing import Dict, Any, Optional
from app.services.ai.base import AIProvider

logger = logging.getLogger(__name__)


class GeminiProvider(AIProvider):
    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent"

    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> str:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        url = f"{self.base_url}?key={self.api_key}"
        contents = []

        if context:
            context_str = f"Verified Context Information:\n{json.dumps(context, indent=2)}\n\n"
            contents.append({"parts": [{"text": context_str + prompt}]})
        else:
            contents.append({"parts": [{"text": prompt}]})

        payload: Dict[str, Any] = {"contents": contents}
        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                logger.error(f"Gemini API returned error: {resp.text}")
                raise RuntimeError(f"Gemini API error ({resp.status_code}): {resp.text}")
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "")
            return "No response generated."

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
            return {}
