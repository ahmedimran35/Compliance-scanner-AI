import React from 'react';
import { Folder, Link, Edit, Trash2, Eye, Calendar, X, ArrowRight, Clock, Users, Sparkles, Target, Activity, TrendingUp, Globe, Zap, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { getApiUrl } from '@/config/api';

interface Project {
  _id: string;
  name: string;
  description?: string;
  urlCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
  showActions?: boolean;
}

export default function ProjectCard({ project, onDelete, showActions = true }: ProjectCardProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      setIsDeleting(true);
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication token not available');
      }

      const response = await fetch(`${getApiUrl()}/api/projects/${project._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete project');
      }

      onDelete(project._id);
          } catch (error) {
        // Handle error silently or show toast notification
        console.error('Failed to delete project:', error);
      } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate project health based on URL count and age
  const projectAge = Math.ceil((new Date().getTime() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const healthScore = Math.min(100, Math.max(0, 100 - (projectAge * 2) + (project.urlCount * 10)));
  const healthStatus = healthScore >= 80 ? 'excellent' : healthScore >= 60 ? 'good' : healthScore >= 40 ? 'fair' : 'poor';
  
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Health Status Indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getHealthColor(healthStatus).split(' ')[2]}`}></div>
      
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
              <Folder className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {project.name}
              </h3>
              <p className="text-sm text-slate-500">
                Created {formatDate(project.createdAt)}
              </p>
            </div>
          </div>
          
          {showActions && (
            <div className="flex space-x-1">
              <motion.button
                onClick={() => router.push(`/projects/${project._id}`)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Enhanced Stats */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Link className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{project.urlCount}</p>
                <p className="text-xs text-slate-500">URLs</p>
              </div>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getHealthColor(healthStatus)}`}>
              <div className={`w-2 h-2 rounded-full ${healthStatus === 'excellent' ? 'bg-green-500' : healthStatus === 'good' ? 'bg-blue-500' : healthStatus === 'fair' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-xs font-medium capitalize">{healthStatus}</span>
            </div>
          </div>
          
          {/* Health Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">Project Health</span>
              <span className="text-xs font-medium text-slate-700">{Math.round(healthScore)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${healthScore}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-2 rounded-full ${
                  healthStatus === 'excellent' ? 'bg-green-500' : 
                  healthStatus === 'good' ? 'bg-blue-500' : 
                  healthStatus === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              ></motion.div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-2">
          <motion.button
            onClick={() => router.push(`/projects/${project._id}`)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          
          <div className="flex space-x-2">
            <motion.button
              onClick={() => router.push(`/projects/${project._id}/scan`)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 text-sm"
            >
              <Zap className="w-3 h-3" />
              <span>Scan</span>
            </motion.button>
            <motion.button
              onClick={() => router.push(`/projects/${project._id}/reports`)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 text-sm"
            >
              <FileText className="w-3 h-3" />
              <span>Reports</span>
            </motion.button>
          </div>
        </div>
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
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Delete Project</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-red-600 text-lg">⚠️</span>
                      <div>
                        <h4 className="font-medium text-red-800 mb-2">Warning</h4>
                        <p className="text-sm text-red-700 mb-3">
                          Deleting this project will permanently remove:
                        </p>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• The project "<strong>{project.name}</strong>"</li>
                          <li>• All <strong>{project.urlCount} URLs</strong> in this project</li>
                          <li>• All scan results and compliance data</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete this project? This action cannot be undone and all data will be permanently lost.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Deleting...</span>
                      </div>
                    ) : (
                      'Delete Project'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 