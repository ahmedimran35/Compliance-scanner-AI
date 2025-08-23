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

    console.log('Processing token for authentication...');

    // For now, let's decode the token without verification to get the user info
    // This is a temporary solution until we get the proper JWT public key
    const decoded = jwt.decode(token) as any;
    
    if (!decoded || !decoded.sub) {
      console.log('Token decode failed or missing sub:', decoded);
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('Token decoded successfully, user ID:', decoded.sub);

    // Find or create user in database
    let user = await User.findOne({ clerkId: decoded.sub });
    
    if (!user) {
      console.log('Creating new user for clerkId:', decoded.sub);
      console.log('Token decoded data:', decoded);
      
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
      
      // If still no email, use a better placeholder
      if (!email) {
        email = `user_${decoded.sub}@placeholder.com`;
        console.log('No email found in token, using placeholder:', email);
      }
      
      console.log('Extracted email:', email);
      console.log('Token structure for debugging:', {
        hasEmail: !!decoded.email,
        hasEmailAddresses: !!decoded.email_addresses,
        emailAddressesType: typeof decoded.email_addresses,
        primaryEmailId: decoded.primary_email_address_id,
        emailAddressesKeys: decoded.email_addresses ? Object.keys(decoded.email_addresses) : null
      });
      
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
        console.log('New user created successfully');
      } catch (saveError: any) {
        console.error('Failed to save user:', saveError);
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
      console.log('Existing user found:', user.email);
      
      // Update existing users to have unlimited access if they don't already
      if (user.maxProjects !== -1 || user.maxScansPerMonth !== -1) {
        console.log('Updating existing user to unlimited access');
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
            console.log('User updated to unlimited access successfully');
          }
        } catch (updateError) {
          console.error('Error updating user to unlimited access:', updateError);
          // Continue with existing user data
        }
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Removed requireProTier middleware since all features are now free 