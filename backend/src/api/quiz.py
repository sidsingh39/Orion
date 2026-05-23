import json
import re
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from src.core.llm import ask_llm
from src.db.vector_store import query_documents
from src.api.auth import get_current_user

router = APIRouter()

class QuizRequest(BaseModel):
    topic: str
    selected_docs: list[str] = []

@router.post("/quiz")
def generate_quiz(req: QuizRequest, current_user = Depends(get_current_user)):
    # Retrieve relevant context (filtered by user_id)
    context = query_documents(
    req.topic,
    user_id=current_user.id,
    selected_docs=req.selected_docs
)
    
    # Fallback if no context found
    if not context or len(context.strip()) < 10:
        context = "General knowledge about the topic."

        topic_text = (
        req.topic.strip()
        if req.topic.strip()
        else "selected knowledge sources"
    )

    prompt = f"""
    Generate exactly 5 multiple-choice questions about "{topic_text}".

    Context:
    {context}

    IMPORTANT:
    Return ONLY a raw JSON list of objects.
    Do not include markdown formatting, explanations outside JSON, or additional text.

    Rules:

    1. If multiple sources are present, distribute questions across them.
    2. Do NOT generate all questions from a single source.
    3. Give every source fair representation.
    4. Use source labels like [Source: Resume.pdf] when deciding distribution.
    5. If three sources exist, try approximately:
       - Source 1 → 1–2 questions
       - Source 2 → 1–2 questions
       - Source 3 → 1–2 questions
    6. The "answer" must exactly match one option.
    7. Provide exactly 5 questions.
    8. The explanation should be concise and educational.

    Output Format:

    [
      {{
        "question":"Question text",
        "options":["Option A","Option B","Option C","Option D"],
        "answer":"Option B",
        "explanation":"Concise explanation"
      }}
    ]
    """
    
    try:
        response = ask_llm(prompt)
        print(f"LLM Response for Quiz: {response}") # Debug log
        
        # Robust JSON extraction
        # 1. Try direct parse
        try:
            quiz_data = json.loads(response)
        except json.JSONDecodeError:
            # 2. Try cleaning markdown code blocks
            clean_res = response.replace("```json", "").replace("```", "").strip()
            try:
                quiz_data = json.loads(clean_res)
            except json.JSONDecodeError:
                # 3. Try regex to find the list bracket [...]
                match = re.search(r'\[.*\]', response, re.DOTALL)
                if match:
                    try:
                        quiz_data = json.loads(match.group(0))
                    except:
                         raise ValueError("Could not parse JSON from regex match")
                else:
                    raise ValueError("No JSON list found in response")

        return {"quiz": quiz_data}

    except Exception as e:
        print(f"Quiz Generation Error: {e}")
        # Return a helpful error to the client instead of a generic 500 if possible, 
        # or just log it and 500.
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")
