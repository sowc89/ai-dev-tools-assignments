from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime
from enum import Enum

class CardStatus(str, Enum):
    NEW = "NEW"
    REVIEWING = "REVIEWING"
    MASTERED = "MASTERED"

# Association table for Deck and Tag (Many-to-Many)
class DeckTagLink(SQLModel, table=True):
    deck_id: Optional[int] = Field(default=None, foreign_key="deck.id", primary_key=True)
    tag_id: Optional[int] = Field(default=None, foreign_key="tag.id", primary_key=True)

# Tag Model
class TagBase(SQLModel):
    name: str = Field(unique=True, index=True)

class Tag(TagBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Relationship to Decks
    decks: List["Deck"] = Relationship(back_populates="tags", link_model=DeckTagLink)

class TagCreate(TagBase):
    pass

class TagRead(TagBase):
    id: int

# User Model
class UserBase(SQLModel):
    username: str = Field(unique=True, index=True)
    email: Optional[str] = None

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship to Decks
    decks: List["Deck"] = Relationship(back_populates="user")

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int

class Token(SQLModel):
    access_token: str
    token_type: str

class TokenData(SQLModel):
    username: Optional[str] = None

# Deck Model
class DeckBase(SQLModel):
    name: str = Field(index=True)
    description: Optional[str] = None

class Deck(DeckBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = Field(default="")
    
    # Relationship to User
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="decks")
    
    # Relationship to Cards
    cards: List["Card"] = Relationship(back_populates="deck", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    
    # Relationship to Tags
    tags: List[Tag] = Relationship(back_populates="decks", link_model=DeckTagLink)

class DeckCreate(DeckBase):
    tags: Optional[List[str]] = None

class DeckRead(DeckBase):
    id: int
    created_at: datetime
    notes: Optional[str] = None
    tags: List[TagRead] = []

class DeckUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None

# Card Model
class CardBase(SQLModel):
    front: str
    back: str
    status: CardStatus = Field(default=CardStatus.NEW)
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
    status: Optional[CardStatus] = None

# AI Models
class GenerateResponse(SQLModel):
    cards: List[CardCreate]
    source_text: str

class RefineRequest(SQLModel):
    cards: List[CardCreate]
    source_text: str
    feedback: str
