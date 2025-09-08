"use client";

import { useUser, SignOutButton, useAuth } from '@clerk/nextjs';
import { Shield, BarChart3, LogOut, Plus, Folder, Link, Search, Settings, FileText, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap, Calendar, Globe, Crown, Sparkles, Target, Activity, ArrowRight, Star, TrendingDown, Users, Globe2, Eye, Target as TargetIcon, Activity as ActivityIcon, TrendingUp as TrendingUpIcon, AlertCircle, CheckCircle2, Clock as ClockIcon, Zap as ZapIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import { getApiUrl } from '@/config/api';

// Dynamic imports to fix client reference manifest issue
const QuickScanModal = dynamic(() => import('@/components/QuickScanModal'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

const StatsCard = dynamic(() => import('@/components/StatsCard'), {
  ssr: false
});

const ProjectCard = dynamic(() => import('@/components/ProjectCard'), {
  ssr: false
});

const QuickActionCard = dynamic(() => import('@/components/QuickActionCard'), {
  ssr: false
});

const RecentScans = dynamic(() => import('@/components/RecentScans'), {
  ssr: false
});

const QuickActionsPanel = dynamic(() => import('@/components/QuickActionsPanel'), {
  ssr: false
});

const AssistantWidget = dynamic(() => import('@/components/AssistantWidget'), {
  ssr: false
});

const CreateProjectModal = dynamic(() => import('@/components/modals/CreateProjectModal'), {
  ssr: false
});

interface Project {
  _id: string;
  name: string;
  description?: string;
  urlCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Scan {
  _id: string;
  urlId: string;
  projectId: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  results?: any;
  createdAt: string;
  completedAt?: string;
}

interface DashboardStats {
  totalProjects: number;
  totalUrls: number;
  scansThisMonth: number;
  complianceScore: number;
  recentScans: Scan[];
  monthlyScans: number;
  averageScore: number;
  avgScanTime: number;
  successRate: number;
  failedScans: number;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [stats, setStats] = React.useState<DashboardStats>({
    totalProjects: 0,
    totalUrls: 0,
    scansThisMonth: 0,
    complianceScore: 0,
    recentScans: [],
    monthlyScans: 0,
    averageScore: 0,
    avgScanTime: 0,
    successRate: 0,
    failedScans: 0
  });
  const [recentScans, setRecentScans] = React.useState<Scan[]>([]);
  const [scheduledScans, setScheduledScans] = React.useState<any[]>([]);
  const [monthlyScanCount, setMonthlyScanCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showQuickScan, setShowQuickScan] = React.useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'projects' | 'activity' | 'reports'>('overview');
  const [backendStatus, setBackendStatus] = React.useState<'checking' | 'online' | 'offline'>('checking');

  // Handle authentication redirect
  React.useEffect(() => {
    if (isLoaded && !user) {
      if (process.env.NODE_ENV === 'development') {
      }
      router.replace('/sign-in');
    }
  }, [isLoaded, user, router]);

  // Fetch dashboard data - optimized
  const fetchDashboardData = React.useCallback(async (isBackgroundRefresh = false) => {
    if (!getToken) {
      if (process.env.NODE_ENV === 'development') {
      }
      return;
    }

    // Only show loading state for initial load, not background refreshes
    if (!isBackgroundRefresh) {
      setLoading(true);
      setError(null);
    }

    try {
      const baseUrl = getApiUrl();
      const token = await getToken();

      if (process.env.NODE_ENV === 'development') {
      }

      // Fetch all data in parallel for better performance - with individual error handling
      const fetchWithFallback = async (url: string, fallbackData: any = []) => {
        try {
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            return await response.json();
          } else {
            console.warn(`API call failed for ${url}:`, response.status, response.statusText);
            return fallbackData;
          }
        } catch (error) {
          console.warn(`API call error for ${url}:`, error);
          return fallbackData;
        }
      };

      // Fetch all data with individual error handling
      const [projectsData, scansData, scheduledData, monthlyData, allScansData] = await Promise.all([
        fetchWithFallback(`${baseUrl}/api/projects`, []),
        fetchWithFallback(`${baseUrl}/api/scans?limit=50`, []),
        fetchWithFallback(`${baseUrl}/api/scheduled-scans`, []),
        fetchWithFallback(`${baseUrl}/api/scans/monthly-count`, { count: 0 }),
        fetchWithFallback(`${baseUrl}/api/scans?limit=50`, [])
      ]);

      const normalizedProjects = Array.isArray(projectsData) ? projectsData : (projectsData.projects || []);
      const normalizedScans = Array.isArray(scansData) ? scansData : (scansData.scans || []);
      const normalizedScheduled = Array.isArray(scheduledData) ? scheduledData : (scheduledData.scans || []);
      const allScans = Array.isArray(allScansData) ? allScansData : (allScansData.scans || []);

      setProjects(normalizedProjects);
      setRecentScans(normalizedScans);
      setScheduledScans(normalizedScheduled);
      setMonthlyScanCount(monthlyData.count || 0);

      // Compute comprehensive stats using all scans data
      const totalUrls = normalizedProjects.reduce((sum: number, p: any) => sum + (p.urlCount || 0), 0);
      const allCompletedScans = allScans.filter((s: any) => s.status === 'completed');
      const allFailedScans = allScans.filter((s: any) => s.status === 'failed');
      
      if (!isBackgroundRefresh && process.env.NODE_ENV === 'development') {
        
        // Debug: Show detailed structure of first completed scan
        if (allCompletedScans.length > 0) {
        }
      }
      
      const successRate = allScans.length > 0 ? Math.round((allCompletedScans.length / allScans.length) * 100) : 0;

      // Calculate comprehensive compliance score from all completed scans
      const scores: number[] = [];
      for (const scan of allCompletedScans) {
        let score = null;
        if (scan?.results?.overallScore && typeof scan.results.overallScore === 'number') {
          score = scan.results.overallScore;
        } else if (scan?.results?.complianceScore && typeof scan.results.complianceScore === 'number') {
          score = scan.results.complianceScore;
        } else if (scan?.results?.score && typeof scan.results.score === 'number') {
          score = scan.results.score;
        } else if (scan?.results?.compliance?.score && typeof scan.results.compliance.score === 'number') {
          score = scan.results.compliance.score;
        } else if (scan?.results?.accessibility?.score && typeof scan.results.accessibility.score === 'number') {
          score = scan.results.accessibility.score;
        } else if (scan?.results?.security?.score && typeof scan.results.security.score === 'number') {
          score = scan.results.security.score;
        } else if (scan?.overallScore && typeof scan.overallScore === 'number') {
          score = scan.overallScore;
        } else if (scan?.complianceScore && typeof scan.complianceScore === 'number') {
          score = scan.complianceScore;
        } else if (scan?.score && typeof scan.score === 'number') {
          score = scan.score;
        }
        if (score !== null && score >= 0 && score <= 100 && score !== 100) {
          scores.push(score);
                  if (!isBackgroundRefresh && process.env.NODE_ENV === 'development') {
        }
        } else if (score === 100) {
          if (!isBackgroundRefresh && process.env.NODE_ENV === 'development') {
          }
        }
      }

      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      if (!isBackgroundRefresh && process.env.NODE_ENV === 'development') {
      }

      let finalComplianceScore = averageScore;
      if (scores.length === 0) {
        finalComplianceScore = 0;
        if (!isBackgroundRefresh && process.env.NODE_ENV === 'development') {
        }
      }

      // Calculate average scan time with robust timestamp fallbacks and a minimum of 1s for non-zero durations
      const asNumberTimestamp = (value: any): number | null => {
        if (!value) return null;
        const timestamp = new Date(value).getTime();
        return Number.isFinite(timestamp) ? timestamp : null;
      };

      const getFirstValidTimestamp = (scanObj: any, candidateKeys: string[]): number | null => {
        for (const key of candidateKeys) {
          const ts = asNumberTimestamp(scanObj?.[key]);
          if (ts !== null) return ts;
        }
        return null;
      };

      const isCompletedStatus = (status: any): boolean => {
        const normalized = String(status || '').toLowerCase();
        return normalized === 'completed' || normalized === 'success' || normalized === 'done';
      };

      const candidateStartKeys = ['createdAt', 'startedAt', 'started_at', 'startTime', 'start_time'];
      const candidateEndKeys = ['completedAt', 'finishedAt', 'finished_at', 'endTime', 'end_time', 'updatedAt'];

      const durationSecondsList: number[] = [];
      for (const scan of allScans) {
        if (!isCompletedStatus(scan?.status)) continue;

        const startTs = getFirstValidTimestamp(scan, candidateStartKeys);
        const endTs = getFirstValidTimestamp(scan, candidateEndKeys);

        if (startTs === null || endTs === null) {
                  if (!isBackgroundRefresh && process.env.NODE_ENV === 'development') {
        }
          continue;
        }

        const durationMs = endTs - startTs;
        if (!Number.isFinite(durationMs) || durationMs <= 0) {
                  if (!isBackgroundRefresh && process.env.NODE_ENV === 'development') {
        }
          continue;
        }

        const seconds = Math.max(1, Math.ceil(durationMs / 1000));
        durationSecondsList.push(seconds);
        if (!isBackgroundRefresh && process.env.NODE_ENV === 'development') {
        }
      }

      const avgScanTime = durationSecondsList.length > 0
        ? Math.round(durationSecondsList.reduce((sum, value) => sum + value, 0) / durationSecondsList.length)
        : 0;

      if (!isBackgroundRefresh && process.env.NODE_ENV === 'development') {
      }

      setStats(prev => ({
        ...prev,
        totalProjects: normalizedProjects.length,
        totalUrls,
        scansThisMonth: monthlyData.count || 0,
        complianceScore: finalComplianceScore,
        recentScans: normalizedScans,
        monthlyScans: monthlyData.count || 0,
        averageScore: averageScore,
        avgScanTime: avgScanTime,
        successRate: successRate,
        failedScans: allFailedScans.length
      }));

      if (!isBackgroundRefresh && process.env.NODE_ENV === 'development') {
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error fetching dashboard data:', error);
      }
      if (!isBackgroundRefresh) {
        setError('Failed to load dashboard data');
      }
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  }, [getToken]);

  // Check backend status - optimized with better error handling
  const checkBackendStatus = React.useCallback(async () => {
    try {
      const baseUrl = getApiUrl();
      const token = await getToken?.();
      
      // Try health endpoint first, then fallback to projects
      let response;
      try {
        response = await fetch(`${baseUrl}/api/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
        });
      } catch (healthError) {
        // Fallback to projects endpoint if health fails
        response = await fetch(`${baseUrl}/api/projects`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
        });
      }

      if (response.ok) {
        setBackendStatus('online');
        if (process.env.NODE_ENV === 'development') {
        }
      } else {
        setBackendStatus('offline');
        if (process.env.NODE_ENV === 'development') {
        }
      }
    } catch (error) {
      setBackendStatus('offline');
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Backend connection failed:', error);
      }
    }
  }, [getToken]);

  // Initial load - optimized
  React.useEffect(() => {
    if (user) {
      if (process.env.NODE_ENV === 'development') {
      }
      fetchDashboardData();
      checkBackendStatus();
    }
  }, [user?.id, fetchDashboardData, checkBackendStatus]); // Only depend on user ID and memoized functions

  // Refresh data every 10 seconds - optimized for real-time updates
  React.useEffect(() => {
    if (!user) return;

    let interval: any;
    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          if (process.env.NODE_ENV === 'development') {
          }
          fetchDashboardData(true); // Pass true for background refresh
        }
      }, 10000); // Reduced to 10 seconds for more responsive updates
    };
    const stop = () => interval && clearInterval(interval);

    start();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData(true);
        start();
      } else {
        stop();
        interval = null;
      }
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, [user?.id, fetchDashboardData]); // Only depend on user ID and memoized function

  const handleQuickScan = () => {
    setShowQuickScan(true);
  };

  const handleCreateProject = () => {
    setShowCreateProjectModal(true);
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setShowCreateProjectModal(false);
    // Refresh stats to update project count
    fetchDashboardData();
  };

  const handleQuickScanComplete = (scanId?: string) => {
    setShowQuickScan(false);
    
    // Immediately refresh dashboard data for real-time updates (background refresh)
    if (process.env.NODE_ENV === 'development') {
    }
    fetchDashboardData(true); // Use background refresh
    
    // Navigate to scan report if scan ID is provided
    if (scanId) {
      router.push(`/scans/${scanId}`);
    }
  };

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-xl text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
                          <h1 className="text-2xl font-bold text-slate-900 mb-4">Scan More</h1>
          <div className="flex items-center justify-center space-x-2 text-slate-600">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Initializing...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show redirect state when user is not authenticated
  if (isLoaded && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-xl text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h1>
          <p className="text-slate-600 mb-4">Please sign in to access your dashboard.</p>
          <button 
            onClick={() => router.push('/sign-in')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const recentProjects = projects.slice(0, 3);

  // Calculate additional metrics
  const pendingScans = scheduledScans.length; // Use actual scheduled scans count

  return (
    <Layout>
      <div className="relative min-h-screen bg-slate-50">
        {/* Compact Professional Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border-b border-slate-200 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="relative"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">
                      {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </motion.div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Welcome back, {user.firstName || 'User'}! 👋
                  </h1>
                  <p className="text-sm text-slate-600">Ready to secure your projects</p>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center space-x-4">
                {/* System Status */}
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-green-500' : backendStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'} animate-pulse`}></div>
                  <span className="text-sm font-medium text-green-700">
                    {backendStatus === 'online' ? 'All systems operational' : backendStatus === 'offline' ? 'System maintenance' : 'Checking status...'}
                  </span>
            </div>

                {/* Primary Action */}
            <motion.button
              onClick={handleQuickScan}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Zap className="w-4 h-4" />
              <span>Quick Scan</span>
            </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Section */}
        <div className="relative bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-6 py-8">
            {/* Tabbed Interface */}
            <div className="mb-8">
              <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                      activeTab === 'overview' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab('projects')}
                    className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                      activeTab === 'projects' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Projects
                  </button>
                  <button 
                    onClick={() => setActiveTab('activity')}
                    className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                      activeTab === 'activity' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Activity
                  </button>
                  <button 
                    onClick={() => setActiveTab('reports')}
                    className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
                      activeTab === 'reports' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Reports
                  </button>
                </nav>
              </div>
            </div>
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                className="mb-12 p-8 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-3xl flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Connection Error</h3>
                    <p className="text-red-700">{error}</p>
              </div>
              </div>
                <motion.button
                onClick={() => fetchDashboardData()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                  Retry Connection
                </motion.button>
          </motion.div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Quick Overview
                </h2>
                <p className="text-slate-600">
                  Your security dashboard at a glance
                </p>
              </div>

              {/* Compact Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/projects')}
                  className="cursor-pointer"
                >
              <StatsCard
                    title="Projects"
                value={stats.totalProjects.toString()}
                icon={Folder}
                color="blue"
                loading={loading}
                    subtitle="Active projects"
                    status={stats.totalProjects > 0 ? 'good' : 'neutral'}
                    trend={stats.totalProjects > 0 ? { value: 12, isPositive: true } : undefined}
                  />
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/scans')}
                  className="cursor-pointer"
                >
              <StatsCard
                    title="URLs"
                value={stats.totalUrls.toString()}
                icon={Link}
                color="green"
                loading={loading}
                    subtitle="Monitored websites"
                    status={stats.totalUrls > 0 ? 'good' : 'neutral'}
                    progress={Math.min((stats.totalUrls / 50) * 100, 100)}
                  />
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/scans')}
                  className="cursor-pointer"
                >
              <StatsCard
                    title="Scans"
                    value={stats.scansThisMonth.toString()}
                icon={BarChart3}
                color="purple"
                loading={loading}
                    subtitle="This month"
                    status="good"
                    trend={{ value: 8, isPositive: true }}
                  />
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/reports')}
                  className="cursor-pointer"
                >
              <StatsCard
                    title="Compliance"
                value={stats.complianceScore > 0 ? `${stats.complianceScore}%` : 'N/A'}
                icon={Shield}
                    color={stats.complianceScore >= 80 ? 'green' : stats.complianceScore >= 60 ? 'orange' : 'red'}
                loading={loading}
                    subtitle="Security score"
                    status={stats.complianceScore >= 80 ? 'good' : stats.complianceScore >= 60 ? 'warning' : 'critical'}
                    progress={stats.complianceScore}
              />
                </motion.div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Recent Activity & Projects */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Recent Projects Preview */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
                  >
                    <div className="p-6 border-b border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Folder className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">Recent Projects</h3>
                            <p className="text-sm text-slate-600">{stats.totalProjects} active • {stats.totalUrls} URLs</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button 
                            onClick={() => setActiveTab('projects')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            View All
                          </motion.button>
                          <motion.button 
                            onClick={handleCreateProject}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            New
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="bg-slate-100 rounded-lg p-4 animate-pulse">
                              <div className="h-4 bg-slate-200 rounded mb-2"></div>
                              <div className="h-3 bg-slate-200 rounded mb-1"></div>
                              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                            </div>
                          ))}
                        </div>
                      ) : projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {projects.slice(0, 4).map((project) => (
                            <ProjectCard key={project._id} project={project} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Folder className="w-8 h-8 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects yet</h3>
                          <p className="text-slate-600 mb-4 text-sm">
                            Create your first project to start scanning websites
                          </p>
                          <motion.button 
                            onClick={handleCreateProject}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                          >
                            Create Project
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Recent Activity */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
                  >
                    <div className="p-6 border-b border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <Activity className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                            <p className="text-sm text-slate-600">Latest scans and updates</p>
                          </div>
                        </div>
                        <motion.button 
                          onClick={() => setActiveTab('activity')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm"
                        >
                          View All
                        </motion.button>
                      </div>
                    </div>

                    <div className="p-6">
                      <RecentScans 
                        scans={recentScans} 
                        loading={loading}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Quick Actions & System Status */}
                <div className="space-y-6">
                  {/* Quick Actions Panel */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <QuickActionsPanel
                      onQuickScan={handleQuickScan}
                      onCreateProject={handleCreateProject}
                      totalProjects={stats.totalProjects}
                      totalUrls={stats.totalUrls}
                    />
                  </motion.div>

                  {/* System Status */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">System Status</h3>
                        <p className="text-sm text-slate-600">Security & performance</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Backend Status</span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            backendStatus === 'online' ? 'bg-green-500' : 
                            backendStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                          } animate-pulse`}></div>
                          <span className={`text-sm font-medium ${
                            backendStatus === 'online' ? 'text-green-600' : 
                            backendStatus === 'offline' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {backendStatus === 'online' ? 'Online' : 
                             backendStatus === 'offline' ? 'Offline' : 'Checking...'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Compliance Score</span>
                        <span className="text-sm font-semibold text-slate-900">
                          {stats.complianceScore}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Success Rate</span>
                        <span className="text-sm font-semibold text-slate-900">
                          {stats.successRate}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Avg. Scan Time</span>
                        <span className="text-sm font-semibold text-slate-900">
                          {stats.avgScanTime}s
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Performance Metrics */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Performance</h3>
                        <p className="text-sm text-slate-600">This month</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-600">Scans Completed</span>
                          <span className="text-sm font-semibold text-slate-900">{stats.scansThisMonth}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min((stats.scansThisMonth / 100) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-600">Success Rate</span>
                          <span className="text-sm font-semibold text-slate-900">{stats.successRate}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${stats.successRate}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-600">Compliance Score</span>
                          <span className="text-sm font-semibold text-slate-900">{stats.complianceScore}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${stats.complianceScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
          </motion.div>
        )}

        {activeTab === 'projects' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                All Projects
              </h2>
              <p className="text-slate-600">
                Manage and monitor all your projects
              </p>
            </div>
            
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded mb-4"></div>
                    <div className="h-3 bg-slate-200 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                ))
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Folder className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No projects yet</h3>
                  <p className="text-slate-600 mb-6 text-sm max-w-sm mx-auto">
                    Create your first project to start scanning websites for compliance and security.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <motion.button 
                      onClick={handleCreateProject}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                    >
                      Create Project
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Recent Activity
              </h2>
              <p className="text-slate-600">
                Your latest scans and project activity
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <RecentScans 
                scans={recentScans} 
                loading={loading}
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Reports & Analytics
              </h2>
              <p className="text-slate-600">
                Comprehensive reports and insights
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Compliance Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Overall Score</span>
                    <span className="text-2xl font-bold text-blue-600">{stats.complianceScore}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${stats.complianceScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Scan Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Scans</span>
                    <span className="font-semibold">{stats.scansThisMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Success Rate</span>
                    <span className="font-semibold">{stats.successRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Avg. Scan Time</span>
                    <span className="font-semibold">{stats.avgScanTime}s</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

          </div>
        </div>

        {/* Quick Scan Modal */}
        {showQuickScan && (
          <React.Suspense fallback={<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
              <div className="animate-pulse">
                <div className="h-6 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </div>
          </div>
          </div>}>
            <QuickScanModal
              onClose={() => setShowQuickScan(false)}
              onComplete={handleQuickScanComplete}
            />
          </React.Suspense>
        )}

        {/* Floating Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <motion.button
            onClick={handleQuickScan}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200"
          >
            <Zap className="w-6 h-6" />
          </motion.button>
        </motion.div>

            {/* Create Project Modal */}
        {showCreateProjectModal && (
          <CreateProjectModal
            onClose={() => setShowCreateProjectModal(false)}
            onProjectCreated={handleProjectCreated}
          />
        )}

    {/* Floating AI Assistant */}
      <AssistantWidget />
      </div>
    </Layout>
  );
} 