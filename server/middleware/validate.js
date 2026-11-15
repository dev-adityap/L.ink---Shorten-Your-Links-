import { body, validationResult } from 'express-validator';

export const validateShorten = [
  body('originalUrl')
    .trim()
    .notEmpty()
    .withMessage('Original URL is required')
    .isURL({ require_protocol: true })
    .withMessage('Please enter a valid URL (include http:// or https://)'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
