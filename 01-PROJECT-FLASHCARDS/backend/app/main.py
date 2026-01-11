from typing import List
from datetime import timedelta
import os
from dotenv import load_dotenv

load_dotenv()
from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from jose import JWTError, jwt
from app.database import create_db_and_tables, get_session
from app.services.ai_agent import FlashcardAgent
from app.auth import verify_password, get_password_hash, create_access_token, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.models import (
    Deck, DeckCreate, DeckRead, DeckUpdate,
    Card, CardCreate, CardRead, CardUpdate, CardStatus,
    Tag, TagRead, TagCreate, DeckTagLink,
    GenerateResponse, RefineRequest,
    User, UserCreate, UserRead, Token, TokenData
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(session: Session = Depends(get_session), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = session.exec(select(User).where(User.username == token_data.username)).first()
    if user is None:
        raise credentials_exception
    return user

app = FastAPI(
    title="Flashcards AI API",
    version="1.0.0",
    description="Backend API for Flashcards App with AI capabilities"
)

# Configure CORS
# Read allowed origins from environment variable (comma-separated)
# If not provided, default to wildcard for development (requires allow_credentials=False for browser compatibility)
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
    allow_credentials = True
else:
    origins = ["*"]
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Flashcards API is running"}

# --- Auth Endpoints ---

@app.post("/register", response_model=UserRead)
def register(user: UserCreate, session: Session = Depends(get_session)):
    db_user = session.exec(select(User).where(User.username == user.username)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_password)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# --- Deck Endpoints ---

def get_or_create_tags(session: Session, tag_names: List[str]) -> List[Tag]:
    tags = []
    for name in tag_names:
        name = name.strip().lower()
        if not name: continue
        tag = session.exec(select(Tag).where(Tag.name == name)).first()
        if not tag:
            tag = Tag(name=name)
            session.add(tag)
        tags.append(tag)
    return tags

@app.post("/decks/", response_model=DeckRead)
def create_deck(deck: DeckCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    deck_data = deck.dict(exclude={"tags"})
    db_deck = Deck(**deck_data)
    db_deck.user_id = current_user.id
    
    if deck.tags:
        db_deck.tags = get_or_create_tags(session, deck.tags)
    
    session.add(db_deck)
    session.commit()
    session.refresh(db_deck)
    return db_deck

@app.get("/decks/", response_model=List[DeckRead])
def read_decks(offset: int = 0, limit: int = Query(default=100, le=100), session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    decks = session.exec(select(Deck).where(Deck.user_id == current_user.id).offset(offset).limit(limit)).all()
    return decks

@app.get("/decks/{deck_id}", response_model=DeckRead)
def read_deck(deck_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    deck = session.exec(select(Deck).where(Deck.id == deck_id, Deck.user_id == current_user.id)).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found or no access")
    return deck

@app.put("/decks/{deck_id}", response_model=DeckRead)
def update_deck(deck_id: int, deck_update: DeckUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    db_deck = session.exec(select(Deck).where(Deck.id == deck_id, Deck.user_id == current_user.id)).first()
    if not db_deck:
        raise HTTPException(status_code=404, detail="Deck not found or no access")
    
    deck_data = deck_update.dict(exclude_unset=True)
    
    # Handle tags separately
    if "tags" in deck_data:
        tag_names = deck_data.pop("tags")
        if tag_names is not None:
             db_deck.tags = get_or_create_tags(session, tag_names)

    for key, value in deck_data.items():
        setattr(db_deck, key, value)
        
    session.add(db_deck)
    session.commit()
    session.refresh(db_deck)
    return db_deck

@app.delete("/decks/{deck_id}")
def delete_deck(deck_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    deck = session.exec(select(Deck).where(Deck.id == deck_id, Deck.user_id == current_user.id)).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found or no access")
    session.delete(deck)
    session.commit()
    return {"ok": True}

# --- Card Endpoints ---

@app.post("/cards/", response_model=CardRead)
def create_card(card: CardCreate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Verify deck exists and belongs to current user
    deck = session.exec(select(Deck).where(Deck.id == card.deck_id, Deck.user_id == current_user.id)).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found or no access")
    
    db_card = Card.from_orm(card)
    session.add(db_card)
    session.commit()
    session.refresh(db_card)
    return db_card

@app.get("/decks/{deck_id}/cards", response_model=List[CardRead])
def read_cards_by_deck(deck_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Verify deck exists and belongs to user
    deck = session.exec(select(Deck).where(Deck.id == deck_id, Deck.user_id == current_user.id)).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found or no access")
        
    statement = select(Card).where(Card.deck_id == deck_id)
    cards = session.exec(statement).all()
    return cards

@app.put("/cards/{card_id}", response_model=CardRead)
def update_card(card_id: int, card_update: CardUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Find card and verify it belongs to a deck owned by the user
    db_card = session.exec(
        select(Card).join(Deck).where(Card.id == card_id, Deck.user_id == current_user.id)
    ).first()
    
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found or no access")
        
    card_data = card_update.dict(exclude_unset=True)
    for key, value in card_data.items():
        setattr(db_card, key, value)
        
    session.add(db_card)
    session.commit()
    session.refresh(db_card)
    return db_card

@app.delete("/cards/{card_id}")
def delete_card(card_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    # Find card and verify it belongs to a deck owned by the user
    db_card = session.exec(
        select(Card).join(Deck).where(Card.id == card_id, Deck.user_id == current_user.id)
    ).first()
    
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found or no access")
    session.delete(db_card)
    session.commit()
    return {"ok": True}


# --- AI Generation Endpoint ---

@app.post("/generate", response_model=GenerateResponse)
async def generate_cards(
    file: UploadFile = File(...),
    start_page: int = Form(1),
    end_page: int = Form(-1),
    current_user: User = Depends(get_current_user)
):
    print(f"DEBUG: Received file: {file.filename}, Pages: {start_page}-{end_page}")
    if not file.filename.lower().endswith('.pdf'):
        print("DEBUG: Filename check failed")
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Memory-efficient reading: UploadFile uses a SpooledTemporaryFile.
    # We can read in chunks if we were processing it locally, but since we
    # passed it to the AI agent which expects bytes, we still need to load it.
    # To improve this, we could pass a file path to the agent if stored locally.
    # For now, we'll keep it as bytes but acknowledge the limitation.
    content = await file.read()
    await file.close() # Ensure file is closed after reading
    
    try:
        # Initialize agent
        agent = FlashcardAgent()
        
        # Generate cards
        valid_cards, source_text = await agent.generate_from_pdf(content, start_page=start_page, end_page=end_page)
        return GenerateResponse(cards=valid_cards, source_text=source_text)
        
    except ValueError as ve:
        raise HTTPException(status_code=500, detail="AI configuration error")
    except Exception as e:
        print(f"DEBUG: AI generation failed: {str(e)}") # Log internally
        raise HTTPException(status_code=500, detail="Flashcard generation failed. Please try again later.")

@app.post("/generate/refine", response_model=List[CardCreate])
async def refine_cards(request: RefineRequest, current_user: User = Depends(get_current_user)):
    try:
        agent = FlashcardAgent()
        new_cards = await agent.refine_flashcards(request.cards, request.source_text, request.feedback)
        return new_cards
    except Exception as e:
        print(f"DEBUG: Refinement failed: {str(e)}") # Log internally
        raise HTTPException(status_code=500, detail="Flashcard refinement failed. Please try again later.")
