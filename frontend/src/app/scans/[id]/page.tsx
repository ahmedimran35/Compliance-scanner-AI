"use client";

import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Eye,
  TrendingUp,
  TrendingDown,
  Info,
  AlertTriangle,
  Check,
  X,
  FileText,
  Accessibility,
  Lock,
  Zap,
  Settings,
  Globe,
  ExternalLink,
  Copy,
  Star,
  Search,
  MapPin,
  ShoppingCart
} from 'lucide-react';
import Layout from '@/components/Layout';
import { getApiUrl } from '@/config/api';

interface ScanResult {
  _id: string;
  urlId: string;
  projectId: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  scanOptions: {
    gdpr: boolean;
    accessibility: boolean;
    security: boolean;
    performance: boolean;
    seo: boolean;
    customRules: string[];
  };
  results?: {
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
    technicalDetails: {
      serverInfo: string;
      technologies: string[];
      frameworks: string[];
      cms: string | null;
      hosting: string | null;
    };
  };
  scanDuration: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface URL {
  _id: string;
  url: string;
  name?: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  lastScanned?: string;
  createdAt: string;
}

export default function ScanDetailPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const scanId = params.id as string;

  const [scan, setScan] = useState<ScanResult | null>(null);
  const [url, setUrl] = useState<URL | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchScanDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();

      if (!token) {
        setError('Authentication token not available. Please sign in again.');
        return;
      }

      const apiUrl = getApiUrl();
      
