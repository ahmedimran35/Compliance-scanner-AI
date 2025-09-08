"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '../../config/api';
import { 
  Users, 
  Database, 
  Activity, 
  TrendingUp, 
  Shield, 
  Globe, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Search, 
  Filter,
  RefreshCw,
  Download,
  Calendar,
  DollarSign,
  Star,
  Crown,
  Zap,
  Server,
  Wifi,
  FileText,
  Target,
  Settings,
  Bell,
  Mail,
  MapPin,
  Hash,
  Lock,
  Unlock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  MessageSquare,
  Trash2
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalScans: number;
  totalWebsites: number;
  totalDonations: number;
  supporters: number;
  systemUptime: number;
  averageScanTime: number;
  successRate: number;
}

interface UserData {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isSupporter: boolean;
  supporterTier?: string;
  totalDonations: number;
  projects: number;
  scansThisMonth: number;
  createdAt: string;
  lastActive?: string;
}



interface ScanData {
  _id: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  scanOptions: {
    gdpr: boolean;
    accessibility: boolean;
    security: boolean;
    performance: boolean;
    seo: boolean;
  };
  results?: {
    overall: {
      score: number;
      grade: string;
      totalIssues: number;
    };
  };
  scanDuration: number;
  createdAt: string;
  updatedAt: string;
}

interface UserMonitoringData {
  userId: string;
  userInfo: {
    email: string;
    name: string;
  };
  monitoringStats: {
    totalWebsites: number;
    activeWebsites: number;
    onlineWebsites: number;
    offlineWebsites: number;
    lastActivity: string;
  };
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  requestsPerMinute: number;
  averageResponseTime: number;
  errorRate: number;
}

