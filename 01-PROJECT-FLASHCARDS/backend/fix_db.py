import sqlite3
import os

db_path = 'database.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found.")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check current values
    cursor.execute("SELECT DISTINCT status FROM card")
    statuses = cursor.fetchall()
    print(f"Current statuses in DB: {statuses}")
    
    # Update Revise -> Reviewing
    cursor.execute("UPDATE card SET status = 'Reviewing' WHERE status = 'Revise'")
    revised_count = cursor.rowcount
    
    # Update All Done -> Mastered
    cursor.execute("UPDATE card SET status = 'Mastered' WHERE status = 'All Done'")
    all_done_count = cursor.rowcount
    
    conn.commit()
    print(f"Migration successful!")
    print(f"Updated 'Revise' -> 'Reviewing': {revised_count} rows")
    print(f"Updated 'All Done' -> 'Mastered': {all_done_count} rows")
    
except Exception as e:
    print(f"Error during migration: {e}")
finally:
    if conn:
        conn.close()
