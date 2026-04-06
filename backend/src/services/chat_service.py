from src.core.llm import ask_llm, ask_llm_stream
from src.db.vector_store import query_documents
from src.chat_db import add_message, get_messages_by_session, get_session


def handle_chat_stream(query: str, session_id: str = None, user_id: str = None):
    # 0. Verify Session Ownership if session_id is provided
    if session_id and user_id:
        session = get_session(session_id, user_id=user_id)
        if not session:
            yield "Error: Session not found or access denied."
            return

    # 1. Save User Message
    if session_id:
        add_message(session_id, "user", query)

    # 2. Retrieve relevant context from vector store
    context = query_documents(query, user_id=user_id)

    # 3. Retrieve Conversation History
    history_text = ""

    if session_id:
        messages = get_messages_by_session(session_id)
        recent_messages = messages[:-1][-10:]

        if recent_messages:
            history_text = "\nConversation History:\n"

            for msg in recent_messages:
                role = "User" if msg["role"] == "user" else "AI"
                history_text += f"{role}: {msg['content']}\n"

    # 4. Build prompt with trust awareness
    if context:
        prompt = f"""
You are a friendly and helpful study buddy.

Use the provided context carefully.

Important trust rule:
- If context contains [Low-confidence source: X%], clearly mention that the information may not be fully verified.
- Prefer verified information when available.
- If low-confidence content is used, warn the user naturally.

Context:
{context}

{history_text}

User Question: {query}
"""
    else:
        prompt = f"""
You are a friendly and helpful study buddy.
Answer the user's question in a casual, encouraging, and supportive tone.

{history_text}

User Question: {query}
"""

    print(f"\nSending prompt to Groq (Context: {len(context) if context else 0}, History: {len(history_text)} chars)\n")

    # 5. Stream response
    full_response = ""

    for chunk in ask_llm_stream(prompt):
        full_response += chunk
        yield chunk

    # 6. Save AI Response
    if session_id:
        add_message(session_id, "assistant", full_response)