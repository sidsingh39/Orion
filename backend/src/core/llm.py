import os
from groq import Groq
from src.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

# =========================================
# TEXT MODELS
# =========================================

MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
]

# =========================================
# VISION MODELS
# =========================================

VISION_MODELS = [
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
]

# =========================================
# NORMAL CHAT
# =========================================

def ask_llm(prompt: str):

    for model in MODELS:

        try:
            print(f"Trying model: {model}")

            response = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
            )

            return response.choices[0].message.content

        except Exception as e:

            print(f"Model {model} failed: {e}")
            continue

    return (
        "Sorry, I am currently unable to generate "
        "a response due to server issues."
    )

# =========================================
# STREAMING CHAT
# =========================================

def ask_llm_stream(prompt: str):

    for model in MODELS:

        try:
            print(f"Trying model (stream): {model}")

            stream = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                stream=True,
                temperature=0.3,
            )

            for chunk in stream:

                content = chunk.choices[0].delta.content

                if content:
                    yield content

            return

        except Exception as e:

            print(f"Model {model} failed (stream): {e}")
            continue

    yield (
        "Sorry, I am currently unable to generate "
        "a response due to server issues."
    )

# =========================================
# VISION OCR
# =========================================

def ask_llm_vision(prompt: str, image_url: str):

    for model in VISION_MODELS:

        try:
            print(f"Trying vision model: {model}")

            response = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image_url
                                }
                            }
                        ]
                    }
                ],
                temperature=0.2,
            )

            return response.choices[0].message.content

        except Exception as e:

            print(f"Vision model {model} failed: {e}")
            continue

    return (
        "Image description unavailable "
        "due to processing error."
    )