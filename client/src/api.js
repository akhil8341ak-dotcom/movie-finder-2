const API_BASE = '/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Health check failed:', err);
    return null;
  }
}

export async function fetchHomepageCollections() {
  const res = await fetch(`${API_BASE}/movies/homepage`);
  if (!res.ok) throw new Error('Failed to load homepage collections');
  return await res.json();
}

export async function fetchMovieDetails(id) {
  const res = await fetch(`${API_BASE}/movies/${id}`);
  if (!res.ok) throw new Error('Failed to load movie details');
  return await res.json();
}

export async function searchMovies(query) {
  if (!query || !query.trim()) return [];
  const res = await fetch(`${API_BASE}/movies/search?q=${encodeURIComponent(query.trim())}`);
  if (!res.ok) throw new Error('Failed to search movies');
  const data = await res.json();
  return data.results || [];
}

export async function discoverMovies({ language, genre, year, minRating, sortBy, page = 1 } = {}) {
  const params = new URLSearchParams();
  if (language) params.append('language', language);
  if (genre) params.append('genre', genre);
  if (year) params.append('year', year);
  if (minRating) params.append('minRating', minRating);
  if (sortBy) params.append('sortBy', sortBy);
  if (page) params.append('page', page);

  const res = await fetch(`${API_BASE}/movies/discover?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to discover movies');
  const data = await res.json();
  return data.results || [];
}

export async function fetchGenres() {
  const res = await fetch(`${API_BASE}/movies/genres`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.genres || [];
}

export async function fetchGarudaStarters() {
  const res = await fetch(`${API_BASE}/garuda/starters`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.starters || [];
}

export async function sendGarudaMessage({ message, history = [], sessionContext = {}, languagePreference = 'auto' }) {
  const res = await fetch(`${API_BASE}/garuda/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, sessionContext, languagePreference })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to connect to Garuda AI service');
  }

  return await res.json();
}
