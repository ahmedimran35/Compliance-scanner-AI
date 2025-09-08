"use client";

import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Folder, 
  Plus, 
  Search, 
  Settings, 
  Trash2, 
  Eye, 
  Edit, 
  BarChart3, 
  Calendar, 
  Link, 
  Shield,
  Zap,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Globe,
  Activity
} from 'lucide-react';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import EditProjectModal from '@/components/modals/EditProjectModal';
import DeleteProjectModal from '@/components/modals/DeleteProjectModal';
import Layout from '@/components/Layout';
import ProjectCard from '@/components/ProjectCard';
import { getApiUrl } from '@/config/api';
import React from 'react';

interface Project {
  _id: string;
  name: string;
  description?: string;
  urlCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Fetch projects - optimized
  const fetchProjects = React.useCallback(async () => {
    if (!getToken) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(`${getApiUrl()}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(Array.isArray(data) ? data : (data.projects || []));
    } catch (error) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Initial load - optimized
  React.useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user?.id, fetchProjects]); // Only depend on user ID and memoized function

  // Navigation debouncing to prevent double-clicks
  const [isNavigating, setIsNavigating] = React.useState(false);

  const handleProjectClick = React.useCallback((projectId: string) => {
    if (isNavigating) return; // Prevent double navigation
    
    setIsNavigating(true);
    router.push(`/projects/${projectId}`);
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 500);
  }, [router, isNavigating]);

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setShowCreateModal(false);
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects(projects.map(p => p._id === updatedProject._id ? updatedProject : p));
    setEditingProject(null);
  };

  const handleProjectDeleted = (projectId: string) => {
    setProjects(projects.filter(p => p._id !== projectId));
    setDeletingProject(null);
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
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 shadow-2xl border border-blue-800/30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
              <div className="flex items-center space-x-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Folder className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Your Projects</h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-200 text-sm font-medium">Project Management</span>
                    </div>
                    <span className="text-blue-300 text-sm">•</span>
                    <span className="text-blue-200 text-sm">Compliance scanning</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <motion.p 
                      key={projects.length}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-bold text-white"
                    >
                      {projects.length}
                    </motion.p>
                    <p className="text-blue-200 text-sm font-medium">Projects</p>
                  </div>
                  <div className="text-center">
                    <motion.p 
                      key={projects.reduce((sum, project) => sum + project.urlCount, 0)}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-bold text-white"
                    >
                      {projects.reduce((sum, project) => sum + project.urlCount, 0)}
                    </motion.p>
                    <p className="text-blue-200 text-sm font-medium">URLs</p>
                  </div>
                  <div className="text-center">
                    <motion.p 
                      key="0"
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-bold text-white"
                    >
                      0
                    </motion.p>
                    <p className="text-blue-200 text-sm font-medium">Active</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  disabled={loading}
                  className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  <span>{loading ? 'Loading...' : 'Create Project'}</span>
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-blue-200/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Folder className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-700">Total Projects</p>
                <motion.p 
                  key={projects.length}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-blue-900"
                >
                  {projects.length}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-blue-600 font-medium">Active workspace</span>
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
                <Link className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-700">Total URLs</p>
                <motion.p 
                  key={projects.reduce((sum, project) => sum + project.urlCount, 0)}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-green-900"
                >
                  {projects.reduce((sum, project) => sum + project.urlCount, 0)}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <Globe className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">Monitored sites</span>
              </div>
              <div className="w-16 h-2 bg-green-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
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
            className="group bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-purple-200/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-purple-700">Active Scans</p>
                <motion.p 
                  key="0"
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-purple-900"
                >
                  0
                </motion.p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <Zap className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-purple-600 font-medium">Running now</span>
              </div>
              <div className="w-16 h-2 bg-purple-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "0%" }}
                  transition={{ delay: 0.9, duration: 1 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Folder className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Project Overview</h2>
                <p className="text-slate-600">
                  {projects.length === 0 
                    ? "Get started by creating your first project" 
                    : `You have ${projects.length} project${projects.length !== 1 ? 's' : ''} in your workspace`
                  }
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="group relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{loading ? 'Loading...' : 'Create New Project'}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced Projects Content */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-16"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-slate-200/50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Folder className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Loading Projects</h3>
                  <p className="text-slate-600">Fetching your project data...</p>
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
              <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Projects</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchProjects}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center py-16"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-16 border border-slate-200/50 shadow-2xl max-w-lg mx-auto">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Folder className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Ready to get started?</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Create your first project to start scanning URLs for compliance issues and security vulnerabilities.
              </p>
              
              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="group bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-3 mx-auto overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Plus className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Create Your First Project</span>
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
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              >
                <ProjectCard
                  project={project}
                  onDelete={(projectId) => {
                    setProjects(projects.filter(p => p._id !== projectId));
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onProjectUpdated={handleProjectUpdated}
        />
      )}

      {deletingProject && (
        <DeleteProjectModal
          project={deletingProject}
          onClose={() => setDeletingProject(null)}
          onProjectDeleted={handleProjectDeleted}
        />
      )}
    </Layout>
  );
} 