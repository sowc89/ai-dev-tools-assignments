from fastapi.testclient import TestClient

def test_create_deck(client: TestClient):
    response = client.post("/decks/", json={"name": "Test Deck", "description": "Unit Test"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Deck"
    assert "id" in data

def test_read_decks(client: TestClient):
    # Create a deck first (assuming clean DB per session or test)
    client.post("/decks/", json={"name": "Deck 1"})
    client.post("/decks/", json={"name": "Deck 2"})
    
    response = client.get("/decks/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2

def test_create_card(client: TestClient):
    # Get a deck id
    deck_res = client.post("/decks/", json={"name": "Card Deck"})
    deck_id = deck_res.json()["id"]
    
    response = client.post("/cards/", json={
        "front": "Question",
        "back": "Answer",
        "deck_id": deck_id
    })
    assert response.status_code == 200
    data = response.json()
    assert data["front"] == "Question"
    assert data["deck_id"] == deck_id

def test_read_cards_by_deck(client: TestClient):
    deck_res = client.post("/decks/", json={"name": "Empty Deck"})
    deck_id = deck_res.json()["id"]
    
    response = client.get(f"/decks/{deck_id}/cards")
    assert response.status_code == 200
    assert response.json() == []
