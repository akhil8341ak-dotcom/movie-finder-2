import { Router } from 'express';
import {
  getHomepageCollections,
  getTrending,
  getPopular,
  getTopRated,
  discoverMovies,
  searchMovies,
  getMovieDetails
} from '../services/tmdb.js';
import { GENRES } from '../services/dataset.js';

const router = Router();

// GET /api/movies/homepage
router.get('/homepage', async (req, res, next) => {
  try {
    const data = await getHomepageCollections();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/genres
router.get('/genres', (req, res) => {
  res.json({ genres: GENRES });
});

// GET /api/movies/trending
router.get('/trending', async (req, res, next) => {
  try {
    const timeWindow = req.query.timeWindow === 'day' ? 'day' : 'week';
    const movies = await getTrending(timeWindow);
    res.json({ results: movies });
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/popular
router.get('/popular', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const movies = await getPopular(page);
    res.json({ results: movies });
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/top-rated
router.get('/top-rated', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const movies = await getTopRated(page);
    res.json({ results: movies });
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/discover
router.get('/discover', async (req, res, next) => {
  try {
    const { language, genre, year, minRating, sortBy, page } = req.query;
    const movies = await discoverMovies({
      language,
      genre,
      year: year ? parseInt(year, 10) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      sortBy,
      page: page ? parseInt(page, 10) : 1
    });
    res.json({ results: movies });
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/search
router.get('/search', async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const page = parseInt(req.query.page, 10) || 1;
    const movies = await searchMovies(q, page);
    res.json({ results: movies, query: q });
  } catch (err) {
    next(err);
  }
});

// GET /api/movies/:id
router.get('/:id', async (req, res, next) => {
  try {
    const movie = await getMovieDetails(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(movie);
  } catch (err) {
    next(err);
  }
});

export default router;
