# Clerk.js Setup Guide

## Critical Issue: Authentication Failures

The TestSprite tests revealed that the application is using Clerk.js development keys in production, causing authentication failures. Here's how to fix this:

## 1. Environment Variables Setup

Create a `.env.local` file in the frontend directory with the following variables:

```bash
# Clerk.js Authentication Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key_here
CLERK_SECRET_KEY=sk_live_your_production_secret_here

# Clerk.js URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Environment
NODE_ENV=production
```

## 2. Get Production Clerk.js Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application or select existing one
3. Go to API Keys section
4. Copy the **Production** publishable key (starts with `pk_live_`)
5. Copy the **Production** secret key (starts with `sk_live_`)

## 3. Update Clerk.js Configuration

The deprecated props have been fixed in the code:
- `redirectUrl` → `afterSignInUrl` / `afterSignUpUrl`

## 4. Test Authentication

After updating the environment variables:
1. Restart the development server
2. Test user registration and sign-in
3. Verify JWT token issuance
4. Test protected routes access

## 5. Common Issues

### Development Keys Warning
- **Problem**: Using `pk_test_` keys in production
- **Solution**: Use `pk_live_` keys for production

### 400/422 API Errors
- **Problem**: Invalid environment configuration
- **Solution**: Ensure all required environment variables are set

### Authentication Blocking
- **Problem**: Users can't register or sign in
- **Solution**: Check Clerk.js dashboard for application settings

## 6. Security Best Practices

1. Never commit `.env.local` to version control
2. Use different keys for development and production
3. Regularly rotate production keys
4. Monitor Clerk.js dashboard for security alerts

## 7. Testing After Fix

Run the following tests to verify fixes:
- User registration flow
- User sign-in flow
- Protected route access
- JWT token validation
- Role-based access control
