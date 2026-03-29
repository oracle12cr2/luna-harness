import { useState } from 'react';
import bookmarksAPI from '../api/bookmarks';

const BookmarkCard = ({ bookmark, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    url: bookmark.url,
    title: bookmark.title,
    description: bookmark.description || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDomainFromUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  const handleSave = async () => {
    setError('');
    setIsLoading(true);

    try {
      const updatedBookmark = await bookmarksAPI.updateBookmark(bookmark.id, editData);
      onUpdate(updatedBookmark);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description || ''
    });
    setError('');
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(bookmark);
  };

  if (isEditing) {
    return (
      <div className="bookmark-card editing">
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        <div className="edit-form">
          <div className="form-group">
            <input
              type="url"
              value={editData.url}
              onChange={(e) => setEditData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="URL"
              disabled={isLoading}
              className="edit-input"
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Title"
              disabled={isLoading}
              className="edit-input"
            />
          </div>
          
          <div className="form-group">
            <textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              rows="2"
              disabled={isLoading}
              className="edit-textarea"
            />
          </div>
        </div>

        <div className="bookmark-actions">
          <button 
            onClick={handleCancel}
            className="btn btn-secondary btn-sm"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="btn btn-primary btn-sm"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bookmark-card">
      <div className="bookmark-content">
        <div className="bookmark-header">
          <div className="bookmark-favicon">
            {bookmark.favicon_url ? (
              <img 
                src={bookmark.favicon_url} 
                alt="" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="favicon-fallback" style={{ display: bookmark.favicon_url ? 'none' : 'flex' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path>
              </svg>
            </div>
          </div>
          
          <div className="bookmark-info">
            <h3 className="bookmark-title">{bookmark.title}</h3>
            <a 
              href={bookmark.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bookmark-url"
            >
              {getDomainFromUrl(bookmark.url)}
            </a>
          </div>
        </div>

        {bookmark.description && (
          <p className="bookmark-description">{bookmark.description}</p>
        )}

        <div className="bookmark-meta">
          <span className="bookmark-date">
            Added {formatDate(bookmark.created_at)}
          </span>
        </div>
      </div>

      <div className="bookmark-actions">
        <button 
          onClick={() => setIsEditing(true)}
          className="btn btn-ghost btn-sm"
          aria-label="Edit bookmark"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button 
          onClick={handleDelete}
          className="btn btn-ghost btn-sm btn-danger"
          aria-label="Delete bookmark"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BookmarkCard;