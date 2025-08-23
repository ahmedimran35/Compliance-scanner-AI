import mongoose, { Document, Schema } from 'mongoose';

export interface IScan extends Document {
  urlId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
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
    gdpr: {
      hasCookieBanner: boolean;
      hasPrivacyPolicy: boolean;
      hasTermsOfService: boolean;
      hasDataProcessingNotice: boolean;
      hasCookiePolicy: boolean;
      hasDataRetentionPolicy: boolean;
      hasUserConsentMechanism: boolean;
      hasDataPortability: boolean;
      hasRightToErasure: boolean;
      hasDataMinimization: boolean;
      hasPurposeLimitation: boolean;
      hasLawfulBasis: boolean;
      score: number;
      issues: string[];
      recommendations: string[];
      complianceLevel: 'compliant' | 'partially-compliant' | 'non-compliant';
    };
    accessibility: {
      hasAltText: boolean;
      hasProperHeadings: boolean;
      hasContrastRatio: boolean;
      hasKeyboardNavigation: boolean;
      hasScreenReaderSupport: boolean;
      hasFocusIndicators: boolean;
      hasSkipLinks: boolean;
      hasARIALabels: boolean;
      hasSemanticHTML: boolean;
      hasFormLabels: boolean;
      hasLanguageDeclaration: boolean;
      hasErrorHandling: boolean;
      score: number;
      issues: string[];
      recommendations: string[];
      wcagLevel: 'A' | 'AA' | 'AAA' | 'non-compliant';
    };
    security: {
      hasHTTPS: boolean;
      hasSecurityHeaders: boolean;
      hasCSP: boolean;
      hasHSTS: boolean;
      hasXFrameOptions: boolean;
      hasXContentTypeOptions: boolean;
      hasReferrerPolicy: boolean;
      hasPermissionsPolicy: boolean;
      hasSecureCookies: boolean;
      hasCSRFProtection: boolean;
      hasInputValidation: boolean;
      hasOutputEncoding: boolean;
      hasSessionManagement: boolean;
      hasErrorHandling: boolean;
      score: number;
      issues: string[];
      recommendations: string[];
      securityLevel: 'high' | 'medium' | 'low' | 'critical';
    };
    performance: {
      loadTime: number;
      pageSize: number;
      imageOptimization: boolean;
      minification: boolean;
      compression: boolean;
      caching: boolean;
      cdnUsage: boolean;
      renderBlockingResources: number;
      unusedCSS: number;
      unusedJS: number;
      firstContentfulPaint: number;
      largestContentfulPaint: number;
      cumulativeLayoutShift: number;
      firstInputDelay: number;
      score: number;
      issues: string[];
      recommendations: string[];
      performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    };
    seo: {
      hasMetaTitle: boolean;
      hasMetaDescription: boolean;
      hasOpenGraph: boolean;
      hasTwitterCard: boolean;
      hasStructuredData: boolean;
      hasSitemap: boolean;
      hasRobotsTxt: boolean;
      hasCanonicalUrl: boolean;
      hasInternalLinking: boolean;
      hasHeadingStructure: boolean;
      hasImageOptimization: boolean;
      hasMobileOptimization: boolean;
      hasPageSpeed: boolean;
      hasSSL: boolean;
      score: number;
      issues: string[];
      recommendations: string[];
      seoScore: number;
    };
    overall: {
      score: number;
      grade: 'A' | 'B' | 'C' | 'D' | 'F';
      totalIssues: number;
      recommendations: string[];
      priorityIssues: string[];
      complianceStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    };
    technicalDetails?: {
      serverInfo: string;
      technologies: string[];
      frameworks: string[];
      cms: string | null;
      hosting: string | null;
    };
  };
  scanDuration: number; // in milliseconds
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScanSchema = new Schema<IScan>({
  urlId: {
    type: Schema.Types.ObjectId,
    ref: 'URL',
    required: true,
    index: true,
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'scanning', 'completed', 'failed'],
    default: 'pending',
  },
  scanOptions: {
    gdpr: { type: Boolean, default: true },
    accessibility: { type: Boolean, default: true },
    security: { type: Boolean, default: true },
    performance: { type: Boolean, default: false },
    seo: { type: Boolean, default: false },
    customRules: [{ type: String }],
  },
  results: {
    gdpr: {
      hasCookieBanner: { type: Boolean, default: false },
      hasPrivacyPolicy: { type: Boolean, default: false },
      hasTermsOfService: { type: Boolean, default: false },
      hasDataProcessingNotice: { type: Boolean, default: false },
      hasCookiePolicy: { type: Boolean, default: false },
      hasDataRetentionPolicy: { type: Boolean, default: false },
      hasUserConsentMechanism: { type: Boolean, default: false },
      hasDataPortability: { type: Boolean, default: false },
      hasRightToErasure: { type: Boolean, default: false },
      hasDataMinimization: { type: Boolean, default: false },
      hasPurposeLimitation: { type: Boolean, default: false },
      hasLawfulBasis: { type: Boolean, default: false },
      score: { type: Number, min: 0, max: 100, default: 0 },
      issues: [{ type: String }],
      recommendations: [{ type: String }],
      complianceLevel: { type: String, enum: ['compliant', 'partially-compliant', 'non-compliant'], default: 'non-compliant' },
    },
    accessibility: {
      hasAltText: { type: Boolean, default: false },
      hasProperHeadings: { type: Boolean, default: false },
      hasContrastRatio: { type: Boolean, default: false },
      hasKeyboardNavigation: { type: Boolean, default: false },
      hasScreenReaderSupport: { type: Boolean, default: false },
      hasFocusIndicators: { type: Boolean, default: false },
      hasSkipLinks: { type: Boolean, default: false },
      hasARIALabels: { type: Boolean, default: false },
      hasSemanticHTML: { type: Boolean, default: false },
      hasFormLabels: { type: Boolean, default: false },
      hasLanguageDeclaration: { type: Boolean, default: false },
      hasErrorHandling: { type: Boolean, default: false },
      score: { type: Number, min: 0, max: 100, default: 0 },
      issues: [{ type: String }],
      recommendations: [{ type: String }],
      wcagLevel: { type: String, enum: ['A', 'AA', 'AAA', 'non-compliant'], default: 'non-compliant' },
    },
    security: {
      hasHTTPS: { type: Boolean, default: false },
      hasSecurityHeaders: { type: Boolean, default: false },
      hasCSP: { type: Boolean, default: false },
      hasHSTS: { type: Boolean, default: false },
      hasXFrameOptions: { type: Boolean, default: false },
      hasXContentTypeOptions: { type: Boolean, default: false },
      hasReferrerPolicy: { type: Boolean, default: false },
      hasPermissionsPolicy: { type: Boolean, default: false },
      hasSecureCookies: { type: Boolean, default: false },
      hasCSRFProtection: { type: Boolean, default: false },
      hasInputValidation: { type: Boolean, default: false },
      hasOutputEncoding: { type: Boolean, default: false },
      hasSessionManagement: { type: Boolean, default: false },
      hasErrorHandling: { type: Boolean, default: false },
      score: { type: Number, min: 0, max: 100, default: 0 },
      issues: [{ type: String }],
      recommendations: [{ type: String }],
      securityLevel: { type: String, enum: ['high', 'medium', 'low', 'critical'], default: 'critical' },
    },
    performance: {
      loadTime: { type: Number, default: 0 },
      pageSize: { type: Number, default: 0 },
      imageOptimization: { type: Boolean, default: false },
      minification: { type: Boolean, default: false },
      compression: { type: Boolean, default: false },
      caching: { type: Boolean, default: false },
      cdnUsage: { type: Boolean, default: false },
      renderBlockingResources: { type: Number, default: 0 },
      unusedCSS: { type: Number, default: 0 },
      unusedJS: { type: Number, default: 0 },
      firstContentfulPaint: { type: Number, default: 0 },
      largestContentfulPaint: { type: Number, default: 0 },
      cumulativeLayoutShift: { type: Number, default: 0 },
      firstInputDelay: { type: Number, default: 0 },
      score: { type: Number, min: 0, max: 100, default: 0 },
      issues: [{ type: String }],
      recommendations: [{ type: String }],
      performanceGrade: { type: String, enum: ['A', 'B', 'C', 'D', 'F'], default: 'F' },
    },
    seo: {
      hasMetaTitle: { type: Boolean, default: false },
      hasMetaDescription: { type: Boolean, default: false },
      hasOpenGraph: { type: Boolean, default: false },
      hasTwitterCard: { type: Boolean, default: false },
      hasStructuredData: { type: Boolean, default: false },
      hasSitemap: { type: Boolean, default: false },
      hasRobotsTxt: { type: Boolean, default: false },
      hasCanonicalUrl: { type: Boolean, default: false },
      hasInternalLinking: { type: Boolean, default: false },
      hasHeadingStructure: { type: Boolean, default: false },
      hasImageOptimization: { type: Boolean, default: false },
      hasMobileOptimization: { type: Boolean, default: false },
      hasPageSpeed: { type: Boolean, default: false },
      hasSSL: { type: Boolean, default: false },
      score: { type: Number, min: 0, max: 100, default: 0 },
      issues: [{ type: String }],
      recommendations: [{ type: String }],
      seoScore: { type: Number, min: 0, max: 100, default: 0 },
    },
    overall: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      grade: { type: String, enum: ['A', 'B', 'C', 'D', 'F'], default: 'F' },
      totalIssues: { type: Number, default: 0 },
      recommendations: [{ type: String }],
      priorityIssues: [{ type: String }],
      complianceStatus: { type: String, enum: ['excellent', 'good', 'fair', 'poor', 'critical'], default: 'critical' },
    },
    technicalDetails: {
      serverInfo: { type: String, default: '' },
      technologies: [{ type: String }],
      frameworks: [{ type: String }],
      cms: { type: String, default: null },
      hosting: { type: String, default: null },
    },
  },
  scanDuration: {
    type: Number,
    default: 0,
  },
  errorMessage: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
ScanSchema.index({ urlId: 1, createdAt: -1 });
ScanSchema.index({ projectId: 1, createdAt: -1 });
ScanSchema.index({ status: 1, createdAt: -1 });
ScanSchema.index({ 'scanOptions.gdpr': 1 });
ScanSchema.index({ 'scanOptions.accessibility': 1 });
ScanSchema.index({ 'scanOptions.security': 1 });

export default mongoose.model<IScan>('Scan', ScanSchema); 