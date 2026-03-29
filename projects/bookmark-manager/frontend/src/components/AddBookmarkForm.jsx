import { useState } from 'react';
import bookmarksAPI from '../api/bookmarks';

const AddBookmarkForm = ({ isOpen, onClose, onBookmarkAdded }) => {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setFormData({ url: '', title: '', description: '' });
    setError('');
    setIsLoading(false);
    setIsFetchingTitle(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleUrlChange = async (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, url }));

    // Auto-fetch title when URL is entered
    if (url.trim() && !formData.title) {
      setIsFetchingTitle(true);
      try {
        const { title } = await bookmarksAPI.fetchTitle(url);
        setFormData(prev => ({ ...prev, title }));
      } catch (err) {
        console.log('Failed to fetch title:', err.message);
        // Don't show error for title fetching failures
      } finally {
        setIsFetchingTitle(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.url.trim()) {
      setError('URL is required');
      return;
    }

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);

    try {
      const newBookmark = await bookmarksAPI.createBookmark(formData);
      onBookmarkAdded(newBookmark);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Bookmark</h2>
          <button 
            onClick={handleClose}
            className="close-button"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bookmark-form">
          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="form-group">
            <label htmlFor="url">URL *</label>
            <input
              id="url"
              type="url"
              value={formData.url}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">
              Title * 
              {isFetchingTitle && <span className="loading-text">(fetching...)</span>}
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter bookmark title"
              required
              disabled={isLoading || isFetchingTitle}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
              rows="3"
              disabled={isLoading}
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || isFetchingTitle}
            >
              {isLoading ? 'Adding...' : 'Add Bookmark'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookmarkForm;