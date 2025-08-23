# ComplianceScanner AI

AI-powered website compliance scanner that helps businesses stay compliant with accessibility, security, and regulatory requirements.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd compliance-saas
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your actual values
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

## 🏗️ Project Structure

```
/compliance-saas
├── /frontend          # Next.js 14 + TypeScript frontend
├── /backend           # Node.js + Express + TypeScript backend
└── /docs              # Project documentation
```

## 🎨 Features

### Landing Page
- **Hero Section**: Compelling headline with animated floating shapes
- **Features**: Three key feature cards with icons
- **Pricing**: Two-tier pricing (Free vs Pro)
- **Footer**: Legal links and company information

### Backend API
- **Health Endpoint**: Basic health check for monitoring
- **MongoDB Integration**: Ready for database connection
- **TypeScript**: Full type safety
- **Environment Configuration**: Secure variable management

## 💰 Pricing Tiers

### Free Plan
- 1 project
- 5 URLs per project
- 5 scans per month
- Basic AI analysis
- Email support

### Pro Plan ($29/month)
- Unlimited projects
- Unlimited URLs
- Unlimited scans
- Full AI insights
- Scheduling & automation
- API access
- Priority support

## 🛠️ Tech Stack

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

## 🎯 Design System

### Colors
- **Primary**: #1E40AF (Blue)
- **Secondary**: #22D3EE (Cyan)
- **Neutral**: #F9FAFB, #374151, #6B7280 (Grays)
- **Error**: #EF4444 (Red)
- **Success**: #10B981 (Green)

### Typography
- **Font**: Inter (Roboto fallback)
- **Weights**: 400, 500, 600, 700

## 📚 Documentation

- [Task 0 Documentation](./docs/TASK-0.md) - Detailed setup and implementation guide

## 🔧 Development

### Frontend Commands
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
```

### Backend Commands
```bash
cd backend
npm run dev      # Start development server
npm run build    # Build TypeScript
npm start        # Start production server
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/compliance-scanner

# API Keys
OPENROUTER_API_KEY=your_openrouter_api_key_here
STRIPE_KEY=your_stripe_secret_key_here
CLERK_KEY=your_clerk_secret_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Configure build command: `npm run build`
4. Set start command: `npm start`

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, email support@compliancescanner.ai or create an issue in this repository. 