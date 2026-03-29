const API_BASE_URL = 'http://localhost:8001';

class BookmarksAPI {
  async fetchBookmarks(search = '') {
    const url = new URL(`${API_BASE_URL}/bookmarks`);
    if (search.trim()) {
      url.searchParams.append('search', search.trim());
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch bookmarks: ${response.statusText}`);
    }
    return response.json();
  }

  async createBookmark(bookmarkData) {
    const response = await fetch(`${API_BASE_URL}/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookmarkData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to create bookmark: ${response.statusText}`);
    }
    return response.json();
  }

  async updateBookmark(id, bookmarkData) {
    const response = await fetch(`${API_BASE_URL}/bookmarks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookmarkData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to update bookmark: ${response.statusText}`);
    }
    return response.json();
  }

  async deleteBookmark(id) {
    const response = await fetch(`${API_BASE_URL}/bookmarks/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to delete bookmark: ${response.statusText}`);
    }
    return response.json();
  }

  async fetchTitle(url) {
    const response = await fetch(`${API_BASE_URL}/fetch-title`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to fetch title: ${response.statusText}`);
    }
    return response.json();
  }
}

export default new BookmarksAPI();