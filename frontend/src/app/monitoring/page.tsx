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
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200/50 mb-6">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Real-time Monitoring</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Website Monitoring
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Monitor your websites in real-time with configurable intervals and instant alerts
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12"
          >
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Websites</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalWebsites}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Online</p>
                  <p className="text-3xl font-bold text-green-600">{stats.onlineWebsites}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Offline</p>
                  <p className="text-3xl font-bold text-red-600">{stats.offlineWebsites}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Avg Response</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.averageResponseTime.toFixed(0)}ms</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Uptime</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalUptime.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Gauge className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          >
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-1">Monitor Overview</h2>
              <p className="text-slate-600">
                {websites.length === 0 
                  ? "Get started by adding your first website to monitor" 
                  : `Monitoring ${websites.length} website${websites.length !== 1 ? 's' : ''} in real-time`
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={fetchWebsites}
                className="p-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={() => setShowAddModal(true)}
                className="group relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Plus className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{loading ? 'Loading...' : 'Add Website'}</span>
              </motion.button>
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
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <span className="text-slate-600 text-lg font-medium">Loading your websites...</span>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center py-16"
          >
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Websites</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </motion.div>
        ) : websites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center py-16"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-16 border border-white/50 shadow-2xl max-w-lg mx-auto">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-12 h-12 text-green-600" />
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