interface FeedbackData {
  _id: string;
  type: 'general' | 'bug' | 'feature' | 'improvement';
  rating: number;
  title: string;
  description: string;
  email: string;
  category: string;
  status: 'pending' | 'reviewed' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  userId?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

interface FeedbackStats {
  total: number;
  recent: number;
  status: Record<string, number>;
  type: Record<string, number>;
  priority: Record<string, number>;
  rating: {
    average: number;
    total: number;
  };
}

export default function AdminDashboard() {
  // If user is hitting /admin directly while a secret path is configured, show 404-like screen
  const secretPath = (process.env.NEXT_PUBLIC_ADMIN_PATH || '').trim();
  const isDirectAdmin = typeof window !== 'undefined' && window.location.pathname === '/admin';
  const hasSecret = secretPath !== '' && secretPath !== '/admin';
  if (isDirectAdmin && hasSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
          <a href="/" className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Go to Homepage</a>
        </div>
      </div>
    );
  }
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    totalScans: 0,
    totalWebsites: 0,
    totalDonations: 0,
    supporters: 0,
    systemUptime: 0,
    averageScanTime: 0,
    successRate: 0
  });
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [scans, setScans] = useState<ScanData[]>([]);
  const [userMonitoring, setUserMonitoring] = useState<UserMonitoringData[]>([]);
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({
    total: 0,
    recent: 0,
    status: {},
    type: {},
    priority: {},
    rating: { average: 0, total: 0 }
  });
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    activeConnections: 0,
    requestsPerMinute: 0,
    averageResponseTime: 0,
    errorRate: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [adminUserInput, setAdminUserInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginHealth, setLoginHealth] = useState<'unknown' | 'ok' | 'down'>('unknown');
  const [loginHealthLoading, setLoginHealthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Pagination states
  const [scansPage, setScansPage] = useState(1);
  const [scansLimit] = useState(20);
  const [scansTotal, setScansTotal] = useState(0);
  const [scansPages, setScansPages] = useState(0);
  const [scansLoading, setScansLoading] = useState(false);
  
  // Feedback delete state
  const [deletingFeedback, setDeletingFeedback] = useState<string | null>(null);
  
  // Service status (real-time)
  const servicePaths = useMemo(() => [
    '/api/admin/health',
    '/api/admin/stats',
    '/api/admin/users',
    '/api/admin/scans',
    '/api/admin/websites',
    '/api/admin/metrics',
    '/api/admin/feedback',
    '/api/admin/feedback-stats',
    '/api/admin/anonymized-stats',
    '/api/admin/support-users',
    '/api/admin/support-scans'
  ], []);
  const [serviceStatus, setServiceStatus] = useState<Record<string, 'online' | 'offline' | 'checking'>>({});
  const [servicesOnlineCount, setServicesOnlineCount] = useState(0);
  const [showServicesModal, setShowServicesModal] = useState(false);

  // Build auth header from stored creds
  const authHeader = useMemo(() => {
    const savedUser = (typeof window !== 'undefined' && localStorage.getItem('admin_user')) || process.env.NEXT_PUBLIC_ADMIN_USERNAME || '';
    const savedPass = (typeof window !== 'undefined' && localStorage.getItem('admin_pass')) || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
    if (!savedUser || !savedPass) return '';
    try {
      return `Basic ${btoa(`${savedUser}:${savedPass}`)}`;
    } catch {
      return '';
    }
  }, []);

  const authHeaders = useMemo(() => (authHeader ? { Authorization: authHeader } : {}), [authHeader]);

  // Initialize login state from env/localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('admin_user') || process.env.NEXT_PUBLIC_ADMIN_USERNAME || '';
    const savedPass = localStorage.getItem('admin_pass') || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
    setAdminUserInput(savedUser);
    setAdminPassInput(savedPass);
    setAuthReady(true);
    // Probe backend health for the login screen
    const probe = async () => {
      try {
        setLoginHealthLoading(true);
        const res = await fetch(`${API_URL}/health`).catch(() => null);
        if (res && res.ok) setLoginHealth('ok'); else setLoginHealth('down');
      } catch {
        setLoginHealth('down');
      } finally {
        setLoginHealthLoading(false);
      }
    };
    probe();
  }, []);

  // Real-time data fetching
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // First check if backend is running
      const backendHealthCheck = await fetch(`${API_URL}/health`).catch(() => null);
      
      if (!backendHealthCheck || !backendHealthCheck.ok) {
        console.error('❌ Backend server is not running on port 3001');
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalProjects: 0,
          totalScans: 0,
          totalWebsites: 0,
          totalDonations: 0,
          supporters: 0,
          systemUptime: 0,
          averageScanTime: 0,
          successRate: 0
        });
        setUsers([]);
        setScans([]);
        setUserMonitoring([]);
        setSystemMetrics({
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
          activeConnections: 0,
          requestsPerMinute: 0,
          averageResponseTime: 0,
          errorRate: 0
        });
        setLoading(false);
        return;
      }
      
      // Prepare Basic Auth header for admin endpoints
      if (!authHeader) {
        setLoading(false);
        return;
      }

      // Fetch all data in parallel from backend
      const [statsRes, usersRes, scansRes, monitoringRes, metricsRes, feedbackRes, feedbackStatsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, { headers: authHeaders }),
        fetch(`${API_URL}/api/admin/users`, { headers: authHeaders }),
        fetch(`${API_URL}/api/admin/scans?page=${scansPage}&limit=${scansLimit}&sortBy=${sortBy}&sortOrder=${sortOrder}`, { headers: authHeaders }),
        fetch(`${API_URL}/api/admin/websites`, { headers: authHeaders }),
        fetch(`${API_URL}/api/admin/metrics`, { headers: authHeaders }),
        fetch(`${API_URL}/api/admin/feedback`, { headers: authHeaders }),
        fetch(`${API_URL}/api/admin/feedback-stats`, { headers: authHeaders })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      if (scansRes.ok) {
        const scansData = await scansRes.json();
        setScans(scansData.scans || []);
        setScansTotal(scansData.pagination?.total || 0);
        setScansPages(scansData.pagination?.pages || 0);
      }

      if (monitoringRes.ok) {
        const monitoringData = await monitoringRes.json();
        setUserMonitoring(monitoringData.userMonitoring || []);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setSystemMetrics(metricsData);
      }

      if (feedbackRes.ok) {
        const feedbackData = await feedbackRes.json();
        setFeedback(feedbackData.feedback || []);
      }

      if (feedbackStatsRes.ok) {
        const feedbackStatsData = await feedbackStatsRes.json();
        setFeedbackStats(feedbackStatsData);
      }

    } catch (error) {
      console.error('❌ Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch scans with pagination
  const fetchScans = async (page: number = scansPage) => {
    try {
      setScansLoading(true);
      const response = await fetch(`${API_URL}/api/admin/scans?page=${page}&limit=${scansLimit}&sortBy=${sortBy}&sortOrder=${sortOrder}`, { headers: authHeaders });
      
      if (response.ok) {
        const data = await response.json();
        setScans(data.scans || []);
        setScansTotal(data.pagination?.total || 0);
        setScansPages(data.pagination?.pages || 0);
        setScansPage(page);
      }
    } catch (error) {
      console.error('❌ Error fetching scans:', error);
    } finally {
      setScansLoading(false);
    }
  };

  // Delete feedback function
  const deleteFeedback = async (feedbackId: string) => {
    try {
      setDeletingFeedback(feedbackId);
      const response = await fetch(`${API_URL}/api/admin/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      
      if (response.ok) {
        // Remove the feedback from the list
        setFeedback(prev => prev.filter(f => f._id !== feedbackId));
        // Update stats
        setFeedbackStats(prev => ({
          ...prev,
          total: prev.total - 1
        }));
      } else {
        console.error('❌ Failed to delete feedback');
      }
    } catch (error) {
      console.error('❌ Error deleting feedback:', error);
    } finally {
      setDeletingFeedback(null);
    }
  };

  // Initial data fetch only
  useEffect(() => {
    fetchAdminData();
  }, [authHeader]);

  // Refetch scans when pagination parameters change
  useEffect(() => {
    if (activeTab === 'scans') {
      fetchScans();
    }
  }, [scansPage, sortBy, sortOrder]);

  // Real-time service status checker
  useEffect(() => {
    let isMounted = true;
    const checkAllServices = async () => {
      if (!authHeader) return;
      const statuses: Record<string, 'online' | 'offline' | 'checking'> = {};
      await Promise.allSettled(
        servicePaths.map(async (path) => {
          try {
            const url = `${API_URL}${path}${path.includes('?') ? '' : path.endsWith('scans') ? `?page=1&limit=1` : ''}`;
            const res = await fetch(url, { headers: authHeaders });
            statuses[path] = res.ok ? 'online' : 'offline';
          } catch {
            statuses[path] = 'offline';
          }
        })
      );
      if (!isMounted) return;
      setServiceStatus(statuses);
      setServicesOnlineCount(Object.values(statuses).filter((s) => s === 'online').length);
    };
    // initial and interval
    checkAllServices();
    const id = setInterval(checkAllServices, 60000);
    return () => { isMounted = false; clearInterval(id); };
  }, [API_URL, authHeader, authHeaders, servicePaths]);

  // Filter and sort functions
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );



  const filteredScans = scans.filter(scan => {
    const matchesSearch = true; // Add search logic if needed
    const matchesStatus = filterStatus === 'all' || scan.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredUserMonitoring = userMonitoring.filter(monitoring =>
    monitoring.userInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    monitoring.userInfo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFeedback = feedback.filter(feedback =>
    feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (feedback.userId?.firstName && feedback.userId.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (feedback.userId?.lastName && feedback.userId.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort functions
  const sortData = <T extends any>(data: T[], key: string, order: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      if (aVal instanceof Date && bVal instanceof Date) {
        return order === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
      }
      
      return 0;
    });
  };

  const sortedUsers = sortData(filteredUsers, sortBy, sortOrder);
  const sortedScans = sortData(filteredScans, sortBy, sortOrder);
  const sortedUserMonitoring = sortData(filteredUserMonitoring, sortBy, sortOrder);
  const sortedFeedback = sortData(filteredFeedback, sortBy, sortOrder);

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'scanning':
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'failed':
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'online':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'scanning':
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
      case 'offline':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto blur-xl"
            />
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-3"
          >
            Loading Admin Dashboard
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-blue-200 text-lg mb-6"
          >
            Fetching real-time data...
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center space-x-2"
          >
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Check if backend is accessible (all stats are 0 when backend is not running)
  const isBackendRunning = stats.totalUsers !== 0 || stats.totalProjects !== 0 || stats.totalScans !== 0 || stats.totalWebsites !== 0;

  // If no auth header, show login form
  if (!authHeader && authReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
        >
          <div className="flex items-center space-x-4 mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Login</h1>
              <p className="text-blue-200">Enter credentials to access the admin dashboard</p>
            </div>
          </div>

          {authError && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-200 font-medium">{authError}</span>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Username</label>
                <input
                  value={adminUserInput}
                  onChange={(e) => setAdminUserInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white placeholder-blue-300"
                  placeholder="Admin username"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">Password</label>
                <input
                  type="password"
                  value={adminPassInput}
                  onChange={(e) => setAdminPassInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white placeholder-blue-300"
                  placeholder="Admin password"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  setAuthError(null);
                  if (!adminUserInput || !adminPassInput) {
                    setAuthError('Please enter username and password');
                    return;
                  }
                  localStorage.setItem('admin_user', adminUserInput);
                  localStorage.setItem('admin_pass', adminPassInput);
                  window.location.reload();
                }}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Lock className="w-5 h-5" />
                <span className="font-semibold">Login to Dashboard</span>
              </motion.button>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">System Status</h3>
                  <span className="text-xs text-blue-300">{new Date().toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm mb-3">
                  <div className={`w-3 h-3 rounded-full ${loginHealthLoading ? 'bg-yellow-400 animate-pulse' : loginHealth === 'ok' ? 'bg-green-400' : loginHealth === 'down' ? 'bg-red-400' : 'bg-gray-400'}`}></div>
                  <span className="text-blue-200">Backend: {loginHealthLoading ? 'Checking…' : loginHealth === 'ok' ? 'Online' : loginHealth === 'down' ? 'Offline' : 'Unknown'}</span>
                </div>
                <div className="text-xs text-blue-300 break-all bg-white/5 p-2 rounded-lg">API URL: {API_URL}</div>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                <h3 className="text-lg font-semibold text-white mb-4">Security Features</h3>
                <ul className="space-y-3 text-sm text-blue-200">
                  <li className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Zero Trust: Admin endpoints require explicit Basic Auth</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Lock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>No cookies used for admin auth; credentials stay on your device</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Backend rejects requests without exact credentials</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Modern Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 border-b border-blue-800/30 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-200 text-sm font-medium">Live Monitoring</span>
                  </div>
                  <span className="text-blue-300 text-sm">•</span>
                  <span className="text-blue-200 text-sm">Real-time system analytics</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Quick Actions */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchAdminData}
                className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="font-medium">Refresh</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  try {
                    const response = await fetch(`${API_URL}/api/admin/health`, { headers: authHeaders });
                    if (response.ok) {
                      const health = await response.json();
                      alert(`Database: ${health.database.connected ? 'Connected' : 'Disconnected'}\nUsers: ${health.database.models.users.count}\nProjects: ${health.database.models.projects.count}\nScans: ${health.database.models.scans.count}`);
                    } else {
                      alert('Health check failed - Backend server may not be running');
                    }
                  } catch (error) {
                    console.error('Health check error:', error);
                    alert('Health check error - Backend server is not running on port 3001');
                  }
                }}
                className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Shield className="w-4 h-4" />
                <span className="font-medium">Health Check</span>
              </motion.button>
              
              {/* Services Status */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowServicesModal(true)}
                className="flex items-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all duration-200 border border-white/20"
                title="View service status"
              >
                <div className={`w-3 h-3 rounded-full ${servicesOnlineCount === servicePaths.length ? 'bg-green-400' : servicesOnlineCount === 0 ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                <span className="text-sm font-medium">{servicesOnlineCount}/{servicePaths.length}</span>
                <Server className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  localStorage.removeItem('admin_user');
                  localStorage.removeItem('admin_pass');
                  window.location.href = '/admin';
                }}
                className="flex items-center space-x-2 px-5 py-3 bg-red-600/20 hover:bg-red-600/30 backdrop-blur-sm text-red-200 hover:text-white rounded-xl transition-all duration-200 border border-red-500/30"
                title="Logout"
              >
                <Unlock className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Modal */}
      {showServicesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Service Status</h3>
              <button
                onClick={() => setShowServicesModal(false)}
                className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {servicePaths.map((path) => {
                  const status = serviceStatus[path] || 'checking';
                  const dot = status === 'online' ? 'bg-green-500' : status === 'offline' ? 'bg-red-500' : 'bg-yellow-500';
                  return (
                    <div key={path} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${dot}`}></div>
                        <span className="text-sm text-gray-800">{path}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${status === 'online' ? 'text-green-700 bg-green-50 border-green-200' : status === 'offline' ? 'text-red-700 bg-red-50 border-red-200' : 'text-yellow-700 bg-yellow-50 border-yellow-200'}`}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-xs text-gray-500">Auto-refreshes every 60s.</div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Backend Status Warning */}
        {!isBackendRunning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Backend Server Not Running</h3>
                <p className="text-sm text-red-700">
                  The admin dashboard cannot fetch real data because the backend server is not running on port 3001. 
                  Please start the backend server to see real-time data.
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Enhanced Hero Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Hero Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-blue-200/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-700">Total Users</p>
                  <motion.p 
                    key={stats.totalUsers}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold text-blue-900"
                  >
                    {formatNumber(stats.totalUsers)}
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+12% this month</span>
                </div>
                <div className="w-16 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-emerald-200/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Database className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-700">Active Projects</p>
                  <motion.p 
                    key={stats.totalProjects}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold text-emerald-900"
                  >
                    {formatNumber(stats.totalProjects)}
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+8% this week</span>
                </div>
                <div className="w-16 h-2 bg-emerald-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    transition={{ delay: 0.7, duration: 1 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="group bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-purple-200/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-purple-700">Total Scans</p>
                  <motion.p 
                    key={stats.totalScans}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold text-purple-900"
                  >
                    {formatNumber(stats.totalScans)}
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+15% today</span>
                </div>
                <div className="w-16 h-2 bg-purple-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ delay: 0.9, duration: 1 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="group bg-gradient-to-br from-amber-50 to-amber-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-amber-200/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-700">Supporters</p>
                  <motion.p 
                    key={stats.supporters}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold text-amber-900"
                  >
                    {formatNumber(stats.supporters)}
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">${formatNumber(stats.totalDonations)}</span>
                </div>
                <div className="w-16 h-2 bg-amber-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "45%" }}
                    transition={{ delay: 1.1, duration: 1 }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="group bg-gradient-to-br from-indigo-50 to-indigo-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-indigo-200/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-indigo-700">Success Rate</p>
                  <motion.p 
                    key={stats.successRate}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold text-indigo-900"
                  >
                    {formatPercentage(stats.successRate)}
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <Zap className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-blue-600 font-medium">Avg: {formatDuration(stats.averageScanTime)}</span>
                </div>
                <div className="w-16 h-2 bg-indigo-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.successRate}%` }}
                    transition={{ delay: 1.3, duration: 1 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Real-time Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Live System Activity</h3>
                  <p className="text-slate-300 text-sm">Real-time monitoring and alerts</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Live</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Active Users</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.activeUsers)}</div>
                <div className="text-xs text-green-400">+5 in last hour</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Scans Today</span>
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">{Math.floor(stats.totalScans * 0.1)}</div>
                <div className="text-xs text-green-400">+12% vs yesterday</div>
              </div>
              
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">System Health</span>
                  <Shield className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">{isBackendRunning ? '99.9%' : '0%'}</div>
                <div className="text-xs text-green-400">Uptime</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* System Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">CPU Usage</span>
                  <span className="font-medium">{formatPercentage(systemMetrics.cpuUsage)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${systemMetrics.cpuUsage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Memory Usage</span>
                  <span className="font-medium">{formatPercentage(systemMetrics.memoryUsage)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${systemMetrics.memoryUsage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Disk Usage</span>
                  <span className="font-medium">{formatPercentage(systemMetrics.diskUsage)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${systemMetrics.diskUsage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{formatNumber(systemMetrics.requestsPerMinute)}</div>
                <div className="text-sm text-gray-600">Requests/min</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatNumber(systemMetrics.activeConnections)}</div>
                <div className="text-sm text-gray-600">Active Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{formatDuration(systemMetrics.averageResponseTime)}</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{formatPercentage(systemMetrics.errorRate)}</div>
                <div className="text-sm text-gray-600">Error Rate</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-gray-200/50">
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3, color: 'blue' },
                { id: 'users', name: 'Users', icon: Users, color: 'emerald' },
                { id: 'scans', name: 'Scans', icon: Activity, color: 'purple' },
                { id: 'monitoring', name: 'Monitoring', icon: Globe, color: 'amber' },
                { id: 'feedback', name: 'Feedback', icon: MessageSquare, color: 'indigo' }
              ].map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-500/25`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className={`relative z-10 w-5 h-5 flex items-center justify-center ${
                      isActive ? 'text-white' : `text-${tab.color}-500 group-hover:text-${tab.color}-600`
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`relative z-10 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>
                      {tab.name}
                    </span>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="relative z-10 w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search users, scans, feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200/50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500"
                  />
                  {searchTerm && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                    >
                      <XCircle className="w-3 h-3 text-gray-600" />
                    </motion.button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-8 py-4 bg-gray-50/80 border border-gray-200/50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="scanning">Scanning</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-10 pr-8 py-4 bg-gray-50/80 border border-gray-200/50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="updatedAt">Last Updated</option>
                    <option value="email">Email</option>
                    <option value="name">Name</option>
                  </select>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Recent Users</h3>
                      <p className="text-sm text-gray-600">Latest registered users</p>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('users')}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition-colors"
                  >
                    View All
                  </motion.button>
                </div>
                <div className="space-y-3">
                  {sortedUsers.slice(0, 5).map((user, index) => (
                    <motion.div 
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl hover:from-blue-50 hover:to-blue-100/50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">{user.email}</p>
                          <p className="text-sm text-gray-600">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">{user.projects}</span>
                          <span className="text-xs text-gray-500">projects</span>
                        </div>
                        <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Scans */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Recent Scans</h3>
                      <p className="text-sm text-gray-600">Latest scan activities</p>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('scans')}
                    className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg font-medium transition-colors"
                  >
                    View All
                  </motion.button>
                </div>
                <div className="space-y-3">
                  {sortedScans.slice(0, 5).map((scan, index) => (
                    <motion.div 
                      key={scan._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl hover:from-purple-50 hover:to-purple-100/50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                          scan.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                          scan.status === 'scanning' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                          scan.status === 'failed' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                          'bg-gradient-to-br from-blue-500 to-blue-600'
                        }`}>
                          {getStatusIcon(scan.status)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-purple-900 transition-colors">Scan #{scan._id.slice(-6)}</p>
                          <p className="text-sm text-gray-600">{formatDuration(scan.scanDuration)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(scan.status)}`}>
                          {scan.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(scan.createdAt)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === 'users' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                      <p className="text-sm text-gray-600">Manage and monitor user accounts</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="text-lg font-bold text-blue-600">{sortedUsers.length}</span>
                  </div>
                </div>
              </div>
              
              {/* Mobile Card Layout */}
              <div className="block lg:hidden">
                <div className="p-6 space-y-4">
                  {sortedUsers.map((user, index) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200/50 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.email}</p>
                            <p className="text-sm text-gray-600">{user.firstName} {user.lastName}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isSupporter ? 'text-green-600 bg-green-50 border border-green-200' : 'text-gray-600 bg-gray-50 border border-gray-200'
                        }`}>
                          {user.isSupporter ? 'Supporter' : 'Free'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-blue-600">{user.projects}</p>
                          <p className="text-xs text-gray-500">Projects</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-purple-600">{user.scansThisMonth}</p>
                          <p className="text-xs text-gray-500">Scans</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">${user.totalDonations}</p>
                          <p className="text-xs text-gray-500">Donated</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200/50">
                        <p className="text-xs text-gray-500">Joined: {formatDate(user.createdAt)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Projects</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Scans</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Donations</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {sortedUsers.map((user, index) => (
                      <motion.tr 
                        key={user._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">{user.email}</div>
                              <div className="text-sm text-gray-600">
                                {user.firstName} {user.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            user.isSupporter ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-600 bg-gray-50 border-gray-200'
                          }`}>
                            {user.isSupporter ? 'Supporter' : 'Free'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{user.projects}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{user.scansThisMonth}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">${user.totalDonations}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}



          {activeTab === 'scans' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Scan Management</h3>
                      <p className="text-sm text-gray-600">Monitor and analyze scan activities</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-lg font-bold text-purple-600">{scansTotal}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="createdAt">Created Date</option>
                        <option value="status">Status</option>
                        <option value="scanDuration">Duration</option>
                      </select>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-colors"
                      >
                        {sortOrder === 'asc' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                {scansLoading ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <RefreshCw className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <p className="text-gray-600 font-medium">Loading scans...</p>
                    <p className="text-sm text-gray-500 mt-1">Fetching latest scan data</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile Card Layout */}
                    <div className="block lg:hidden">
                      <div className="p-6 space-y-4">
                        {sortedScans.map((scan, index) => (
                          <motion.div
                            key={scan._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200/50 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                                  scan.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                                  scan.status === 'scanning' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                                  scan.status === 'failed' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                                  'bg-gradient-to-br from-blue-500 to-blue-600'
                                }`}>
                                  <Activity className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">#{scan._id.slice(-6)}</p>
                                  <p className="text-sm text-gray-600">{formatDuration(scan.scanDuration)}</p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(scan.status)}`}>
                                {scan.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <p className="text-lg font-bold text-purple-600">
                                  {scan.results?.overall ? `${scan.results.overall.score}/100` : '-'}
                                </p>
                                <p className="text-xs text-gray-500">Score</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-blue-600">{formatDate(scan.createdAt)}</p>
                                <p className="text-xs text-gray-500">Created</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Desktop Table Layout */}
                    <div className="hidden lg:block">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Scan ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/50">
                          {sortedScans.map((scan, index) => (
                            <motion.tr 
                              key={scan._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index }}
                              className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/50 transition-all duration-300 group"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                                    scan.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                                    scan.status === 'scanning' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                                    scan.status === 'failed' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                                    'bg-gradient-to-br from-blue-500 to-blue-600'
                                  }`}>
                                    <Activity className="w-6 h-6 text-white" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-900 transition-colors">#{scan._id.slice(-6)}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(scan.status)}`}>
                                  {scan.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {scan.results?.overall ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="text-sm font-semibold text-gray-900">
                                      {scan.results.overall.score}/100
                                    </div>
                                    <span className="text-xs text-gray-500">({scan.results.overall.grade})</span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{formatDuration(scan.scanDuration)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(scan.createdAt)}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {scansPages > 1 && (
                      <div className="px-6 py-4 border-t border-gray-200/50">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Showing {((scansPage - 1) * scansLimit) + 1} to {Math.min(scansPage * scansLimit, scansTotal)} of {scansTotal} scans
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => fetchScans(scansPage - 1)}
                              disabled={scansPage <= 1}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Previous
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-600">
                              Page {scansPage} of {scansPages}
                            </span>
                            <button
                              onClick={() => fetchScans(scansPage + 1)}
                              disabled={scansPage >= scansPages}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'monitoring' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900">User Monitoring Activity</h3>
                <p className="text-sm text-gray-600 mt-1">Shows user monitoring activity without exposing private website URLs</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Websites</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Online</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offline</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {sortedUserMonitoring.map((monitoring) => (
                      <tr key={monitoring.userId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{monitoring.userInfo.name}</div>
                              <div className="text-sm text-gray-500">{monitoring.userInfo.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{monitoring.monitoringStats.totalWebsites}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{monitoring.monitoringStats.activeWebsites}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-50 border border-green-200">
                            {monitoring.monitoringStats.onlineWebsites}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-50 border border-red-200">
                            {monitoring.monitoringStats.offlineWebsites}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(monitoring.monitoringStats.lastActivity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">User Feedback</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage and respond to user feedback and suggestions</p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-semibold text-blue-600">{feedbackStats.total}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Recent:</span>
                      <span className="font-semibold text-green-600">{feedbackStats.recent}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Avg Rating:</span>
                      <span className="font-semibold text-yellow-600">{feedbackStats.rating.average}/5</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {sortedFeedback.map((feedback) => (
                      <tr 
                        key={feedback._id} 
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setShowFeedbackModal(true);
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <MessageSquare className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {feedback.userId && (feedback.userId.firstName || feedback.userId.lastName) 
                                  ? `${feedback.userId.firstName || ''} ${feedback.userId.lastName || ''}`.trim()
                                  : feedback.email ? feedback.email.split('@')[0] : 'Anonymous User'
                                }
                              </div>
                              <div className="text-sm text-gray-500">
                                {feedback.userId?.email || feedback.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            feedback.type === 'bug' ? 'text-red-600 bg-red-50 border border-red-200' :
                            feedback.type === 'feature' ? 'text-yellow-600 bg-yellow-50 border border-yellow-200' :
                            feedback.type === 'improvement' ? 'text-green-600 bg-green-50 border border-green-200' :
                            'text-blue-600 bg-blue-50 border border-blue-200'
                          }`}>
                            {feedback.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-gray-900 truncate">{feedback.title}</div>
                            <div className="text-xs text-gray-500 truncate">{feedback.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">({feedback.rating})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            feedback.status === 'pending' ? 'text-yellow-600 bg-yellow-50 border border-yellow-200' :
                            feedback.status === 'reviewed' ? 'text-blue-600 bg-blue-50 border border-blue-200' :
                            feedback.status === 'in-progress' ? 'text-purple-600 bg-purple-50 border border-purple-200' :
                            feedback.status === 'resolved' ? 'text-green-600 bg-green-50 border border-green-200' :
                            'text-gray-600 bg-gray-50 border border-gray-200'
                          }`}>
                            {feedback.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            feedback.priority === 'critical' ? 'text-red-600 bg-red-50 border border-red-200' :
                            feedback.priority === 'high' ? 'text-orange-600 bg-orange-50 border border-orange-200' :
                            feedback.priority === 'medium' ? 'text-yellow-600 bg-yellow-50 border border-yellow-200' :
                            'text-green-600 bg-green-50 border border-green-200'
                          }`}>
                            {feedback.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(feedback.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this feedback?')) {
                                  deleteFeedback(feedback._id);
                                }
                              }}
                              disabled={deletingFeedback === feedback._id}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                              title="Delete feedback"
                            >
                              {deletingFeedback === feedback._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Feedback Detail Modal */}
          {showFeedbackModal && selectedFeedback && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Feedback Details</h3>
                    <button
                      onClick={() => {
                        setShowFeedbackModal(false);
                        setSelectedFeedback(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* User Info */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {selectedFeedback.userId && (selectedFeedback.userId.firstName || selectedFeedback.userId.lastName) 
                          ? `${selectedFeedback.userId.firstName || ''} ${selectedFeedback.userId.lastName || ''}`.trim()
                          : selectedFeedback.email ? selectedFeedback.email.split('@')[0] : 'Anonymous User'
                        }
                      </h4>
                      <p className="text-sm text-gray-600">
                        {selectedFeedback.userId?.email || selectedFeedback.email || 'No email'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Submitted on {formatDate(selectedFeedback.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Feedback Type & Rating */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Type</h5>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedFeedback.type === 'bug' ? 'text-red-600 bg-red-100' :
                        selectedFeedback.type === 'feature' ? 'text-yellow-600 bg-yellow-100' :
                        selectedFeedback.type === 'improvement' ? 'text-green-600 bg-green-100' :
                        'text-blue-600 bg-blue-100'
                      }`}>
                        {selectedFeedback.type.charAt(0).toUpperCase() + selectedFeedback.type.slice(1)}
                      </span>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-xl">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Rating</h5>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < selectedFeedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">({selectedFeedback.rating}/5)</span>
                      </div>
                    </div>
                  </div>

                  {/* Category & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Category</h5>
                      <span className="text-sm text-gray-900">{selectedFeedback.category}</span>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Status</h5>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedFeedback.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                        selectedFeedback.status === 'reviewed' ? 'text-blue-600 bg-blue-100' :
                        selectedFeedback.status === 'in-progress' ? 'text-purple-600 bg-purple-100' :
                        selectedFeedback.status === 'resolved' ? 'text-green-600 bg-green-100' :
                        'text-gray-600 bg-gray-100'
                      }`}>
                        {selectedFeedback.status.charAt(0).toUpperCase() + selectedFeedback.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Title</h5>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-900">{selectedFeedback.title}</h4>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.description}</p>
                    </div>
                  </div>

                  {/* Admin Notes (if any) */}
                  {selectedFeedback.adminNotes && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Admin Notes</h5>
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.adminNotes}</p>
                      </div>
                    </div>
                  )}

                  {/* Priority */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Priority</h5>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedFeedback.priority === 'critical' ? 'text-red-600 bg-red-100' :
                      selectedFeedback.priority === 'high' ? 'text-orange-600 bg-orange-100' :
                      selectedFeedback.priority === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                      'text-green-600 bg-green-100'
                    }`}>
                      {selectedFeedback.priority.charAt(0).toUpperCase() + selectedFeedback.priority.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowFeedbackModal(false);
                      setSelectedFeedback(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
