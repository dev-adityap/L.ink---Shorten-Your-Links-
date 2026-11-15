import express from 'express';
import Url from '../models/Url.js';

const router = express.Router();

/**
 * GET /api/urls
 * Returns all shortened URLs sorted by newest first (for the history table).
 */
router.get('/urls', async (req, res, next) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.json({ success: true, data: urls });
  } catch (error) {
    next(error);
  }
});

export default router;

