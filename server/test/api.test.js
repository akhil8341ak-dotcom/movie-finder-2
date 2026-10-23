import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/index.js';
import { processGarudaChat, parseIntentLocally } from '../src/services/gemini.js';
import {
  getHomepageCollections,
  searchMovies,
  getMovieDetails,
  discoverMovies,
  normalizeMovie
} from '../src/services/tmdb.js';
import { VERIFIED_MOVIES } from '../src/services/dataset.js';

describe('MovieFinder Core & Data Services', () => {
  test('Dataset contains high-quality verified movies with verified fields', () => {
    assert.ok(VERIFIED_MOVIES.length >= 25, 'Should have at least 25 core verified movies');
    for (const movie of VERIFIED_MOVIES) {
      assert.ok(movie.id, `Movie ${movie.title} must have an ID`);
      assert.ok(movie.title, `Movie ID ${movie.id} must have a title`);
      assert.ok(movie.original_language, `Movie ${movie.title} must have an original_language`);
      assert.ok(typeof movie.vote_average === 'number', `Movie ${movie.title} must have numeric vote_average`);
      assert.ok(movie.release_date, `Movie ${movie.title} must have a release_date`);
    }
  });

  test('normalizeMovie formats and resolves full CDN URLs safely', () => {
    const raw = {
      id: 999999,
      title: 'Test Movie',
      poster_path: '/testPoster.jpg',
      backdrop_path: '/testBackdrop.jpg',
      vote_average: 8.567,
      release_date: '2024-05-10',
      genre_ids: [28, 53]
    };
    const normalized = normalizeMovie(raw);
    assert.equal(normalized.id, 999999);
    assert.equal(normalized.title, 'Test Movie');
    assert.equal(normalized.vote_average, 8.6);
    assert.equal(normalized.release_year, '2024');
    assert.ok(normalized.poster_url.includes('image.tmdb.org'));
    assert.ok(normalized.genres.includes('Action'));
    assert.ok(normalized.genres.includes('Thriller'));
  });

  test('Homepage collections return hero and multiple discovery rails (~40-60 items)', async () => {
    const result = await getHomepageCollections();
    assert.ok(result.hero, 'Must have a hero movie');
    assert.ok(result.collections.length >= 8, 'Must have at least 8 discovery collections');

    let totalDiscovered = 0;
    for (const col of result.collections) {
      assert.ok(col.id, 'Collection must have an ID');
      assert.ok(col.title, 'Collection must have a title');
      assert.ok(Array.isArray(col.items), 'Collection must have items array');
      totalDiscovered += col.items.length;
    }

    assert.ok(totalDiscovered >= 30, `Expected at least 30 discoverable movie entries across rails, got ${totalDiscovered}`);
  });

  test('Search finds movies by title and original title', async () => {
    const rrrResults = await searchMovies('RRR');
    assert.ok(rrrResults.length > 0, 'Should find RRR');
    assert.equal(rrrResults[0].id, 579974);

    const interstellarResults = await searchMovies('Interstellar');
    assert.ok(interstellarResults.length > 0, 'Should find Interstellar');
    assert.equal(interstellarResults[0].title, 'Interstellar');
  });

  test('Movie details returns director, cast, and similar movies', async () => {
    const details = await getMovieDetails(579974); // RRR
    assert.ok(details, 'Details should be found');
    assert.equal(details.title, 'RRR');
    assert.equal(details.director, 'S. S. Rajamouli');
    assert.ok(details.cast.length > 0, 'Cast should be populated');
    assert.ok(Array.isArray(details.similar), 'Similar movies should be an array');
  });

  test('Discover filters by language accurately', async () => {
    const teluguMovies = await discoverMovies({ language: 'te' });
    assert.ok(teluguMovies.length > 0, 'Should return Telugu movies');
    for (const m of teluguMovies) {
      assert.equal(m.original_language, 'te', 'Movie must be in Telugu');
    }

    const hindiMovies = await discoverMovies({ language: 'hi' });
    assert.ok(hindiMovies.length > 0, 'Should return Hindi movies');
    for (const m of hindiMovies) {
      assert.equal(m.original_language, 'hi', 'Movie must be in Hindi');
    }
  });
});

