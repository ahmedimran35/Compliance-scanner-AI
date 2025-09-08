import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // In development, be more lenient with token validation
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    let decoded: any;
    
    if (isDevelopment) {
      // In development, try to decode the token without verification first
      try {
        decoded = jwt.decode(token) as any;
        if (!decoded) {
          return res.status(401).json({ error: 'Invalid token format' });
        }
      } catch (decodeError) {
        console.warn('Token decode failed in development:', decodeError);
        return res.status(401).json({ error: 'Invalid token' });
      }
    } else {
      // In production, always verify the token
      const jwtSecret = process.env.JWT_SECRET || process.env.CLERK_SECRET_KEY;
      if (!jwtSecret) {
        return res.status(500).json({ error: 'JWT secret not configured' });
      }
      
      try {
        decoded = jwt.verify(token, jwtSecret);
      } catch (verifyError) {
        console.warn('JWT verification failed:', verifyError);
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
    
    if (!decoded || !decoded.sub) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }


    // Find or create user in database
    let user = await User.findOne({ clerkId: decoded.sub });
    
    if (!user) {
      
      // Extract email from token with better fallback handling
      let email = '';
      if (decoded.email) {
        email = decoded.email;
      } else if (decoded.email_addresses && Array.isArray(decoded.email_addresses) && decoded.email_addresses.length > 0) {
        email = decoded.email_addresses[0].email_address;
      } else if (decoded.email_addresses && typeof decoded.email_addresses === 'object') {
        // Handle case where email_addresses is an object
        const emailAddresses = Object.values(decoded.email_addresses);
        if (emailAddresses.length > 0 && typeof emailAddresses[0] === 'object') {
          email = (emailAddresses[0] as any).email_address || '';
        }
      } else if (decoded.primary_email_address_id) {
        // Try to get email from primary_email_address_id
        if (decoded.email_addresses && decoded.email_addresses[decoded.primary_email_address_id]) {
          email = decoded.email_addresses[decoded.primary_email_address_id].email_address;
        }
      }
      
      // EMAIL IS MANDATORY - Reject user creation without email
      // In development, allow placeholder emails
      if (!email || email.trim() === '') {
        console.error('❌ User creation rejected: No email provided');
        return res.status(400).json({ 
          error: 'Email is required for account creation',
          message: 'Please provide a valid email address to continue.'
        });
      }
      
      // In production, reject placeholder emails
      if (process.env.NODE_ENV === 'production' && email.includes('@placeholder.com')) {
        console.error('❌ User creation rejected: Placeholder email not allowed in production');
        return res.status(400).json({ 
          error: 'Invalid email address',
          message: 'Please provide a valid email address to continue.'
        });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.error('❌ User creation rejected: Invalid email format:', email);
        return res.status(400).json({ 
          error: 'Invalid email format',
          message: 'Please provide a valid email address.'
        });
      }
      
      // Only log debug info in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔍 Token debug info:', {
          hasEmail: !!decoded.email,
          hasEmailAddresses: !!decoded.email_addresses,
          emailAddressesType: typeof decoded.email_addresses,
          primaryEmailId: decoded.primary_email_address_id,
          emailAddressesKeys: decoded.email_addresses ? Object.keys(decoded.email_addresses) : null
        });
      }
      
      // Create new user with unlimited access (no tier restrictions)
      user = new User({
        clerkId: decoded.sub,
        email: email,
        firstName: decoded.first_name || decoded.firstName || '',
        lastName: decoded.last_name || decoded.lastName || '',
        isSupporter: false,
        totalDonations: 0,
        donationHistory: [],
        projects: 0,
        scansThisMonth: 0,
        maxProjects: -1, // Unlimited
        maxScansPerMonth: -1, // Unlimited
      });
      
      try {
        await user.save();
      } catch (saveError: any) {
        // If email is duplicate, try to find existing user
        if (saveError.code === 11000) {
          user = await User.findOne({ email: email });
          if (!user) {
            return res.status(500).json({ error: 'User creation failed' });
          }
        } else {
          return res.status(500).json({ error: 'User creation failed' });
        }
      }
    } else {
      
      // Update existing users to have unlimited access if they don't already
      if (user.maxProjects !== -1 || user.maxScansPerMonth !== -1) {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { clerkId: decoded.sub },
            {
              maxProjects: -1, // Unlimited
              maxScansPerMonth: -1, // Unlimited
              isSupporter: user.isSupporter || false,
              totalDonations: user.totalDonations || 0,
              donationHistory: user.donationHistory || []
            },
            { new: true }
          );
          
          if (updatedUser) {
            user = updatedUser;
          }
        } catch (updateError) {
          // Continue with existing user data
        }
      }
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Removed requireProTier middleware since all features are now free 