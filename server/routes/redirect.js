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
      const frontendBase = (process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '').split(',')[0]?.trim().replace(/\/$/, '') || 'https://link.ink';
      const homeUrl = frontendBase || '/';
      if (req.accepts('html')) {
        return res.status(410).type('html').send(`<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Link Expired · L.ink</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#FDFCF7;color:#111827;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:24px}main{max-width:560px;background:#F8F7F2;border:1px solid #EBE9E0;border-radius:16px;padding:32px;box-shadow:0 1px 2px rgba(0,0,0,.04)}h1{margin:0 0 8px;font-size:28px;line-height:1.2}p{margin:0 0 20px;color:#4b5563;line-height:1.6}a{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:10px;background:#111827;color:#fff;text-decoration:none;font-weight:600}a:focus-visible{outline:2px solid #111827;outline-offset:2px}@media(prefers-color-scheme:dark){body{background:#0f172a;color:#f8fafc}main{background:#1e293b;border-color:#334155}p{color:#cbd5e1}a{background:#f8fafc;color:#0f172a}}</style></head><body><main><h1>This link has expired</h1><p>The short link you opened is no longer active. You can create a new link or manage your links on L.ink.</p><a href="${homeUrl}">Go to L.ink</a></main></body></html>`);
      }
      return res.status(410).json({ success: false, message: 'This link has expired', homeUrl });
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

