import mongoose, { Document } from 'mongoose';
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
    scanDuration: number;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IScan, {}, {}, {}, mongoose.Document<unknown, {}, IScan, {}, {}> & IScan & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Scan.d.ts.map