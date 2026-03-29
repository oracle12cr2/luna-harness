import sqlite3
import os
from datetime import datetime
from typing import List, Optional, Dict, Any

DATABASE_PATH = "bookmarks.db"

def get_db_connection():
    """Get database connection with row factory for dict-like access"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initialize the database with bookmarks table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            favicon_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create indexes for search performance
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_bookmarks_title ON bookmarks(title)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_bookmarks_url ON bookmarks(url)
    """)
    
    conn.commit()
    conn.close()

def create_bookmark(url: str, title: str, description: str = "", favicon_url: str = None) -> Dict[str, Any]:
    """Create a new bookmark"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO bookmarks (url, title, description, favicon_url, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (url, title, description, favicon_url, datetime.now(), datetime.now()))
        
        bookmark_id = cursor.lastrowid
        conn.commit()
        
        # Fetch and return the created bookmark
        bookmark = get_bookmark_by_id(bookmark_id)
        return bookmark
    except sqlite3.IntegrityError:
        raise ValueError(f"Bookmark with URL '{url}' already exists")
    finally:
        conn.close()

def get_all_bookmarks(search: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get all bookmarks with optional search filtering"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if search:
        cursor.execute("""
            SELECT * FROM bookmarks 
            WHERE title LIKE ? OR url LIKE ? OR description LIKE ?
            ORDER BY created_at DESC
        """, (f"%{search}%", f"%{search}%", f"%{search}%"))
    else:
        cursor.execute("""
            SELECT * FROM bookmarks 
            ORDER BY created_at DESC
        """)
    
    bookmarks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return bookmarks

def get_bookmark_by_id(bookmark_id: int) -> Optional[Dict[str, Any]]:
    """Get bookmark by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM bookmarks WHERE id = ?", (bookmark_id,))
    row = cursor.fetchone()
    
    conn.close()
    return dict(row) if row else None

def update_bookmark(bookmark_id: int, url: str = None, title: str = None, description: str = None) -> Optional[Dict[str, Any]]:
    """Update an existing bookmark"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Build dynamic update query
    updates = []
    params = []
    
    if url is not None:
        updates.append("url = ?")
        params.append(url)
    if title is not None:
        updates.append("title = ?")
        params.append(title)
    if description is not None:
        updates.append("description = ?")
        params.append(description)
    
    if not updates:
        conn.close()
        return get_bookmark_by_id(bookmark_id)
    
    updates.append("updated_at = ?")
    params.append(datetime.now())
    params.append(bookmark_id)
    
    try:
        cursor.execute(f"""
            UPDATE bookmarks 
            SET {', '.join(updates)}
            WHERE id = ?
        """, params)
        
        if cursor.rowcount == 0:
            conn.close()
            return None
        
        conn.commit()
        bookmark = get_bookmark_by_id(bookmark_id)
        return bookmark
    except sqlite3.IntegrityError:
        raise ValueError(f"Bookmark with URL '{url}' already exists")
    finally:
        conn.close()

def delete_bookmark(bookmark_id: int) -> bool:
    """Delete bookmark by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM bookmarks WHERE id = ?", (bookmark_id,))
    deleted = cursor.rowcount > 0
    
    conn.commit()
    conn.close()
    return deleted