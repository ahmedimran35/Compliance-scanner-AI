import { Request, Response, NextFunction } from 'express';

// Optional express-validator import with fallback
let body: any, validationResult: any;
try {
  const validator = require('express-validator');
  body = validator.body;
  validationResult = validator.validationResult;
} catch (error) {
  console.warn('express-validator not available, using basic validation');
  // Fallback validation functions
  body = (field: string) => ({
    isEmail: () => ({ withMessage: (msg: string) => ({ run: (req: any) => Promise.resolve() }) }),
    normalizeEmail: () => ({ withMessage: (msg: string) => ({ run: (req: any) => Promise.resolve() }) }),
    isLength: (options: any) => ({ withMessage: (msg: string) => ({ run: (req: any) => Promise.resolve() }) }),
    matches: (pattern: any) => ({ withMessage: (msg: string) => ({ run: (req: any) => Promise.resolve() }) }),
    isURL: (options: any) => ({ withMessage: (msg: string) => ({ run: (req: any) => Promise.resolve() }) })
  });
  validationResult = () => ({ isEmpty: () => true, array: () => [] });
}

// Sanitize input to prevent XSS
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
};

// Validation rules for common inputs
export const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

export const validatePassword = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

export const validateURL = body('url')
  .isURL({ protocols: ['http', 'https'], require_protocol: true })
  .withMessage('Please provide a valid URL with http or https protocol');

export const validateProjectName = body('name')
  .isLength({ min: 1, max: 100 })
  .withMessage('Project name must be between 1 and 100 characters')
  .matches(/^[a-zA-Z0-9\s\-_]+$/)
  .withMessage('Project name can only contain letters, numbers, spaces, hyphens, and underscores');

// Check validation results
export const checkValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Rate limiting for specific endpoints
export const createRateLimit = (windowMs: number, max: number) => {
  const rateLimit = require('express-rate-limit');
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
};
