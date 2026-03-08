import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.post import Post, PostFile
from app.models.user import User
from app.schemas.post import PostFileResponse
from app.services import storage

router = APIRouter(prefix="/posts/{post_id}/files", tags=["files"])

ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf",
    "application/zip",
    "text/plain",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("", response_model=PostFileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    post_id: uuid.UUID,
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="File type not allowed")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    file_url = storage.upload_file(file_bytes, file.filename, file.content_type)

    post_file = PostFile(
        post_id=post_id,
        file_url=file_url,
        file_name=file.filename,
        file_size=len(file_bytes),
    )
    db.add(post_file)
    await db.commit()
    await db.refresh(post_file)
    return post_file


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    post_id: uuid.UUID,
    file_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(PostFile).where(PostFile.id == file_id, PostFile.post_id == post_id)
    )
    post_file = result.scalar_one_or_none()
    if not post_file:
        raise HTTPException(status_code=404, detail="File not found")

    # 게시글 작성자만 삭제 가능
    post_result = await db.execute(select(Post).where(Post.id == post_id))
    post = post_result.scalar_one()
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    storage.delete_file(post_file.file_url)
    await db.delete(post_file)
    await db.commit()
