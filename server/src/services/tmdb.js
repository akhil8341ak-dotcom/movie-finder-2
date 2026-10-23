import { config } from '../config.js';
import { VERIFIED_MOVIES, GENRES } from './dataset.js';

// In-memory cache with TTL
const cache = new Map();

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data, ttlSeconds = config.cache.ttlSeconds) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000
  });
}

// Map genre IDs to human-readable names
const genreMap = new Map(GENRES.map(g => [g.id, g.name]));

export function normalizeMovie(raw) {
  if (!raw || typeof raw !== 'object') return null;

  let posterPath = raw.poster_path || null;
  let backdropPath = raw.backdrop_path || null;

  // If poster is missing but alternative posters exist in raw.images
  if (!posterPath && raw.images && Array.isArray(raw.images.posters) && raw.images.posters.length > 0) {
    posterPath = raw.images.posters[0].file_path || null;
  }

  // If backdrop is missing but backdrops exist in raw.images
  if (!backdropPath && raw.images && Array.isArray(raw.images.backdrops) && raw.images.backdrops.length > 0) {
    backdropPath = raw.images.backdrops[0].file_path || null;
  }

  // Construct secure HTTPS URLs using supported TMDB sizes (w500 for posters, original for backdrops)
  // Never invent external stock image URLs
  const poster_url = posterPath
    ? (posterPath.startsWith('http') ? posterPath : `https://image.tmdb.org/t/p/w500${posterPath.startsWith('/') ? '' : '/'}${posterPath}`)
    : (backdropPath ? `https://image.tmdb.org/t/p/w500${backdropPath.startsWith('/') ? '' : '/'}${backdropPath}` : null);

  const backdrop_url = backdropPath
    ? (backdropPath.startsWith('http') ? backdropPath : `https://image.tmdb.org/t/p/original${backdropPath.startsWith('/') ? '' : '/'}${backdropPath}`)
    : (posterPath ? `https://image.tmdb.org/t/p/original${posterPath.startsWith('/') ? '' : '/'}${posterPath}` : null);

  const releaseDate = raw.release_date || '';
  const releaseYear = releaseDate ? releaseDate.split('-')[0] : 'N/A';

  const genres = Array.isArray(raw.genres)
    ? raw.genres.map(g => (typeof g === 'string' ? g : g.name)).filter(Boolean)
    : Array.isArray(raw.genre_ids)
    ? raw.genre_ids.map(id => genreMap.get(id)).filter(Boolean)
    : [];

  return {
    id: raw.id,
    title: raw.title || raw.name || 'Untitled',
    original_title: raw.original_title || raw.title || '',
    original_language: raw.original_language || 'en',
    overview: raw.overview || 'No synopsis available.',
    release_date: releaseDate,
    release_year: releaseYear,
    vote_average: typeof raw.vote_average === 'number' ? Number(raw.vote_average.toFixed(1)) : 0,
    vote_count: raw.vote_count || 0,
    poster_path: posterPath || null,
    backdrop_path: backdropPath || null,
    poster_url,
    backdrop_url,
    genres,
    runtime: raw.runtime || null,
    director: raw.director || null,
    cast: Array.isArray(raw.cast) ? raw.cast : [],
    moods: Array.isArray(raw.moods) ? raw.moods : []
  };
}

async function fetchFromTMDB(endpoint, params = {}) {
  if (!config.tmdb.apiKey) {
    return null; // Signals fallback to verified dataset
  }

  const query = new URLSearchParams({
    api_key: config.tmdb.apiKey,
    ...params
  });

  const url = `${config.tmdb.baseUrl}${endpoint}?${query.toString()}`;

  const cacheKey = `tmdb:${url}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[TMDB] HTTP ${response.status} from ${endpoint}. Falling back to verified dataset.`);
      return null;
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.warn(`[TMDB] Network error calling ${endpoint}: ${err.message}. Falling back.`);
    return null;
  }
}

// -----------------------------------------------------------------------------
// Service Methods
// -----------------------------------------------------------------------------

export async function getTrending(timeWindow = 'week') {
  const data = await fetchFromTMDB(`/trending/movie/${timeWindow}`);
  if (data && Array.isArray(data.results) && data.results.length > 0) {
    return data.results.map(normalizeMovie).filter(Boolean);
  }

  // Fallback: high rated / popular verified movies
  return VERIFIED_MOVIES
    .slice()
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 15)
    .map(normalizeMovie);
}

