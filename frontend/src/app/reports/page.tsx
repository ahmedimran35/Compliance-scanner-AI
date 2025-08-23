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
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Compliance Reports</h1>
              <p className="text-slate-600">
                View and analyze all your website compliance scan results
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-slate-600">Average Score</p>
                <p className="text-2xl font-bold text-blue-600">{averageScore}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Total Scans</p>
                <p className="text-2xl font-bold text-slate-900">{scans.length}</p>
              </div>
              <button
                onClick={fetchReports}
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
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '...' : scans.filter(s => s.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {loading ? '...' : scans.filter(s => s.status === 'failed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {loading ? '...' : scans.filter(s => s.status === 'scanning' || s.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Clock className="w-6 h-6 text-blue-600" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Grade A</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '...' : scans.filter(s => s.results?.overall?.grade === 'A').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Shield className="w-6 h-6 text-green-600" />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Filters with Project Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by website name or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              >
                <option value="all">All Projects</option>
                {uniqueProjects.map((projectName) => (
                  <option key={projectName} value={projectName}>
                    {projectName}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="scanning">Scanning</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
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
        </motion.div>

        {/* Reports Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading reports...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : paginatedScans.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No reports found</h3>
              <p className="text-slate-600 mb-6">
                {scans.length === 0 
                  ? "You haven't run any scans yet. Start by creating a project and running a scan."
                  : "No reports match your current filters. Try adjusting your search criteria."
                }
              </p>
              {scans.length === 0 && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Start Your First Scan
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50">
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Website</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Project</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Grade</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Score</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Issues</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
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
                      <tr 
                        key={scan._id}
                        className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                        }`}
                        onClick={() => handleScanClick(scan._id)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                              <Globe className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">
                                {urlName}
                              </div>
                              <div className="text-sm text-slate-500 truncate max-w-xs">
                                {urlAddress}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <FolderOpen className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-900">
                              {projectName}
                            </span>
                          </div>
                        </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(scan.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            scan.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                            scan.status === 'scanning' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            scan.status === 'failed' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {getStatusText(scan.status)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {scan.results?.overall?.grade ? (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getGradeColor(scan.results.overall.grade)}`}>
                            Grade {scan.results.overall.grade}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {scan.results?.overall?.score ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
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
                            <span className="text-sm font-semibold text-slate-900 min-w-[3rem]">
                              {scan.results.overall.score}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {scan.results?.overall?.totalIssues ? (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200 whitespace-nowrap">
                            {scan.results.overall.totalIssues} issues
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {new Date(scan.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                                handleScanClick(scan._id);
                            }}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
              
                              alert('Download functionality coming soon!');
                            }}
                            className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download Report"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredScans.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredScans.length)} of {filteredScans.length} results
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
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
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
} 