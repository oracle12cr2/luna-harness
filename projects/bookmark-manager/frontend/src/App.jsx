import { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import BookmarkList from './components/BookmarkList';
import AddBookmarkForm from './components/AddBookmarkForm';
import ConfirmDialog from './components/ConfirmDialog';
import bookmarksAPI from './api/bookmarks';
import './App.css';

function App() {
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, bookmark: null });
  const [error, setError] = useState('');

  const fetchBookmarks = useCallback(async (search = '') => {
    try {
      setIsLoading(true);
      setError('');
      const data = await bookmarksAPI.fetchBookmarks(search);
      setBookmarks(data);
      setFilteredBookmarks(data);
    } catch (err) {
      setError(`Failed to load bookmarks: ${err.message}`);
      console.error('Failed to fetch bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    fetchBookmarks(term);
  }, [fetchBookmarks]);

  const handleBookmarkAdded = (newBookmark) => {
    // Refresh the list to get the most recent data
    fetchBookmarks(searchTerm);
  };

  const handleBookmarkUpdate = (updatedBookmark) => {
    const newBookmarks = bookmarks.map(bookmark =>
      bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark
    );
    setBookmarks(newBookmarks);
    setFilteredBookmarks(newBookmarks);
  };

  const handleDeleteConfirm = async () => {
    const { bookmark } = deleteDialog;
    try {
      await bookmarksAPI.deleteBookmark(bookmark.id);
      const newBookmarks = bookmarks.filter(b => b.id !== bookmark.id);
      setBookmarks(newBookmarks);
      setFilteredBookmarks(newBookmarks);
    } catch (err) {
      setError(`Failed to delete bookmark: ${err.message}`);
    } finally {
      setDeleteDialog({ isOpen: false, bookmark: null });
    }
  };

  const handleDeleteRequest = (bookmark) => {
    setDeleteDialog({ isOpen: true, bookmark });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, bookmark: null });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon">🔖</span>
            BookmarkVault
          </h1>
          <button 
            onClick={() => setIsAddFormOpen(true)}
            className="btn btn-primary add-button"
            aria-label="Add new bookmark"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span className="add-text">Add Bookmark</span>
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="main-content">
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button 
                onClick={() => setError('')}
                className="close-error"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          <div className="search-section">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search bookmarks by title, URL, or description..."
            />
          </div>

          <div className="results-info">
            {searchTerm ? (
              <p className="search-results">
                Found {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''} 
                matching "{searchTerm}"
              </p>
            ) : (
              <p className="total-bookmarks">
                {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''} total
              </p>
            )}
          </div>

          <BookmarkList
            bookmarks={filteredBookmarks}
            isLoading={isLoading}
            onUpdate={handleBookmarkUpdate}
            onDelete={handleDeleteRequest}
          />
        </div>
      </main>

      <AddBookmarkForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onBookmarkAdded={handleBookmarkAdded}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Bookmark"
        message={`Are you sure you want to delete "${deleteDialog.bookmark?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Floating Add Button for mobile */}
      <button 
        onClick={() => setIsAddFormOpen(true)}
        className="floating-add-button"
        aria-label="Add new bookmark"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}

export default App;