describe('Artwork & Poster Validation (Quality Audit Fixes)', () => {
  test('All poster and backdrop paths in VERIFIED_MOVIES start with slash and end in valid extension', () => {
    for (const movie of VERIFIED_MOVIES) {
      assert.ok(movie.poster_path && movie.poster_path.startsWith('/'), `Movie ${movie.title} poster_path must start with /`);
      assert.ok(movie.poster_path.endsWith('.jpg') || movie.poster_path.endsWith('.png'), `Movie ${movie.title} poster must end with .jpg or .png`);
      if (movie.backdrop_path) {
        assert.ok(movie.backdrop_path.startsWith('/'), `Movie ${movie.title} backdrop_path must start with /`);
      }
    }
  });

  test('normalizeMovie never fabricates Unsplash image URLs when poster is null', () => {
    const noPoster = { id: 101, title: 'No Poster Film', poster_path: null, backdrop_path: null };
    const normalized = normalizeMovie(noPoster);
    assert.equal(normalized.poster_url, null, 'poster_url should be null when neither poster nor backdrop exists');
    assert.equal(normalized.backdrop_url, null, 'backdrop_url should be null when neither exists');
  });

  test('normalizeMovie falls back to backdrop if poster is missing', () => {
    const withBackdrop = { id: 102, title: 'Backdrop Film', poster_path: null, backdrop_path: '/myBackdrop.jpg' };
    const normalized = normalizeMovie(withBackdrop);
    assert.equal(normalized.poster_url, 'https://image.tmdb.org/t/p/w500/myBackdrop.jpg');
    assert.equal(normalized.backdrop_url, 'https://image.tmdb.org/t/p/original/myBackdrop.jpg');
  });

  test('normalizeMovie extracts alternative artwork from raw.images.posters', () => {
    const withImages = {
      id: 103,
      title: 'Alternative Art Film',
      poster_path: null,
      images: {
        posters: [{ file_path: '/altPoster123.jpg' }]
      }
    };
    const normalized = normalizeMovie(withImages);
    assert.equal(normalized.poster_url, 'https://image.tmdb.org/t/p/w500/altPoster123.jpg');
  });
});

