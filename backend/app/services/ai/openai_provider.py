import json
import logging
import httpx
from typing import Dict, Any, Optional
from app.services.ai.base import AIProvider

logger = logging.getLogger(__name__)


class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str, model_name: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model_name = model_name
        self.base_url = "https://api.openai.com/v1/chat/completions"

    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> str:
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY is not configured.")

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        
        user_content = prompt
        if context:
            user_content = f"Verified Context Data:\n{json.dumps(context, indent=2)}\n\nQuery:\n{prompt}"
        
        messages.append({"role": "user", "content": user_content})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(self.base_url, headers=headers, json=payload)
            if resp.status_code != 200:
                logger.error(f"OpenAI error: {resp.text}")
                raise RuntimeError(f"OpenAI API error ({resp.status_code}): {resp.text}")
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def extract_structured_json(
        self,
        text: str,
        schema_description: str,
    ) -> Dict[str, Any]:
        prompt = (
            f"Extract structured JSON based on this schema:\n{schema_description}\n"
            f"Text:\n{text}\nReturn ONLY JSON."
        )
        response_text = await self.generate_response(prompt)
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
            logger.warning(f"Failed to parse search intent via OpenAI: {e}")
            return {}
