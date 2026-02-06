from src.core.llm import ask_llm, ask_llm_stream
from src.db.vector_store import query_documents
from src.chat_db import add_message, get_messages_by_session

def handle_chat_stream(query: str, session_id: str = None):
    # 0. Save User Message
    if session_id:
        add_message(session_id, "user", query)

    # 1. Retrieve relevant context from vector store
    context = query_documents(query)
    
    # 2. Retrieve Conversation History
    history_text = ""
    if session_id:
        messages = get_messages_by_session(session_id)
        # We just added the user query. So messages[-1] is the current query.
        recent_messages = messages[:-1][-10:] # Take up to 10 messages BEFORE the current one
        
        if recent_messages:
            history_text = "\nConversation History:\n"
            for msg in recent_messages:
                role = "User" if msg['role'] == 'user' else "AI"
                history_text += f"{role}: {msg['content']}\n"

    # 3. Build prompt
    if context:
        prompt = f"""
You are a friendly and helpful study buddy.
Use the following context to answer the user's question. 
Keep your tone casual but educational.

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
    
    # 4. Stream Response & Accumulate
    full_response = ""
    for chunk in ask_llm_stream(prompt):
        full_response += chunk
        yield chunk

    # 5. Save AI Response
    if session_id:
        add_message(session_id, "assistant", full_response)
