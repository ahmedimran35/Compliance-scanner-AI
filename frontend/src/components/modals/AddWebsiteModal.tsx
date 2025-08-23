"use client";

import { useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, AlertCircle, Activity, ArrowRight, Sparkles, Clock, Zap } from 'lucide-react';
import { getApiUrl } from '@/config/api';

interface AddWebsiteModalProps {
  onClose: () => void;
  onWebsiteAdded: (website: any) => void;
}

export default function AddWebsiteModal({ onClose, onWebsiteAdded }: AddWebsiteModalProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [interval, setInterval] = useState<'1min' | '5min' | '30min'>('5min');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Website name is required');
      return;
    }

    if (!url.trim()) {
      setError('Website URL is required');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();

      if (!token) {
        setError('Authentication token not available. Please sign in again.');
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/monitoring/websites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          url: url.trim(),
          interval,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Add Website Error:', response.status, data);

        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else if (response.status === 400) {
          throw new Error(data.error || 'Invalid website data');
        } else {
          throw new Error(data.error || 'Failed to add website');
        }
      }

      onWebsiteAdded(data.website);
    } catch (err: any) {
      console.error('Add website error:', err);
      setError(err.message || 'Failed to add website');
    } finally {
      setLoading(false);
    }
  };

  const intervalOptions = [
    { value: '1min', label: '1 Minute', description: 'High frequency monitoring', icon: Zap },
    { value: '5min', label: '5 Minutes', description: 'Standard monitoring', icon: Clock },
    { value: '30min', label: '30 Minutes', description: 'Low frequency monitoring', icon: Activity },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-green-50/30">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Add Website</h2>
                <p className="text-slate-600">Start monitoring a new website</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm text-red-700 font-medium">{error}</span>
              </motion.div>
            )}

            <div className="space-y-8">
              {/* Website Details */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-50 to-green-50/30 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Website Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                        Website Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                        placeholder="Enter website name"
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label htmlFor="url" className="block text-sm font-semibold text-slate-700 mb-2">
                        Website URL *
                      </label>
                      <input
                        type="url"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                        placeholder="https://example.com"
                        maxLength={500}
                      />
                    </div>
                  </div>
                </div>

                {/* Monitoring Interval */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Monitoring Interval</h3>
                  </div>

                  <div className="space-y-3">
                    {intervalOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <motion.label
                          key={option.value}
                          className={`relative flex items-center space-x-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                            interval === option.value
                              ? 'border-green-500 bg-green-50/50'
                              : 'border-slate-200 bg-white/80 hover:border-slate-300'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <input
                            type="radio"
                            name="interval"
                            value={option.value}
                            checked={interval === option.value}
                            onChange={(e) => setInterval(e.target.value as '1min' | '5min' | '30min')}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            interval === option.value
                              ? 'border-green-500 bg-green-500'
                              : 'border-slate-300'
                          }`}>
                            {interval === option.value && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              interval === option.value
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                : 'bg-slate-100'
                            }`}>
                              <Icon className={`w-5 h-5 ${
                                interval === option.value ? 'text-white' : 'text-slate-500'
                              }`} />
                            </div>
                            <div>
                              <p className={`font-semibold ${
                                interval === option.value ? 'text-green-700' : 'text-slate-900'
                              }`}>
                                {option.label}
                              </p>
                              <p className="text-sm text-slate-600">{option.description}</p>
                            </div>
                          </div>
                        </motion.label>
                      );
                    })}
                  </div>
                </div>

                {/* Info Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">What happens next?</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-slate-700">
                        Your website will be immediately added to our monitoring system
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-slate-700">
                        We'll start checking your website at the selected interval
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-slate-700">
                        You'll receive instant alerts if your website goes down
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 mt-8 pt-6 border-t border-slate-200">
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 border-2 border-slate-200 text-slate-700 rounded-2xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading || !name.trim() || !url.trim()}
                className="group flex-1 px-6 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {loading ? (
                  <div className="flex items-center justify-center space-x-2 relative z-10">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Adding Website...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 relative z-10">
                    <span>Add Website</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 