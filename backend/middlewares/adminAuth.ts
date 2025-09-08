import { Request, Response, NextFunction } from 'express';

interface AdminRequest extends Request {
  isAdmin?: boolean;
}

// Strict Basic Auth for admin endpoints
export const requireAdmin = (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization || '';
    const realm = 'Admin';

    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    // If credentials are not configured, deny in all environments
    if (!adminUser || !adminPass) {
      res.setHeader('WWW-Authenticate', `Basic realm="${realm}", charset="UTF-8"`);
      return res.status(401).json({ error: 'Admin credentials not configured' });
    }

    if (!header.toLowerCase().startsWith('basic ')) {
      res.setHeader('WWW-Authenticate', `Basic realm="${realm}", charset="UTF-8"`);
      return res.status(401).json({ error: 'Authentication required' });
    }

    const base64Credentials = header.slice(6).trim();
    let decoded = '';
    try {
      decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
    } catch {
      res.setHeader('WWW-Authenticate', `Basic realm="${realm}", charset="UTF-8"`);
      return res.status(401).json({ error: 'Invalid authorization header' });
    }

    const sepIndex = decoded.indexOf(':');
    if (sepIndex === -1) {
      res.setHeader('WWW-Authenticate', `Basic realm="${realm}", charset="UTF-8"`);
      return res.status(401).json({ error: 'Invalid credentials format' });
    }

    const providedUser = decoded.slice(0, sepIndex);
    const providedPass = decoded.slice(sepIndex + 1);

    if (providedUser !== adminUser || providedPass !== adminPass) {
      res.setHeader('WWW-Authenticate', `Basic realm="${realm}", charset="UTF-8"`);
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    req.isAdmin = true;
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// Optional: Admin API key guard (Bearer)
export const checkAdminKey = (req: AdminRequest, res: Response, next: NextFunction) => {
  const adminKey = (req.headers['x-admin-key'] as string) || (req.headers['authorization'] as string);
  if (!process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Admin API key not configured' });
  }
  const expected = `Bearer ${process.env.ADMIN_API_KEY}`;
  if (adminKey !== expected) {
    return res.status(401).json({ error: 'Admin access required' });
  }
  req.isAdmin = true;
  return next();
};
