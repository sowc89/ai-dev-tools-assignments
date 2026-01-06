from typing import List
import os
from dotenv import load_dotenv

load_dotenv()
from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from app.database import create_db_and_tables, get_session
from app.services.ai_agent import FlashcardAgent
from app.models import (
    Deck, DeckCreate, DeckRead, DeckUpdate,
    Card, CardCreate, CardRead, CardUpdate,
    GenerateResponse, RefineRequest
)

app = FastAPI(
    title="Flashcards AI API",
    version="1.0.0",
    description="Backend API for Flashcards App with AI capabilities"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Flashcards API is running"}

# --- Deck Endpoints ---

@app.post("/decks/", response_model=DeckRead)
def create_deck(deck: DeckCreate, session: Session = Depends(get_session)):
    db_deck = Deck.from_orm(deck)
    session.add(db_deck)
    session.commit()
    session.refresh(db_deck)
    return db_deck

@app.get("/decks/", response_model=List[DeckRead])
def read_decks(offset: int = 0, limit: int = Query(default=100, le=100), session: Session = Depends(get_session)):
    decks = session.exec(select(Deck).offset(offset).limit(limit)).all()
    return decks

@app.get("/decks/{deck_id}", response_model=DeckRead)
def read_deck(deck_id: int, session: Session = Depends(get_session)):
    deck = session.get(Deck, deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return deck

@app.put("/decks/{deck_id}", response_model=DeckRead)
def update_deck(deck_id: int, deck_update: DeckUpdate, session: Session = Depends(get_session)):
    db_deck = session.get(Deck, deck_id)
    if not db_deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    deck_data = deck_update.dict(exclude_unset=True)
    for key, value in deck_data.items():
        setattr(db_deck, key, value)
        
    session.add(db_deck)
    session.commit()
    session.refresh(db_deck)
    return db_deck

@app.delete("/decks/{deck_id}")
def delete_deck(deck_id: int, session: Session = Depends(get_session)):
    deck = session.get(Deck, deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    session.delete(deck)
    session.commit()
    return {"ok": True}

# --- Card Endpoints ---

@app.post("/cards/", response_model=CardRead)
def create_card(card: CardCreate, session: Session = Depends(get_session)):
    # Verify deck exists
    deck = session.get(Deck, card.deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    db_card = Card.from_orm(card)
    session.add(db_card)
    session.commit()
    session.refresh(db_card)
    return db_card

@app.get("/decks/{deck_id}/cards", response_model=List[CardRead])
def read_cards_by_deck(deck_id: int, session: Session = Depends(get_session)):
    # Verify deck exists (optional, but good for 404)
    deck = session.get(Deck, deck_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
        
    statement = select(Card).where(Card.deck_id == deck_id)
    cards = session.exec(statement).all()
    return cards

@app.put("/cards/{card_id}", response_model=CardRead)
def update_card(card_id: int, card_update: CardUpdate, session: Session = Depends(get_session)):
    db_card = session.get(Card, card_id)
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
        
    card_data = card_update.dict(exclude_unset=True)
    for key, value in card_data.items():
        setattr(db_card, key, value)
        
    session.add(db_card)
    session.commit()
    session.refresh(db_card)
    return db_card

@app.delete("/cards/{card_id}")
def delete_card(card_id: int, session: Session = Depends(get_session)):
    card = session.get(Card, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    session.delete(card)
    session.commit()
    return {"ok": True}


# --- AI Generation Endpoint ---

@app.post("/generate", response_model=GenerateResponse)
async def generate_cards(
    file: UploadFile = File(...),
    start_page: int = Form(1),
    end_page: int = Form(-1)
):
    print(f"DEBUG: Received file: {file.filename}, Pages: {start_page}-{end_page}")
    if not file.filename.lower().endswith('.pdf'):
        print("DEBUG: Filename check failed")
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Read PDF content
    content = await file.read()
    
    try:
        # Initialize agent
        agent = FlashcardAgent()
        
        # Generate cards
        valid_cards, source_text = await agent.generate_from_pdf(content, start_page=start_page, end_page=end_page)
        return GenerateResponse(cards=valid_cards, source_text=source_text)
        
    except ValueError as ve:
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

@app.post("/generate/refine", response_model=List[CardCreate])
async def refine_cards(request: RefineRequest):
    try:
        agent = FlashcardAgent()
        new_cards = await agent.refine_flashcards(request.cards, request.source_text, request.feedback)
        return new_cards
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refinement failed: {str(e)}")
