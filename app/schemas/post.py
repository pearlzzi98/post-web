import uuid
from datetime import datetime

from pydantic import BaseModel


class PostFileResponse(BaseModel):
    id: uuid.UUID
    file_url: str
    file_name: str
    file_size: int | None

    model_config = {"from_attributes": True}


class PostCreate(BaseModel):
    title: str
    content: str


class PostUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


class PostResponse(BaseModel):
    id: uuid.UUID
    title: str
    content: str
    author_id: uuid.UUID
    view_count: int
    created_at: datetime
    updated_at: datetime
    files: list[PostFileResponse] = []

    model_config = {"from_attributes": True}


class PostListResponse(BaseModel):
    id: uuid.UUID
    title: str
    author_id: uuid.UUID
    view_count: int
    created_at: datetime

    model_config = {"from_attributes": True}
