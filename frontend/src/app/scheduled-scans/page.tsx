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
      console.log('Polling for scheduled scans updates...');
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
      console.error('Error toggling scheduled scan:', error);
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
      console.error('Error deleting scheduled scan:', error);
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
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Scheduled Scans</h1>
              <p className="text-slate-600">
                Manage your automated compliance scans and monitoring schedules
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-slate-600">Active Schedules</p>
                <p className="text-2xl font-bold text-green-600">
                  {scheduledScans.filter(s => s.isActive).length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Total Schedules</p>
                <p className="text-2xl font-bold text-slate-900">{scheduledScans.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Unique URLs</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(scheduledScans.map(s => s.urlId._id)).size}
                </p>
              </div>
              <button
                onClick={fetchScheduledScans}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '...' : scheduledScans.filter(s => s.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Play className="w-6 h-6 text-green-600" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Paused</p>
                <p className="text-2xl font-bold text-gray-600">
                  {loading ? '...' : scheduledScans.filter(s => !s.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Pause className="w-6 h-6 text-gray-600" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Due Soon</p>
                <p className="text-2xl font-bold text-orange-600">
                  {loading ? '...' : scheduledScans.filter(s => {
                    if (!s.isActive) return false;
                    const nextRun = new Date(s.nextRun);
                    const now = new Date();
                    const diff = nextRun.getTime() - now.getTime();
                    return diff <= 300000 && diff > 0; // 5 minutes
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Clock className="w-6 h-6 text-orange-600" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {loading ? '...' : scheduledScans.filter(s => {
                    if (!s.isActive) return false;
                    const nextRun = new Date(s.nextRun);
                    const now = new Date();
                    return nextRun.getTime() <= now.getTime();
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scheduled Scans List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading scheduled scans...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : scheduledScans.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No scheduled scans</h3>
              <p className="text-slate-600 mb-6">
                You haven't set up any automated scans yet. Schedule scans to automatically monitor your websites. You can create multiple schedules for the same URL with different frequencies and scan options.
              </p>
              <button
                onClick={() => router.push('/projects')}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Go to Projects
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50">
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Website</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Schedule</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Scan Options</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Next Run</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Last Run</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledScans.map((scan, index) => (
                    <tr 
                      key={scan._id}
                      className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                            <Globe className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {scan.urlId.name || 'Unnamed Website'}
                            </div>
                            <div className="text-sm text-slate-500 truncate max-w-xs">
                              {scan.urlId.url}
                            </div>
                            <div className="text-xs text-slate-400">
                              Project: {scan.projectId.name}
                            </div>
                            <div className="text-xs text-blue-600 font-medium">
                              {getSchedulesForUrl(scan.urlId._id)} schedule{getSchedulesForUrl(scan.urlId._id) !== 1 ? 's' : ''} for this URL
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Repeat className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">{getFrequencyText(scan)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {scan.scanOptions.gdpr && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              GDPR
                            </span>
                          )}
                          {scan.scanOptions.accessibility && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              Accessibility
                            </span>
                          )}
                          {scan.scanOptions.security && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              Security
                            </span>
                          )}
                          {scan.scanOptions.performance && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                              Performance
                            </span>
                          )}
                          {scan.scanOptions.seo && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              SEO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(scan)}`}>
                          {getStatusText(scan)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {new Date(scan.nextRun).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-slate-500">
                              {new Date(scan.nextRun).toLocaleTimeString()} ({getTimeUntilNextRun(scan.nextRun)})
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {scan.lastRun ? (
                          <div className="text-sm text-slate-600">
                            {new Date(scan.lastRun).toLocaleDateString()}
                            <br />
                            <span className="text-xs text-slate-500">
                              {new Date(scan.lastRun).toLocaleTimeString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">Never</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleActive(scan._id, scan.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                              scan.isActive 
                                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' 
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            }`}
                            title={scan.isActive ? 'Pause Schedule' : 'Activate Schedule'}
                          >
                            {scan.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => router.push(`/projects/${scan.projectId._id}`)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Project"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteScan(scan._id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Schedule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
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