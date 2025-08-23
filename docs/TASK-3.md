# Task 3: Core Website Scanning Functionality

## Overview
This document outlines the implementation of core website scanning functionality for the ComplianceScanner AI application. The system provides automated compliance checks for websites including GDPR, accessibility, security, performance, and SEO analysis.

## Scan Architecture

### 1. System Components

#### Backend Components
- **Express.js Server**: Main API server handling scan requests
- **MongoDB Database**: Stores scan results, projects, URLs, and user data
- **WebsiteScanner Service**: Core scanning engine using JSDOM and axios
- **Authentication Middleware**: Clerk-based JWT token verification
- **Rate Limiting**: Tier-based scan limits (Free: 5/month, Pro: Unlimited)

#### Frontend Components
- **Next.js Application**: React-based frontend with TypeScript
- **Project Detail Page**: Main interface for managing URLs and scans
- **Real-time Updates**: Polling mechanism for scan status updates
- **Scan History Table**: Displays scan results and statistics

### 2. Database Schema

#### Scan Collection
```typescript
interface IScan {
  urlId: ObjectId;           // Reference to URL
  projectId: ObjectId;       // Reference to Project
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  scanOptions: {
    gdpr: boolean;
    accessibility: boolean;
    security: boolean;
    performance: boolean;
    seo: boolean;
    customRules: string[];
  };
  results: {
    gdpr: { score: number; issues: string[]; recommendations: string[]; };
    accessibility: { score: number; issues: string[]; recommendations: string[]; };
    security: { score: number; issues: string[]; recommendations: string[]; };
    performance: { score: number; issues: string[]; recommendations: string[]; };
    seo: { score: number; issues: string[]; recommendations: string[]; };
    overall: { score: number; grade: 'A'|'B'|'C'|'D'|'F'; totalIssues: number; };
  };
  scanDuration: number;      // milliseconds
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. API Endpoints

#### Scan Management
- `POST /api/scans/:urlId` - Start a new scan
- `GET /api/scans/:scanId` - Get scan results
- `GET /api/scans/project/:projectId` - Get project scan history
- `GET /api/scans/url/:urlId` - Get URL scan history

#### Request/Response Examples

**Start Scan Request:**
```json
POST /api/scans/64f8a1b2c3d4e5f6a7b8c9d0
{
  "scanOptions": {
    "gdpr": true,
    "accessibility": true,
    "security": true,
    "performance": false,
    "seo": false
  }
}
```

**Scan Response:**
```json
{
  "message": "Scan started successfully",
  "scan": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "status": "pending",
    "scanOptions": { ... },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 4. Scanning Engine

#### WebsiteScanner Class
The core scanning functionality is implemented in the `WebsiteScanner` class:

```typescript
class WebsiteScanner {
  private url: string;
  private html: string;
  private dom: JSDOM;
  private responseHeaders: any;
  private loadTime: number;
  private pageSize: number;

  async scan(options: ScanOptions): Promise<ScanResult>
}
```

#### Compliance Checks

**GDPR Compliance:**
- Cookie banner detection
- Privacy policy presence
- Terms of service links
- Data processing notices
- Cookie policy
- Data retention policy
- User consent mechanisms
- Data portability options
- Right to erasure

**Accessibility:**
- Alt text for images
- Proper heading structure
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- Skip navigation links
- ARIA labels
- Semantic HTML usage

**Security:**
- HTTPS implementation
- Security headers (CSP, HSTS, X-Frame-Options)
- Content Security Policy
- HTTP Strict Transport Security
- X-Content-Type-Options
- Referrer Policy
- Permissions Policy

**Performance (Pro Tier):**
- Page load time
- Page size optimization
- Image optimization
- Resource minification
- Compression usage
- Caching headers
- CDN implementation

**SEO (Pro Tier):**
- Meta title presence
- Meta description
- Open Graph tags
- Twitter Card tags
- Structured data
- Sitemap availability
- Robots.txt presence
- Canonical URLs
- Internal linking

## Data Flow Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │   Database  │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │ 1. User clicks    │                   │
       │ "Run Scan"        │                   │
       │                   │                   │
       ▼                   │                   │
┌─────────────┐            │                   │
│  POST /api/ │───────────►│                   │
│ scans/:urlId│            │                   │
└─────────────┘            │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │ Validate    │            │
       │            │ User & URL  │            │
       │            └─────────────┘            │
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │ Check Tier  │            │
       │            │ Limits      │            │
       │            └─────────────┘            │
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │ Create Scan │───────────►│
       │            │ Record      │            │
       │            └─────────────┘            │
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │ Start Async │            │
       │            │ Scan        │            │
       │            └─────────────┘            │
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │ Fetch HTML  │            │
       │            │ Content     │            │
       │            └─────────────┘            │
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │ Parse HTML  │            │
       │            │ with JSDOM  │            │
       │            └─────────────┘            │
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │ Run         │            │
       │            │ Compliance  │            │
       │            │ Checks      │            │
       │            └─────────────┘            │
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │ Calculate   │            │
       │            │ Scores &    │            │
       │            │ Grades      │            │
       │            └─────────────┘            │
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │ Update Scan │───────────►│
       │            │ Results     │            │
       │            └─────────────┘            │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Poll for    │    │ Scan        │    │ Results     │
│ Status      │    │ Complete    │    │ Stored      │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Update UI   │    │ Log         │    │ Available   │
│ with Results│    │ Completion  │    │ for Query   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Implementation Details

### 1. Tier-Based Limitations

**Free Tier:**
- Maximum 5 scans per month
- Basic compliance checks (GDPR, Accessibility, Security)
- No performance or SEO scanning

**Pro Tier:**
- Unlimited scans
- All compliance checks including Performance and SEO
- Priority support

### 2. Real-time Updates

The frontend implements a polling mechanism to provide real-time scan status updates:

```typescript
const pollScanStatus = async (scanId: string) => {
  const poll = async () => {
    const response = await fetch(`/api/scans/${scanId}`);
    const scan = await response.json();
    
    setScans(prev => prev.map(s => s._id === scanId ? scan : s));
    
    if (scan.status === 'pending' || scan.status === 'scanning') {
      setTimeout(poll, 2000); // Poll every 2 seconds
    }
  };
  
  poll();
};
```

### 3. Error Handling

The system includes comprehensive error handling:

- **Network Errors**: Retry mechanisms and user-friendly error messages
- **Authentication Errors**: Automatic redirect to sign-in
- **Rate Limiting**: Clear messaging about tier limitations
- **Scan Failures**: Detailed error logging and user notification

### 4. Performance Optimizations

- **Async Processing**: Scans run in background to prevent UI blocking
- **Database Indexing**: Optimized queries for scan history
- **Caching**: Scan results cached to prevent duplicate processing
- **Connection Pooling**: Efficient database connections

## Security Considerations

1. **Authentication**: All scan endpoints require valid JWT tokens
2. **Authorization**: Users can only access their own projects and scans
3. **Input Validation**: URL validation and sanitization
4. **Rate Limiting**: Prevents abuse and ensures fair usage
5. **Error Handling**: No sensitive information leaked in error messages

## Monitoring and Logging

- **Scan Duration Tracking**: Performance monitoring
- **Error Logging**: Comprehensive error tracking
- **Usage Analytics**: Track scan patterns and usage
- **Health Checks**: API endpoint monitoring

## Future Enhancements

1. **Batch Scanning**: Scan multiple URLs simultaneously
2. **Scheduled Scans**: Automated periodic compliance checks
3. **Custom Rules**: User-defined compliance rules
4. **Integration APIs**: Webhook support for external systems
5. **Advanced Analytics**: Detailed compliance trend analysis 