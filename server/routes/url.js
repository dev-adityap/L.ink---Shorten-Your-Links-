import express from 'express';
import mongoose from 'mongoose';
import Url from '../models/Url.js';
import { generateShortId } from '../utils/shortId.js';
import { validateShorten } from '../middleware/validate.js';
import { verifyToken, optionalVerifyToken } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import { getAuth } from 'firebase-admin/auth';

const router = express.Router();

const getBaseUrl = () => {
  const base =
    process.env.BASE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    `http://localhost:${process.env.PORT || 5000}`;
  return base.replace(/\/$/, '');
};

// Stricter rate limit for shorten endpoint
const shortenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 shorten requests per windowMs
  message: { success: false, message: 'Too many URL shortening requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const guestShortenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many guest requests. Sign in for a higher limit or try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !!req.user,
});

const RESERVED_ALIASES = new Set(['api', 'health', 'urls', 'shorten', 'analytics', 'favicon.ico', 'robots.txt', 'sitemap.xml']);

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const normalizeAlias = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizeTitle = (value) => (typeof value === 'string' ? value.trim().slice(0, 100) : '');

const validateAlias = (alias) => {
  if (!alias) return { ok: true, value: '' };
  if (alias.length < 1 || alias.length > 50) {
    return { ok: false, message: 'Custom alias must be between 1 and 50 characters' };
  }
  if (!/^[A-Za-z0-9_-]+$/.test(alias)) {
    return { ok: false, message: 'Custom alias can only contain letters, numbers, hyphens, and underscores' };
  }
  if (RESERVED_ALIASES.has(alias.toLowerCase())) {
    return { ok: false, message: 'This alias is reserved and cannot be used' };
  }
  return { ok: true, value: alias };
};

const getOptionalUserId = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch {
    return null;
  }
};

const parseExpiresAt = (value, { requireFuture = false } = {}) => {
  if (value === undefined) return { provided: false };
  if (value === null || value === '') return { provided: true, value: null };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { provided: true, error: 'Please provide a valid expiration date' };
  }
  if (requireFuture && date.getTime() <= Date.now()) {
    return { provided: true, error: 'Expiration date must be in the future' };
  }
  return { provided: true, value: date };
};

/**
 * POST /api/shorten
 * Guest-first: allows unauthenticated basic short links. Custom alias/expiration require auth.
 */
