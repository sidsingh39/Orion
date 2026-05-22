from pydantic import BaseModel


class NoticeRequest(BaseModel):
    title: str
    raw_content: str
    category: str
    department: str
    program: str
    semester: str
    section: str
    uploader_role: str
    visibility_scope: str
    source_type: str