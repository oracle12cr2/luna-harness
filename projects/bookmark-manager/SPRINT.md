# Sprint 1: Core Bookmark Management

## Sprint Goal
Implement the foundational bookmark management features that allow users to add, view, edit, delete, and search bookmarks with a clean, responsive interface.

## Acceptance Criteria
- [ ] Add bookmark form with URL, title, description fields
- [ ] Auto-fetch page title and favicon when URL is entered
- [ ] List view showing all bookmarks with title, URL, and timestamp
- [ ] Edit existing bookmarks inline
- [ ] Delete bookmarks with confirmation
- [ ] Search bookmarks by title, URL, or description
- [ ] Basic responsive layout for mobile and desktop

## Implementation Plan

### Backend (FastAPI + SQLite)
1. **Database Schema**
   - Bookmarks table: id, url, title, description, favicon_url, created_at, updated_at
   - SQLite database with proper indexing for search

2. **API Endpoints**
   - `GET /bookmarks` - List all bookmarks with search functionality
   - `POST /bookmarks` - Create new bookmark
   - `GET /bookmarks/{id}` - Get specific bookmark
   - `PUT /bookmarks/{id}` - Update bookmark
   - `DELETE /bookmarks/{id}` - Delete bookmark
   - `POST /fetch-title` - Auto-fetch page title and favicon

3. **Features**
   - URL validation and normalization
   - Full-text search across title, description, and URL
   - Automatic page title/favicon fetching
   - Proper error handling and HTTP status codes

### Frontend (React + Vite)
1. **Components**
   - BookmarkList: Display all bookmarks
   - BookmarkCard: Individual bookmark display with edit/delete
   - AddBookmarkForm: Modal/form for adding new bookmarks
   - SearchBar: Real-time search filtering
   - ConfirmDialog: Delete confirmation modal

2. **Features**
   - Responsive design (mobile-first)
   - Real-time search filtering
   - Inline editing for bookmarks
   - Auto-fetch title when URL is entered
   - Clean, modern UI with proper loading states

### File Structure
```
bookmark-manager/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookmarkList.jsx
│   │   │   ├── BookmarkCard.jsx
│   │   │   ├── AddBookmarkForm.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── ConfirmDialog.jsx
│   │   ├── api/
│   │   │   └── bookmarks.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── requirements.txt
│   └── bookmarks.db (generated)
└── SPRINT_RESULT.md
```

## Success Verification
1. **Functional Tests**
   - Start both frontend (port 5173) and backend (port 8000)
   - Add a new bookmark - should auto-fetch title
   - View bookmark list - should show title, URL, timestamp
   - Search for bookmarks - should filter results real-time
   - Edit bookmark inline - should update immediately
   - Delete bookmark - should show confirmation dialog
   - Test responsive design on mobile/desktop

2. **API Tests**
   - All endpoints return proper HTTP status codes
   - Search functionality works correctly
   - Title fetching works for valid URLs
   - Error handling for invalid URLs

## Definition of Done
- All acceptance criteria are implemented and tested
- Both frontend and backend start without errors
- API endpoints respond correctly with proper error handling
- UI is responsive and visually polished (no generic styling)
- Code is clean and well-structured
- Git repository initialized with descriptive commits