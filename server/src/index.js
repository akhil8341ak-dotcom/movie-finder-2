import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import healthRouter from './routes/health.js';
import moviesRouter from './routes/movies.js';
import garudaRouter from './routes/garuda.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  // API Routes
  app.use('/api/health', healthRouter);
  app.use('/api/movies', moviesRouter);
  app.use('/api/garuda', garudaRouter);

  // Serve frontend in production or if client/dist exists
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  // Global 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // Centralized error handling
  app.use((err, req, res, next) => {
    console.error('[Server Error]:', err);
    const status = err.status || 500;
    res.status(status).json({
      error: err.message || 'Internal Server Error',
      ...(config.nodeEnv === 'development' ? { stack: err.stack } : {})
    });
  });

  return app;
}

const app = createApp();

// If run directly, start the server
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const server = app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`🎬 MovieFinder + Garuda API Server running on port ${config.port}`);
    console.log(`🚀 Mode: ${config.nodeEnv}`);
    console.log(`🎥 TMDB Key: ${config.tmdb.apiKey ? 'Configured (Live API)' : 'Not set (Verified Dataset Mode)'}`);
    console.log(`🦅 Gemini Key: ${config.gemini.apiKey ? `Configured (${config.gemini.model})` : 'Not set (Local Semantic Engine Mode)'}`);
    console.log(`====================================================`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => process.exit(0));
  });
}

export default app;