describe('Garuda Multilingual AI Assistant (Unit & End-to-End)', () => {
  test('Local semantic parser accurately handles Telugu transliterated thriller request', () => {
    const intent = parseIntentLocally('Naaku oka manchi thriller movie suggest cheyyi');
    assert.equal(intent.detected_language, 'te');
    assert.equal(intent.with_original_language, 'te');
    assert.equal(intent.genre, 'Thriller');
    assert.ok(intent.conversational_reply.length > 0);
  });

  test('Local semantic parser accurately handles Telugu mood-off feel-good request', () => {
    const intent = parseIntentLocally('Mood off undi, something feel-good suggest cheyyi');
    assert.equal(intent.detected_language, 'te');
    assert.equal(intent.mood, 'feel_good');
    assert.ok(intent.conversational_reply.toLowerCase().includes('mood off'));
  });

  test('Local semantic parser handles Hindi request', () => {
    const intent = parseIntentLocally('Hindi me koi acchi suspense thriller movie batao');
    assert.equal(intent.detected_language, 'hi');
    assert.equal(intent.with_original_language, 'hi');
    assert.equal(intent.genre, 'Thriller');
  });

  test('Local semantic parser handles Tamil, Malayalam and Kannada requests', () => {
    const ta = parseIntentLocally('Tamil padam nalla thriller sollu');
    assert.equal(ta.detected_language, 'ta');
    assert.equal(ta.with_original_language, 'ta');

    const ml = parseIntentLocally('Malayalam cinemakal parayu');
    assert.equal(ml.detected_language, 'ml');
    assert.equal(ml.with_original_language, 'ml');

    const kn = parseIntentLocally('Kannada chitragalu heli');
    assert.equal(kn.detected_language, 'kn');
    assert.equal(kn.with_original_language, 'kn');
  });

  test('Garuda end-to-end: English query returns verified sci-fi movies', async () => {
    const res = await processGarudaChat({
      message: 'Recommend a mind-bending sci-fi movie like Interstellar'
    });

    assert.ok(res.reply, 'Garuda must produce a reply');
    assert.ok(res.movies.length > 0, 'Garuda must return verified movie cards');
    assert.ok(res.movies.some(m => m.title === 'Interstellar' || m.title === 'Inception' || m.genres.includes('Science Fiction')));
    for (const m of res.movies) {
      assert.ok(m.id, 'Every movie must have a verified ID');
      assert.ok(typeof m.vote_average === 'number', 'Every movie must have a verified rating');
    }
  });

  test('Garuda end-to-end: Telugu transliteration returns verified Telugu movies', async () => {
    const res = await processGarudaChat({
      message: 'Naaku oka manchi thriller movie suggest cheyyi'
    });

    assert.ok(res.reply, 'Garuda must produce a reply');
    assert.ok(res.movies.length > 0, 'Garuda must return movies');
    for (const m of res.movies) {
      assert.equal(m.original_language, 'te', 'All returned movies must be in Telugu');
    }
  });

  test('Garuda end-to-end: Session context preservation with follow-up', async () => {
    const turn1 = await processGarudaChat({
      message: 'Suggest some thrillers'
    });
    assert.ok(turn1.movies.length > 0);

    const turn2 = await processGarudaChat({
      message: 'Only Telugu movies please',
      history: [
        { role: 'user', text: 'Suggest some thrillers' },
        { role: 'garuda', text: turn1.reply }
      ],
      sessionContext: turn1.sessionContext
    });

    assert.ok(turn2.movies.length > 0);
    assert.equal(turn2.sessionContext.with_original_language, 'te');
    for (const m of turn2.movies) {
      assert.equal(m.original_language, 'te', 'Must respect filter update in follow-up');
    }
  });

  test('Garuda failure & edge cases handled gracefully', async () => {
    const emptyRes = await processGarudaChat({ message: '' });
    assert.ok(emptyRes.reply.includes('Hello! I am Garuda'));
    assert.equal(emptyRes.movies.length, 0);

    const obscureRes = await processGarudaChat({ message: 'xzqpwk 123999 nonexistent' });
    assert.ok(obscureRes.reply, 'Should handle gracefully without crashing');
  });
});

describe('Full HTTP Server Integration (Live Endpoints)', () => {
  let server;
  let baseUrl;

  before(async () => {
    const app = createApp();
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('GET /api/health returns 200 and integration status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.ok(body.integrations.tmdb);
    assert.ok(body.integrations.gemini);
  });

  test('GET /api/movies/homepage returns hero and rails', async () => {
    const res = await fetch(`${baseUrl}/api/movies/homepage`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.hero);
    assert.ok(Array.isArray(body.collections));
    assert.ok(body.collections.length >= 8);
  });

  test('GET /api/movies/search?q=RRR returns verified movie records', async () => {
    const res = await fetch(`${baseUrl}/api/movies/search?q=RRR`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.results));
    assert.ok(body.results.some((m) => m.title === 'RRR'));
  });

  test('POST /api/garuda/chat processes Telugu query and returns movie cards', async () => {
    const res = await fetch(`${baseUrl}/api/garuda/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Naaku oka manchi thriller movie suggest cheyyi'
      })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.reply);
    assert.ok(Array.isArray(body.movies));
    assert.ok(body.movies.length > 0);
  });

  test('POST /api/garuda/chat rejects empty or invalid message with 400', async () => {
    const res = await fetch(`${baseUrl}/api/garuda/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' })
    });
    assert.equal(res.status, 400);
  });

  test('GET / serves the compiled React single page application HTML', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('MovieFinder'));
    assert.ok(text.includes('id="root"'));
  });
});
