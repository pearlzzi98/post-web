import uuid
from collections import defaultdict

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal, get_db
from app.dependencies import get_current_user
from app.models.chat import ChatMessage
from app.models.user import User
from app.schemas.chat import ChatMessageResponse
from app.services.auth import decode_token

router = APIRouter(tags=["chat"])

# 메모리 내 연결 관리: {user_id: WebSocket}
_connections: dict[str, WebSocket] = {}


@router.get("/chat/history", response_model=list[ChatMessageResponse])
async def get_chat_history(
    other_user_id: uuid.UUID = Query(...),
    offset: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """두 유저 간의 채팅 이력을 조회합니다."""
    result = await db.execute(
        select(ChatMessage)
        .where(
            or_(
                (ChatMessage.sender_id == current_user.id)
                & (ChatMessage.receiver_id == other_user_id),
                (ChatMessage.sender_id == other_user_id)
                & (ChatMessage.receiver_id == current_user.id),
            )
        )
        .order_by(ChatMessage.created_at.asc())
        .offset(offset)
        .limit(limit)
    )
    return result.scalars().all()


@router.websocket("/ws/chat")
async def websocket_chat(
    websocket: WebSocket,
    token: str = Query(...),
):
    """
    WebSocket 채팅 엔드포인트.

    연결: ws://host/ws/chat?token=<access_token>
    메시지 송신 형식: {"receiver_id": "<uuid>", "content": "<text>"}
    메시지 수신 형식: {"sender_id": "<uuid>", "content": "<text>", "created_at": "<iso>"}
    """
    # 토큰 검증
    try:
        user_id = decode_token(token, token_type="access")
    except ValueError:
        await websocket.close(code=4001)
        return

    await websocket.accept()
    _connections[user_id] = websocket

    try:
        while True:
            data = await websocket.receive_json()
            receiver_id = data.get("receiver_id")
            content = data.get("content", "").strip()

            if not receiver_id or not content:
                await websocket.send_json({"error": "receiver_id and content required"})
                continue

            # DB에 저장
            async with AsyncSessionLocal() as db:
                msg = ChatMessage(
                    sender_id=uuid.UUID(user_id),
                    receiver_id=uuid.UUID(receiver_id),
                    content=content,
                )
                db.add(msg)
                await db.commit()
                await db.refresh(msg)

            payload = {
                "sender_id": user_id,
                "content": content,
                "created_at": msg.created_at.isoformat(),
            }

            # 수신자가 연결되어 있으면 실시간 전달
            if receiver_id in _connections:
                try:
                    await _connections[receiver_id].send_json(payload)
                except Exception:
                    del _connections[receiver_id]

            # 송신자에게도 echo
            await websocket.send_json(payload)

    except WebSocketDisconnect:
        _connections.pop(user_id, None)
