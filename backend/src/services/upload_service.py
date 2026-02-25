import uuid
import datetime
from fastapi import UploadFile, HTTPException
from src.core.embeddings import get_embedding
from src.db.vector_store import add_document
from src.db.supabase import supabase

async def process_deployment(file: UploadFile, content: bytes, user_id: str = None):
    """
    Orchestrates the file upload, parsing, vision analysis, storage, and embedding.
    """
    try:
        # 1. Parse Content
        if file.filename.endswith(".pdf"):
            import io
            from pypdf import PdfReader
            
            pdf_reader = PdfReader(io.BytesIO(content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
                
        elif file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
            import base64
            from src.core.llm import ask_llm_vision
            
            # Encode image to base64
            base64_image = base64.b64encode(content).decode('utf-8')
            mime_type = "image/jpeg" if file.filename.lower().endswith((".jpg", ".jpeg")) else "image/png"
            image_url = f"data:{mime_type};base64,{base64_image}"
            
            # Generate description using Vision LLM
            prompt = "Describe this image in detail for a knowledge base. Include key text, objects, and context."
            description = ask_llm_vision(prompt, image_url)
            
            text = f"Image Filename: {file.filename}\nDescription: {description}"
            
        else:
            # Default to text
            text = f"Filename: {file.filename}\nContent:\n{content.decode('utf-8')}"
        
        # 2. Upload to Supabase Storage
        file_path = f"{uuid.uuid4()}-{file.filename}"
        supabase.storage.from_("uploads").upload(
            file=content,
            path=file_path,
            file_options={"content-type": file.content_type}
        )
        
        # 3. Get public URL
        file_url = supabase.storage.from_("uploads").get_public_url(file_path)
        
        # 4. Chunking and embedding
        # Simple chunking for now
        CHUNK_SIZE = 1000
        chunks = [text[i:i+CHUNK_SIZE] for i in range(0, len(text), CHUNK_SIZE)]
        
        timestamp = datetime.datetime.now().isoformat()
        
        for chunk in chunks:
            emb = get_embedding(chunk)
            metadata = {
                "filename": file.filename,
                "type": file.content_type or "unknown",
                "timestamp": timestamp,
                "chunk_text": chunk[:100] + "...", # Store preview
                "file_url": file_url,
                "storage_path": file_path 
            }
            add_document(chunk, emb, metadata, user_id=user_id)
            
        return {
            "status": "uploaded", 
            "filename": file.filename, 
            "chunks": len(chunks), 
            "file_url": file_url
        }

    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a text, PDF, or image file.")
    except Exception as e:
        print(f"Upload Service Failed: {str(e)}")
        # In a real app, log to Sentry/CloudWatch
        raise e
