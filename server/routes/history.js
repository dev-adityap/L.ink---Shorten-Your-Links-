import express from 'express';
import Url from '../models/Url.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/urls
 * Returns shortened URLs for the authenticated user, sorted by newest first.
 */
router.get('/urls', verifyToken, async (req, res, next) => {
  try {
    const urls = await Url.find({ userId: req.user.uid }).sort({ createdAt: -1 });
    res.json({ success: true, data: urls });
  } catch (error) {
    next(error);
  }
});

export default router;

