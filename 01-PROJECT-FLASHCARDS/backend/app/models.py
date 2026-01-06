from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime

# Deck Model
class DeckBase(SQLModel):
    name: str = Field(index=True)
    description: Optional[str] = None

class Deck(DeckBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = Field(default="")
    
    # Relationship to Cards
    cards: List["Card"] = Relationship(back_populates="deck")

class DeckCreate(DeckBase):
    pass

class DeckRead(DeckBase):
    id: int
    created_at: datetime
    notes: Optional[str] = None

class DeckUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None

# Card Model
class CardBase(SQLModel):
    front: str
    back: str
    deck_id: Optional[int] = Field(default=None, foreign_key="deck.id")

class Card(CardBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship to Deck
    deck: Optional[Deck] = Relationship(back_populates="cards")

class CardCreate(CardBase):
    pass

class CardRead(CardBase):
    id: int
    created_at: datetime

class CardUpdate(SQLModel):
    front: Optional[str] = None
    back: Optional[str] = None

# AI Models
class GenerateResponse(SQLModel):
    cards: List[CardCreate]
    source_text: str

class RefineRequest(SQLModel):
    cards: List[CardCreate]
    source_text: str
    feedback: str
