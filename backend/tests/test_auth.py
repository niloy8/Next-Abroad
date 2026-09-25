import pytest


@pytest.mark.asyncio
async def test_register_and_login(client):
    # 1. Register new student
    register_payload = {
        "email": "newstudent@example.com",
        "password": "Password123!",
        "full_name": "New Student",
    }
    res = await client.post("/api/auth/register", json=register_payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newstudent@example.com"

    # 2. Login with credentials
    login_payload = {
        "email": "newstudent@example.com",
        "password": "Password123!",
    }
    res_login = await client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    login_data = res_login.json()
    assert "access_token" in login_data

    # 3. Test me endpoint with token
    token = login_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    res_me = await client.get("/api/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "newstudent@example.com"


@pytest.mark.asyncio
async def test_duplicate_registration_fails(client):
    payload = {
        "email": "duplicate@example.com",
        "password": "Password123!",
        "full_name": "User One",
    }
    res1 = await client.post("/api/auth/register", json=payload)
    assert res1.status_code == 200

    res2 = await client.post("/api/auth/register", json=payload)
    assert res2.status_code == 400
