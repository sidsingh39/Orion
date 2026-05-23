import uuid
import datetime
import pytesseract
import re

from fastapi import UploadFile, HTTPException

from src.core.embeddings import get_embedding
from src.db.vector_store import add_document
from src.db.supabase import supabase

from src.services.verification import verify_document_content
from src.services.notice_extractor import extract_notice_data
from src.services.text_cleaner import clean_extracted_text

from src.core.llm import ask_llm_vision


# Tesseract path
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Users\sidle\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"
)


# Main upload processor
async def process_deployment(
    file: UploadFile,
    content: bytes,
    user_id: str = None,
    uploader_role: str = "student"
):

    try:

        text = ""

        # Handle PDF files
        if file.filename.endswith(".pdf"):

            import io
            import base64
            from pypdf import PdfReader
            from pdf2image import convert_from_bytes

            pdf_reader = PdfReader(io.BytesIO(content))

            # Extract PDF text normally
            for page in pdf_reader.pages:

                extracted = page.extract_text()

                if extracted:
                    text += extracted + "\n"

            # OCR fallback for scanned PDFs
            if (
                len(text.strip()) < 500
                or "�" in text
                or "|" in text
            ):

                print("\nUsing Vision OCR Fallback...\n")

                images = convert_from_bytes(
                    content,
                    poppler_path=(
                        r"C:\Users\sidle\Release-25.12.0-0"
                        r"\poppler-25.12.0\Library\bin"
                    )
                )

                text = ""

                for img in images:

                    buffered = io.BytesIO()

                    img.save(
                        buffered,
                        format="PNG"
                    )

                    base64_image = base64.b64encode(
                        buffered.getvalue()
                    ).decode("utf-8")

                    image_url = (
                        f"data:image/png;base64,"
                        f"{base64_image}"
                    )

                    prompt = """
Extract the academic notice cleanly.

Rules:
- preserve headings
- preserve dates
- preserve schedules
- preserve instructions
- preserve faculty names
- preserve group details
- preserve deadlines
- remove OCR corruption
- return only clean notice text
"""

                    extracted = ask_llm_vision(
                        prompt,
                        image_url
                    )

                    text += extracted + "\n\n"

        # Handle image files
        elif file.filename.lower().endswith(
            (".png", ".jpg", ".jpeg")
        ):

            import base64

            base64_image = base64.b64encode(
                content
            ).decode("utf-8")

            mime_type = (
                "image/jpeg"
                if file.filename.lower().endswith(
                    (".jpg", ".jpeg")
                )
                else "image/png"
            )

            image_url = (
                f"data:{mime_type};base64,"
                f"{base64_image}"
            )

            prompt = """
Describe this academic image clearly.

Include:
- visible text
- notices
- headings
- schedules
- important instructions
"""

            description = ask_llm_vision(
                prompt,
                image_url
            )

            text = (
                f"Image Filename: {file.filename}\n\n"
                f"{description}"
            )

        # Handle text files
        else:

            text = (
                f"Filename: {file.filename}\n"
                f"Content:\n"
                f"{content.decode('utf-8', errors='ignore')}"
            )

        # Clean extracted text
        text = clean_extracted_text(text)

        # Verify notice
        verification_result = verify_document_content(
            text,
            uploader_role
        )

        # Extract notice details
        notice_data = extract_notice_data(text)

        # Create storage-safe filename
        safe_filename = re.sub(
            r"[^a-zA-Z0-9._-]",
            "_",
            file.filename
        )

        file_path = (
            f"{uuid.uuid4()}-{safe_filename}"
        )

        # Upload file to storage
        supabase.storage.from_("uploads").upload(
            file=content,
            path=file_path,
            file_options={
                "content-type": file.content_type
            }
        )

        # Get public URL
        file_url = (
            supabase
            .storage
            .from_("uploads")
            .get_public_url(file_path)
        )

        # Save notice
        notice_payload = {

            "title": notice_data["title"],
            "filename": file.filename,
            "raw_content": text,
            "summary": notice_data["summary"],
            "category": notice_data["category"],
            "department": notice_data["department"],
            "program": notice_data["program"],
            "semester": notice_data["semester"],
            "section": notice_data["section"],
            "uploaded_by": user_id,
            "uploader_role": uploader_role,
            "visibility_scope": notice_data[
                "visibility_scope"
            ],
            "deadline": notice_data["deadline"],
            "source_type": (
                file.content_type or "unknown"
            ),
            "trust_score": verification_result[
                "trust_score"
            ],
            "approval_status": "approved"
        }

        notice_response = (
            supabase
            .table("notices")
            .insert(notice_payload)
            .execute()
        )

        saved_notice = notice_response.data[0]

        # Split text into chunks
        CHUNK_SIZE = 1000

        chunks = [
            text[i:i + CHUNK_SIZE]
            for i in range(
                0,
                len(text),
                CHUNK_SIZE
            )
        ]

        timestamp = (
            datetime.datetime.now()
            .isoformat()
        )

        # Store vectors
        for chunk in chunks:

            emb = get_embedding(chunk)

            metadata = {

                "notice_id": saved_notice["id"],
                "filename": file.filename,
                "type": (
                    file.content_type or "unknown"
                ),
                "timestamp": timestamp,
                "chunk_text": (
                    chunk[:100] + "..."
                ),
                "file_url": file_url,
                "storage_path": file_path,
                "trust_score": verification_result[
                    "trust_score"
                ],
                "verified": verification_result[
                    "verified"
                ],
                "trust_message": verification_result[
                    "message"
                ]
            }

            add_document(
                chunk,
                emb,
                metadata,
                user_id=user_id
            )

        # Return success
        return {

            "status": "uploaded",
            "filename": file.filename,
            "chunks": len(chunks),
            "file_url": file_url,
            "verification": verification_result,
            "notice": saved_notice
        }

    # Handle bad file format
    except UnicodeDecodeError:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid file format. "
                "Please upload a text, PDF, "
                "or image file."
            )
        )

    # Handle unknown errors
    except Exception as e:

        print(
            f"Upload Service Failed: {str(e)}"
        )

        raise e