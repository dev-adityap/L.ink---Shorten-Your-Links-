import express from 'express';
import Url from '../models/Url.js';

const router = express.Router();

const getDeviceType = (userAgent = '') => {
  return /mobile|android|iphone|ipad/i.test(userAgent) ? 'Mobile' : 'Desktop';
};

const getReferrerHost = (referrerHeader = '') => {
  if (!referrerHeader) return 'Direct / None';
  try {
    const parsed = new URL(referrerHeader);
    return parsed.hostname || 'Direct / None';
  } catch {
    return 'Direct / None';
  }
};

const isSafeRedirectUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * GET /:shortId
 * Finds the URL by shortId/customAlias, enforces active/expiry state, records analytics, and redirects
 */
router.get('/:shortId', async (req, res, next) => {
  try {
    const url = await Url.findOne({ $or: [{ shortId: req.params.shortId }, { customAlias: req.params.shortId }] });

    if (!url) {
      return res.status(404).json({ success: false, message: 'Short link not found' });
    }

    const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);
    if (isExpired) {
      return res.status(410).json({ success: false, message: 'This link has expired' });
    }

    if (!url.isActive) {
      return res.status(403).json({ success: false, message: 'This link is currently paused' });
    }

    if (!isSafeRedirectUrl(url.originalUrl)) {
      return res.status(400).json({ success: false, message: 'Link destination is invalid' });
    }

    const userAgent = req.headers['user-agent'] || '';
    const referrerHeader = req.headers.referer || req.headers.referrer || '';
    const detectedDevice = getDeviceType(userAgent);
    const detectedReferrer = getReferrerHost(referrerHeader);
    const clickedAt = new Date();

    // Atomically increment clicks and append analytics to avoid lost updates under concurrency
    await Url.updateOne(
      { _id: url._id },
      {
        $inc: { clicks: 1 },
        $push: {
          analytics: {
            clickedAt,
            timestamp: clickedAt,
            referrer: detectedReferrer,
            device: detectedDevice,
            userAgent,
          },
        },
      }
    );

    return res.redirect(url.originalUrl);
  } catch (error) {
    next(error);
  }
});

export default router;

