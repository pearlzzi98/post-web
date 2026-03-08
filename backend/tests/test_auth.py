import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    resp = await client.post(
        "/auth/register",
        json={"email": "new@example.com", "username": "newuser", "password": "pass1234"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "new@example.com"
    assert data["username"] == "newuser"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    payload = {"email": "dup@example.com", "username": "dup1", "password": "pass"}
    await client.post("/auth/register", json=payload)
    payload["username"] = "dup2"
    resp = await client.post("/auth/register", json=payload)
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    await client.post(
        "/auth/register",
        json={"email": "login@example.com", "username": "loginuser", "password": "pass1234"},
    )
    resp = await client.post(
        "/auth/login",
        json={"email": "login@example.com", "password": "pass1234"},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()
    assert "refresh_token" in resp.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    resp = await client.post(
        "/auth/login",
        json={"email": "login@example.com", "password": "wrong"},
    )
    assert resp.status_code == 401
