# Task 0: MVP Project Structure Setup

## Overview

This task establishes the foundational structure for **ComplianceScanner AI**, a SaaS product that provides AI-powered website compliance scanning. The MVP includes a modern, responsive landing page and a basic backend API with MongoDB integration.

## Project Structure

```
/compliance-saas
├── /frontend                    # Next.js 14 + TypeScript frontend
│   ├── /src
│   │   ├── /app                # Next.js App Router
│   │   │   ├── layout.tsx      # Root layout with Inter font
│   │   │   ├── page.tsx        # Main landing page
│   │   │   └── globals.css     # Global styles
│   │   └── /components
│   │       ├── /ui             # Reusable UI components
│   │       │   └── Button.tsx  # Custom button component
│   │       └── /sections       # Page sections
│   │           ├── Hero.tsx    # Hero section with CTA
│   │           ├── Features.tsx # Features showcase
│   │           ├── Pricing.tsx # Pricing table
│   │           └── Footer.tsx  # Footer with legal links
│   ├── tailwind.config.ts      # TailwindCSS configuration
│   └── package.json            # Frontend dependencies
├── /backend                    # Node.js + Express backend
│   ├── index.ts               # Main server file
│   ├── tsconfig.json          # TypeScript configuration
│   ├── package.json           # Backend dependencies
│   └── env.example            # Environment variables template
└── /docs
    └── TASK-0.md              # This documentation file
```

## Commands

### Frontend Development
```bash
cd frontend
npm install                    # Install dependencies
npm run dev                    # Start development server (http://localhost:3000)
npm run build                  # Build for production
npm run start                  # Start production server
```

### Backend Development
```bash
cd backend
npm install                    # Install dependencies
cp env.example .env            # Copy environment template
# Edit .env with your actual values
npm run dev                    # Start development server (http://localhost:3001)
npm run build                  # Build TypeScript
npm start                      # Start production server
```

### Health Check
```bash
curl http://localhost:3001/health
# Expected response: {"status":"ok"}
```

## Libraries Used

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icon library
- **Inter Font**: Google Fonts integration

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **TypeScript**: Type-safe JavaScript
- **Mongoose**: MongoDB ODM
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## UI Design Notes

### Color Palette
- **Primary**: #1E40AF (Blue)
- **Secondary**: #22D3EE (Cyan)
- **Neutral**: #F9FAFB, #374151, #6B7280 (Grays)
- **Error**: #EF4444 (Red)
- **Success**: #10B981 (Green)

### Typography
- **Font Family**: Inter (Roboto fallback)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Design Principles
- Modern SaaS aesthetic with rounded corners
- Smooth hover effects and transitions
- Subtle shadows and gradients
- Responsive design for all screen sizes
- Accessibility-first approach

### Landing Page Sections

#### 1. Hero Section
- Gradient background with animated floating shapes
- Large headline: "AI-Powered Website Compliance Scanner"
- Subtext: "Scan, analyze, and stay compliant — instantly."
- Two CTA buttons: "Start Free" (primary), "View Pricing" (secondary)
- Trust indicators: "No credit card required", "Setup in 2 minutes", "Free forever plan"

#### 2. Features Section
- Three feature cards with icons:
  - **AI-Powered Analysis**: Advanced AI algorithms for compliance scanning
  - **Instant Results**: Real-time scanning with detailed insights
  - **Detailed Reports**: Actionable insights with prioritized recommendations

#### 3. Pricing Section
- Two-tier pricing structure:
  - **Free Plan**: $0/month
    - 1 project, 5 URLs/project, 5 scans/month
    - Basic AI analysis, email support
    - Limitations: No scheduling, no API access, limited reports
  - **Pro Plan**: $29/month
    - Unlimited everything
    - Full AI insights, scheduling, API access
    - Priority support, advanced reports, team collaboration

#### 4. Footer
- Company information and social links
- Product and company navigation
- Legal links: Privacy Policy, Terms of Service, Cookie Policy, GDPR, Accessibility

## Backend API

### Health Endpoint
- **URL**: `GET /health`
- **Response**: `{"status": "ok"}`
- **Purpose**: Basic health check for monitoring

### Database Connection
- **MongoDB Atlas**: Cloud-hosted MongoDB
- **Connection**: Configured via `MONGODB_URI` environment variable
- **Error Handling**: Graceful connection failure handling

### Environment Variables
- `MONGODB_URI`: MongoDB Atlas connection string
- `OPENROUTER_API_KEY`: AI API key for compliance analysis
- `STRIPE_KEY`: Payment processing
- `CLERK_KEY`: Authentication service
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

## Next Steps

1. **Authentication**: Implement user registration/login
2. **Dashboard**: Create user dashboard for project management
3. **Scanner**: Build the core compliance scanning functionality
4. **Reports**: Develop detailed compliance reporting system
5. **Payments**: Integrate Stripe for subscription management
6. **API**: Expand backend API for full functionality

## Development Notes

- All components are fully responsive
- Animations use Framer Motion for smooth interactions
- TypeScript ensures type safety across the application
- TailwindCSS provides consistent styling and responsive design
- Backend is ready for MongoDB Atlas connection
- Health endpoint is functional for monitoring 