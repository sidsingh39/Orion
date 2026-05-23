from src.db.supabase import supabase
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.chat import router as chat_router
from src.api.upload import router as upload_router
from src.api.quiz import router as quiz_router
from src.api.auth import router as auth_router
from src.api.sessions import router as sessions_router
from src.models.notice_request import NoticeRequest
from src.core.embeddings import get_embedding
from src.db.vector_store import add_document
from src.db.vector_store import query_documents
from src.api.notices import router as notices_router

app = FastAPI()

# Allowed frontend origins
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",

    # Vercel frontend
    "https://orion-potb-c9rqhtol-siddharth-singhs-projects-8f0d8fbf.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
import os

# Create static directory if it doesn't exist
os.makedirs("static/uploads", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/test-db")
def test_db():
    try:
        response = supabase.table("users").select("*").execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/")
def home():
    return {"status": "Groq/Supabase RAG server running"}

app.include_router(chat_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(quiz_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(sessions_router, prefix="/api")
app.include_router(notices_router, prefix="/api")

@app.post("/create-notice")
def create_notice(notice: NoticeRequest):
    try:
        data = {
            "title": notice.title,
            "raw_content": notice.raw_content,
            "category": notice.category,
            "department": notice.department,
            "program": notice.program,
            "semester": notice.semester,
            "section": notice.section,
            "uploader_role": notice.uploader_role,
            "visibility_scope": notice.visibility_scope,
            "source_type": notice.source_type,
            "trust_score": 75,
            "approval_status": "approved"
        }

        response = supabase.table("notices").insert(data).execute()

        saved_notice = response.data[0]

        embedding = get_embedding(saved_notice["raw_content"])

        metadata = {
            "notice_id": saved_notice["id"],
            "title": saved_notice["title"],
            "department": saved_notice["department"],
            "program": saved_notice["program"],
            "semester": saved_notice["semester"],
            "section": saved_notice["section"],
            "trust_score": saved_notice["trust_score"]
        }

        add_document(
            text=saved_notice["raw_content"],
            embedding=embedding,
            metadata=metadata
        )

        return {
            "status": "success",
            "data": response.data
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/search-notices")
def search_notices(query: str):
    try:
        results = query_documents(query_text=query)

        return {
            "status": "success",
            "query": query,
            "results": results
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }