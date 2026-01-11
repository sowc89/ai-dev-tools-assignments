from sqlmodel import Session, create_engine, select
from app.models import Card, CardStatus
from app.database import sqlite_url

engine = create_engine(sqlite_url)

def migrate_statuses():
    with Session(engine) as session:
        # We need to use a raw query or bypass the Enum validation for the search
        # since SQLModel/SQLAlchemy will try to validate 'Revise' against the Enum if we use the object model normally.
        # However, selecting all and checking raw values should work.
        
        cards = session.exec(select(Card)).all()
        count = 0
        for card in cards:
            # Check the raw value in the database
            raw_status = card.status
            
            if raw_status == 'Revise':
                card.status = CardStatus.REVIEWING
                count += 1
            elif raw_status == 'All Done':
                card.status = CardStatus.MASTERED
                count += 1
            elif raw_status == 'New':
                card.status = CardStatus.NEW
                count += 1
            # If it's already an Enum or something else, we can decide what to do.
            # Usually, 'New' mapping to CardStatus.NEW is safe.
        
        session.commit()
        print(f"Migrated {count} cards to new status Enums.")

if __name__ == "__main__":
    migrate_statuses()
