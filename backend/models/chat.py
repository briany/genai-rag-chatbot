from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class Source(BaseModel):
    document_name: str
    chunk_text: str
    score: float

class ChatResponse(BaseModel):
    response: str
    sources: List[Source]
    conversation_id: Optional[str] = None

class DocumentChunk(BaseModel):
    id: str
    document_id: str
    content: str
    metadata: dict
