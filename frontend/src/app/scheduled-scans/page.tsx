"use client";

import React from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Globe,
  Settings,
  Repeat,
  Zap,
  BarChart3,
  Plus
} from 'lucide-react';
import Layout from '@/components/Layout';
import ScheduleScanModal from '@/components/modals/ScheduleScanModal';
import { getApiUrl } from '@/config/api';

interface ScheduledScan {
  _id: string;
  urlId: {
    _id: string;
    url: string;
    name?: string;
  };
  projectId: {
    _id: string;
    name: string;
  };
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  scanOptions: {
    gdpr: boolean;
    accessibility: boolean;
    security: boolean;
    performance: boolean;
    seo: boolean;
    customRules: string[];
  };
  isActive: boolean;
  lastRun?: string;
  nextRun: string;
  createdAt: string;
}

export default function ScheduledScansPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  
  const [scheduledScans, setScheduledScans] = React.useState<ScheduledScan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = React.useState(false);
  const [selectedScan, setSelectedScan] = React.useState<ScheduledScan | null>(null);

  React.useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  React.useEffect(() => {
    if (user && isLoaded) {
      fetchScheduledScans();
    }
  }, [user?.id]);

  const fetchScheduledScans = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();

      if (!token) {
        setError('Authentication token not available. Please sign in again.');
        return;
      }

      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}/api/scheduled-scans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch scheduled scans: ${response.statusText}`);
      }

      const data = await response.json();
      setScheduledScans(data);
    } catch (err) {
      console.error('Error fetching scheduled scans:', err);
      setError('Failed to fetch scheduled scans. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Poll for updates every 30 seconds
  React.useEffect(() => {
    if (!user || !isLoaded) return;

    const interval = setInterval(() => {
      if (process.env.NODE_ENV === 'development') {
      }
      fetchScheduledScans();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, isLoaded, fetchScheduledScans]);

  const handleToggleActive = async (scanId: string, currentStatus: boolean) => {
    try {
      const token = await getToken();
      if (!token) return;

      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}/api/scheduled-scans/${scanId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setScheduledScans(prev => prev.map(scan => 
          scan._id === scanId ? { ...scan, isActive: !currentStatus } : scan
        ));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error toggling scheduled scan:', error);
      }
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled scan? This action cannot be undone.')) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}/api/scheduled-scans/${scanId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setScheduledScans(prev => prev.filter(scan => scan._id !== scanId));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting scheduled scan:', error);
      }
    }
  };

  const getFrequencyText = (scan: ScheduledScan) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    switch (scan.frequency) {
      case 'daily':
        return `Every day at ${scan.time}`;
      case 'weekly':
        return `Every ${daysOfWeek[scan.dayOfWeek || 0]} at ${scan.time}`;
      case 'monthly':
        return `Every ${scan.dayOfMonth}${getDaySuffix(scan.dayOfMonth || 1)} of the month at ${scan.time}`;
      default:
        return 'Unknown frequency';
    }
  };

  const getDaySuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const getScanOptionsText = (scan: ScheduledScan) => {
    const options = [];
    if (scan.scanOptions.gdpr) options.push('GDPR');
    if (scan.scanOptions.accessibility) options.push('Accessibility');
    if (scan.scanOptions.security) options.push('Security');
    if (scan.scanOptions.performance) options.push('Performance');
    if (scan.scanOptions.seo) options.push('SEO');
    return options.join(', ') || 'None';
  };

  const getTimeUntilNextRun = (nextRun: string) => {
    const now = new Date();
    const next = new Date(nextRun);
    const diff = next.getTime() - now.getTime();
    
    if (diff <= 0) return 'Due now';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (scan: ScheduledScan) => {
    if (!scan.isActive) return 'text-gray-500 bg-gray-100';
    
    const nextRun = new Date(scan.nextRun);
    const now = new Date();
    const diff = nextRun.getTime() - now.getTime();
    
    if (diff <= 0) return 'text-red-600 bg-red-100';
    if (diff <= 300000) return 'text-orange-600 bg-orange-100'; // 5 minutes
    return 'text-green-600 bg-green-100';
  };

  const getStatusText = (scan: ScheduledScan) => {
    if (!scan.isActive) return 'Paused';
    
    const nextRun = new Date(scan.nextRun);
    const now = new Date();
    const diff = nextRun.getTime() - now.getTime();
    
    if (diff <= 0) return 'Due now';
    if (diff <= 300000) return 'Starting soon'; // 5 minutes
    return 'Active';
  };

  const getSchedulesForUrl = (urlId: string) => {
    return scheduledScans.filter(scan => scan.urlId._id === urlId).length;
  };

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
        {/* Enhanced Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 shadow-2xl border border-blue-800/30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
              <div className="flex items-center space-x-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Calendar className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Scheduled Scans</h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-200 text-sm font-medium">Automated Monitoring</span>
                    </div>
                    <span className="text-blue-300 text-sm">•</span>
                    <span className="text-blue-200 text-sm">Smart scheduling system</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <motion.p 
                      key={scheduledScans.filter(s => s.isActive).length}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-bold text-white"
                    >
                      {scheduledScans.filter(s => s.isActive).length}
                    </motion.p>
                    <p className="text-blue-200 text-sm font-medium">Active</p>
                  </div>
                  <div className="text-center">
                    <motion.p 
                      key={scheduledScans.length}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-bold text-white"
                    >
                      {scheduledScans.length}
                    </motion.p>
                    <p className="text-blue-200 text-sm font-medium">Total</p>
                  </div>
                  <div className="text-center">
                    <motion.p 
                      key={new Set(scheduledScans.map(s => s.urlId._id)).size}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-bold text-white"
                    >
                      {new Set(scheduledScans.map(s => s.urlId._id)).size}
                    </motion.p>
                    <p className="text-blue-200 text-sm font-medium">URLs</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchScheduledScans}
                  disabled={loading}
                  className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BarChart3 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group bg-gradient-to-br from-green-50 to-green-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-green-200/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Play className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-700">Active Schedules</p>
                <motion.p 
                  key={scheduledScans.filter(s => s.isActive).length}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-green-900"
                >
                  {loading ? '...' : scheduledScans.filter(s => s.isActive).length}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-green-600 font-medium">Running</span>
              </div>
              <div className="w-16 h-2 bg-green-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${scheduledScans.length > 0 ? (scheduledScans.filter(s => s.isActive).length / scheduledScans.length) * 100 : 0}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group bg-gradient-to-br from-gray-50 to-gray-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Pause className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">Paused Schedules</p>
                <motion.p 
                  key={scheduledScans.filter(s => !s.isActive).length}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-gray-900"
                >
                  {loading ? '...' : scheduledScans.filter(s => !s.isActive).length}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                <span className="text-gray-600 font-medium">Stopped</span>
              </div>
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${scheduledScans.length > 0 ? (scheduledScans.filter(s => !s.isActive).length / scheduledScans.length) * 100 : 0}%` }}
                  transition={{ delay: 0.7, duration: 1 }}
                  className="h-full bg-gradient-to-r from-gray-500 to-slate-600 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-orange-200/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-orange-700">Due Soon</p>
                <motion.p 
                  key={scheduledScans.filter(s => {
                    if (!s.isActive) return false;
                    const nextRun = new Date(s.nextRun);
                    const now = new Date();
                    const diff = nextRun.getTime() - now.getTime();
                    return diff <= 300000 && diff > 0;
                  }).length}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-orange-900"
                >
                  {loading ? '...' : scheduledScans.filter(s => {
                    if (!s.isActive) return false;
                    const nextRun = new Date(s.nextRun);
                    const now = new Date();
                    const diff = nextRun.getTime() - now.getTime();
                    return diff <= 300000 && diff > 0;
                  }).length}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-orange-600 font-medium">Starting soon</span>
              </div>
              <div className="w-16 h-2 bg-orange-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ delay: 0.9, duration: 1 }}
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-600 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group bg-gradient-to-br from-red-50 to-red-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-red-200/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-red-700">Overdue</p>
                <motion.p 
                  key={scheduledScans.filter(s => {
                    if (!s.isActive) return false;
                    const nextRun = new Date(s.nextRun);
                    const now = new Date();
                    return nextRun.getTime() <= now.getTime();
                  }).length}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-red-900"
                >
                  {loading ? '...' : scheduledScans.filter(s => {
                    if (!s.isActive) return false;
                    const nextRun = new Date(s.nextRun);
                    const now = new Date();
                    return nextRun.getTime() <= now.getTime();
                  }).length}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-red-600 font-medium">Needs attention</span>
              </div>
              <div className="w-16 h-2 bg-red-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "25%" }}
                  transition={{ delay: 1.1, duration: 1 }}
                  className="h-full bg-gradient-to-r from-red-500 to-pink-600 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Scheduled Scans List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden"
        >
          {loading ? (
            <div className="p-16 text-center">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-slate-200/50 max-w-md mx-auto">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Calendar className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Loading Schedules</h3>
                    <p className="text-slate-600">Fetching your scheduled scans...</p>
                  </div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-16 text-center">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-red-200/50 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Schedules</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchScheduledScans}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Try Again
                </motion.button>
              </div>
            </div>
          ) : scheduledScans.length === 0 ? (
            <div className="p-16 text-center">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-16 border border-slate-200/50 shadow-2xl max-w-lg mx-auto">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Calendar className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No Scheduled Scans</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  You haven't set up any automated scans yet. Schedule scans to automatically monitor your websites with different frequencies and scan options.
                </p>
                
                <motion.button
                  onClick={() => router.push('/projects')}
                  className="group bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-3 mx-auto overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Calendar className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Go to Projects</span>
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b-2 border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50/30">
                    <th className="text-left py-4 px-4 font-bold text-slate-800 min-w-[200px]">Website</th>
                    <th className="text-left py-4 px-4 font-bold text-slate-800 min-w-[150px]">Schedule</th>
                    <th className="text-left py-4 px-4 font-bold text-slate-800 min-w-[180px]">Scan Options</th>
                    <th className="text-left py-4 px-4 font-bold text-slate-800 min-w-[100px]">Status</th>
                    <th className="text-left py-4 px-4 font-bold text-slate-800 min-w-[140px]">Next Run</th>
                    <th className="text-left py-4 px-4 font-bold text-slate-800 min-w-[120px]">Last Run</th>
                    <th className="text-left py-4 px-4 font-bold text-slate-800 min-w-[110px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledScans.map((scan, index) => (
                    <motion.tr 
                      key={scan._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group border-b border-slate-100/50 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 ${
                        index % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/30'
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Globe className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 mb-1 truncate">
                              {scan.urlId.name || 'Unnamed Website'}
                            </div>
                            <div className="text-sm text-slate-600 truncate mb-1">
                              {scan.urlId.url}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {scan.projectId.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-md flex items-center justify-center shadow-lg">
                            <Repeat className="w-3 h-3 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-semibold text-slate-800 truncate block">{getFrequencyText(scan)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {scan.scanOptions.gdpr && (
                            <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-xs font-semibold shadow-sm">
                              GDPR
                            </span>
                          )}
                          {scan.scanOptions.accessibility && (
                            <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-xs font-semibold shadow-sm">
                              A11y
                            </span>
                          )}
                          {scan.scanOptions.security && (
                            <span className="px-2 py-1 bg-gradient-to-r from-red-100 to-red-200 text-red-800 rounded-full text-xs font-semibold shadow-sm">
                              Security
                            </span>
                          )}
                          {scan.scanOptions.performance && (
                            <span className="px-2 py-1 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 rounded-full text-xs font-semibold shadow-sm">
                              Perf
                            </span>
                          )}
                          {scan.scanOptions.seo && (
                            <span className="px-2 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full text-xs font-semibold shadow-sm">
                              SEO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(scan)}`}>
                          {getStatusText(scan)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-md flex items-center justify-center shadow-lg">
                            <Clock className="w-3 h-3 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-slate-900 truncate">
                              {new Date(scan.nextRun).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-blue-600 font-semibold truncate">
                              {getTimeUntilNextRun(scan.nextRun)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {scan.lastRun ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-gray-500 to-slate-600 rounded-md flex items-center justify-center shadow-lg">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-slate-900 truncate">
                                {new Date(scan.lastRun).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-slate-600 truncate">
                                {new Date(scan.lastRun).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-gray-300 to-gray-400 rounded-md flex items-center justify-center shadow-lg">
                              <XCircle className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-slate-500 text-sm font-medium">Never</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleToggleActive(scan._id, scan.isActive)}
                            className={`p-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md ${
                              scan.isActive 
                                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 bg-orange-50/50' 
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50 bg-green-50/50'
                            }`}
                            title={scan.isActive ? 'Pause Schedule' : 'Activate Schedule'}
                          >
                            {scan.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => router.push(`/projects/${scan.projectId._id}`)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md bg-slate-50/50"
                            title="View Project"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteScan(scan._id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md bg-slate-50/50"
                            title="Delete Schedule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
} 