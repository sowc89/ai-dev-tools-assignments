import sqlite3
import os

def migrate():
    db_path = "database.db"
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found. Skipping migration (initial setup will create it).")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # 1. Check for user_id in deck table
        cursor.execute("PRAGMA table_info(deck)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "user_id" not in columns:
            print("Adding user_id column to deck table...")
            # For SQLite, we can't easily add a foreign key to an existing table with ALTER TABLE
            # but we can add the column. The app logic handles the association.
            cursor.execute("ALTER TABLE deck ADD COLUMN user_id INTEGER REFERENCES user(id)")
            conn.commit()
            print("Successfully added user_id column.")
        else:
            print("user_id column already exists in deck table.")

        # 2. Check for status in card table
        cursor.execute("PRAGMA table_info(card)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "status" not in columns:
            print("Adding status column to card table...")
            cursor.execute("ALTER TABLE card ADD COLUMN status TEXT DEFAULT 'New'")
            conn.commit()
            print("Successfully added status column.")
        else:
            print("status column already exists in card table.")

        # 3. Check for tags in deck table
        cursor.execute("PRAGMA table_info(deck)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "tags" not in columns:
            print("Adding tags column to deck table...")
            cursor.execute("ALTER TABLE deck ADD COLUMN tags TEXT DEFAULT ''")
            conn.commit()
            print("Successfully added tags column.")
        else:
            print("tags column already exists in deck table.")

        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
