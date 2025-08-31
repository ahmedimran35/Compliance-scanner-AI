# Task 1: Authentication with Clerk

## Overview

This task implements complete authentication for ComplianceScanner AI using Clerk, including sign-up, sign-in, protected routes, and backend JWT verification.

## Authentication Flow

### 1. User Registration Flow
```
User visits /sign-up → Clerk SignUp component → User creates account → 
Redirected to dashboard → Backend creates user record with free tier
```

### 2. User Login Flow
```
User visits /sign-in → Clerk SignIn component → User authenticates → 
Redirected to dashboard → Backend verifies JWT and loads user data
```

### 3. Protected Route Flow
```
User visits /dashboard → Middleware checks authentication → 
If authenticated: Show dashboard → If not: Redirect to sign-in
```

### 4. Backend API Flow
```
Frontend makes API call → Includes JWT in Authorization header → 
Backend middleware verifies JWT → Creates/finds user in MongoDB → 
Attaches user to request → Route handler processes request
```

## Frontend Implementation

### Clerk Setup

1. **Installation**
   ```bash
   npm install @clerk/nextjs
   ```

2. **Provider Setup** (`src/app/layout.tsx`)
   ```tsx
   import { ClerkProvider } from '@clerk/nextjs'
   
   export default function RootLayout({ children }) {
     return (
       <ClerkProvider>
         <html lang="en">
           <body>{children}</body>
         </html>
       </ClerkProvider>
     )
   }
   ```

3. **Middleware** (`src/middleware.ts`)
   ```tsx
   import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
   
   const isProtectedRoute = createRouteMatcher([
     "/dashboard(.*)",
   ]);
   
   export default clerkMiddleware((auth, req) => {
     if (isProtectedRoute(req)) auth().protect();
   });
   ```

### Authentication Pages

#### Sign-In Page (`/sign-in/[[...sign-in]]/page.tsx`)
- Beautiful dark gradient background
- Customized Clerk SignIn component styling
- Matches the application theme
- Responsive design

#### Sign-Up Page (`/sign-up/[[...sign-up]]/page.tsx`)
- Same styling as sign-in page
- Customized Clerk SignUp component
- Seamless user experience

#### Dashboard Page (`/dashboard/page.tsx`)
- Protected route requiring authentication
- User profile display
- Usage statistics
- Project management interface
- Quick actions for scanning

### Header Component Updates

The header now includes:
- Dynamic authentication state
- User profile dropdown when logged in
- Sign-in/Sign-up buttons when logged out
- Mobile-responsive design

## Backend Implementation

### User Model (`models/User.ts`)

```typescript
interface IUser {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  tier: 'free' | 'pro';
  projects: number;
  scansThisMonth: number;
  maxProjects: number;
  maxScansPerMonth: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Tier Limits:**
- **Free Tier**: 1 project, 5 scans/month
- **Pro Tier**: Unlimited projects and scans

### Authentication Middleware (`middlewares/auth.ts`)

```typescript
export const authenticateToken = async (req, res, next) => {
  // 1. Extract JWT from Authorization header
  // 2. Verify JWT using Clerk public key
  // 3. Find or create user in MongoDB
  // 4. Attach user to request
  // 5. Continue to route handler
}
```

### User Routes (`routes/users.ts`)

**Available Endpoints:**
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/tier` - Update user tier
- `GET /api/users/usage` - Get usage statistics

## Clerk Setup Instructions

### 1. Create Clerk Application

1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Choose "Next.js" as your framework
4. Copy your API keys

### 2. Environment Variables

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

**Backend** (`.env`):
```env
CLERK_JWT_PUBLIC_KEY=your_jwt_public_key
MONGODB_URI=your_mongodb_connection_string
```

### 3. Configure Clerk Dashboard

1. **Authentication Methods**
   - Enable Email/Password
   - Enable Social providers (Google, GitHub, etc.)

2. **User Profile**
   - Configure required fields
   - Set up email verification

3. **Appearance**
   - Customize colors to match your theme
   - Upload your logo

4. **Redirect URLs**
   - Add `http://localhost:3000/dashboard`
   - Add `http://localhost:3000/sign-in`
   - Add `http://localhost:3000/sign-up`

### 4. Get JWT Public Key

1. Go to Clerk Dashboard → JWT Templates
2. Create a new template or use default
3. Copy the public key for backend verification

## Code Samples

### Frontend Authentication Hook

```tsx
import { useUser } from '@clerk/nextjs';

function MyComponent() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  return <div>Welcome, {user.firstName}!</div>;
}
```

### Backend Protected Route

```typescript
import { authenticateToken } from '../middlewares/auth';

router.get('/protected', authenticateToken, (req, res) => {
  const user = req.user; // User is attached by middleware
  res.json({ message: 'Protected data', user });
});
```

### API Call with Authentication

```typescript
const token = await auth().getToken();
const response = await fetch('/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## Testing

### 1. Test Authentication Flow

1. Visit `/sign-up` and create an account
2. Verify redirect to dashboard
3. Sign out and test sign-in
4. Verify protected routes work

### 2. Test Backend API

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test protected endpoint (requires JWT)
curl -H "Authorization: Bearer YOUR_JWT" \
     http://localhost:3001/api/users/profile
```

### 3. Test Tier System

1. Create a new user (should be free tier)
2. Check MongoDB for user record
3. Verify tier limits are applied

## Security Considerations

1. **JWT Verification**: All protected routes verify JWT tokens
2. **User Creation**: New users are automatically created with free tier
3. **Tier Enforcement**: Backend enforces tier limits
4. **CORS**: Properly configured for frontend-backend communication
5. **Environment Variables**: Sensitive keys stored securely

## Next Steps

1. **Stripe Integration**: Implement payment processing for tier upgrades
2. **Project Management**: Create project CRUD operations
3. **Scanning Engine**: Implement the core compliance scanning functionality
4. **Usage Tracking**: Add detailed usage analytics
5. **Team Management**: Add team collaboration features

## Troubleshooting

### Common Issues

1. **JWT Verification Fails**
   - Check `CLERK_JWT_PUBLIC_KEY` is correct
   - Verify JWT template in Clerk dashboard

2. **User Not Created in Database**
   - Check MongoDB connection
   - Verify authentication middleware is working

3. **Protected Routes Not Working**
   - Check middleware configuration
   - Verify Clerk provider is wrapping the app

4. **Styling Issues**
   - Check Clerk appearance configuration
   - Verify CSS classes are applied correctly

### Debug Commands

```bash
# Check if backend is running
curl http://localhost:3001/health

# Check MongoDB connection
# Look for "MongoDB connected successfully" in logs

# Check frontend authentication
# Open browser dev tools and check for Clerk errors
```

## Files Created/Modified

### Frontend
- `src/app/layout.tsx` - Added ClerkProvider
- `src/middleware.ts` - Added route protection
- `src/app/sign-in/[[...sign-in]]/page.tsx` - Sign-in page
- `src/app/sign-up/[[...sign-up]]/page.tsx` - Sign-up page
- `src/app/dashboard/page.tsx` - Protected dashboard
- `src/components/sections/Header.tsx` - Updated with auth

### Backend
- `models/User.ts` - User model with tier system
- `middlewares/auth.ts` - JWT verification middleware
- `routes/users.ts` - User API routes
- `index.ts` - Updated with routes and MongoDB
- `env.example` - Added Clerk JWT key

### Documentation
- `docs/TASK-1.md` - This documentation file 