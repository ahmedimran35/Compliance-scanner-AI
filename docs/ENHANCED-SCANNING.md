# Enhanced Scanning Engine

## Overview

The scanning engine has been significantly enhanced to provide users with granular control over what they want to scan. Users can now choose specific compliance categories instead of running all checks by default.

## New Features

### 1. Selective Scanning
- **GDPR & Privacy**: Cookie banners, privacy policies, data protection compliance
- **Accessibility**: WCAG compliance, alt text, keyboard navigation, screen reader support
- **Security**: HTTPS, security headers, CSP, HSTS, and other security measures
- **Performance**: Load times, page size, optimization, Core Web Vitals (Pro feature)
- **SEO**: Meta tags, structured data, sitemaps, search engine optimization (Pro feature)

### 2. Tier-Based Access
- **Free Tier**: GDPR, Accessibility, and Security scans
- **Pro Tier**: All scans including Performance and SEO analysis
- **Unlimited Scans**: Pro users get unlimited scans vs 5/month for free users

### 3. Enhanced UI
- **Scan Options Modal**: Beautiful interface to select scan categories
- **Visual Indicators**: Clear icons and colors for each scan type
- **Real-time Feedback**: Shows selected categories and scan progress
- **Pro Badges**: Clear indication of premium features

## Technical Implementation

### Frontend Changes

#### ScanOptionsModal Component
```typescript
interface ScanOptions {
  gdpr: boolean;
  accessibility: boolean;
  security: boolean;
  performance: boolean;
  seo: boolean;
  customRules: string[];
}
```

#### Enhanced Project Detail Page
- Added scan options modal integration
- Shows scan categories in history table
- User tier detection and display
- Improved scan button with settings icon

### Backend Changes

#### Enhanced Scanner Service
- Conditional scanning based on selected options
- Improved scoring algorithm for partial scans
- Better error handling and logging
- Realistic scan timing with delays

#### New API Endpoints
- `GET /api/user/profile` - Get user tier information
- `PATCH /api/user/tier` - Update user tier (for testing)

#### Scan Results Structure
```typescript
interface ScanResult {
  gdpr: { score: number; issues: string[]; recommendations: string[] };
  accessibility: { score: number; issues: string[]; recommendations: string[] };
  security: { score: number; issues: string[]; recommendations: string[] };
  performance?: { score: number; issues: string[]; recommendations: string[] };
  seo?: { score: number; issues: string[]; recommendations: string[] };
  overall: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    totalIssues: number;
    recommendations: string[];
    priorityIssues: string[];
  };
  scanDuration: number;
}
```

## User Experience

### Scan Workflow
1. **Click Scan Button**: Users click the settings icon next to any URL
2. **Select Categories**: Choose which compliance areas to scan
3. **Review Options**: See what's included and any Pro requirements
4. **Start Scan**: Begin the scanning process with selected options
5. **Monitor Progress**: Real-time updates on scan status
6. **View Results**: Detailed breakdown by category

### Visual Feedback
- **Color-coded Categories**: Each scan type has its own color
- **Pro Indicators**: Crown icons for premium features
- **Selection Count**: Shows how many categories are selected
- **Progress Indicators**: Loading states and completion feedback

## Benefits

### For Users
- **Faster Scans**: Only scan what you need
- **Cost Control**: Free users can focus on essential compliance
- **Better Insights**: Targeted results for specific areas
- **Flexible Workflows**: Customize scanning based on priorities

### For Business
- **Tier Differentiation**: Clear value proposition for Pro features
- **Reduced Load**: More efficient resource usage
- **Better UX**: Intuitive and engaging interface
- **Scalability**: Easier to add new scan categories

## Future Enhancements

### Planned Features
1. **Custom Rules**: User-defined compliance checks
2. **Scan Templates**: Predefined scan configurations
3. **Batch Scanning**: Scan multiple URLs with same options
4. **Advanced Analytics**: Detailed performance metrics
5. **Integration APIs**: Connect with external compliance tools

### Technical Improvements
1. **Caching**: Store scan results for faster re-scans
2. **Parallel Processing**: Run multiple checks simultaneously
3. **Webhook Support**: Notify external systems of scan completion
4. **Export Options**: PDF reports and data exports

## Testing

### Manual Testing
1. Create a new project and add URLs
2. Test scan options modal with different user tiers
3. Verify scan results show correct categories
4. Check that Pro features are properly restricted

### API Testing
```bash
# Test user profile endpoint
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/user/profile

# Test scan with options
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"scanOptions":{"gdpr":true,"accessibility":true}}' \
  http://localhost:3001/api/scans/<urlId>
```

## Configuration

### Environment Variables
```env
# User tier configuration
DEFAULT_USER_TIER=free
PRO_FEATURES_ENABLED=true

# Scan limits
FREE_TIER_SCAN_LIMIT=5
PRO_TIER_SCAN_LIMIT=unlimited
```

### Database Schema Updates
The scan collection now includes:
- `scanOptions`: Object containing selected scan categories
- Enhanced results structure with optional performance and SEO data
- Better indexing for faster queries

## Conclusion

The enhanced scanning engine provides a much more flexible and user-friendly experience. Users can now focus on specific compliance areas, making the tool more practical for different use cases while maintaining clear value differentiation between free and Pro tiers. 