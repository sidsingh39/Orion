import uuid
import datetime
import pytesseract

from fastapi import UploadFile, HTTPException
from src.core.embeddings import get_embedding
from src.db.vector_store import add_document
from src.db.supabase import supabase
from src.services.verification import verify_document_content

# Path to Tesseract executable on Windows
pytesseract.pytesseract.tesseract_cmd = r"C:\Users\sidle\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"


async def process_deployment(
    file: UploadFile,
    content: bytes,
    user_id: str = None,
    uploader_role: str = "student"
):
    """
    Orchestrates file upload, parsing, verification, storage, and embedding.
    """

    try:
        text = ""

        # ---------------------------------------------------
        # 1. Parse Content
        # ---------------------------------------------------
        if file.filename.endswith(".pdf"):
            import io
            from pypdf import PdfReader

            pdf_reader = PdfReader(io.BytesIO(content))

            # Normal PDF text extraction first
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"

            # OCR fallback for scanned PDFs
            if len(text.strip()) < 50:
                from pdf2image import convert_from_bytes

                images = convert_from_bytes(
                    content,
                    poppler_path=r"C:\Users\sidle\Release-25.12.0-0\poppler-25.12.0\Library\bin"
                )

                for img in images:
                    text += pytesseract.image_to_string(img) + "\n"

        # ---------------------------------------------------
        # Image Upload Handling
        # ---------------------------------------------------
        elif file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
            import base64
            from src.core.llm import ask_llm_vision

            base64_image = base64.b64encode(content).decode("utf-8")

            mime_type = (
                "image/jpeg"
                if file.filename.lower().endswith((".jpg", ".jpeg"))
                else "image/png"
            )

            image_url = f"data:{mime_type};base64,{base64_image}"

            prompt = (
                "Describe this image in detail for a knowledge base. "
                "Include key text, objects, and context."
            )

            description = ask_llm_vision(prompt, image_url)

            text = f"Image Filename: {file.filename}\nDescription: {description}"

        # ---------------------------------------------------
        # Plain Text / Other Files
        # ---------------------------------------------------
        else:
            text = f"Filename: {file.filename}\nContent:\n{content.decode('utf-8', errors='ignore')}"

        # ---------------------------------------------------
        # 2. Verify document trust
        # ---------------------------------------------------
        verification_result = verify_document_content(text, uploader_role)

        # ---------------------------------------------------
        # 3. Upload to Supabase Storage
        # ---------------------------------------------------
        file_path = f"{uuid.uuid4()}-{file.filename}"

        supabase.storage.from_("uploads").upload(
            file=content,
            path=file_path,
            file_options={"content-type": file.content_type}
        )

        # ---------------------------------------------------
        # 4. Get public URL
        # ---------------------------------------------------
        file_url = supabase.storage.from_("uploads").get_public_url(file_path)

        # ---------------------------------------------------
        # 5. Chunking and Embedding
        # ---------------------------------------------------
        CHUNK_SIZE = 1000
        chunks = [text[i:i + CHUNK_SIZE] for i in range(0, len(text), CHUNK_SIZE)]

        timestamp = datetime.datetime.now().isoformat()

        for chunk in chunks:
            emb = get_embedding(chunk)

            metadata = {
                "filename": file.filename,
                "type": file.content_type or "unknown",
                "timestamp": timestamp,
                "chunk_text": chunk[:100] + "...",
                "file_url": file_url,
                "storage_path": file_path,
                "trust_score": verification_result["trust_score"],
                "verified": verification_result["verified"],
                "trust_message": verification_result["message"]
            }

            add_document(chunk, emb, metadata, user_id=user_id)

        # ---------------------------------------------------
        # 6. Return Upload Result
        # ---------------------------------------------------
        return {
            "status": "uploaded",
            "filename": file.filename,
            "chunks": len(chunks),
            "file_url": file_url,
            "verification": verification_result
        }

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload a text, PDF, or image file."
        )

    except Exception as e:
        print(f"Upload Service Failed: {str(e)}")
        raise e