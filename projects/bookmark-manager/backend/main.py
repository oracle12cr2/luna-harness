from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
from bs4 import BeautifulSoup
import re
import os
from urllib.parse import urlparse, urljoin
from typing import List, Optional

from models import BookmarkCreate, BookmarkUpdate, BookmarkResponse, FetchTitleRequest, FetchTitleResponse
from database import init_database, create_bookmark, get_all_bookmarks, get_bookmark_by_id, update_bookmark, delete_bookmark

app = FastAPI(title="BookmarkVault API", version="1.0.0")

# Enable CORS for frontend - support both development ports
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_database()

def normalize_url(url: str) -> str:
    """Normalize URL by adding http:// if no scheme is present"""
    if not url or not url.strip():
        raise ValueError("URL cannot be empty")
    
    url = url.strip()
    if not url.startswith(('http://', 'https://')):
        url = 'http://' + url
    return url

def fetch_page_metadata(url: str) -> tuple[str, str]:
    """Fetch page title and favicon URL from a given URL"""
    try:
        normalized_url = normalize_url(url)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(normalized_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title
        title = ""
        if soup.title and soup.title.string:
            title = soup.title.string.strip()
        elif soup.find('meta', property='og:title'):
            title = soup.find('meta', property='og:title')['content'].strip()
        elif soup.find('meta', attrs={'name': 'title'}):
            title = soup.find('meta', attrs={'name': 'title'})['content'].strip()
        
        if not title:
            title = url  # Fallback to URL if no title found
        
        # Extract favicon
        favicon_url = None
        
        # Try various favicon selectors
        favicon_selectors = [
            'link[rel="icon"]',
            'link[rel="shortcut icon"]', 
            'link[rel="apple-touch-icon"]',
            'link[rel="apple-touch-icon-precomposed"]'
        ]
        
        for selector in favicon_selectors:
            favicon_link = soup.select_one(selector)
            if favicon_link and favicon_link.get('href'):
                favicon_url = urljoin(normalized_url, favicon_link['href'])
                break
        
        # Default favicon.ico if none found
        if not favicon_url:
            parsed_url = urlparse(normalized_url)
            favicon_url = f"{parsed_url.scheme}://{parsed_url.netloc}/favicon.ico"
        
        return title, favicon_url
        
    except Exception as e:
        # Return URL as title if fetching fails
        return url, None

@app.get("/")
def read_root():
    return {"message": "BookmarkVault API", "version": "1.0.0"}

@app.post("/fetch-title", response_model=FetchTitleResponse)
def fetch_title(request: FetchTitleRequest):
    """Fetch title and favicon for a URL"""
    try:
        title, favicon_url = fetch_page_metadata(request.url)
        return FetchTitleResponse(title=title, favicon_url=favicon_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch title: {str(e)}")

@app.get("/bookmarks", response_model=List[BookmarkResponse])
def get_bookmarks(search: Optional[str] = Query(None, description="Search term for filtering bookmarks")):
    """Get all bookmarks with optional search filtering"""
    try:
        bookmarks = get_all_bookmarks(search=search)
        return bookmarks
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch bookmarks: {str(e)}")

@app.post("/bookmarks", response_model=BookmarkResponse)
def create_new_bookmark(bookmark: BookmarkCreate):
    """Create a new bookmark"""
    try:
        # Auto-fetch title and favicon if not provided
        if not bookmark.title.strip():
            title, favicon_url = fetch_page_metadata(bookmark.url)
            bookmark.title = title
        else:
            # Still fetch favicon even if title is provided
            _, favicon_url = fetch_page_metadata(bookmark.url)
        
        normalized_url = normalize_url(bookmark.url)
        
        new_bookmark = create_bookmark(
            url=normalized_url,
            title=bookmark.title,
            description=bookmark.description,
            favicon_url=favicon_url
        )
        return new_bookmark
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create bookmark: {str(e)}")

@app.get("/bookmarks/{bookmark_id}", response_model=BookmarkResponse)
def get_bookmark(bookmark_id: int):
    """Get a specific bookmark by ID"""
    bookmark = get_bookmark_by_id(bookmark_id)
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return bookmark

@app.put("/bookmarks/{bookmark_id}", response_model=BookmarkResponse)
def update_existing_bookmark(bookmark_id: int, bookmark_update: BookmarkUpdate):
    """Update an existing bookmark"""
    try:
        # Normalize URL if provided
        url = normalize_url(bookmark_update.url) if bookmark_update.url else None
        
        updated_bookmark = update_bookmark(
            bookmark_id=bookmark_id,
            url=url,
            title=bookmark_update.title,
            description=bookmark_update.description
        )
        
        if not updated_bookmark:
            raise HTTPException(status_code=404, detail="Bookmark not found")
        
        return updated_bookmark
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update bookmark: {str(e)}")

@app.delete("/bookmarks/{bookmark_id}")
def delete_existing_bookmark(bookmark_id: int):
    """Delete a bookmark"""
    try:
        # First check if bookmark exists
        existing_bookmark = get_bookmark_by_id(bookmark_id)
        if not existing_bookmark:
            raise HTTPException(status_code=404, detail=f"Bookmark with ID {bookmark_id} not found")
        
        deleted = delete_bookmark(bookmark_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Bookmark with ID {bookmark_id} not found")
        return {"message": "Bookmark deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete bookmark: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)