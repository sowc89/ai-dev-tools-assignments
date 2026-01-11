import sqlite3
import os

db_path = 'database.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found.")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Update to uppercase
    cursor.execute("UPDATE card SET status = 'NEW' WHERE status = 'New' OR status = 'new'")
    new_count = cursor.rowcount
    
    cursor.execute("UPDATE card SET status = 'REVIEWING' WHERE status = 'Reviewing' OR status = 'reviewing'")
    rev_count = cursor.rowcount
    
    cursor.execute("UPDATE card SET status = 'MASTERED' WHERE status = 'Mastered' OR status = 'mastered'")
    mas_count = cursor.rowcount
    
    conn.commit()
    print(f"Migration successful!")
    print(f"Updated to NEW: {new_count}")
    print(f"Updated to REVIEWING: {rev_count}")
    print(f"Updated to MASTERED: {mas_count}")
    
except Exception as e:
    print(f"Error during migration: {e}")
finally:
    if conn:
        conn.close()
