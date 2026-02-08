import re
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.core.llm import ask_llm
from src.db.vector_store import query_documents

router = APIRouter()

class QuizRequest(BaseModel):
    topic: str

@router.post("/quiz")
def generate_quiz(req: QuizRequest):
    # Retrieve relevant context
    context = query_documents(req.topic)
    
    # Fallback if no context found
    if not context or len(context.strip()) < 10:
        context = "General knowledge about the topic."

    prompt = f"""
    Generate a quiz with 5 multiple-choice questions about "{req.topic}".
    
    Use the following context if relevant, otherwise use general knowledge:
    {context}
    
    IMPORTANT: Return ONLY a raw JSON list of objects. Do not include markdown formatting (like ```json), explanations, or any other text.
    
    Output Format:
    [
      {{
        "question": "Question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "Option B" 
      }}
    ]
    
    Constraints:
    1. The "answer" MUST be an exact string match to one of the "options".
    2. Provide exactly 5 questions.
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
