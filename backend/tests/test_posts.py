import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_post(client: AsyncClient, auth_headers: dict):
    resp = await client.post(
        "/posts",
        json={"title": "테스트 제목", "content": "테스트 내용"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "테스트 제목"
    assert data["view_count"] == 0


@pytest.mark.asyncio
async def test_create_post_unauthorized(client: AsyncClient):
    resp = await client.post("/posts", json={"title": "t", "content": "c"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_list_posts(client: AsyncClient, auth_headers: dict):
    await client.post(
        "/posts",
        json={"title": "목록 테스트", "content": "내용"},
        headers=auth_headers,
    )
    resp = await client.get("/posts")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_get_post_increments_view(client: AsyncClient, auth_headers: dict):
    create_resp = await client.post(
        "/posts",
        json={"title": "조회수 테스트", "content": "내용"},
        headers=auth_headers,
    )
    post_id = create_resp.json()["id"]

    resp1 = await client.get(f"/posts/{post_id}")
    resp2 = await client.get(f"/posts/{post_id}")
    assert resp2.json()["view_count"] > resp1.json()["view_count"]


@pytest.mark.asyncio
async def test_update_post(client: AsyncClient, auth_headers: dict):
    create_resp = await client.post(
        "/posts",
        json={"title": "수정 전", "content": "내용"},
        headers=auth_headers,
    )
    post_id = create_resp.json()["id"]

    resp = await client.patch(
        f"/posts/{post_id}",
        json={"title": "수정 후"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "수정 후"


@pytest.mark.asyncio
async def test_delete_post(client: AsyncClient, auth_headers: dict):
    create_resp = await client.post(
        "/posts",
        json={"title": "삭제 테스트", "content": "내용"},
        headers=auth_headers,
    )
    post_id = create_resp.json()["id"]

    resp = await client.delete(f"/posts/{post_id}", headers=auth_headers)
    assert resp.status_code == 204

    get_resp = await client.get(f"/posts/{post_id}")
    assert get_resp.status_code == 404
