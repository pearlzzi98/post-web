import pytest
from httpx import AsyncClient


@pytest.fixture
async def post_id(client: AsyncClient, auth_headers: dict) -> str:
    resp = await client.post(
        "/posts",
        json={"title": "댓글용 게시글", "content": "내용"},
        headers=auth_headers,
    )
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_create_comment(client: AsyncClient, auth_headers: dict, post_id: str):
    resp = await client.post(
        f"/posts/{post_id}/comments",
        json={"content": "첫 번째 댓글"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["content"] == "첫 번째 댓글"


@pytest.mark.asyncio
async def test_list_comments(client: AsyncClient, auth_headers: dict, post_id: str):
    await client.post(
        f"/posts/{post_id}/comments",
        json={"content": "댓글"},
        headers=auth_headers,
    )
    resp = await client.get(f"/posts/{post_id}/comments")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_update_comment(client: AsyncClient, auth_headers: dict, post_id: str):
    create_resp = await client.post(
        f"/posts/{post_id}/comments",
        json={"content": "수정 전"},
        headers=auth_headers,
    )
    comment_id = create_resp.json()["id"]

    resp = await client.patch(
        f"/posts/{post_id}/comments/{comment_id}",
        json={"content": "수정 후"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["content"] == "수정 후"


@pytest.mark.asyncio
async def test_delete_comment(client: AsyncClient, auth_headers: dict, post_id: str):
    create_resp = await client.post(
        f"/posts/{post_id}/comments",
        json={"content": "삭제할 댓글"},
        headers=auth_headers,
    )
    comment_id = create_resp.json()["id"]

    resp = await client.delete(
        f"/posts/{post_id}/comments/{comment_id}",
        headers=auth_headers,
    )
    assert resp.status_code == 204
