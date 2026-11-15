import express from 'express';
import Url from '../models/Url.js';

const router = express.Router();

/**
 * GET /:shortId
 * Finds the URL by shortId/customAlias, pushes analytics entry, increments clicks, and redirects
 */
router.get('/:shortId', async (req, res, next) => {
  try {
    const url = await Url.findOne({ $or: [{ shortId: req.params.shortId }, { customAlias: req.params.shortId }] });

    if (!url) {
      return res.status(404).json({ success: false, message: 'Short link not found' });
    }

    url.clicks += 1;
    url.analytics.push({
      timestamp: new Date(),
      userAgent: req.headers['user-agent'] || '',
    });
    await url.save();

    res.redirect(url.originalUrl);
  } catch (error) {
    next(error);
  }
});

export default router;

