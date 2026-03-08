import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import ProfileUpdate, UserResponse
from app.services import storage

router = APIRouter(prefix="/users", tags=["profile"])

AVATAR_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5MB


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """현재 로그인한 사용자의 프로필을 반환합니다."""
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_profile(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    body: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.username is not None:
        result = await db.execute(
            select(User).where(User.username == body.username, User.id != current_user.id)
        )
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = body.username

    if body.bio is not None:
        current_user.bio = body.bio

    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in AVATAR_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Image file only (jpeg, png, webp, gif)")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_AVATAR_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    # 기존 아바타 삭제
    if current_user.avatar_url:
        storage.delete_file(current_user.avatar_url)

    avatar_url = storage.upload_file(file_bytes, file.filename, file.content_type)
    current_user.avatar_url = avatar_url

    await db.commit()
    await db.refresh(current_user)
    return current_user
