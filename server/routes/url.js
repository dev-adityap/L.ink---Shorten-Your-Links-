import express from 'express';
import Url from '../models/Url.js';
import { generateShortId } from '../utils/shortId.js';
import { validateShorten } from '../middleware/validate.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Stricter rate limit for shorten endpoint
const shortenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 shorten requests per windowMs
  message: { success: false, message: 'Too many URL shortening requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/shorten
 * Accepts an original URL, optional customAlias, creates a new entry (or returns an existing one),
 * and returns the shortened data.
 */
router.post('/shorten', shortenLimiter, validateShorten, async (req, res, next) => {
  try {
    const { originalUrl, customAlias } = req.body;

    // If custom alias provided, check if taken
    if (customAlias) {
      const existing = await Url.findOne({ $or: [{ shortId: customAlias }, { customAlias: customAlias }] });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Custom alias is already taken' });
      }
    }

    // Return existing entry if this URL was already shortened (and no custom alias requested)
    if (!customAlias) {
      let url = await Url.findOne({ originalUrl });
      if (url) {
        const shortUrl = `${req.protocol}://${req.get('host')}/${url.shortId}`;
        return res.status(201).json({
          success: true,
          data: {
            originalUrl: url.originalUrl,
            shortId: url.shortId,
            shortUrl,
            clicks: url.clicks,
            createdAt: url.createdAt,
            customAlias: url.customAlias,
          },
        });
      }
    }

    let shortId = customAlias || generateShortId();
    if (!customAlias) {
      // Ensure the generated shortId is unique
      while (await Url.findOne({ shortId })) {
        shortId = generateShortId();
      }
    }

    const url = await Url.create({ originalUrl, shortId, customAlias: customAlias || undefined });

    const shortUrl = `${req.protocol}://${req.get('host')}/${url.shortId}`;

    res.status(201).json({
      success: true,
      data: {
        originalUrl: url.originalUrl,
        shortId: url.shortId,
        shortUrl,
        clicks: url.clicks,
        createdAt: url.createdAt,
        customAlias: url.customAlias,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/:shortId
 * Returns a specific URL's document including analytics array and total clicks
 */
router.get('/analytics/:shortId', async (req, res, next) => {
  try {
    const url = await Url.findOne({ $or: [{ shortId: req.params.shortId }, { customAlias: req.params.shortId }] });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found' });
    }
    res.json({ success: true, data: url });
  } catch (error) {
    next(error);
  }
});

export default router;

