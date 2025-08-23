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

const AssistantWidget = dynamic(() => import('@/components/AssistantWidget'), {
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
  const [backendStatus, setBackendStatus] = React.useState<'checking' | 'online' | 'offline'>('checking');

  // Handle authentication redirect
  React.useEffect(() => {
    if (isLoaded && !user) {
      console.log('User not authenticated, redirecting to sign-in');
      router.replace('/sign-in');
    }
  }, [isLoaded, user, router]);

  // Fetch dashboard data - optimized
  const fetchDashboardData = React.useCallback(async (isBackgroundRefresh = false) => {
    if (!getToken) {
      console.log('🔑 No token available for dashboard data');
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

      console.log('📊 Fetching dashboard data...', isBackgroundRefresh ? '(background)' : '');

      // Fetch all data in parallel for better performance - get more scans for better stats
      const [projectsResponse, scansResponse, scheduledResponse, monthlyResponse, allScansResponse] = await Promise.all([
        fetch(`${baseUrl}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/api/scans?limit=50`, { // Increased limit for pagination
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/api/scheduled-scans`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/api/scans/monthly-count`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/api/scans?limit=50`, { // Get more scans for comprehensive stats
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!projectsResponse.ok || !scansResponse.ok || !scheduledResponse.ok || !monthlyResponse.ok || !allScansResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [projectsData, scansData, scheduledData, monthlyData, allScansData] = await Promise.all([
        projectsResponse.json(),
        scansResponse.json(),
        scheduledResponse.json(),
        monthlyResponse.json(),
        allScansResponse.json()
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
      
      if (!isBackgroundRefresh) {
        console.log('📊 Raw scan data sample:', allScans.slice(0, 2));
        console.log('📊 Total scans found:', allScans.length);
        console.log('📊 Completed scans:', allCompletedScans.length);
        
        // Debug: Show detailed structure of first completed scan
        if (allCompletedScans.length > 0) {
          console.log('🔍 First completed scan structure:', JSON.stringify(allCompletedScans[0], null, 2));
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
          if (!isBackgroundRefresh) {
            console.log('📊 Found valid score:', score, 'from scan:', scan._id);
          }
        } else if (score === 100) {
          if (!isBackgroundRefresh) {
            console.log('⚠️ Skipping default 100% score from scan:', scan._id);
          }
        }
      }

      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      if (!isBackgroundRefresh) {
        console.log('📊 Compliance scores found:', scores.length, 'Average:', averageScore);
      }

      let finalComplianceScore = averageScore;
      if (scores.length === 0) {
        finalComplianceScore = 0;
        if (!isBackgroundRefresh) {
          console.log('📊 No real compliance scores found, showing 0');
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
          if (!isBackgroundRefresh) {
            console.log('⚠️ Missing timestamps for scan:', scan?._id, 'start:', startTs, 'end:', endTs);
          }
          continue;
        }

        const durationMs = endTs - startTs;
        if (!Number.isFinite(durationMs) || durationMs <= 0) {
          if (!isBackgroundRefresh) {
            console.log('⚠️ Invalid duration for scan:', scan?._id, 'durationMs:', durationMs);
          }
          continue;
        }

        const seconds = Math.max(1, Math.ceil(durationMs / 1000));
        durationSecondsList.push(seconds);
        if (!isBackgroundRefresh) {
          console.log('⏱️ Scan duration (robust):', scan?._id, seconds + 's');
        }
      }

      const avgScanTime = durationSecondsList.length > 0
        ? Math.round(durationSecondsList.reduce((sum, value) => sum + value, 0) / durationSecondsList.length)
        : 0;

      if (!isBackgroundRefresh) {
        console.log('⏱️ Average scan time (robust):', avgScanTime + 's from', durationSecondsList.length, 'scans');
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

      if (!isBackgroundRefresh) {
        console.log('📊 Dashboard data loaded successfully');
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      if (!isBackgroundRefresh) {
        setError('Failed to load dashboard data');
      }
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  }, [getToken]);

  // Check backend status - optimized
  const checkBackendStatus = React.useCallback(async () => {
    try {
      const baseUrl = getApiUrl();
      const token = await getToken?.();
      const response = await fetch(`${baseUrl}/api/projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });

      if (response.ok) {
        setBackendStatus('online');
        console.log('✅ Backend is connected');
      } else {
        setBackendStatus('offline');
        console.log('❌ Backend returned error status');
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      setBackendStatus('offline');
    }
  }, [getToken]);

  // Initial load - optimized
  React.useEffect(() => {
    if (user) {
      console.log('👤 User loaded, fetching dashboard data...');
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
          console.log('🔄 Refreshing dashboard data...');
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

  const handleQuickScanComplete = (scanId?: string) => {
    setShowQuickScan(false);
    
    // Immediately refresh dashboard data for real-time updates (background refresh)
    console.log('🔄 Quick scan completed, refreshing dashboard...');
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
          <h1 className="text-2xl font-bold text-slate-900 mb-4">ComplianceScanner AI</h1>
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-6 py-8">
        {/* Welcome Section with Quick Scan Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              Welcome back, {user.firstName || 'User'}! 👋
          </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Your compliance dashboard is ready. Monitor your scanning projects and stay ahead of security requirements.
            </p>
            
            {/* Beautiful Quick Scan Button */}
            <motion.button
              onClick={handleQuickScan}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 border border-green-400/20"
            >
              <Zap className="w-6 h-6" />
              <span>Quick Scan</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-3xl flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <p className="text-red-700 font-medium">{error}</p>
              </div>
              <button
                onClick={() => fetchDashboardData()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Retry
              </button>
          </motion.div>
        )}

        {/* Enhanced Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <React.Suspense fallback={<div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 animate-pulse h-32"></div>}>
              <StatsCard
                title="Total Projects"
                value={stats.totalProjects.toString()}
                icon={Folder}
                color="blue"
                loading={loading}
              />
            </React.Suspense>
          <React.Suspense fallback={<div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 animate-pulse h-32"></div>}>
              <StatsCard
                title="Total URLs"
                value={stats.totalUrls.toString()}
                icon={Link}
                color="green"
                loading={loading}
              />
            </React.Suspense>
          <React.Suspense fallback={<div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 animate-pulse h-32"></div>}>
              <StatsCard
                title="Scans This Month"
                value={`${stats.scansThisMonth}/∞`}
                icon={BarChart3}
                color="purple"
                loading={loading}
              />
            </React.Suspense>
          <React.Suspense fallback={<div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 animate-pulse h-32"></div>}>
              <StatsCard
                title="Compliance Score"
                value={stats.complianceScore > 0 ? `${stats.complianceScore}%` : 'N/A'}
                icon={Shield}
                color="orange"
                loading={loading}
              />
            </React.Suspense>
          </motion.div>

        {/* Additional Metrics Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <TrendingUpIcon className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.successRate}%</h3>
            <p className="text-slate-600 font-medium">Success Rate</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <ActivityIcon className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.avgScanTime}s</h3>
            <p className="text-slate-600 font-medium">Avg Scan Time</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <TrendingDown className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.failedScans}</h3>
            <p className="text-slate-600 font-medium">Failed Scans</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <TargetIcon className="w-6 h-6 text-white" />
              </div>
              <Eye className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{pendingScans}</h3>
            <p className="text-slate-600 font-medium">Scheduled Scans</p>
              </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="xl:col-span-2"
        >
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              <div className="p-8 border-b border-slate-200/30 bg-gradient-to-r from-slate-50/50 to-blue-50/50">
            <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Folder className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900">Your Projects</h2>
                      <p className="text-slate-600 text-lg">Manage and monitor your scanning projects</p>
                    </div>
                  </div>
            <button 
                onClick={() => router.push('/projects/new')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
                    <Plus className="w-5 h-5" />
              <span>New Project</span>
            </button>
          </div>
          </div>

          {loading ? (
                <div className="p-16 text-center">
                  <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-slate-600 text-lg">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Folder className="w-12 h-12 text-slate-400" />
                    </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">No projects yet</h3>
                  <p className="text-slate-600 mb-8 text-lg max-w-md mx-auto">
                    Create your first project to start scanning websites for compliance and security.
              </p>
              <button 
                onClick={() => router.push('/projects/new')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 text-lg"
              >
                Create Your First Project
              </button>
            </div>
          ) : (
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentProjects.map((project) => (
                      <React.Suspense key={project._id} fallback={<div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 animate-pulse h-40"></div>}>
                    <ProjectCard
                      project={project}
                      onDelete={(projectId) => {
                        // Remove the project from the list
                        setProjects(projects.filter(p => p._id !== projectId));
                        // Update stats
                        setStats(prev => ({
                          ...prev,
                          totalProjects: prev.totalProjects - 1,
                          totalUrls: prev.totalUrls - project.urlCount
                        }));
                      }}
                    />
                  </React.Suspense>
                ))}
              </div>
              {projects.length > 3 && (
                    <div className="mt-8 text-center">
                  <button 
                    onClick={() => router.push('/projects')}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors hover:bg-blue-50 px-6 py-3 rounded-2xl text-lg"
                  >
                    View All Projects ({projects.length})
                  </button>
                </div>
              )}
            </div>
          )}
              </div>
        </motion.div>

            {/* Recent Scans */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="xl:col-span-1"
            >
            <React.Suspense fallback={<div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 animate-pulse h-96"></div>}>
                <RecentScans scans={stats.recentScans} loading={loading} />
              </React.Suspense>
            </motion.div>
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
    {/* Floating AI Assistant */}
      <AssistantWidget />
    </Layout>
  );
} 