export async function getPopular(page = 1) {
  const data = await fetchFromTMDB('/movie/popular', { page });
  if (data && Array.isArray(data.results) && data.results.length > 0) {
    return data.results.map(normalizeMovie).filter(Boolean);
  }

  return VERIFIED_MOVIES
    .slice()
    .sort((a, b) => b.vote_count - a.vote_count)
    .slice(0, 15)
    .map(normalizeMovie);
}

export async function getTopRated(page = 1) {
  const data = await fetchFromTMDB('/movie/top_rated', { page });
  if (data && Array.isArray(data.results) && data.results.length > 0) {
    return data.results.map(normalizeMovie).filter(Boolean);
  }

  return VERIFIED_MOVIES
    .filter(m => m.vote_average >= 8.0)
    .map(normalizeMovie);
}

export async function discoverMovies({
  language,
  genre,
  year,
  minRating,
  sortBy = 'popularity.desc',
  page = 1
} = {}) {
  const tmdbParams = {
    page,
    sort_by: sortBy
  };

  if (language) tmdbParams.with_original_language = language;
  if (year) tmdbParams.primary_release_year = year;
  if (minRating) tmdbParams['vote_average.gte'] = minRating;

  if (genre) {
    const matchedGenre = GENRES.find(g => g.name.toLowerCase() === genre.toLowerCase());
    if (matchedGenre) {
      tmdbParams.with_genres = matchedGenre.id;
    }
  }

  const data = await fetchFromTMDB('/discover/movie', tmdbParams);
  if (data && Array.isArray(data.results) && data.results.length > 0) {
    return data.results.map(normalizeMovie).filter(Boolean);
  }

  // Dataset fallback with comprehensive filtering
  let results = [...VERIFIED_MOVIES];

  if (language) {
    results = results.filter(m => m.original_language.toLowerCase() === language.toLowerCase());
  }

  if (genre) {
    const genreLower = genre.toLowerCase();
    results = results.filter(m => {
      const gNames = (m.genre_ids || []).map(id => genreMap.get(id)?.toLowerCase()).filter(Boolean);
      return gNames.includes(genreLower);
    });
  }

  if (year) {
    results = results.filter(m => m.release_date && m.release_date.startsWith(String(year)));
  }

  if (minRating) {
    results = results.filter(m => m.vote_average >= Number(minRating));
  }

  return results.map(normalizeMovie);
}

export async function searchMovies(query, page = 1) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return [];
  }

  const trimmed = query.trim();
  const data = await fetchFromTMDB('/search/movie', { query: trimmed, page });
  if (data && Array.isArray(data.results) && data.results.length > 0) {
    return data.results.map(normalizeMovie).filter(Boolean);
  }

  // Fallback search across title, original title, director, and overview
  const qLower = trimmed.toLowerCase();
  const matches = VERIFIED_MOVIES.filter(m => {
    return (
      m.title.toLowerCase().includes(qLower) ||
      (m.original_title && m.original_title.toLowerCase().includes(qLower)) ||
      (m.director && m.director.toLowerCase().includes(qLower)) ||
      (m.overview && m.overview.toLowerCase().includes(qLower)) ||
      (m.cast && m.cast.some(c => c.toLowerCase().includes(qLower)))
    );
  });

  return matches.map(normalizeMovie);
}

export async function getMovieDetails(id) {
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return null;

  const data = await fetchFromTMDB(`/movie/${numId}`, { append_to_response: 'credits,similar,images' });
  if (data) {
    const normalized = normalizeMovie(data);
    if (data.credits) {
      if (Array.isArray(data.credits.crew)) {
        const dir = data.credits.crew.find(c => c.job === 'Director');
        if (dir) normalized.director = dir.name;
      }
      if (Array.isArray(data.credits.cast)) {
        normalized.cast = data.credits.cast.slice(0, 6).map(c => c.name);
      }
    }
    if (data.similar && Array.isArray(data.similar.results)) {
      normalized.similar = data.similar.results.slice(0, 8).map(normalizeMovie).filter(Boolean);
    }
    return normalized;
  }

  // Fallback from verified dataset
  const movie = VERIFIED_MOVIES.find(m => m.id === numId);
  if (!movie) return null;

  const normalized = normalizeMovie(movie);
  // Attach similar movies in same language or genre
  normalized.similar = VERIFIED_MOVIES
    .filter(m => m.id !== numId && (m.original_language === movie.original_language || (m.genre_ids && movie.genre_ids && m.genre_ids.some(g => movie.genre_ids.includes(g)))))
    .slice(0, 6)
    .map(normalizeMovie);

  return normalized;
}

