import json
from src.core.llm import ask_llm


def extract_notice_data(text: str):
    prompt = f"""
You are an academic notice extraction system.

Extract structured information from the academic notice below.

Return ONLY valid JSON.

Required JSON format:

{{
    "title": "",
    "category": "",
    "department": "",
    "program": "",
    "semester": "",
    "section": "",
    "visibility_scope": "",
    "summary": "",
    "deadline": ""
}}

Rules:
- Keep values concise.
- If information is missing, return "unknown".
- Do not explain anything.
- Return JSON only.

Academic Notice:
{text}
"""

    response = ask_llm(prompt)

    try:
        start = response.find("{")
        end = response.rfind("}") + 1

        cleaned = response[start:end]

        return json.loads(cleaned)

    except Exception:
        return {
            "title": "unknown",
            "category": "unknown",
            "department": "unknown",
            "program": "unknown",
            "semester": "unknown",
            "section": "unknown",
            "visibility_scope": "department",
            "summary": text[:300],
            "deadline": "unknown"
        }