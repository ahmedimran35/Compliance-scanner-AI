import React from 'react';
import { Globe, Clock, Edit, Trash2, Play, Pause, Wifi, WifiOff, AlertTriangle, CheckCircle, XCircle, Zap, BarChart3, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import { getApiUrl } from '@/config/api';

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

interface MonitoringCardProps {
  website: Website;
  onToggleStatus: (isActive: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MonitoringCard({ website, onToggleStatus, onEdit, onDelete }: MonitoringCardProps) {
  const { getToken } = useAuth();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication token not available');
      }

      const response = await fetch(`${getApiUrl()}/api/monitoring/websites/${website._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete website');
      }

      onDelete();
          } catch (error) {
        // Handle error silently or show toast notification
        console.error('Failed to delete website:', error);
      } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes === 1) return '1 minute ago';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'offline':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4" />;
      case 'offline':
        return <XCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime < 200) return 'text-green-600';
    if (responseTime < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return 'text-green-600';
    if (uptime >= 99.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 via-emerald-50/0 to-teal-50/0 group-hover:from-green-50/40 group-hover:via-emerald-50/30 group-hover:to-teal-50/40 transition-all duration-300 rounded-2xl"></div>
      
      {/* Top section with website info */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 mb-1 truncate group-hover:text-green-700 transition-colors">
                  {website.name}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>Last check: {formatDate(website.lastCheck)}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-slate-600 text-sm leading-relaxed truncate bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-200/50">
                {website.url}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-1 ml-4">
            <motion.button
              onClick={() => onToggleStatus(!website.isActive)}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md ${
                website.isActive 
                  ? 'text-green-600 hover:text-green-700 hover:bg-green-50 bg-green-50/50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 bg-slate-50/50'
              }`}
              title={website.isActive ? 'Pause Monitoring' : 'Start Monitoring'}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {website.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </motion.button>
            <motion.button
              onClick={onEdit}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md bg-slate-50/50"
              title="Edit Website"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Edit className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 shadow-sm hover:shadow-md bg-slate-50/50"
              title="Delete Website"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Status section */}
        <div className="bg-gradient-to-r from-slate-50 to-green-50/50 rounded-xl p-4 mb-5 border border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${getStatusColor(website.status)}`}>
                {getStatusIcon(website.status)}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 capitalize">{website.status}</p>
                <p className="text-sm text-slate-600">Current Status</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                website.status === 'online' ? 'bg-green-500' : 
                website.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <p className="text-xs text-slate-500 mt-1">
                {website.isActive ? 'Active' : 'Paused'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl p-3 border border-slate-200/50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className={`text-lg font-bold ${getResponseTimeColor(website.responseTime)}`}>
                  {website.responseTime}ms
                </p>
                <p className="text-xs text-slate-600">Response Time</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50/50 rounded-xl p-3 border border-slate-200/50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className={`text-lg font-bold ${getUptimeColor(website.uptime)}`}>
                  {website.uptime.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-600">Uptime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interval section */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50/50 rounded-xl p-3 mb-5 border border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{website.interval}</p>
                <p className="text-xs text-slate-600">Check Interval</p>
              </div>
            </div>
            <div className="text-right">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <p className="text-xs text-slate-500 mt-1">Monitoring</p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <motion.button
          onClick={onEdit}
          className="group/btn w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 overflow-hidden"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
          <Settings className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Manage Website</span>
        </motion.button>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setShowDeleteConfirm(false)} 
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-8 border-b border-slate-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Delete Website</h3>
                    <p className="text-sm text-slate-600">This action cannot be undone</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Close"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XCircle className="w-5 h-5" />
                </motion.button>
              </div>
              
              {/* Content */}
              <div className="p-8">
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 mb-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-red-600 text-lg">⚠️</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-red-800 mb-2">Warning</h4>
                        <p className="text-sm text-red-700 mb-3">
                          Deleting this website will permanently remove:
                        </p>
                        <ul className="text-sm text-red-700 space-y-2">
                          <li className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            <span>The website "<strong>{website.name}</strong>"</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            <span>All monitoring data and history</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            <span>All alerts and notifications</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    Are you sure you want to delete this website? This action cannot be undone and all monitoring data will be permanently lost.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-4">
                  <motion.button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-6 py-4 border-2 border-slate-200 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isDeleting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Deleting...</span>
                      </div>
                    ) : (
                      'Delete Website'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 