export async function getHomepageCollections() {
  const cacheKey = 'homepage:collections';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const [
    trending,
    topRated,
    telugu,
    hindi,
    tamil,
    malayalam,
    kannada,
    english
  ] = await Promise.all([
    getTrending('week'),
    getTopRated(1),
    discoverMovies({ language: 'te' }),
    discoverMovies({ language: 'hi' }),
    discoverMovies({ language: 'ta' }),
    discoverMovies({ language: 'ml' }),
    discoverMovies({ language: 'kn' }),
    discoverMovies({ language: 'en' })
  ]);

  // Curate mood collections: use live discover when TMDB is active, with verified dataset fallback
  let feelGood = [];
  let intenseThrillers = [];
  let mindBending = [];
  let hiddenGems = [];

  if (config.tmdb.apiKey) {
    const [liveFeelGood, liveThrillers, liveMindBending, liveHiddenGems] = await Promise.all([
      discoverMovies({ genre: 'Comedy', minRating: 7.5, sortBy: 'popularity.desc' }),
      discoverMovies({ genre: 'Thriller', minRating: 7.5, sortBy: 'popularity.desc' }),
      discoverMovies({ genre: 'Science Fiction', minRating: 7.5, sortBy: 'vote_average.desc' }),
      discoverMovies({ minRating: 8.0, sortBy: 'vote_average.desc' })
    ]);
    if (liveFeelGood.length > 0) feelGood = liveFeelGood;
    if (liveThrillers.length > 0) intenseThrillers = liveThrillers;
    if (liveMindBending.length > 0) mindBending = liveMindBending;
    if (liveHiddenGems.length > 0) hiddenGems = liveHiddenGems;
  }

  // Fallback to verified dataset mood tagging if live results were empty or TMDB unconfigured
  if (feelGood.length === 0) {
    feelGood = VERIFIED_MOVIES.filter(m => m.moods && m.moods.includes('feel_good')).map(normalizeMovie);
  }
  if (intenseThrillers.length === 0) {
    intenseThrillers = VERIFIED_MOVIES.filter(m => m.moods && m.moods.includes('intense_thriller')).map(normalizeMovie);
  }
  if (mindBending.length === 0) {
    mindBending = VERIFIED_MOVIES.filter(m => m.moods && m.moods.includes('mind_bending')).map(normalizeMovie);
  }
  if (hiddenGems.length === 0) {
    hiddenGems = VERIFIED_MOVIES.filter(m => (m.moods && m.moods.includes('hidden_gems')) || m.vote_average >= 8.2).map(normalizeMovie);
  }

  const heroCandidate = trending[0] || VERIFIED_MOVIES[0];

  const result = {
    hero: heroCandidate,
    collections: [
      { id: 'trending', title: 'Trending This Week', description: 'What audiences are streaming and talking about right now', items: trending },
      { id: 'top-rated', title: 'Critically Acclaimed', description: 'Timeless cinematic masterpieces rated 8.0+', items: topRated },
      { id: 'telugu', title: 'Telugu Cinema Spotlight', description: 'Blockbuster epics, gripping thrillers & soulful dramas', items: telugu },
      { id: 'hindi', title: 'Hindi Hits & Classics', description: 'From inspiring true stories to unforgettable mysteries', items: hindi },
      { id: 'tamil', title: 'Tamil Cinema Brilliance', description: 'Hard-hitting vengeance, neo-noir and modern triumphs', items: tamil },
      { id: 'malayalam', title: 'Malayalam New Wave', description: 'Grounded, authentic storytelling and edge-of-seat survival', items: malayalam },
      { id: 'kannada', title: 'Kannada Powerhouses', description: 'Spiritual folklore, emotional odysseys and raw action', items: kannada },
      { id: 'english', title: 'Global Sci-Fi & Cinema', description: 'Visionary mind-benders and epic Hollywood sagas', items: english },
      { id: 'mind-bending', title: 'Mind-Bending & Twists', description: 'Films that will make you question reality until the final second', items: mindBending },
      { id: 'feel-good', title: 'Feel-Good & Comfort Watches', description: 'Warm hugs in movie format when your mood needs uplifting', items: feelGood },
      { id: 'intense-thrillers', title: 'Edge-of-Your-Seat Thrillers', description: 'High stakes, relentless suspense and breathless pacing', items: intenseThrillers },
      { id: 'hidden-gems', title: 'Garuda’s Hidden Gems', description: 'Extraordinary films that deserve way more attention', items: hiddenGems }
    ]
  };

  setCache(cacheKey, result, 60 * 15); // Cache for 15 minutes
  return result;
}