router.post('/shorten', shortenLimiter, optionalVerifyToken, guestShortenLimiter, validateShorten, async (req, res, next) => {
  try {
    const { originalUrl } = req.body;
    const customAlias = normalizeAlias(req.body.customAlias);
    const title = normalizeTitle(req.body.title);
    const userId = req.user?.uid || null;
    const expiresAt = parseExpiresAt(req.body.expiresAt, { requireFuture: true });

    if (expiresAt.error) {
      return res.status(400).json({ success: false, message: expiresAt.error });
    }

    // Defense in depth: enforce http/https even if middleware is bypassed
    if (!isHttpUrl(originalUrl)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid URL (include http:// or https://)' });
    }

    // Guest gating: advanced options require sign-in
    if (!userId && (customAlias || expiresAt.provided)) {
      return res.status(401).json({ success: false, message: 'Sign in to use custom aliases and link controls' });
    }

    const aliasCheck = validateAlias(customAlias);
    if (!aliasCheck.ok) {
      return res.status(400).json({ success: false, message: aliasCheck.message });
    }
    const safeAlias = aliasCheck.value || undefined;

    // If custom alias provided, check if taken (and not reserved)
    if (safeAlias) {
      const existing = await Url.findOne({ $or: [{ shortId: safeAlias }, { customAlias: safeAlias }] });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Custom alias is already taken' });
      }
    }

    // Return existing entry if this URL was already shortened (and no custom alias requested)
    if (!safeAlias) {
      let url = userId
        ? await Url.findOne({ originalUrl, userId })
        : await Url.findOne({ originalUrl, $or: [{ userId: { $exists: false } }, { userId: null }] });
      if (url) {
        const shortUrl = `${getBaseUrl()}/${url.shortId}`;
        return res.status(201).json({
          success: true,
          data: {
            originalUrl: url.originalUrl,
            shortId: url.shortId,
            shortUrl,
            clicks: url.clicks,
            createdAt: url.createdAt,
            customAlias: url.customAlias,
            title: url.title,
            isActive: url.isActive,
            expiresAt: url.expiresAt,
          },
        });
      }
    }

    let shortId = safeAlias || generateShortId();
    if (!safeAlias) {
      // Ensure the generated shortId is unique and not reserved
      let attempts = 0;
      while (
        attempts < 10 &&
        (RESERVED_ALIASES.has(shortId.toLowerCase()) || (await Url.findOne({ $or: [{ shortId }, { customAlias: shortId }] })))
      ) {
        shortId = generateShortId();
        attempts += 1;
      }
      if (RESERVED_ALIASES.has(shortId.toLowerCase()) || (await Url.findOne({ $or: [{ shortId }, { customAlias: shortId }] }))) {
        return res.status(500).json({ success: false, message: 'Failed to generate a unique short link. Please try again.' });
      }
    }

    const url = await Url.create({
      originalUrl,
      shortId,
      customAlias: safeAlias,
      ...(title ? { title } : {}),
      userId: userId || null,
      ...(expiresAt.provided ? { expiresAt: expiresAt.value } : {}),
    });

    const shortUrl = `${getBaseUrl()}/${url.shortId}`;

    return res.status(201).json({
      success: true,
      data: {
        originalUrl: url.originalUrl,
        shortId: url.shortId,
        shortUrl,
        clicks: url.clicks,
        createdAt: url.createdAt,
        customAlias: url.customAlias,
        title: url.title,
        isActive: url.isActive,
        expiresAt: url.expiresAt,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Short link or custom alias is already taken' });
    }
    next(error);
  }
});

/**
 * GET /api/analytics/:shortId
 * Returns analytics for a URL. Owner-only for user-owned links; public for anonymous links.
 */
router.get('/analytics/:shortId', async (req, res, next) => {
  try {
    const url = await Url.findOne({ $or: [{ shortId: req.params.shortId }, { customAlias: req.params.shortId }] });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found' });
    }

    // Protect user-owned link analytics: only the owner may view
    if (url.userId) {
      const requesterId = await getOptionalUserId(req);
      if (!requesterId || requesterId !== url.userId) {
        return res.status(404).json({ success: false, message: 'URL not found' });
      }
    }

    res.json({ success: true, data: url });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/urls/:id
 * Deletes a URL owned by the authenticated user.
 */
router.delete('/urls/:id', verifyToken, async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid link id' });
    }

    const url = await Url.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found or not authorized' });
    }

    res.json({ success: true, message: 'URL deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/urls/:id
 * Updates a URL's destination, alias, active state, and/or expiration for the authenticated owner.
 */
router.patch('/urls/:id', verifyToken, async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid link id' });
    }

    const url = await Url.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found or not authorized' });
    }

    const hasOriginalUrl = Object.prototype.hasOwnProperty.call(req.body, 'originalUrl');
    if (hasOriginalUrl) {
      const { originalUrl } = req.body;
      if (!originalUrl || typeof originalUrl !== 'string') {
        return res.status(400).json({ success: false, message: 'Original URL is required' });
      }

      const trimmedUrl = originalUrl.trim();
      if (!isHttpUrl(trimmedUrl)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid URL (include http:// or https://)' });
      }

      url.originalUrl = trimmedUrl;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'title')) {
      url.title = normalizeTitle(req.body.title);
    }

    const hasAliasInput =
      Object.prototype.hasOwnProperty.call(req.body, 'customAlias') ||
      Object.prototype.hasOwnProperty.call(req.body, 'alias') ||
      Object.prototype.hasOwnProperty.call(req.body, 'shortId');
    if (hasAliasInput) {
      const rawAlias = normalizeAlias(req.body.customAlias ?? req.body.alias ?? req.body.shortId);
      if (rawAlias && rawAlias !== url.shortId) {
        const aliasCheck = validateAlias(rawAlias);
        if (!aliasCheck.ok) {
          return res.status(400).json({ success: false, message: aliasCheck.message });
        }
        const aliasInput = aliasCheck.value;
        const conflict = await Url.findOne({
          $or: [{ shortId: aliasInput }, { customAlias: aliasInput }],
          _id: { $ne: url._id },
        });
        if (conflict) {
          return res.status(409).json({ success: false, message: 'Custom alias is already taken' });
        }
        url.shortId = aliasInput;
        url.customAlias = aliasInput;
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'isActive')) {
      if (typeof req.body.isActive !== 'boolean') {
        return res.status(400).json({ success: false, message: 'isActive must be a boolean' });
      }
      url.isActive = req.body.isActive;
    }

    const expiresAt = parseExpiresAt(req.body.expiresAt, { requireFuture: true });
    if (expiresAt.error) {
      return res.status(400).json({ success: false, message: expiresAt.error });
    }
    if (expiresAt.provided) {
      url.expiresAt = expiresAt.value;
    }

    await url.save();

    res.json({ success: true, data: url });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Custom alias is already taken' });
    }
    next(error);
  }
});

/**
 * POST /api/urls/bulk-delete
 * Deletes multiple URLs owned by the authenticated user.
 */
router.post('/urls/bulk-delete', verifyToken, async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids must be a non-empty array' });
    }

    const validIds = ids.filter((id) => isValidObjectId(id));
    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid link ids provided' });
    }

    const result = await Url.deleteMany({
      _id: { $in: validIds },
      userId: req.user.uid,
    });

    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/urls/claim
 * Claims unclaimed guest links for the authenticated user.
 */
router.post('/urls/claim', verifyToken, async (req, res, next) => {
  try {
    const { shortIds } = req.body || {};
    if (!Array.isArray(shortIds) || shortIds.length === 0) {
      return res.status(400).json({ success: false, message: 'shortIds must be a non-empty array' });
    }

    const cleaned = [...new Set(shortIds
      .filter((id) => typeof id === 'string')
      .map((id) => id.trim())
      .filter((id) => id.length > 0 && id.length <= 100))].slice(0, 100);

    if (cleaned.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid shortIds provided' });
    }

    const result = await Url.updateMany(
      { shortId: { $in: cleaned }, $or: [{ userId: null }, { userId: { $exists: false } }] },
      { $set: { userId: req.user.uid } }
    );

    res.json({ success: true, claimedCount: result.modifiedCount || 0 });
  } catch (error) {
    next(error);
  }
});

export default router;

