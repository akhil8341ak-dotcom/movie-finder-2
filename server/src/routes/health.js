import { Router } from 'express';
import { config } from '../config.js';

const router = Router();
const startTime = Date.now();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MovieFinder & Garuda API',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    integrations: {
      tmdb: {
        configured: Boolean(config.tmdb.apiKey),
        mode: config.tmdb.apiKey ? 'live-api' : 'verified-catalogue-fallback'
      },
      gemini: {
        configured: Boolean(config.gemini.apiKey),
        model: config.gemini.model,
        mode: config.gemini.apiKey ? 'live-llm' : 'semantic-parser-fallback'
      }
    },
    version: '1.0.0'
  });
});

export default router;
