from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from src.api.auth import get_current_user
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user = Depends(get_current_user)):
    from src.services.upload_service import process_deployment
    try:
        content = await file.read()
        return await process_deployment(file, content, user_id=current_user.id)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/uploads")
def get_uploads(current_user = Depends(get_current_user)):
    from src.db.vector_store import get_all_uploads
    return {"uploads": get_all_uploads(user_id=current_user.id)}

@router.delete("/upload/{filename}")
def delete_upload(filename: str, current_user = Depends(get_current_user)):
    from src.db.vector_store import delete_document
    
    # 1. Delete from DB (with user ownership check)
    success = delete_document(filename, user_id=current_user.id)
    if not success:
         raise HTTPException(status_code=404, detail="File not found")

    return {"status": "deleted", "filename": filename}
