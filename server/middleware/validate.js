import { body, validationResult } from 'express-validator';

const isHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const validateShorten = [
  body('originalUrl')
    .trim()
    .notEmpty()
    .withMessage('Original URL is required')
    .custom((value) => {
      if (!isHttpUrl(value)) {
        throw new Error('Please enter a valid URL (include http:// or https://)');
      }
      return true;
    }),
  body('customAlias')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Custom alias must be between 1 and 50 characters')
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage('Custom alias can only contain letters, numbers, hyphens, and underscores'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const first = errors.array()[0];
      return res.status(400).json({ success: false, message: first.msg, errors: errors.array() });
    }
    // Normalize trimmed values back onto body for downstream handlers
    if (typeof req.body.originalUrl === 'string') req.body.originalUrl = req.body.originalUrl.trim();
    if (typeof req.body.customAlias === 'string') req.body.customAlias = req.body.customAlias.trim();
    next();
  },
];
