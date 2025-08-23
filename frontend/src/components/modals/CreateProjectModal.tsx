"use client";

import { useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, Link, AlertCircle, CheckCircle, Clock, XCircle, Play, BarChart3, Globe, Settings, Zap, Crown, Calendar, Plus, Trash2, Sparkles, ArrowRight } from 'lucide-react';
import { getApiUrl } from '@/config/api';

interface CreateProjectModalProps {
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

interface URLInput {
  url: string;
  name: string;
}

export default function CreateProjectModal({ onClose, onProjectCreated }: CreateProjectModalProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [urls, setUrls] = useState<URLInput[]>([{ url: '', name: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUrl = () => {
    setUrls([...urls, { url: '', name: '' }]);
  };

  const removeUrl = (index: number) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const updateUrl = (index: number, field: 'url' | 'name', value: string) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    // Filter out empty URLs
    const validUrls = urls.filter(url => url.url.trim());

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();

      if (!token) {
        setError('Authentication token not available. Please sign in again.');
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          urls: validUrls.map(url => ({
            url: url.url.trim(),
            name: url.name.trim() || undefined,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Create Project Error:', response.status, data);

        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else if (response.status === 400) {
          throw new Error(data.error || 'Invalid project data');
        } else {
          throw new Error(data.error || 'Failed to create project');
        }
      }

      onProjectCreated(data.project);
    } catch (err: any) {
      console.error('Create project error:', err);
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="flex items-center justify-between p-8 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Folder className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Create New Project</h2>
                <p className="text-slate-600">Set up a new compliance scanning project</p>
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
              {/* Project Details */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Project Details</h3>
                  </div>
                  
              <div className="space-y-4">
                <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                        placeholder="Enter your project name"
                    maxLength={100}
                  />
                </div>

                <div>
                      <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none"
                        placeholder="Describe what this project is for..."
                    maxLength={500}
                  />
                    </div>
                </div>
              </div>

              {/* URLs Section */}
                <div className="bg-gradient-to-r from-slate-50 to-green-50/30 rounded-2xl p-6 border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Globe className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">Website URLs to Scan</h3>
                    </div>
                    <motion.button
                    type="button"
                    onClick={addUrl}
                      className="flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm font-semibold px-3 py-2 rounded-xl hover:bg-green-50 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add URL</span>
                    </motion.button>
                </div>

                  <div className="space-y-4">
                  {urls.map((url, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 space-y-3">
                        <input
                          type="url"
                          value={url.url}
                          onChange={(e) => updateUrl(index, 'url', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200"
                          placeholder="https://example.com"
                          required={index === 0}
                        />
                        <input
                          type="text"
                          value={url.name}
                          onChange={(e) => updateUrl(index, 'name', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200"
                          placeholder="Display name (optional)"
                        />
                      </div>
                      {urls.length > 1 && (
                            <motion.button
                          type="button"
                          onClick={() => removeUrl(index)}
                              className="p-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                            </motion.button>
                      )}
                    </div>
                      </motion.div>
                  ))}
                </div>

                  <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-200/50">
                    <p className="text-sm text-blue-700">
                      <strong>Tip:</strong> Add the website URLs you want to scan for compliance issues. At least one URL is required to create a project.
                </p>
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
                disabled={loading || !name.trim() || !urls.some(url => url.url.trim())}
                className="group flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {loading ? (
                  <div className="flex items-center justify-center space-x-2 relative z-10">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Project...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 relative z-10">
                    <span>Create Project</span>
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