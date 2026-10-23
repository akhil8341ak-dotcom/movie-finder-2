import { Router } from 'express';
import { processGarudaChat } from '../services/gemini.js';
import { STARTER_PROMPTS } from '../services/dataset.js';

const router = Router();

// GET /api/garuda/starters
router.get('/starters', (req, res) => {
  res.json({ starters: STARTER_PROMPTS });
});

// POST /api/garuda/chat
router.post('/chat', async (req, res, next) => {
  try {
    const { message, history, sessionContext, languagePreference } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Field "message" is required and must be a non-empty string.' });
    }

    // Rate limiting / safety check: cap message length
    if (message.length > 500) {
      return res.status(400).json({ error: 'Message exceeds maximum length of 500 characters.' });
    }

    const result = await processGarudaChat({
      message,
      history: Array.isArray(history) ? history.slice(-6) : [],
      sessionContext: sessionContext || {},
      languagePreference: languagePreference || 'auto'
    });

    res.json(result);
  } catch (err) {
    console.error('[Garuda Chat Route Error]:', err);
    res.status(500).json({
      error: 'An unexpected error occurred while processing your request.',
      details: err.message
    });
  }
});

export default router;
