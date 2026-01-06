import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

def test_user_data_isolation(client: TestClient, session: Session):
    # 1. Register and Login User A
    client.post("/register", json={"username": "user_a", "password": "password", "email": "a@example.com"})
    res_a = client.post("/token", data={"username": "user_a", "password": "password"})
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register and Login User B
    client.post("/register", json={"username": "user_b", "password": "password", "email": "b@example.com"})
    res_b = client.post("/token", data={"username": "user_b", "password": "password"})
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. User A creates a deck
    res_deck = client.post("/decks/", json={"name": "A's Private Deck"}, headers=headers_a)
    deck_id = res_deck.json()["id"]

    # 4. User B tries to read User A's deck directly
    res_read = client.get(f"/decks/{deck_id}", headers=headers_b)
    assert res_read.status_code == 404  # Should be 404 (Not Found or No Access)

    # 5. User B tries to list decks
    res_list = client.get("/decks/", headers=headers_b)
    decks = res_list.json()
    # User B should see 0 decks (or only their own if they had any)
    assert len(decks) == 0

    # 6. User B tries to update User A's deck
    res_update = client.put(f"/decks/{deck_id}", json={"name": "Hacked"}, headers=headers_b)
    assert res_update.status_code == 404

    # 7. User B tries to delete User A's deck
    res_delete = client.delete(f"/decks/{deck_id}", headers=headers_b)
    assert res_delete.status_code == 404

def test_unauthorized_access(client: TestClient):
    # Try accessing protected routes without token
    assert client.get("/decks/").status_code == 401
    assert client.post("/decks/", json={"name": "Ghost"}).status_code == 401
    assert client.get("/users/me").status_code == 401

def test_card_isolation(client: TestClient):
    # Create User A + Deck A + Card A
    client.post("/register", json={"username": "alice", "password": "password"})
    token_a = client.post("/token", data={"username": "alice", "password": "password"}).json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}
    
    deck_id = client.post("/decks/", json={"name": "Alice Deck"}, headers=headers_a).json()["id"]
    card_id = client.post("/cards/", json={"front": "Q", "back": "A", "deck_id": deck_id}, headers=headers_a).json()["id"]

    # Create User B
    client.post("/register", json={"username": "bob", "password": "password"})
    token_b = client.post("/token", data={"username": "bob", "password": "password"}).json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Bob tries to delete Alice's card
    assert client.delete(f"/cards/{card_id}", headers=headers_b).status_code == 404
    
    # Bob tries to update Alice's card
    assert client.put(f"/cards/{card_id}", json={"front": "Bob was here"}, headers=headers_b).status_code == 404
