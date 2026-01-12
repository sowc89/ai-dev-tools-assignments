import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from app.main import app, get_session
from app.models import Deck, Card
import os
from unittest.mock import patch, MagicMock

# Setup in-memory SQLite for testing
sqlite_file_name = "test_integration.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def test_full_user_flow(client: TestClient, auth_headers: dict):
    # 1. Create a Deck with tags
    deck_data = {"name": "Integration Test Deck", "description": "Testing full flow", "tags": ["integration", "test"]}
    response = client.post("/decks/", json=deck_data, headers=auth_headers)
    assert response.status_code == 200
    deck = response.json()
    deck_id = deck["id"]
    assert deck["name"] == deck_data["name"]
    # Tags are returned as a list of tag objects
    assert len(deck["tags"]) == 2
    tag_names = {tag["name"] for tag in deck["tags"]}
    assert tag_names == {"integration", "test"}

    # 2. Add Cards Manually with status
    card_data = {"front": "What is 2+2?", "back": "4", "status": "NEW", "deck_id": deck_id}
    response = client.post("/cards/", json=card_data, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "NEW"
    
    # 3. Add Study Notes and Update Tags
    notes_update = {"notes": "Remember to study math.", "tags": ["math", "updated"]}
    response = client.put(f"/decks/{deck_id}", json=notes_update, headers=auth_headers)
    assert response.status_code == 200
    updated_deck = response.json()
    assert updated_deck["notes"] == "Remember to study math."
    # Tags are returned as a list of tag objects
    assert len(updated_deck["tags"]) == 2
    tag_names = {tag["name"] for tag in updated_deck["tags"]}
    assert tag_names == {"math", "updated"}

    # 4. Verify Deck Content
    response = client.get(f"/decks/{deck_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["notes"] == "Remember to study math."

    # 5. Delete a Card
    # First get the card ID
    response = client.get(f"/decks/{deck_id}/cards", headers=auth_headers)
    cards = response.json()
    assert len(cards) == 1
    card_id = cards[0]["id"]

    response = client.delete(f"/cards/{card_id}", headers=auth_headers)
    assert response.status_code == 200

    # Verify card is gone
    response = client.get(f"/decks/{deck_id}/cards", headers=auth_headers)
    assert response.json() == []

@patch("app.main.FlashcardAgent")
def test_ai_generation_flow(mock_agent_class, client: TestClient, auth_headers: dict):
    # Mocking Agent Response
    mock_agent_instance = MagicMock()
    # Define what the async method should return
    from unittest.mock import AsyncMock
    mock_agent_instance.generate_from_pdf = AsyncMock(return_value=(
        [{"front": "AI Question", "back": "AI Answer"}],
        "Source Text"
    ))
    mock_agent_class.return_value = mock_agent_instance

    # 1. Simulate file upload
    files = {'file': ('test.pdf', b'%PDF-1.4 dummy content', 'application/pdf')}
    
    # 2. Call Generate Endpoint
    with patch.dict(os.environ, {"GOOGLE_API_KEY": "dummy_key"}):
        response = client.post("/generate", files=files, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        generated_cards = data["cards"]
        assert len(generated_cards) == 1
        assert generated_cards[0]["front"] == "AI Question"
        assert generated_cards[0]["back"] == "AI Answer"
        assert data["source_text"] == "Source Text"

@patch("app.main.FlashcardAgent")
def test_refine_flow(mock_agent_class, client: TestClient, auth_headers: dict):
    # Mocking Agent Response
    mock_agent_instance = MagicMock()
    from unittest.mock import AsyncMock
    mock_agent_instance.refine_flashcards = AsyncMock(return_value=[
        {"front": "Refined Question", "back": "Refined Answer"}
    ])
    mock_agent_class.return_value = mock_agent_instance

    # 1. Simulate refinement request
    refine_data = {
        "cards": [{"front": "Old Q", "back": "Old A"}],
        "source_text": "Some text",
        "feedback": "Make it better"
    }
    
    response = client.post("/generate/refine", json=refine_data, headers=auth_headers)
    
    assert response.status_code == 200
    refined_cards = response.json()
    assert len(refined_cards) == 1
    assert refined_cards[0]["front"] == "Refined Question"
    assert refined_cards[0]["back"] == "Refined Answer"
