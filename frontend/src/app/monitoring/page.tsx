"use client";

import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Globe, 
  Plus, 
  Settings, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  Target,
  TrendingUp,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Calendar,
  BarChart3,
  XCircle,
  Gauge,
  Sparkles,
  TrendingDown,
  Shield,
  Edit,
  Play,
  Pause
} from 'lucide-react';
import Layout from '@/components/Layout';
import MonitoringCard from '@/components/MonitoringCard';
import AddWebsiteModal from '@/components/modals/AddWebsiteModal';
import EditWebsiteModal from '@/components/modals/EditWebsiteModal';
import DeleteWebsiteModal from '@/components/modals/DeleteWebsiteModal';
import { getApiUrl } from '@/config/api';
import React from 'react';

interface Website {
  _id: string;
  name: string;
  url: string;
  interval: '1min' | '5min' | '30min';
  isActive: boolean;
  lastCheck: string;
  status: 'online' | 'offline' | 'warning';
  responseTime: number;
  uptime: number;
  createdAt: string;
  updatedAt: string;
}

interface MonitoringStats {
  totalWebsites: number;
  onlineWebsites: number;
  offlineWebsites: number;
  averageResponseTime: number;
  totalUptime: number;
}

export default function MonitoringPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [deletingWebsite, setDeletingWebsite] = useState<Website | null>(null);
  const [stats, setStats] = useState<MonitoringStats>({
    totalWebsites: 0,
    onlineWebsites: 0,
    offlineWebsites: 0,
    averageResponseTime: 0,
    totalUptime: 0
  });

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  // Fetch websites - optimized
  const fetchWebsites = React.useCallback(async () => {
    if (!getToken) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(`${getApiUrl()}/api/monitoring/websites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          setError('Authentication failed. Please sign in again.');
        } else if (response.status === 403) {
          setError('Access denied. Please check your permissions.');
        } else {
          setError(`Failed to fetch websites: ${errorData.error || response.statusText}`);
        }
        return;
      }

      const data = await response.json();
      setWebsites(data.websites || []);
      
      // Calculate stats
      const totalWebsites = data.websites?.length || 0;
      const onlineWebsites = data.websites?.filter((w: Website) => w.status === 'online').length || 0;
      const offlineWebsites = data.websites?.filter((w: Website) => w.status === 'offline').length || 0;
      const averageResponseTime = data.websites?.reduce((sum: number, w: Website) => sum + w.responseTime, 0) / totalWebsites || 0;
      const totalUptime = data.websites?.reduce((sum: number, w: Website) => sum + w.uptime, 0) / totalWebsites || 0;
      
      setStats({
        totalWebsites,
        onlineWebsites,
        offlineWebsites,
        averageResponseTime,
        totalUptime
      });
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Initial load - optimized
  React.useEffect(() => {
    if (user) {
      fetchWebsites();
    }
  }, [user?.id, fetchWebsites]); // Only depend on user ID and memoized function

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (websites.length > 0) {
      const interval = setInterval(() => {
        fetchWebsites();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [websites.length, fetchWebsites]);

  // Toggle website status - optimized
  const toggleWebsiteActiveStatus = React.useCallback(async (websiteId: string, currentStatus: boolean) => {
    if (!getToken) return;

    try {
      const token = await getToken();
      const response = await fetch(`${getApiUrl()}/api/monitoring/websites/${websiteId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setWebsites(prev => prev.map(website => 
          website._id === websiteId ? { ...website, isActive: !currentStatus } : website
        ));
      }
    } catch (error) {
    }
  }, [getToken]);

  const handleWebsiteAdded = (newWebsite: Website) => {
    setWebsites([newWebsite, ...websites]);
    setShowAddModal(false);
  };

  const handleWebsiteUpdated = (updatedWebsite: Website) => {
    setWebsites(websites.map(w => w._id === updatedWebsite._id ? updatedWebsite : w));
    setEditingWebsite(null);
  };

  const handleWebsiteDeleted = (websiteId: string) => {
    setWebsites(websites.filter(w => w._id !== websiteId));
    setDeletingWebsite(null);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-slate-600 text-lg font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 flex items-center justify-center">
        <div className="text-slate-600 text-lg font-medium">Redirecting to sign in...</div>
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
            <div className="bg-gradient-to-r from-slate-900 via-green-900 to-emerald-900 rounded-3xl p-8 shadow-2xl border border-green-800/30">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
                <div className="flex items-center space-x-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Activity className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Website Monitoring</h1>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-200 text-sm font-medium">Live Monitoring</span>
                      </div>
                      <span className="text-green-300 text-sm">•</span>
                      <span className="text-green-200 text-sm">Real-time status updates</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <motion.p 
                        key={stats.onlineWebsites}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-bold text-white"
                      >
                        {stats.onlineWebsites}
                      </motion.p>
                      <p className="text-green-200 text-sm font-medium">Online</p>
                    </div>
                    <div className="text-center">
                      <motion.p 
                        key={stats.totalWebsites}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-bold text-white"
                      >
                        {stats.totalWebsites}
                      </motion.p>
                      <p className="text-green-200 text-sm font-medium">Total Sites</p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchWebsites}
                    disabled={loading}
                    className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-blue-200/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-700">Total Websites</p>
                  <motion.p 
                    key={stats.totalWebsites}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold text-blue-900"
                  >
                    {stats.totalWebsites}
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-blue-600 font-medium">Active monitoring</span>
                </div>
                <div className="w-16 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group bg-gradient-to-br from-green-50 to-green-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-green-200/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-700">Online</p>
                  <motion.p 
                    key={stats.onlineWebsites}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold text-green-900"
                  >
                    {stats.onlineWebsites}
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+5% this week</span>
                </div>
                <div className="w-16 h-2 bg-green-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.totalWebsites > 0 ? (stats.onlineWebsites / stats.totalWebsites) * 100 : 0}%` }}
                    transition={{ delay: 0.7, duration: 1 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="group bg-gradient-to-br from-red-50 to-red-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-red-200/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <XCircle className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-700">Offline</p>
                  <motion.p 
                    key={stats.offlineWebsites}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold text-red-900"
                  >
                    {stats.offlineWebsites}
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-red-600 font-medium">-2% this week</span>
                </div>
                <div className="w-16 h-2 bg-red-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.totalWebsites > 0 ? (stats.offlineWebsites / stats.totalWebsites) * 100 : 0}%` }}
                    transition={{ delay: 0.9, duration: 1 }}
                    className="h-full bg-gradient-to-r from-red-500 to-pink-600 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="group bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-purple-200/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-purple-700">Avg Response</p>
                  <motion.p 
                    key={stats.averageResponseTime}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold text-purple-900"
                  >
                    {stats.averageResponseTime.toFixed(0)}ms
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <Target className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-purple-600 font-medium">Fast response</span>
                </div>
                <div className="w-16 h-2 bg-purple-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (1000 - stats.averageResponseTime) / 10)}%` }}
                    transition={{ delay: 1.1, duration: 1 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="group bg-gradient-to-br from-yellow-50 to-yellow-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-yellow-200/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Gauge className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-yellow-700">Uptime</p>
                  <motion.p 
                    key={stats.totalUptime}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold text-yellow-900"
                  >
                    {stats.totalUptime.toFixed(1)}%
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+0.3% this month</span>
                </div>
                <div className="w-16 h-2 bg-yellow-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.totalUptime}%` }}
                    transition={{ delay: 1.3, duration: 1 }}
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-slate-200/50 mb-8"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Monitor Overview</h2>
                  <p className="text-slate-600">
                    {websites.length === 0 
                      ? "Get started by adding your first website to monitor" 
                      : `Monitoring ${websites.length} website${websites.length !== 1 ? 's' : ''} in real-time`
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={fetchWebsites}
                  className="p-3 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </motion.button>
                
                <motion.button
                  onClick={() => setShowAddModal(true)}
                  className="group relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Plus className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{loading ? 'Loading...' : 'Add Website'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

      {/* Websites Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-16"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-slate-200/50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Activity className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Loading Websites</h3>
                  <p className="text-slate-600">Fetching your monitoring data...</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center py-16"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-red-200/50 max-w-md text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Websites</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchWebsites}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        ) : websites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center py-16"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-16 border border-slate-200/50 shadow-2xl max-w-lg mx-auto">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Activity className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Start Monitoring Your Websites</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Add your first website to begin real-time monitoring with configurable intervals and instant status updates.
              </p>
              
              <motion.button
                onClick={() => setShowAddModal(true)}
                className="group bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-3 mx-auto overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Plus className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Add Your First Website</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {websites.map((website, index) => (
              <motion.div
                key={website._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              >
                <MonitoringCard
                  website={website}
                  onToggleStatus={(isActive) => toggleWebsiteActiveStatus(website._id, isActive)}
                  onEdit={() => setEditingWebsite(website)}
                  onDelete={() => setDeletingWebsite(website)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddWebsiteModal
          onClose={() => setShowAddModal(false)}
          onWebsiteAdded={handleWebsiteAdded}
        />
      )}

      {editingWebsite && (
        <EditWebsiteModal
          website={editingWebsite}
          onClose={() => setEditingWebsite(null)}
          onWebsiteUpdated={handleWebsiteUpdated}
        />
      )}

      {deletingWebsite && (
        <DeleteWebsiteModal
          website={deletingWebsite}
          onClose={() => setDeletingWebsite(null)}
          onWebsiteDeleted={handleWebsiteDeleted}
        />
      )}
    </Layout>
  );
} 