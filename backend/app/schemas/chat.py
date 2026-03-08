import uuid
from datetime import datetime

from pydantic import BaseModel


class ChatMessageResponse(BaseModel):
    id: uuid.UUID
    sender_id: uuid.UUID
    receiver_id: uuid.UUID
    content: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatHistoryRequest(BaseModel):
    other_user_id: uuid.UUID
    limit: int = 50
    offset: int = 0