      const response = await fetch(`${apiUrl}/api/scans/${scanId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 404) {
          setError(`Scan with ID "${scanId}" not found. Please check the URL and try again.`);
        } else if (response.status === 401) {
          setError('Authentication failed. Please sign in again.');
        } else if (response.status === 500) {
          setError('Server error. Please try again later or contact support.');
        } else if (response.status === 0 || response.status === 503) {
          setError('Backend server is not available. Please make sure the backend is running on port 3001.');
        } else {
          setError(`Failed to fetch scan: ${errorData.error || response.statusText} (Status: ${response.status})`);
        }
        return;
      }

      const data = await response.json();
      
      // Backend returns scan data directly, not wrapped in 'scan' property
      if (!data._id) {
        setError('Invalid scan data received from server. No scan ID found.');
        return;
      }
      
      // Check if scan has basic required fields
      if (!data.status) {
        setError('Invalid scan data received from server. Missing status information.');
        return;
      }
      
      // Check if scan is completed but has no results
      if (data.status === 'completed' && !data.results) {
        setError('Scan completed but no results were found. This might be a data corruption issue.');
        return;
      }
      
      setScan(data);
      // urlId is populated from backend, so extract the URL data
      if (data.urlId && typeof data.urlId === 'object') {
        setUrl(data.urlId);
      } else {
        setUrl(null);
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error: Backend server is not available. Please make sure the backend is running on port 3001.');
      } else {
        setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}. Please check your connection and try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchScanDetails();
    }
  }, [isLoaded, user, scanId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'scanning':
        return <Clock className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'scanning':
        return 'Scanning';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-700 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'F': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getComplianceColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'gdpr', label: 'GDPR', icon: FileText, enabled: scan?.scanOptions?.gdpr },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility, enabled: scan?.scanOptions?.accessibility },
    { id: 'security', label: 'Security', icon: Lock, enabled: scan?.scanOptions?.security },
    { id: 'performance', label: 'Performance', icon: Zap, enabled: scan?.scanOptions?.performance },
    { id: 'seo', label: 'SEO', icon: BarChart3, enabled: scan?.scanOptions?.seo },
    { id: 'technical', label: 'Technical', icon: Settings, enabled: scan?.results?.technicalDetails },
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-slate-600 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-slate-600 text-xl">Redirecting to sign in...</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-slate-600 space-y-2">
                <p className="text-lg font-medium">Loading comprehensive scan details...</p>
                <p className="text-sm">Scan ID: {scanId}</p>
                <p className="text-sm">Please wait while we fetch the scan results.</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <h2 className="text-xl font-semibold text-red-800">Unable to Load Scan Details</h2>
                </div>
                <p className="text-red-700 mb-6">{error}</p>
                
                <div className="bg-white rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Debug Information:</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Scan ID:</strong> {scanId}</p>
                    <p><strong>API URL:</strong> {getApiUrl()}</p>
                    <p><strong>User:</strong> {user?.emailAddresses[0]?.emailAddress}</p>
                    <p><strong>Error:</strong> {error}</p>
                    <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => fetchScanDetails()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push('/reports')}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Back to Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : scan ? (
          <div className="space-y-8">
            {/* Scan Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    {getStatusIcon(scan.status)}
                    <h1 className="text-3xl font-bold text-slate-900">Comprehensive Scan Results</h1>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
                      scan.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                      scan.status === 'scanning' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      scan.status === 'failed' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {getStatusText(scan.status)}
                    </span>
                  </div>
                  
                  {url && (
                    <div className="flex items-center space-x-2 mb-6">
                      <Globe className="w-5 h-5 text-slate-500" />
                      <span className="text-slate-600 font-medium">Scanned URL:</span>
                      <a 
                        href={url.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 underline"
                      >
                        <span>{url.url}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => copyToClipboard(url.url)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {scan.results?.overall && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Overall Score</span>
                      </div>
                        <div className="text-2xl font-bold text-blue-900">{scan.results.overall.score}%</div>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getGradeColor(scan.results.overall.grade)}`}>
                          Grade {scan.results.overall.grade}
                    </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-700">Status</span>
                    </div>
                        <div className="text-2xl font-bold text-green-900 capitalize">{scan.results.overall.complianceStatus}</div>
                        <div className="text-xs text-green-600">Compliance Level</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-medium text-red-700">Issues Found</span>
                    </div>
                        <div className="text-2xl font-bold text-red-900">{scan.results.overall.totalIssues}</div>
                        <div className="text-xs text-red-600">Total Issues</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-700">Scan Duration</span>
                    </div>
                        <div className="text-2xl font-bold text-purple-900">{formatDuration(scan.scanDuration)}</div>
                        <div className="text-xs text-purple-600">Processing Time</div>
                  </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Navigation Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden"
            >
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      disabled={!tab.enabled}
                      className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                      } ${!tab.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Tab Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-6"
            >
              {/* Overview Tab */}
              {activeTab === 'overview' && scan.results && (
                <div className="space-y-8">
                  {/* Overall Score Card */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-slate-900 mb-4">Overall Compliance Score</h2>
                      <div className="flex items-center justify-center space-x-8">
                        <div className="text-center">
                          <div className={`text-8xl font-bold ${getScoreColor(scan.results.overall.score)} mb-2`}>
                            {scan.results.overall.score}%
                          </div>
                          <div className="text-slate-600 text-lg">Overall Score</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-6xl font-bold px-6 py-4 rounded-2xl border-2 ${getGradeColor(scan.results.overall.grade)} mb-2`}>
                            {scan.results.overall.grade}
                          </div>
                          <div className="text-slate-600 text-lg">Grade</div>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-slate-900 mb-2">
                            {scan.results.overall.totalIssues}
                          </div>
                          <div className="text-slate-600 text-lg">Total Issues</div>
                        </div>
                      </div>
                      <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium border mt-4 ${getComplianceColor(scan.results.overall.complianceStatus)}`}>
                        {scan.results.overall.complianceStatus.charAt(0).toUpperCase() + scan.results.overall.complianceStatus.slice(1)} Compliance
                      </div>
                    </div>
                  </div>

                  {/* Category Scores Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scan.scanOptions.gdpr && scan.results.gdpr && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <FileText className="w-6 h-6 text-blue-600" />
                          <h3 className="text-xl font-bold text-blue-900">GDPR Compliance</h3>
                        </div>
                        <div className="text-3xl font-bold text-blue-700 mb-2">{scan.results.gdpr.score}%</div>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getComplianceColor(scan.results.gdpr.complianceLevel)}`}>
                          {scan.results.gdpr.complianceLevel.replace('-', ' ')}
                        </div>
                        <div className="mt-3 text-sm text-blue-700">
                          {scan.results.gdpr.issues.length} issues found
                        </div>
                      </div>
                    )}

                    {scan.scanOptions.accessibility && scan.results.accessibility && (
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <Accessibility className="w-6 h-6 text-purple-600" />
                          <h3 className="text-xl font-bold text-purple-900">Accessibility</h3>
                        </div>
                        <div className="text-3xl font-bold text-purple-700 mb-2">{scan.results.accessibility.score}%</div>
                        <div className="inline-block px-2 py-1 rounded text-xs font-medium bg-purple-200 text-purple-700">
                          WCAG {scan.results.accessibility.wcagLevel}
                        </div>
                        <div className="mt-3 text-sm text-purple-700">
                          {scan.results.accessibility.issues.length} issues found
                        </div>
                      </div>
                    )}

                    {scan.scanOptions.security && scan.results.security && (
                      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <Lock className="w-6 h-6 text-red-600" />
                          <h3 className="text-xl font-bold text-red-900">Security</h3>
                        </div>
                        <div className="text-3xl font-bold text-red-700 mb-2">{scan.results.security.score}%</div>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getComplianceColor(scan.results.security.securityLevel)}`}>
                          {scan.results.security.securityLevel} security
                        </div>
                        <div className="mt-3 text-sm text-red-700">
                          {scan.results.security.issues.length} issues found
                        </div>
                      </div>
                    )}

                    {scan.scanOptions.performance && scan.results.performance && (
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <Zap className="w-6 h-6 text-yellow-600" />
                          <h3 className="text-xl font-bold text-yellow-900">Performance</h3>
                        </div>
                        <div className="text-3xl font-bold text-yellow-700 mb-2">{scan.results.performance.score}%</div>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getGradeColor(scan.results.performance.performanceGrade)}`}>
                          Grade {scan.results.performance.performanceGrade}
                        </div>
                        <div className="mt-3 text-sm text-yellow-700">
                          {formatDuration(scan.results.performance.loadTime)} load time
                        </div>
                      </div>
                    )}

                    {scan.scanOptions.seo && scan.results.seo && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <BarChart3 className="w-6 h-6 text-green-600" />
                          <h3 className="text-xl font-bold text-green-900">SEO</h3>
                        </div>
                        <div className="text-3xl font-bold text-green-700 mb-2">{scan.results.seo.score}%</div>
                        <div className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-200 text-green-700">
                          Score: {scan.results.seo.seoScore}/100
                        </div>
                        <div className="mt-3 text-sm text-green-700">
                          {scan.results.seo.issues.length} issues found
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Priority Issues */}
                  {scan.results.overall.priorityIssues.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        <h3 className="text-xl font-bold text-red-900">Priority Issues</h3>
                      </div>
                      <div className="space-y-2">
                        {scan.results.overall.priorityIssues.map((issue, index) => (
                          <div key={index} className="flex items-start space-x-2 text-red-700">
                            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {scan.results.overall.recommendations.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Settings className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-bold text-blue-900">Key Recommendations</h3>
                      </div>
                      <div className="space-y-2">
                        {scan.results.overall.recommendations.slice(0, 5).map((recommendation, index) => (
                          <div key={index} className="flex items-start space-x-2 text-blue-700">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* GDPR Tab */}
              {activeTab === 'gdpr' && scan.results?.gdpr && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl"
                >
                  <h2 className="text-xl font-bold text-slate-900 mb-6">GDPR Analysis</h2>
                  
                  {/* GDPR Score Overview */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200 mb-8">
                      <div className="text-center">
                      <h3 className="text-2xl font-bold text-slate-900 mb-6">Overall GDPR Compliance Score</h3>
                      <div className="flex items-center justify-center space-x-12">
                        <div className="text-center">
                          <div className={`text-8xl font-bold ${getScoreColor(scan.results.gdpr.score)} mb-2`}>
                          {scan.results.gdpr.score}%
                        </div>
                          <div className="text-slate-600 text-lg">Compliance Score</div>
                      </div>
                      <div className="text-center">
                          <div className={`text-6xl font-bold px-6 py-4 rounded-2xl border-2 ${getComplianceColor(scan.results.gdpr.complianceLevel)}`}>
                            {scan.results.gdpr.complianceLevel.replace('-', ' ').charAt(0).toUpperCase() + scan.results.gdpr.complianceLevel.replace('-', ' ').slice(1)}
                        </div>
                          <div className="text-slate-600 text-lg">Compliance Status</div>
                      </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-slate-900 mb-2">
                            {scan.results.gdpr.issues?.length || 0}
                          </div>
                          <div className="text-slate-600 text-lg">Issues Found</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consent & Transparency */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      Consent & Transparency
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Cookie Consent Banner</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.gdpr.hasCookieBanner ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.gdpr.hasCookieBanner ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">User Consent Mechanism</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.gdpr.hasUserConsentMechanism ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.gdpr.hasUserConsentMechanism ? 'Implemented' : 'Not Implemented'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Data Processing Notice</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.gdpr.hasDataProcessingNotice ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.gdpr.hasDataProcessingNotice ? 'Clear' : 'Unclear'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Purpose Limitation</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.gdpr.hasPurposeLimitation ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.gdpr.hasPurposeLimitation ? 'Stated' : 'Not Stated'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Lawful Basis</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.gdpr.hasLawfulBasis ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.gdpr.hasLawfulBasis ? 'Defined' : 'Not Defined'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Overall Transparency</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          (scan.results.gdpr.hasCookieBanner && scan.results.gdpr.hasUserConsentMechanism && 
                           scan.results.gdpr.hasDataProcessingNotice && scan.results.gdpr.hasPurposeLimitation) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {(scan.results.gdpr.hasCookieBanner && scan.results.gdpr.hasUserConsentMechanism && 
                            scan.results.gdpr.hasDataProcessingNotice && scan.results.gdpr.hasPurposeLimitation) ? 'Transparent' : 'Needs Improvement'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Policy Documentation */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 text-purple-600 mr-2" />
                      Policy Documentation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Privacy Policy</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.gdpr.hasPrivacyPolicy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.gdpr.hasPrivacyPolicy ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Terms of Service</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.gdpr.hasTermsOfService ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.gdpr.hasTermsOfService ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Cookie Policy</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.gdpr.hasCookiePolicy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.gdpr.hasCookiePolicy ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Data Retention Policy</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.gdpr.hasDataRetentionPolicy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.gdpr.hasDataRetentionPolicy ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Overall Documentation</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          (scan.results.gdpr.hasPrivacyPolicy && scan.results.gdpr.hasTermsOfService && 
                           scan.results.gdpr.hasCookiePolicy && scan.results.gdpr.hasDataRetentionPolicy) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {(scan.results.gdpr.hasPrivacyPolicy && scan.results.gdpr.hasTermsOfService && 
                            scan.results.gdpr.hasCookiePolicy && scan.results.gdpr.hasDataRetentionPolicy) ? 'Complete' : 'Incomplete'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Data Subject Rights */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Shield className="w-5 h-5 text-orange-600 mr-2" />
                      Data Subject Rights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Data Portability</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.gdpr.hasDataPortability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.gdpr.hasDataPortability ? 'Supported' : 'Not Supported'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Right to Erasure</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.gdpr.hasRightToErasure ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.gdpr.hasRightToErasure ? 'Implemented' : 'Not Implemented'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Data Minimization</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.gdpr.hasDataMinimization ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.gdpr.hasDataMinimization ? 'Practiced' : 'Not Practiced'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Overall Rights Support</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          (scan.results.gdpr.hasDataPortability && scan.results.gdpr.hasRightToErasure && 
                           scan.results.gdpr.hasDataMinimization) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {(scan.results.gdpr.hasDataPortability && scan.results.gdpr.hasRightToErasure && 
                            scan.results.gdpr.hasDataMinimization) ? 'Well Supported' : 'Limited Support'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* GDPR Assessment */}
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 text-cyan-600 mr-2" />
                      GDPR Assessment
                    </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Consent & Transparency</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              (scan.results.gdpr.hasCookieBanner && scan.results.gdpr.hasUserConsentMechanism && 
                               scan.results.gdpr.hasDataProcessingNotice) ? 'bg-green-100 text-green-700' : 
                              (scan.results.gdpr.hasCookieBanner || scan.results.gdpr.hasUserConsentMechanism) ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {(scan.results.gdpr.hasCookieBanner && scan.results.gdpr.hasUserConsentMechanism && 
                                scan.results.gdpr.hasDataProcessingNotice) ? 'Excellent' : 
                               (scan.results.gdpr.hasCookieBanner || scan.results.gdpr.hasUserConsentMechanism) ? 'Good' : 'Poor'}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">
                            {[scan.results.gdpr.hasCookieBanner, scan.results.gdpr.hasUserConsentMechanism, 
                              scan.results.gdpr.hasDataProcessingNotice, scan.results.gdpr.hasPurposeLimitation, 
                              scan.results.gdpr.hasLawfulBasis].filter(Boolean).length}/5
                        </div>
                          <div className="text-xs text-slate-500">Transparency measures implemented</div>
                      </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Policy Documentation</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              (scan.results.gdpr.hasPrivacyPolicy && scan.results.gdpr.hasTermsOfService && 
                               scan.results.gdpr.hasCookiePolicy) ? 'bg-green-100 text-green-700' : 
                              (scan.results.gdpr.hasPrivacyPolicy || scan.results.gdpr.hasTermsOfService) ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {(scan.results.gdpr.hasPrivacyPolicy && scan.results.gdpr.hasTermsOfService && 
                                scan.results.gdpr.hasCookiePolicy) ? 'Complete' : 
                               (scan.results.gdpr.hasPrivacyPolicy || scan.results.gdpr.hasTermsOfService) ? 'Partial' : 'Incomplete'}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">
                            {[scan.results.gdpr.hasPrivacyPolicy, scan.results.gdpr.hasTermsOfService, 
                              scan.results.gdpr.hasCookiePolicy, scan.results.gdpr.hasDataRetentionPolicy].filter(Boolean).length}/4
                          </div>
                          <div className="text-xs text-slate-500">Required policies present</div>
                        </div>
                  </div>

                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Data Subject Rights</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              (scan.results.gdpr.hasDataPortability && scan.results.gdpr.hasRightToErasure && 
                               scan.results.gdpr.hasDataMinimization) ? 'bg-green-100 text-green-700' : 
                              (scan.results.gdpr.hasDataPortability || scan.results.gdpr.hasRightToErasure) ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {(scan.results.gdpr.hasDataPortability && scan.results.gdpr.hasRightToErasure && 
                                scan.results.gdpr.hasDataMinimization) ? 'Well Supported' : 
                               (scan.results.gdpr.hasDataPortability || scan.results.gdpr.hasRightToErasure) ? 'Partially Supported' : 'Poorly Supported'}
                            </span>
                            </div>
                          <div className="text-2xl font-bold text-slate-900">
                            {[scan.results.gdpr.hasDataPortability, scan.results.gdpr.hasRightToErasure, 
                              scan.results.gdpr.hasDataMinimization].filter(Boolean).length}/3
                        </div>
                          <div className="text-xs text-slate-500">User rights implemented</div>
                      </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Overall Compliance</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              scan.results.gdpr.complianceLevel === 'compliant' ? 'bg-green-100 text-green-700' : 
                              scan.results.gdpr.complianceLevel === 'partially-compliant' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {scan.results.gdpr.complianceLevel === 'compliant' ? 'Compliant' : 
                               scan.results.gdpr.complianceLevel === 'partially-compliant' ? 'Partially Compliant' : 'Non-Compliant'}
                            </span>
                            </div>
                          <div className="text-2xl font-bold text-slate-900">
                            {scan.results.gdpr.score}%
                        </div>
                          <div className="text-xs text-slate-500">GDPR compliance score</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* GDPR Recommendations */}
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Star className="w-5 h-5 text-yellow-600 mr-2" />
                      GDPR Recommendations
                    </h3>
                    <div className="space-y-3">
                      {scan.results.gdpr.recommendations && scan.results.gdpr.recommendations.length > 0 ? (
                        scan.results.gdpr.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-slate-700 text-sm">{rec}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-slate-500 text-lg mb-2">🔒 Excellent GDPR Compliance!</div>
                          <div className="text-slate-400 text-sm">No major GDPR issues found. Your website is compliant with data protection regulations.</div>
                      </div>
                    )}
                  </div>
                </div>
                </motion.div>
              )}

              {/* Accessibility Tab */}
              {activeTab === 'accessibility' && scan.results?.accessibility && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl"
                >
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Accessibility Analysis</h2>
                  
                  {/* Accessibility Score Overview */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200 mb-8">
                      <div className="text-center">
                      <h3 className="text-2xl font-bold text-slate-900 mb-6">Overall Accessibility Score</h3>
                      <div className="flex items-center justify-center space-x-12">
                        <div className="text-center">
                          <div className={`text-8xl font-bold ${getScoreColor(scan.results.accessibility.score)} mb-2`}>
                          {scan.results.accessibility.score}%
                        </div>
                          <div className="text-slate-600 text-lg">Accessibility Score</div>
                      </div>
                        <div className="text-center">
                          <div className={`text-6xl font-bold px-6 py-4 rounded-2xl border-2 ${getComplianceColor(scan.results.accessibility.wcagLevel)}`}>
                            WCAG {scan.results.accessibility.wcagLevel}
                        </div>
                          <div className="text-slate-600 text-lg">Compliance Level</div>
                      </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-slate-900 mb-2">
                            {scan.results.accessibility.issues?.length || 0}
                    </div>
                          <div className="text-slate-600 text-lg">Issues Found</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Accessibility */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Eye className="w-5 h-5 text-blue-600 mr-2" />
                      Visual Accessibility
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Alt Text for Images</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.accessibility.hasAltText ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.accessibility.hasAltText ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Color Contrast Ratio</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.accessibility.hasContrastRatio ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.accessibility.hasContrastRatio ? 'Adequate' : 'Inadequate'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Focus Indicators</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.accessibility.hasFocusIndicators ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.accessibility.hasFocusIndicators ? 'Visible' : 'Missing'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation & Structure */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
                      Navigation & Structure
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Proper Heading Structure</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.accessibility.hasProperHeadings ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.accessibility.hasProperHeadings ? 'Proper' : 'Improper'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Keyboard Navigation</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.accessibility.hasKeyboardNavigation ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.accessibility.hasKeyboardNavigation ? 'Supported' : 'Limited'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Skip Navigation Links</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.accessibility.hasSkipLinks ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.accessibility.hasSkipLinks ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Language Declaration</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.accessibility.hasLanguageDeclaration ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.accessibility.hasLanguageDeclaration ? 'Declared' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Semantic HTML</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.accessibility.hasSemanticHTML ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.accessibility.hasSemanticHTML ? 'Used' : 'Not Used'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Overall Structure</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          (scan.results.accessibility.hasProperHeadings && scan.results.accessibility.hasKeyboardNavigation && 
                           scan.results.accessibility.hasSkipLinks && scan.results.accessibility.hasLanguageDeclaration) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {(scan.results.accessibility.hasProperHeadings && scan.results.accessibility.hasKeyboardNavigation && 
                            scan.results.accessibility.hasSkipLinks && scan.results.accessibility.hasLanguageDeclaration) ? 'Well Structured' : 'Needs Improvement'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Assistive Technology Support */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Accessibility className="w-5 h-5 text-purple-600 mr-2" />
                      Assistive Technology Support
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Screen Reader Support</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.accessibility.hasScreenReaderSupport ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.accessibility.hasScreenReaderSupport ? 'Supported' : 'Limited'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">ARIA Labels</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.accessibility.hasARIALabels ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.accessibility.hasARIALabels ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Form Labels</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.accessibility.hasFormLabels ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.accessibility.hasFormLabels ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Error Handling</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.accessibility.hasErrorHandling ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.accessibility.hasErrorHandling ? 'Accessible' : 'Inaccessible'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Overall AT Support</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          (scan.results.accessibility.hasScreenReaderSupport && scan.results.accessibility.hasARIALabels && 
                           scan.results.accessibility.hasFormLabels && scan.results.accessibility.hasErrorHandling) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {(scan.results.accessibility.hasScreenReaderSupport && scan.results.accessibility.hasARIALabels && 
                            scan.results.accessibility.hasFormLabels && scan.results.accessibility.hasErrorHandling) ? 'Excellent' : 'Needs Work'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Accessibility Assessment */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                      Accessibility Assessment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Visual Accessibility</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              scan.results.accessibility.hasAltText && scan.results.accessibility.hasContrastRatio && 
                              scan.results.accessibility.hasFocusIndicators ? 'bg-green-100 text-green-700' : 
                              (scan.results.accessibility.hasAltText || scan.results.accessibility.hasContrastRatio) ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {scan.results.accessibility.hasAltText && scan.results.accessibility.hasContrastRatio && 
                               scan.results.accessibility.hasFocusIndicators ? 'Excellent' : 
                               (scan.results.accessibility.hasAltText || scan.results.accessibility.hasContrastRatio) ? 'Good' : 'Poor'}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">
                            {[scan.results.accessibility.hasAltText, scan.results.accessibility.hasContrastRatio, 
                              scan.results.accessibility.hasFocusIndicators].filter(Boolean).length}/3
                          </div>
                          <div className="text-xs text-slate-500">Visual elements accessible</div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Navigation Support</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              scan.results.accessibility.hasKeyboardNavigation && scan.results.accessibility.hasSkipLinks ? 'bg-green-100 text-green-700' : 
                              scan.results.accessibility.hasKeyboardNavigation ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {scan.results.accessibility.hasKeyboardNavigation && scan.results.accessibility.hasSkipLinks ? 'Full Support' : 
                               scan.results.accessibility.hasKeyboardNavigation ? 'Partial Support' : 'Limited Support'}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">
                            {[scan.results.accessibility.hasKeyboardNavigation, scan.results.accessibility.hasSkipLinks, 
                              scan.results.accessibility.hasProperHeadings].filter(Boolean).length}/3
                          </div>
                          <div className="text-xs text-slate-500">Navigation features implemented</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Assistive Technology</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              scan.results.accessibility.hasScreenReaderSupport && scan.results.accessibility.hasARIALabels ? 'bg-green-100 text-green-700' : 
                              scan.results.accessibility.hasScreenReaderSupport ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {scan.results.accessibility.hasScreenReaderSupport && scan.results.accessibility.hasARIALabels ? 'Well Supported' : 
                               scan.results.accessibility.hasScreenReaderSupport ? 'Basic Support' : 'Poor Support'}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">
                            {[scan.results.accessibility.hasScreenReaderSupport, scan.results.accessibility.hasARIALabels, 
                              scan.results.accessibility.hasFormLabels, scan.results.accessibility.hasErrorHandling].filter(Boolean).length}/4
                          </div>
                          <div className="text-xs text-slate-500">AT features implemented</div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">WCAG Compliance</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              scan.results.accessibility.wcagLevel === 'AAA' ? 'bg-green-100 text-green-700' : 
                              scan.results.accessibility.wcagLevel === 'AA' ? 'bg-blue-100 text-blue-700' : 
                              scan.results.accessibility.wcagLevel === 'A' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {scan.results.accessibility.wcagLevel === 'AAA' ? 'AAA Level' : 
                               scan.results.accessibility.wcagLevel === 'AA' ? 'AA Level' : 
                               scan.results.accessibility.wcagLevel === 'A' ? 'A Level' : 'Non-Compliant'}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">
                            WCAG {scan.results.accessibility.wcagLevel}
                          </div>
                          <div className="text-xs text-slate-500">Web Content Accessibility Guidelines</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accessibility Recommendations */}
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Star className="w-5 h-5 text-yellow-600 mr-2" />
                      Accessibility Recommendations
                    </h3>
                    <div className="space-y-3">
                      {scan.results.accessibility.recommendations && scan.results.accessibility.recommendations.length > 0 ? (
                        scan.results.accessibility.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-slate-700 text-sm">{rec}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-slate-500 text-lg mb-2">♿ Excellent Accessibility!</div>
                          <div className="text-slate-400 text-sm">No major accessibility issues found. Your website is inclusive and accessible.</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && scan.results?.security && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl"
                >
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Security Analysis</h2>
                  
                  {/* Security Score Overview */}
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 border border-red-200 mb-8">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-slate-900 mb-6">Overall Security Score</h3>
                      <div className="flex items-center justify-center space-x-12">
                        <div className="text-center">
                          <div className={`text-8xl font-bold ${getScoreColor(scan.results.security.score)} mb-2`}>
                            {scan.results.security.score}%
                          </div>
                          <div className="text-slate-600 text-lg">Security Score</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-6xl font-bold px-6 py-4 rounded-2xl border-2 ${getComplianceColor(scan.results.security.securityLevel)}`}>
                            {scan.results.security.securityLevel.charAt(0).toUpperCase() + scan.results.security.securityLevel.slice(1)}
                          </div>
                          <div className="text-slate-600 text-lg">Security Level</div>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-slate-900 mb-2">
                            {scan.results.security.issues?.length || 0}
                          </div>
                          <div className="text-slate-600 text-lg">Issues Found</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Key Findings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">HTTPS:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasHTTPS ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasHTTPS ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Security Headers:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasSecurityHeaders ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasSecurityHeaders ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">CSP:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasCSP ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasCSP ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">HSTS:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasHSTS ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasHSTS ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">X-Frame-Options:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasXFrameOptions ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasXFrameOptions ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">X-Content-Type-Options:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasXContentTypeOptions ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasXContentTypeOptions ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Referrer Policy:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasReferrerPolicy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasReferrerPolicy ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Permissions Policy:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasPermissionsPolicy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasPermissionsPolicy ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Secure Cookies:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasSecureCookies ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasSecureCookies ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">CSRF Protection:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasCSRFProtection ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasCSRFProtection ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Input Validation:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasInputValidation ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasInputValidation ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Output Encoding:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasOutputEncoding ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasOutputEncoding ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Session Management:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasSessionManagement ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasSessionManagement ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Error Handling:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasErrorHandling ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasErrorHandling ? 'Present' : 'Absent'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-6">Recommendations</h3>
                  <div className="space-y-3">
                    {scan.results.security.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <p className="text-slate-700">{rec}</p>
                      </div>
                    ))}
                  </div>

                  {/* Transport Layer Security */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Lock className="w-5 h-5 text-green-600 mr-2" />
                      Transport Layer Security
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">HTTPS Protocol</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.security.hasHTTPS ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.security.hasHTTPS ? 'Enabled' : 'Disabled'}
                        </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">HSTS (HTTP Strict Transport Security)</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.security.hasHSTS ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.security.hasHSTS ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Secure Cookies</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.security.hasSecureCookies ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.security.hasSecureCookies ? 'Configured' : 'Not Configured'}
                        </span>
                        </div>
                      </div>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Key Findings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">HTTPS:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasHTTPS ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasHTTPS ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Security Headers:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasSecurityHeaders ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasSecurityHeaders ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">CSP:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasCSP ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasCSP ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">HSTS:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasHSTS ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasHSTS ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">X-Frame-Options:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasXFrameOptions ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasXFrameOptions ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">X-Content-Type-Options:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasXContentTypeOptions ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasXContentTypeOptions ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Referrer Policy:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasReferrerPolicy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasReferrerPolicy ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Permissions Policy:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasPermissionsPolicy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasPermissionsPolicy ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Secure Cookies:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasSecureCookies ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasSecureCookies ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">CSRF Protection:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasCSRFProtection ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasCSRFProtection ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Input Validation:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasInputValidation ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasInputValidation ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Output Encoding:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasOutputEncoding ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasOutputEncoding ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Session Management:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasSessionManagement ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasSessionManagement ? 'Present' : 'Absent'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Error Handling:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.results.security.hasErrorHandling ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results.security.hasErrorHandling ? 'Present' : 'Absent'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Headers */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Shield className="w-5 h-5 text-blue-600 mr-2" />
                      Security Headers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Content Security Policy (CSP)</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.security.hasCSP ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.security.hasCSP ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">X-Frame-Options</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.security.hasXFrameOptions ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.security.hasXFrameOptions ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">X-Content-Type-Options</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.security.hasXContentTypeOptions ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.security.hasXContentTypeOptions ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Referrer Policy</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.security.hasReferrerPolicy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.security.hasReferrerPolicy ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Permissions Policy</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.security.hasPermissionsPolicy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.security.hasPermissionsPolicy ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Security Headers Overall</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.security.hasSecurityHeaders ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.security.hasSecurityHeaders ? 'Well Configured' : 'Needs Improvement'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Application Security */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Settings className="w-5 h-5 text-purple-600 mr-2" />
                      Application Security
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">CSRF Protection</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.security.hasCSRFProtection ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.security.hasCSRFProtection ? 'Implemented' : 'Not Implemented'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Input Validation</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.security.hasInputValidation ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.security.hasInputValidation ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Output Encoding</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.security.hasOutputEncoding ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.security.hasOutputEncoding ? 'Implemented' : 'Not Implemented'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Session Management</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.security.hasSessionManagement ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.security.hasSessionManagement ? 'Secure' : 'Insecure'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Error Handling</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.security.hasErrorHandling ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.security.hasErrorHandling ? 'Secure' : 'Insecure'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Overall App Security</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          (scan.results.security.hasCSRFProtection && scan.results.security.hasInputValidation && 
                           scan.results.security.hasOutputEncoding && scan.results.security.hasSessionManagement && 
                           scan.results.security.hasErrorHandling) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {(scan.results.security.hasCSRFProtection && scan.results.security.hasInputValidation && 
                            scan.results.security.hasOutputEncoding && scan.results.security.hasSessionManagement && 
                            scan.results.security.hasErrorHandling) ? 'Robust' : 'Needs Review'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Security Assessment */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                      Security Assessment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Transport Security</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              scan.results.security.hasHTTPS && scan.results.security.hasHSTS ? 'bg-green-100 text-green-700' : 
                              scan.results.security.hasHTTPS ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {scan.results.security.hasHTTPS && scan.results.security.hasHSTS ? 'Excellent' : 
                               scan.results.security.hasHTTPS ? 'Good' : 'Poor'}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">
                            {scan.results.security.hasHTTPS ? 'HTTPS' : 'HTTP'} {scan.results.security.hasHSTS ? '+ HSTS' : ''}
                          </div>
                          <div className="text-xs text-slate-500">Protocol and transport security</div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Header Security</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              scan.results.security.hasSecurityHeaders ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {scan.results.security.hasSecurityHeaders ? 'Well Protected' : 'Vulnerable'}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">
                            {[scan.results.security.hasCSP, scan.results.security.hasXFrameOptions, 
                              scan.results.security.hasXContentTypeOptions, scan.results.security.hasReferrerPolicy, 
                              scan.results.security.hasPermissionsPolicy].filter(Boolean).length}/5
                          </div>
                          <div className="text-xs text-slate-500">Security headers implemented</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Application Security</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              (scan.results.security.hasCSRFProtection && scan.results.security.hasInputValidation && 
                               scan.results.security.hasOutputEncoding) ? 'bg-green-100 text-green-700' : 
                              (scan.results.security.hasCSRFProtection || scan.results.security.hasInputValidation) ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {(scan.results.security.hasCSRFProtection && scan.results.security.hasInputValidation && 
                                scan.results.security.hasOutputEncoding) ? 'Robust' : 
                               (scan.results.security.hasCSRFProtection || scan.results.security.hasInputValidation) ? 'Basic' : 'Weak'}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">
                            {[scan.results.security.hasCSRFProtection, scan.results.security.hasInputValidation, 
                              scan.results.security.hasOutputEncoding, scan.results.security.hasSessionManagement, 
                              scan.results.security.hasErrorHandling].filter(Boolean).length}/5
                          </div>
                          <div className="text-xs text-slate-500">Security measures implemented</div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Cookie Security</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              scan.results.security.hasSecureCookies ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {scan.results.security.hasSecureCookies ? 'Secure' : 'Insecure'}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">
                            {scan.results.security.hasSecureCookies ? 'Secure Cookies' : 'Standard Cookies'}
                          </div>
                          <div className="text-xs text-slate-500">Cookie security configuration</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Recommendations */}
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Star className="w-5 h-5 text-yellow-600 mr-2" />
                      Security Recommendations
                    </h3>
                  <div className="space-y-3">
                      {scan.results.security.recommendations && scan.results.security.recommendations.length > 0 ? (
                        scan.results.security.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-slate-700 text-sm">{rec}</p>
                      </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-slate-500 text-lg mb-2">🔒 Excellent Security!</div>
                          <div className="text-slate-400 text-sm">No major security issues found. Your website is well protected.</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && scan.results?.performance && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl"
                >
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Performance Analysis</h2>
                  
                  {/* Performance Score Overview */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200 mb-8">
                      <div className="text-center">
                      <h3 className="text-2xl font-bold text-slate-900 mb-6">Overall Performance Score</h3>
                      <div className="flex items-center justify-center space-x-12">
                        <div className="text-center">
                          <div className={`text-8xl font-bold ${getScoreColor(scan.results.performance.score)} mb-2`}>
                          {scan.results.performance.score}%
                        </div>
                          <div className="text-slate-600 text-lg">Performance Score</div>
                      </div>
                        <div className="text-center">
                          <div className={`text-6xl font-bold px-6 py-4 rounded-2xl border-2 ${getGradeColor(scan.results.performance.performanceGrade)}`}>
                          {scan.results.performance.performanceGrade}
                        </div>
                          <div className="text-slate-600 text-lg">Performance Grade</div>
                      </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-slate-900 mb-2">
                            {scan.results.performance.issues?.length || 0}
                    </div>
                          <div className="text-slate-600 text-lg">Issues Found</div>
                          </div>
                        </div>
                        </div>
                  </div>

                  {/* Core Web Vitals */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Zap className="w-5 h-5 text-green-600 mr-2" />
                      Core Web Vitals
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">First Contentful Paint</span>
                        <span className="text-sm font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
                          {scan.results.performance.firstContentfulPaint}ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Largest Contentful Paint</span>
                        <span className="text-sm font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                          {scan.results.performance.largestContentfulPaint}ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Cumulative Layout Shift</span>
                        <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {scan.results.performance.cumulativeLayoutShift}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">First Input Delay</span>
                        <span className="text-sm font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {scan.results.performance.firstInputDelay}ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Total Load Time</span>
                        <span className="text-sm font-medium bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          {scan.results.performance.loadTime}ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Page Size</span>
                        <span className="text-sm font-medium bg-pink-100 text-pink-700 px-2 py-1 rounded">
                          {formatFileSize(scan.results.performance.pageSize)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Resource Optimization */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Settings className="w-5 h-5 text-purple-600 mr-2" />
                      Resource Optimization
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Image Optimization</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            scan.results.performance.imageOptimization ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {scan.results.performance.imageOptimization ? 'Optimized' : 'Not Optimized'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Code Minification</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            scan.results.performance.minification ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {scan.results.performance.minification ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Gzip Compression</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            scan.results.performance.compression ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {scan.results.performance.compression ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Browser Caching</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            scan.results.performance.caching ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {scan.results.performance.caching ? 'Configured' : 'Not Configured'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">CDN Usage</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            scan.results.performance.cdnUsage ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {scan.results.performance.cdnUsage ? 'Detected' : 'Not Detected'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Render Blocking</span>
                        <span className="text-sm font-medium bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                          {scan.results.performance.renderBlockingResources} resources
                        </span>
                        </div>
                        </div>
                        </div>

                  {/* Code Efficiency */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 text-orange-600 mr-2" />
                      Code Efficiency Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Unused CSS Rules</span>
                        <span className="text-sm font-medium bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          {scan.results.performance.unusedCSS} rules
                        </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Unused JavaScript</span>
                        <span className="text-sm font-medium bg-red-100 text-red-700 px-2 py-1 rounded">
                          {scan.results.performance.unusedJS} functions
                        </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">CSS Efficiency</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.performance.unusedCSS < 10 ? 'bg-green-100 text-green-700' : 
                          scan.results.performance.unusedCSS < 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.performance.unusedCSS < 10 ? 'Excellent' : 
                           scan.results.performance.unusedCSS < 50 ? 'Good' : 'Poor'}
                        </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">JS Efficiency</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.performance.unusedJS < 5 ? 'bg-green-100 text-green-700' : 
                          scan.results.performance.unusedJS < 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.performance.unusedJS < 5 ? 'Excellent' : 
                           scan.results.performance.unusedJS < 20 ? 'Good' : 'Poor'}
                        </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Blocking Resources</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.performance.renderBlockingResources < 3 ? 'bg-green-100 text-green-700' : 
                          scan.results.performance.renderBlockingResources < 8 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.performance.renderBlockingResources < 3 ? 'Low' : 
                           scan.results.performance.renderBlockingResources < 8 ? 'Medium' : 'High'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Overall Efficiency</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.performance.score >= 90 ? 'bg-green-100 text-green-700' : 
                          scan.results.performance.score >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.performance.score >= 90 ? 'Excellent' : 
                           scan.results.performance.score >= 70 ? 'Good' : 'Needs Improvement'}
                        </span>
                    </div>
                  </div>
                  </div>

                  {/* Performance Metrics Breakdown */}
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 text-cyan-600 mr-2" />
                      Performance Metrics Breakdown
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Load Time Performance</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              scan.results.performance.loadTime < 1000 ? 'bg-green-100 text-green-700' : 
                              scan.results.performance.loadTime < 3000 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {scan.results.performance.loadTime < 1000 ? 'Fast' : 
                               scan.results.performance.loadTime < 3000 ? 'Moderate' : 'Slow'}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">{scan.results.performance.loadTime}ms</div>
                          <div className="text-xs text-slate-500">Total page load time</div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Page Size</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              scan.results.performance.pageSize < 500000 ? 'bg-green-100 text-green-700' : 
                              scan.results.performance.pageSize < 2000000 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {scan.results.performance.pageSize < 500000 ? 'Small' : 
                               scan.results.performance.pageSize < 2000000 ? 'Medium' : 'Large'}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">{formatFileSize(scan.results.performance.pageSize)}</div>
                          <div className="text-xs text-slate-500">Total page size</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">First Paint</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              scan.results.performance.firstContentfulPaint < 1000 ? 'bg-green-100 text-green-700' : 
                              scan.results.performance.firstContentfulPaint < 2500 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {scan.results.performance.firstContentfulPaint < 1000 ? 'Fast' : 
                               scan.results.performance.firstContentfulPaint < 2500 ? 'Moderate' : 'Slow'}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">{scan.results.performance.firstContentfulPaint}ms</div>
                          <div className="text-xs text-slate-500">Time to first paint</div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Largest Paint</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              scan.results.performance.largestContentfulPaint < 2500 ? 'bg-green-100 text-green-700' : 
                              scan.results.performance.largestContentfulPaint < 4000 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {scan.results.performance.largestContentfulPaint < 2500 ? 'Fast' : 
                               scan.results.performance.largestContentfulPaint < 4000 ? 'Moderate' : 'Slow'}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">{scan.results.performance.largestContentfulPaint}ms</div>
                          <div className="text-xs text-slate-500">Time to largest paint</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Recommendations */}
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Star className="w-5 h-5 text-yellow-600 mr-2" />
                      Performance Recommendations
                    </h3>
                  <div className="space-y-3">
                      {scan.results.performance.recommendations && scan.results.performance.recommendations.length > 0 ? (
                        scan.results.performance.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-slate-700 text-sm">{rec}</p>
                      </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-slate-500 text-lg mb-2">🎉 Excellent Performance!</div>
                          <div className="text-slate-400 text-sm">No major performance issues found. Your website is well optimized.</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SEO Tab */}
              {activeTab === 'seo' && scan.results?.seo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl"
                >
                  <h2 className="text-xl font-bold text-slate-900 mb-6">SEO Analysis</h2>
                  
                  {/* SEO Score Overview */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 mb-8">
                      <div className="text-center">
                      <h3 className="text-2xl font-bold text-slate-900 mb-6">Overall SEO Score</h3>
                      <div className="flex items-center justify-center space-x-12">
                        <div className="text-center">
                          <div className={`text-8xl font-bold ${getScoreColor(scan.results.seo.score)} mb-2`}>
                          {scan.results.seo.score}%
                        </div>
                          <div className="text-slate-600 text-lg">SEO Score</div>
                      </div>
                        <div className="text-center">
                          <div className={`text-6xl font-bold px-6 py-4 rounded-2xl border-2 ${getGradeColor(scan.results.seo.seoScore >= 90 ? 'A' : scan.results.seo.seoScore >= 80 ? 'B' : scan.results.seo.seoScore >= 70 ? 'C' : scan.results.seo.seoScore >= 60 ? 'D' : 'F')}`}>
                            {scan.results.seo.seoScore >= 90 ? 'A' : scan.results.seo.seoScore >= 80 ? 'B' : scan.results.seo.seoScore >= 70 ? 'C' : scan.results.seo.seoScore >= 60 ? 'D' : 'F'}
                        </div>
                          <div className="text-slate-600 text-lg">Grade</div>
                      </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-slate-900 mb-2">
                            {scan.results.seo.issues?.length || 0}
                    </div>
                          <div className="text-slate-600 text-lg">Issues Found</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Core SEO Elements */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                      Core SEO Elements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Meta Title</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            scan.results.seo.hasMetaTitle ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {scan.results.seo.hasMetaTitle ? 'Present' : 'Missing'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Meta Description</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            scan.results.seo.hasMetaDescription ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {scan.results.seo.hasMetaDescription ? 'Present' : 'Missing'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Canonical URL</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.seo.hasCanonicalUrl ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.seo.hasCanonicalUrl ? 'Present' : 'Missing'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Robots.txt</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.seo.hasRobotsTxt ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.seo.hasRobotsTxt ? 'Present' : 'Missing'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Sitemap</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.seo.hasSitemap ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.seo.hasSitemap ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Schema Markup</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            scan.results.seo.hasStructuredData ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {scan.results.seo.hasStructuredData ? 'Present' : 'Missing'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Open Graph</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.seo.hasOpenGraph ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.seo.hasOpenGraph ? 'Present' : 'Missing'}
                          </span>
                        </div>
                    </div>
                  </div>

                  {/* Content & Structure */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 text-purple-600 mr-2" />
                      Content & Structure
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Heading Structure</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.seo.hasHeadingStructure ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.seo.hasHeadingStructure ? 'Proper' : 'Improper'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Internal Linking</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.seo.hasInternalLinking ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.seo.hasInternalLinking ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Meta Title Length</span>
                        <span className="text-sm font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {scan.results.seo.hasMetaTitle ? 'Optimal' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Meta Description</span>
                        <span className="text-sm font-medium bg-pink-100 text-pink-700 px-2 py-1 rounded">
                          {scan.results.seo.hasMetaDescription ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Canonical URL</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            scan.results.seo.hasCanonicalUrl ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {scan.results.seo.hasCanonicalUrl ? 'Present' : 'Missing'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">SEO Score</span>
                        <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                          {scan.results.seo.score}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Keyword Analysis */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Search className="w-5 h-5 text-emerald-600 mr-2" />
                      SEO Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Meta Title</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.seo.hasMetaTitle ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.seo.hasMetaTitle ? 'Present' : 'Missing'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Meta Description</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.seo.hasMetaDescription ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.seo.hasMetaDescription ? 'Present' : 'Missing'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Open Graph</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.seo.hasOpenGraph ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.seo.hasOpenGraph ? 'Present' : 'Missing'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Twitter Card</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.seo.hasTwitterCard ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.seo.hasTwitterCard ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Structured Data</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.seo.hasStructuredData ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.seo.hasStructuredData ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">SSL Certificate</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.seo.hasSSL ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.seo.hasSSL ? 'Valid' : 'Invalid'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Search Engine Visibility */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Eye className="w-5 h-5 text-orange-600 mr-2" />
                      Search Engine Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Sitemap</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.seo.hasSitemap ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.seo.hasSitemap ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Robots.txt</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.seo.hasRobotsTxt ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.seo.hasRobotsTxt ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Canonical URL</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.seo.hasCanonicalUrl ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.seo.hasCanonicalUrl ? 'Present' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Mobile Optimization</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            scan.results.seo.hasMobileOptimization ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {scan.results.seo.hasMobileOptimization ? 'Optimized' : 'Not Optimized'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Page Speed</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            scan.results.seo.hasPageSpeed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {scan.results.seo.hasPageSpeed ? 'Fast' : 'Slow'}
                          </span>
                        </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Image Optimization</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results.seo.hasImageOptimization ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results.seo.hasImageOptimization ? 'Optimized' : 'Not Optimized'}
                          </span>
                        </div>
                      </div>
                    </div>

                  {/* Technology Stack */}
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Settings className="w-5 h-5 text-pink-600 mr-2" />
                      Technology Stack
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Server Info</span>
                        <span className="text-sm font-medium bg-pink-100 text-pink-700 px-2 py-1 rounded">
                          {scan.results?.technicalDetails?.serverInfo || 'N/A'}
                        </span>
                  </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Hosting</span>
                        <span className="text-sm font-medium bg-rose-100 text-rose-700 px-2 py-1 rounded">
                          {scan.results?.technicalDetails?.hosting || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">CMS</span>
                        <span className="text-sm font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {scan.results?.technicalDetails?.cms || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Frameworks</span>
                        <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                          {scan.results?.technicalDetails?.frameworks?.length || 0} detected
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Technologies</span>
                        <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {scan.results?.technicalDetails?.technologies?.length || 0} detected
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Scan Duration</span>
                        <span className="text-sm font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
                          {formatDuration(scan.scanDuration)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SEO Recommendations */}
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Star className="w-5 h-5 text-yellow-600 mr-2" />
                      SEO Recommendations
                    </h3>
                  <div className="space-y-3">
                      {scan.results.seo.recommendations && scan.results.seo.recommendations.length > 0 ? (
                        scan.results.seo.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-slate-700 text-sm">{rec}</p>
                      </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-slate-500 text-lg mb-2">🎉 Great job!</div>
                          <div className="text-slate-400 text-sm">No major SEO issues found. Your website is well optimized.</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Technical Tab */}
              {activeTab === 'technical' && scan.results?.technicalDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl"
                >
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Technical Details</h2>
                  
                  {/* Server Information Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                        <Settings className="w-5 h-5 text-blue-600 mr-2" />
                        Server Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Server:</span>
                          <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {scan.results?.technicalDetails?.serverInfo || 'Unknown'}
                          </span>
                        </div>
                        {scan.results?.technicalDetails?.hosting && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Hosting:</span>
                            <span className="text-sm font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
                              {scan.results.technicalDetails.hosting}
                            </span>
                          </div>
                        )}
                        {scan.results?.technicalDetails?.cms && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">CMS:</span>
                            <span className="text-sm font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {scan.results.technicalDetails.cms}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Scan Duration:</span>
                          <span className="text-sm font-medium bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            {formatDuration(scan.scanDuration)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Scan Date:</span>
                          <span className="text-sm font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {new Date(scan.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
                        Technology Summary
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Frontend Frameworks:</span>
                          <span className="text-sm font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
                            {scan.results?.technicalDetails?.frameworks?.length || 0} detected
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Technologies:</span>
                          <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {scan.results?.technicalDetails?.technologies?.length || 0} detected
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Total Technologies:</span>
                          <span className="text-sm font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {(scan.results?.technicalDetails?.frameworks?.length || 0) + (scan.results?.technicalDetails?.technologies?.length || 0)} detected
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Scan Status:</span>
                          <span className={`text-sm font-medium px-2 py-1 rounded ${
                            scan.status === 'completed' ? 'bg-green-100 text-green-700' : 
                            scan.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Modules Scanned:</span>
                          <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                            {Object.values(scan.scanOptions).filter(Boolean).length} modules
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technology Stack Analysis */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
                      Technology Stack Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {scan.results?.technicalDetails?.frameworks && scan.results.technicalDetails.frameworks.length > 0 && (
                          <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-3">Frontend Frameworks</h4>
                          <div className="flex flex-wrap gap-2">
                              {scan.results.technicalDetails.frameworks.map((framework, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  {framework}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {scan.results?.technicalDetails?.technologies && scan.results.technicalDetails.technologies.length > 0 && (
                          <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-3">Technologies & Libraries</h4>
                          <div className="flex flex-wrap gap-2">
                              {scan.results.technicalDetails.technologies.map((tech, index) => (
                              <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                        
                        {(!scan.results?.technicalDetails?.frameworks || scan.results.technicalDetails.frameworks.length === 0) && 
                         (!scan.results?.technicalDetails?.technologies || scan.results.technicalDetails.technologies.length === 0) && (
                      <div className="text-sm text-slate-500 italic">
                        No specific technologies detected
                      </div>
                        )}
                      </div>

                  {/* Network & Response Analysis */}
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Globe className="w-5 h-5 text-cyan-600 mr-2" />
                      Network & Response Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Response Time</span>
                        <span className="text-sm font-medium bg-cyan-100 text-cyan-700 px-2 py-1 rounded">
                          {scan.results?.performance ? formatDuration(scan.results.performance.loadTime) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Page Size</span>
                        <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {scan.results?.performance ? formatFileSize(scan.results.performance.pageSize) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Compression</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results?.performance?.compression ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results?.performance?.compression ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Caching</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results?.performance?.caching ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results?.performance?.caching ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">CDN Usage</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results?.performance?.cdnUsage ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results?.performance?.cdnUsage ? 'Detected' : 'Not Detected'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Render Blocking</span>
                        <span className="text-sm font-medium bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                          {scan.results.performance.renderBlockingResources} resources
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Resource Analysis */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Zap className="w-5 h-5 text-orange-600 mr-2" />
                      Resource Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Render Blocking</span>
                        <span className="text-sm font-medium bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          {scan.results?.performance?.renderBlockingResources || 0} resources
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Unused CSS</span>
                        <span className="text-sm font-medium bg-red-100 text-red-700 px-2 py-1 rounded">
                          {scan.results?.performance?.unusedCSS || 0} rules
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Unused JavaScript</span>
                        <span className="text-sm font-medium bg-red-100 text-red-700 px-2 py-1 rounded">
                          {scan.results?.performance?.unusedJS || 0} functions
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">First Paint</span>
                        <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {scan.results?.performance ? formatDuration(scan.results.performance.firstContentfulPaint) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Largest Paint</span>
                        <span className="text-sm font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {scan.results?.performance ? formatDuration(scan.results.performance.largestContentfulPaint) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Layout Shift</span>
                        <span className="text-sm font-medium bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                          {scan.results?.performance?.cumulativeLayoutShift || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DNS & Network Analysis */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Globe className="w-5 h-5 text-indigo-600 mr-2" />
                      Network & Response Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Response Time</span>
                        <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                          {scan.results?.performance?.loadTime ? `${scan.results.performance.loadTime}ms` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Page Size</span>
                        <span className="text-sm font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {scan.results?.performance?.pageSize ? formatFileSize(scan.results.performance.pageSize) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Compression</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results?.performance?.compression ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results?.performance?.compression ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Caching</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results?.performance?.caching ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results?.performance?.caching ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">CDN Usage</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results?.performance?.cdnUsage ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results?.performance?.cdnUsage ? 'Detected' : 'Not Detected'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Minification</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.results?.performance?.minification ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {scan.results?.performance?.minification ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Server Response Analysis */}
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Settings className="w-5 h-5 text-teal-600 mr-2" />
                      Server Response Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <span className="text-sm text-slate-600">HTTP Status Code</span>
                          <span className="text-sm font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
                            200 OK
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <span className="text-sm text-slate-600">Response Time</span>
                          <span className="text-sm font-medium bg-teal-100 text-teal-700 px-2 py-1 rounded">
                            {scan.results?.performance ? formatDuration(scan.results.performance.loadTime) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <span className="text-sm text-slate-600">Server Version</span>
                          <span className="text-sm font-medium bg-cyan-100 text-cyan-700 px-2 py-1 rounded">
                            {scan.results?.technicalDetails?.serverInfo || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <span className="text-sm text-slate-600">Hosting Provider</span>
                          <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {scan.results?.technicalDetails?.hosting || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <span className="text-sm text-slate-600">Content Length</span>
                          <span className="text-sm font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {scan.results?.performance ? formatFileSize(scan.results.performance.pageSize) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <span className="text-sm text-slate-600">Image Optimization</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            scan.results?.performance?.imageOptimization ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scan.results?.performance?.imageOptimization ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <span className="text-sm text-slate-600">CMS Platform</span>
                          <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                            {scan.results?.technicalDetails?.cms || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <span className="text-sm text-slate-600">Framework Count</span>
                          <span className="text-sm font-medium bg-pink-100 text-pink-700 px-2 py-1 rounded">
                            {scan.results?.technicalDetails?.frameworks?.length || 0} detected
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technology Stack Metrics */}
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200 mb-8">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 text-amber-600 mr-2" />
                      Technology Stack Metrics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Frontend Frameworks</span>
                        <span className="text-sm font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded">
                          {scan.results?.technicalDetails?.frameworks?.length || 0} detected
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Backend Technologies</span>
                        <span className="text-sm font-medium bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                          {scan.results?.technicalDetails?.technologies?.length || 0} detected
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Server Technology</span>
                        <span className="text-sm font-medium bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          {scan.results?.technicalDetails?.serverInfo || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Hosting Platform</span>
                        <span className="text-sm font-medium bg-red-100 text-red-700 px-2 py-1 rounded">
                          {scan.results?.technicalDetails?.hosting || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">CMS System</span>
                        <span className="text-sm font-medium bg-green-100 text-green-700 px-2 py-1 rounded">
                          {scan.results?.technicalDetails?.cms || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Total Technologies</span>
                        <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {(scan.results?.technicalDetails?.frameworks?.length || 0) + (scan.results?.technicalDetails?.technologies?.length || 0)} detected
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Scan Execution Details */}
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <Clock className="w-5 h-5 text-pink-600 mr-2" />
                      Scan Execution Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Total Scan Time</span>
                        <span className="text-sm font-medium bg-pink-100 text-pink-700 px-2 py-1 rounded">
                          {formatDuration(scan.scanDuration)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Scan Date</span>
                        <span className="text-sm font-medium bg-rose-100 text-rose-700 px-2 py-1 rounded">
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Scan ID</span>
                        <span className="text-sm font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                          {scan._id.slice(-8)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Scan Status</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scan.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          scan.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">Modules Scanned</span>
                        <span className="text-sm font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {Object.values(scan.scanOptions).filter(Boolean).length} modules
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm text-slate-600">URL Scanned</span>
                        <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded truncate max-w-32">
                          {url?.url || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {scan.errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="bg-red-50 border border-red-200 rounded-2xl p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <h3 className="text-xl font-bold text-red-900">Scan Error</h3>
                  </div>
                  <p className="text-red-700">{scan.errorMessage}</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-12">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Info className="w-8 h-8 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-yellow-800">No Scan Data Available</h2>
                </div>
                <p className="text-yellow-700 mb-6">
                  The scan details could not be loaded. This might be because:
                </p>
                <ul className="text-left text-yellow-700 mb-6 space-y-2">
                  <li>• The scan ID "{scanId}" doesn't exist</li>
                  <li>• The scan hasn't been completed yet</li>
                  <li>• There was an error during the scan process</li>
                  <li>• The backend server is not running</li>
                </ul>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => fetchScanDetails()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push('/reports')}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Back to Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 