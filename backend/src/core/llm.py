import os
from groq import Groq
from src.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

# List of models to try in order of preference/stability
MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "llama-3.2-11b-vision-preview"
]

def ask_llm(prompt: str):
    for model in MODELS:
        # Skip vision model for text-only prompts
        if "vision" in model:
            continue
            
        try:
            print(f"Trying model: {model}")
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Model {model} failed: {e}")
            continue
    
    return "Sorry, I am currently unable to generate a response due to server issues."

def ask_llm_stream(prompt: str):
    """
    Streams the response from the LLM, trying multiple models if needed.
    Yields chunks of text.
    """
    for model in MODELS:
        if "vision" in model:
            continue
            
        try:
            print(f"Trying model (stream): {model}")
            stream = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                stream=True
            )
            
            for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
            return # Success, exit function
            
        except Exception as e:
            print(f"Model {model} failed (stream): {e}")
            continue
    
    yield "Sorry, I am currently unable to generate a response due to server issues."

def ask_llm_vision(prompt: str, image_url: str):
    model = "llama-3.2-11b-vision-preview" 
    try:
        print(f"Trying vision model: {model}")
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user", 
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url
                            }
                        }
                    ]
                }
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Vision model {model} failed: {e}")
        return "Image description unavailable due to processing error."
