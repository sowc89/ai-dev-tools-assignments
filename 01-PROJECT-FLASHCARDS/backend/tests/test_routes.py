from fastapi.testclient import TestClient

def test_create_deck(client: TestClient, auth_headers: dict):
    response = client.post("/decks/", json={"name": "Test Deck", "description": "Unit Test", "tags": ["tag1", "tag2"]}, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Deck"
    # tags come back as list of TagRead (id, name)
    assert len(data["tags"]) == 2
    assert data["tags"][0]["name"] in ["tag1", "tag2"]
    assert "id" in data

def test_read_decks(client: TestClient, auth_headers: dict):
    # Create a deck first (assuming clean DB per session or test)
    client.post("/decks/", json={"name": "Deck 1"}, headers=auth_headers)
    client.post("/decks/", json={"name": "Deck 2"}, headers=auth_headers)
    
    response = client.get("/decks/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2

def test_create_card(client: TestClient, auth_headers: dict):
    # Get a deck id
    deck_res = client.post("/decks/", json={"name": "Card Deck"}, headers=auth_headers)
    deck_id = deck_res.json()["id"]
    
    response = client.post("/cards/", json={
        "front": "Question",
        "back": "Answer",
        "status": "REVIEWING",
        "deck_id": deck_id
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["front"] == "Question"
    assert data["status"] == "REVIEWING"
    assert data["deck_id"] == deck_id

def test_read_cards_by_deck(client: TestClient, auth_headers: dict):
    deck_res = client.post("/decks/", json={"name": "Empty Deck"}, headers=auth_headers)
    deck_id = deck_res.json()["id"]
    
    response = client.get(f"/decks/{deck_id}/cards", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []
