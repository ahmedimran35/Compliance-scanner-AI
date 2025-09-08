"use client";

import React from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Globe,
  FileText,
  Zap,
  Settings,
  FolderOpen
} from 'lucide-react';
import Layout from '@/components/Layout';
import { getApiUrl } from '@/config/api';

interface Scan {
  _id: string;
  urlId: string | { _id: string; url: string; name?: string };
  projectId: string | { _id: string; name: string; description?: string };
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  scanOptions?: {
    gdpr: boolean;
    accessibility: boolean;
    security: boolean;
    performance: boolean;
    seo: boolean;
    customRules: string[];
  };
  results?: {
    overall: {
      score: number;
      grade: 'A' | 'B' | 'C' | 'D' | 'F';
      totalIssues: number;
      recommendations: string[];
    };
  };
  scanDuration: number;
  createdAt: string;
  completedAt?: string;
}

interface URL {
  _id: string;
  url: string;
  name?: string;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
}

export default function ReportsPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  
  const [scans, setScans] = React.useState<Scan[]>([]);
  const [urls, setUrls] = React.useState<URL[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [gradeFilter, setGradeFilter] = React.useState<string>('all');
  const [projectFilter, setProjectFilter] = React.useState<string>('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  React.useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  React.useEffect(() => {
    if (user && isLoaded) {
      fetchReports();
    }
  }, [user?.id]);

  const fetchReports = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();

      if (!token) {
        setError('Authentication token not available. Please sign in again.');
        return;
      }

      const baseUrl = getApiUrl();

      // Fetch all scans
      const scansResponse = await fetch(`${baseUrl}/api/scans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!scansResponse.ok) {
        throw new Error(`Failed to fetch scans: ${scansResponse.statusText}`);
      }

      const scansData = await scansResponse.json();
      setScans(scansData);

      // Fetch all URLs for reference
      const urlsResponse = await fetch(`${baseUrl}/api/scans/urls`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (urlsResponse.ok) {
        const urlsData = await urlsResponse.json();
        setUrls(urlsData);
      }

      // Fetch all projects for reference
      const projectsResponse = await fetch(`${baseUrl}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
      }

    } catch (err) {
      setError('Failed to fetch reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Poll for updates every 30 seconds
  React.useEffect(() => {
    if (!user || !isLoaded) return;

    let interval: any;
    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchReports();
        }
      }, 30000);
    };
    const stop = () => interval && clearInterval(interval);

    start();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Refresh once on focus
        fetchReports();
        start();
      } else {
        stop();
        interval = null;
      }
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, [user, isLoaded, fetchReports]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'scanning':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'scanning':
        return 'Scanning';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100 border-green-200';
      case 'B': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'C': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'D': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'F': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getUrlName = (urlId: string | { _id: string; url: string; name?: string }) => {
    // Handle both string ID and populated object
    if (typeof urlId === 'object' && urlId !== null) {
      return urlId.name || urlId.url || 'Unknown URL';
    }
    
    const url = urls.find(u => u._id === urlId);
    if (url) {
      return url.name || url.url || 'Unknown URL';
    }
    
    // If URL not found in our list, try to extract from scan data
    const scan = scans.find(s => s._id === urlId || s.urlId === urlId);
    if (scan && typeof scan.urlId === 'object' && scan.urlId !== null) {
      return (scan.urlId as any).name || (scan.urlId as any).url || 'Unknown URL';
    }
    
    return 'Unknown URL';
  };

  const getUrlAddress = (urlId: string | { _id: string; url: string; name?: string }) => {
    // Handle both string ID and populated object
    if (typeof urlId === 'object' && urlId !== null) {
      return urlId.url || 'Unknown URL';
    }
    
    const url = urls.find(u => u._id === urlId);
    if (url) {
      return url.url || 'Unknown URL';
    }
    
    // If URL not found in our list, try to extract from scan data
    const scan = scans.find(s => s._id === urlId || s.urlId === urlId);
    if (scan && typeof scan.urlId === 'object' && scan.urlId !== null) {
      return (scan.urlId as any).url || 'Unknown URL';
    }
    
    return 'Unknown URL';
  };

  const getProjectName = (projectId: string | { _id: string; name: string; description?: string }) => {
    // Handle both string ID and populated object
    if (typeof projectId === 'object' && projectId !== null) {
      return projectId.name || 'Unknown Project';
    }
    
    const project = projects.find(p => p._id === projectId);
    if (project) {
      return project.name || 'Unknown Project';
    }
    
    // If project not found in our list, try to extract from scan data
    const scan = scans.find(s => s._id === projectId || s.projectId === projectId);
    if (scan && typeof scan.projectId === 'object' && scan.projectId !== null) {
      return (scan.projectId as any).name || 'Unknown Project';
    }
    
    return 'Unknown Project';
  };

  const filteredScans = scans.filter(scan => {
    const urlName = getUrlName(scan.urlId).toLowerCase();
    const projectName = getProjectName(scan.projectId).toLowerCase();
    const matchesSearch = searchTerm === '' || 
      urlName.includes(searchTerm.toLowerCase()) || 
      projectName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || scan.status === statusFilter;
    const matchesGrade = gradeFilter === 'all' || 
      (scan.results?.overall?.grade && scan.results.overall.grade === gradeFilter);
    const matchesProject = projectFilter === 'all' || 
      getProjectName(scan.projectId) === projectFilter;
    
    return matchesSearch && matchesStatus && matchesGrade && matchesProject;
  });

  // Get unique project names for filter dropdown
  const uniqueProjects = React.useMemo(() => {
    const projectNames = scans.map(scan => getProjectName(scan.projectId));
    return Array.from(new Set(projectNames)).sort();
  }, [scans]);

  // Pagination logic
  const totalPages = Math.ceil(filteredScans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedScans = filteredScans.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, gradeFilter, projectFilter]);

  const completedScans = scans.filter(scan => scan.status === 'completed');
  const averageScore = completedScans.length > 0 
    ? Math.round(completedScans.reduce((sum, scan) => sum + (scan.results?.overall?.score || 0), 0) / completedScans.length)
    : 0;

  const handleScanClick = (scanId: string) => {
    router.push(`/scans/${scanId}`);
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 shadow-2xl border border-blue-800/30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
              <div className="flex items-center space-x-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <BarChart3 className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Compliance Reports</h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-200 text-sm font-medium">Live Data</span>
                    </div>
                    <span className="text-blue-300 text-sm">•</span>
                    <span className="text-blue-200 text-sm">Real-time compliance analytics</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <motion.p 
                      key={averageScore}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-bold text-white"
                    >
                      {averageScore}%
                    </motion.p>
                    <p className="text-blue-200 text-sm font-medium">Average Score</p>
                  </div>
                  <div className="text-center">
                    <motion.p 
                      key={scans.length}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-bold text-white"
                    >
                      {scans.length}
                    </motion.p>
                    <p className="text-blue-200 text-sm font-medium">Total Scans</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchReports}
                  disabled={loading}
                  className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-emerald-200/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? (
                  <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle className="w-7 h-7 text-white" />
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-700">Completed</p>
                <motion.p 
                  key={scans.filter(s => s.status === 'completed').length}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-emerald-900"
                >
                  {loading ? '...' : scans.filter(s => s.status === 'completed').length}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+12% this week</span>
              </div>
              <div className="w-16 h-2 bg-emerald-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group bg-gradient-to-br from-red-50 to-red-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-red-200/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? (
                  <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <XCircle className="w-7 h-7 text-white" />
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-red-700">Failed</p>
                <motion.p 
                  key={scans.filter(s => s.status === 'failed').length}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-red-900"
                >
                  {loading ? '...' : scans.filter(s => s.status === 'failed').length}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-red-600 font-medium">-5% this week</span>
              </div>
              <div className="w-16 h-2 bg-red-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "15%" }}
                  transition={{ delay: 0.7, duration: 1 }}
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-blue-200/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? (
                  <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Clock className="w-7 h-7 text-white" />
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-700">In Progress</p>
                <motion.p 
                  key={scans.filter(s => s.status === 'scanning' || s.status === 'pending').length}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-blue-900"
                >
                  {loading ? '...' : scans.filter(s => s.status === 'scanning' || s.status === 'pending').length}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <Zap className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-blue-600 font-medium">Active scans</span>
              </div>
              <div className="w-16 h-2 bg-blue-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "60%" }}
                  transition={{ delay: 0.9, duration: 1 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
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
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? (
                  <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Shield className="w-7 h-7 text-white" />
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-purple-700">Grade A</p>
                <motion.p 
                  key={scans.filter(s => s.results?.overall?.grade === 'A').length}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-purple-900"
                >
                  {loading ? '...' : scans.filter(s => s.results?.overall?.grade === 'A').length}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+8% this month</span>
              </div>
              <div className="w-16 h-2 bg-purple-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "70%" }}
                  transition={{ delay: 1.1, duration: 1 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Advanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-slate-200/50 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Advanced Filters</h3>
                <p className="text-sm text-gray-600">Refine your reports with powerful filtering options</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                {[searchTerm, statusFilter, gradeFilter, projectFilter].filter(f => f !== 'all' && f !== '').length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Reports</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search by website name or project..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200/50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500"
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project</label>
                <div className="relative">
                  <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 bg-gray-50/80 border border-gray-200/50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="all">All Projects</option>
                    {uniqueProjects.map((projectName) => (
                      <option key={projectName} value={projectName}>
                        {projectName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 bg-gray-50/80 border border-gray-200/50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="scanning">Scanning</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 bg-gray-50/80 border border-gray-200/50 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="all">All Grades</option>
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                    <option value="D">Grade D</option>
                    <option value="F">Grade F</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {[searchTerm, statusFilter, gradeFilter, projectFilter].some(f => f !== 'all' && f !== '') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6 border-t border-gray-200/50"
            >
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm font-semibold text-gray-700">Active Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    <Search className="w-3 h-3" />
                    <span>"{searchTerm}"</span>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <XCircle className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
                {statusFilter !== 'all' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Status: {statusFilter}</span>
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                    >
                      <XCircle className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
                {gradeFilter !== 'all' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Grade: {gradeFilter}</span>
                    <button
                      onClick={() => setGradeFilter('all')}
                      className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                    >
                      <XCircle className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
                {projectFilter !== 'all' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                  >
                    <FolderOpen className="w-3 h-3" />
                    <span>Project: {projectFilter}</span>
                    <button
                      onClick={() => setProjectFilter('all')}
                      className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                    >
                      <XCircle className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setGradeFilter('all');
                    setProjectFilter('all');
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors"
                >
                  Clear All
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced Reports Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <BarChart3 className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Reports</h3>
              <p className="text-gray-600">Fetching your compliance data...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Reports</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchReports}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Try Again
              </motion.button>
            </div>
          ) : paginatedScans.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Reports Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {scans.length === 0 
                  ? "You haven't run any scans yet. Start by creating a project and running a scan to generate your first compliance report."
                  : "No reports match your current filters. Try adjusting your search criteria or clear some filters to see more results."
                }
              </p>
              {scans.length === 0 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/dashboard')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start Your First Scan
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setGradeFilter('all');
                    setProjectFilter('all');
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Clear All Filters
                </motion.button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block lg:hidden">
              <div className="p-6 space-y-4">
                {paginatedScans.map((scan, index) => {
                  let urlName = 'Unknown URL';
                  let urlAddress = 'Unknown URL';
                  
                  if (scan.urlId && typeof scan.urlId === 'object') {
                    urlName = (scan.urlId as { name?: string; url: string }).name || (scan.urlId as { url: string }).url || 'Unknown URL';
                    urlAddress = (scan.urlId as { url: string }).url || 'Unknown URL';
                  } else if (scan.urlId) {
                    urlName = getUrlName(scan.urlId);
                    urlAddress = getUrlAddress(scan.urlId);
                  }
                  
                  const projectName = getProjectName(scan.projectId);
                  
                  return (
                    <motion.div
                      key={scan._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => handleScanClick(scan._id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Globe className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{urlName}</p>
                            <p className="text-sm text-gray-600 truncate max-w-xs">{urlAddress}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(scan.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            scan.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                            scan.status === 'scanning' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            scan.status === 'failed' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {getStatusText(scan.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Project</p>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <FolderOpen className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 truncate">{projectName}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Grade</p>
                          {scan.results?.overall?.grade ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getGradeColor(scan.results.overall.grade)}`}>
                              Grade {scan.results.overall.grade}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Score</p>
                          {scan.results?.overall?.score ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    scan.results.overall.score >= 90 ? 'bg-green-500' :
                                    scan.results.overall.score >= 80 ? 'bg-blue-500' :
                                    scan.results.overall.score >= 70 ? 'bg-yellow-500' :
                                    scan.results.overall.score >= 60 ? 'bg-orange-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${scan.results.overall.score}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{scan.results.overall.score}%</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Issues</p>
                          {scan.results?.overall?.totalIssues ? (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              {scan.results.overall.totalIssues} issues
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200/50">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{new Date(scan.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScanClick(scan._id);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download Report"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-gray-50 to-gray-100/50">
                      <th className="text-left py-4 px-4 font-semibold text-slate-700 min-w-[200px]">Website</th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-700 min-w-[150px]">Project</th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-700 min-w-[120px]">Status</th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-700 min-w-[100px]">Grade</th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-700 min-w-[120px]">Score</th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-700 min-w-[100px]">Issues</th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-700 min-w-[120px]">Date</th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-700 min-w-[100px]">Actions</th>
                    </tr>
                  </thead>
                <tbody>
                  {paginatedScans.map((scan, index) => {
                    // Get URL information properly
                    let urlName = 'Unknown URL';
                    let urlAddress = 'Unknown URL';
                    
                    if (scan.urlId && typeof scan.urlId === 'object') {
                      // URL is populated
                      urlName = (scan.urlId as { name?: string; url: string }).name || (scan.urlId as { url: string }).url || 'Unknown URL';
                      urlAddress = (scan.urlId as { url: string }).url || 'Unknown URL';
                    } else if (scan.urlId) {
                      // URL is just an ID, use our lookup functions
                      urlName = getUrlName(scan.urlId);
                      urlAddress = getUrlAddress(scan.urlId);
                    }
                    
                    const projectName = getProjectName(scan.projectId);
                    
                    return (
                      <motion.tr 
                        key={scan._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 cursor-pointer transition-all duration-300 group ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                        }`}
                        onClick={() => handleScanClick(scan._id)}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <Globe className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                {urlName}
                              </div>
                              <div className="text-sm text-slate-500 truncate">
                                {urlAddress}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <FolderOpen className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                              {projectName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-lg ${
                              scan.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                              scan.status === 'scanning' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                              scan.status === 'failed' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                              'bg-gradient-to-br from-gray-400 to-gray-500'
                            }`}>
                              {getStatusIcon(scan.status)}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                              scan.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                              scan.status === 'scanning' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                              scan.status === 'failed' ? 'bg-red-100 text-red-700 border-red-200' :
                              'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                              {getStatusText(scan.status)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {scan.results?.overall?.grade ? (
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-lg ${
                                scan.results.overall.grade === 'A' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                                scan.results.overall.grade === 'B' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                                scan.results.overall.grade === 'C' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                                scan.results.overall.grade === 'D' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                                'bg-gradient-to-br from-red-500 to-red-600'
                              }`}>
                                <Shield className="w-3 h-3 text-white" />
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getGradeColor(scan.results.overall.grade)}`}>
                                {scan.results.overall.grade}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {scan.results?.overall?.score ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${scan.results.overall.score}%` }}
                                  transition={{ delay: 0.2 * index, duration: 1 }}
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    scan.results.overall.score >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                    scan.results.overall.score >= 80 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                    scan.results.overall.score >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                    scan.results.overall.score >= 60 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                    'bg-gradient-to-r from-red-500 to-red-600'
                                  }`}
                                />
                              </div>
                              <span className="text-sm font-bold text-slate-900 min-w-[2.5rem]">
                                {scan.results.overall.score}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {scan.results?.overall?.totalIssues ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                                <AlertTriangle className="w-3 h-3 text-white" />
                              </div>
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold border border-red-200 whitespace-nowrap">
                                {scan.results.overall.totalIssues}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center shadow-lg">
                              <Calendar className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-600">
                              {new Date(scan.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleScanClick(scan._id);
                              }}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                              title="View Report"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                              title="Download Report"
                            >
                              <Download className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
            </>
          )}

          {/* Enhanced Pagination Controls */}
          {filteredScans.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-6 border-t border-slate-200/50 bg-gradient-to-r from-gray-50/50 to-gray-100/30 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredScans.length)} of {filteredScans.length} results
                  </span>
                </div>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-200/50 rounded-xl text-sm bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-sm"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm border border-gray-200/50 rounded-xl hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md bg-white/50"
                >
                  Previous
                </motion.button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm rounded-xl transition-all duration-300 shadow-sm ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                            : 'border border-gray-200/50 hover:bg-white/80 bg-white/50 hover:shadow-md'
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm border border-gray-200/50 rounded-xl hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md bg-white/50"
                >
                  Next
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
} 