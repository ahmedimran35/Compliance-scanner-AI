# Production Setup Guide

## Environment Variables

Create a `.env.production` file in the frontend directory with the following variables:

```bash
# Clerk Authentication (Production Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_production_publishable_key_here
CLERK_SECRET_KEY=your_production_secret_key_here

# Backend API URL (Production)
NEXT_PUBLIC_API_URL=https://your-production-backend.com

# Other Production Settings
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

## Clerk Production Setup

1. **Get Production Keys**: 
   - Go to your Clerk Dashboard
   - Create a new production instance or use an existing one
   - Copy the production publishable key (starts with `pk_live_`)
   - Copy the production secret key (starts with `sk_live_`)

2. **Update Environment Variables**:
   - Replace the test keys with production keys
   - Ensure `NODE_ENV=production` is set

## Build and Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

## Security Considerations

1. **Environment Variables**: Never commit `.env.production` to version control
2. **Clerk Keys**: Use production keys only in production environment
3. **API URLs**: Use HTTPS URLs for all production endpoints
4. **Console Logs**: All debug logs are automatically suppressed in production

## Performance Optimizations

The application includes:
- Bundle splitting and optimization
- Image optimization
- Compression enabled
- Security headers
- Minification in production

## Monitoring

Consider adding:
- Error tracking (Sentry)
- Analytics (Google Analytics, etc.)
- Performance monitoring
