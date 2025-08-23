"use client";

import { useUser, useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Plus, 
  Folder, 
  Link, 
  Edit, 
  Trash2, 
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Play,
  BarChart3,
  Globe,
  Settings,
  Zap,
  Crown,
  Calendar
} from 'lucide-react';
import Layout from '@/components/Layout';
import ScanOptionsModal from '@/components/modals/ScanOptionsModal';
import ScheduleScanModal from '@/components/modals/ScheduleScanModal';
import { getApiUrl } from '@/config/api';

interface Project {
  _id: string;
  name: string;
  description?: string;
  urlCount: number;
  createdAt: string;
  updatedAt: string;
}

interface URL {
  _id: string;
  url: string;
  name?: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  lastScanned?: string;
  createdAt: string;
}

interface Scan {
  _id: string;
  urlId: string;
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
    gdpr: {
      score: number;
      issues: string[];
    };
    accessibility: {
      score: number;
      issues: string[];
    };
    security: {
      score: number;
      issues: string[];
    };
    performance?: {
      score: number;
      issues: string[];
    };
    seo?: {
      score: number;
      issues: string[];
    };
    overall: {
      score: number;
      grade: 'A' | 'B' | 'C' | 'D' | 'F';
      totalIssues: number;
      recommendations: string[];
    };
  };
  scanDuration: number;
  errorMessage?: string;
  createdAt: string;
}

interface ScanOptions {
  gdpr: boolean;
  accessibility: boolean;
  security: boolean;
  performance: boolean;
  seo: boolean;
  customRules: string[];
}

export default function ProjectDetailPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [urls, setUrls] = useState<URL[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newUrlName, setNewUrlName] = useState('');
  const [scanningUrls, setScanningUrls] = useState<Set<string>>(new Set());
  const [showScanOptionsModal, setShowScanOptionsModal] = useState(false);
  const [selectedUrlForScan, setSelectedUrlForScan] = useState<URL | null>(null);
  const [showScheduleScanModal, setShowScheduleScanModal] = useState(false);
  const [selectedUrlForSchedule, setSelectedUrlForSchedule] = useState<URL | null>(null);
  const [isSupporter, setIsSupporter] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (user && isLoaded && projectId) {
      fetchProject();
      fetchUrls();
      fetchScans();
      fetchUserStatus();
    }
  }, [user?.id, projectId]);

  const fetchUserStatus = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${getApiUrl()}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsSupporter(data.user?.isSupporter || false);
      }
    } catch (err) {
    }
  };

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();

      if (!token) {
        setError('Authentication token not available. Please sign in again.');
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 404) {
          setError('Project not found');
        } else if (response.status === 401) {
          setError('Authentication failed. Please sign in again.');
        } else {
          setError(`Failed to fetch project: ${errorData.error || response.statusText}`);
        }
        return;
      }

      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUrls = async () => {
    try {
      const token = await getToken();

      if (!token) {
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/projects/${projectId}/urls`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUrls(data);
      }
    } catch (err) {
    }
  };

  const fetchScans = async () => {
    try {
      const token = await getToken();

      if (!token) {
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/scans/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setScans(data);
      }
    } catch (err) {
    }
  };

  const handleAddUrl = async (e: any) => {
    e.preventDefault();

    if (!newUrl.trim()) {
      setError('URL is required');
      return;
    }

    if (!newUrlName.trim()) {
      setError('Website name is required');
      return;
    }

    try {
      const token = await getToken();

      if (!token) {
        setError('Authentication token not available. Please sign in again.');
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/projects/${projectId}/urls`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: newUrl.trim(),
          name: newUrlName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add URL');
      }

      
      // Ensure the new URL has the correct status for immediate scanning
      const newUrlWithStatus = {
        ...data.url,
        status: 'completed' // Set to completed so it's ready for new scans
      };

      setUrls([...urls, newUrlWithStatus]);
      setNewUrl('');
      setNewUrlName('');
      setShowAddUrlModal(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to add URL');
    }
  };

  const handleDeleteUrl = async (urlId: string) => {
    try {
      const token = await getToken();

      if (!token) {
        setError('Authentication token not available. Please sign in again.');
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/projects/${projectId}/urls/${urlId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete URL');
      }

      setUrls(urls.filter(url => url._id !== urlId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete URL');
    }
  };

  const handleRunScan = async (url: URL) => {
    setSelectedUrlForScan(url);
    setShowScanOptionsModal(true);
  };

  const handleScheduleScan = async (url: URL) => {
    setSelectedUrlForSchedule(url);
    setShowScheduleScanModal(true);
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

  const handleScheduleScanSubmit = async (scheduleData: any) => {
    try {
      const token = await getToken();

      if (!token) {
        setError('Authentication token not available. Please sign in again.');
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/scheduled-scans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to schedule scan');
      }

      // Show detailed success message
      const frequencyText = scheduleData.frequency === 'daily' ? 'Every day' :
                           scheduleData.frequency === 'weekly' ? `Every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][scheduleData.dayOfWeek || 0]}` :
                           `Every ${scheduleData.dayOfMonth}${getDaySuffix(scheduleData.dayOfMonth || 1)} of the month`;
      
      const scanOptions = [];
      if (scheduleData.scanOptions.gdpr) scanOptions.push('GDPR');
      if (scheduleData.scanOptions.accessibility) scanOptions.push('Accessibility');
      if (scheduleData.scanOptions.security) scanOptions.push('Security');
      if (scheduleData.scanOptions.performance) scanOptions.push('Performance');
      if (scheduleData.scanOptions.seo) scanOptions.push('SEO');

      const message = `✅ Scan scheduled successfully!\n\n` +
                     `📅 Schedule: ${frequencyText} at ${scheduleData.time}\n` +
                     `🔍 Scan Options: ${scanOptions.join(', ')}\n` +
                     `🌐 Website: ${selectedUrlForSchedule?.name || selectedUrlForSchedule?.url}\n\n` +
                     `The scan will run automatically at the scheduled time. You can create multiple schedules for the same URL and manage all your scheduled scans from the Scheduled Scans page.`;

      alert(message);
      
      // Redirect to scheduled scans page after a short delay
      setTimeout(() => {
        router.push('/scheduled-scans');
      }, 2000);
      
      setSelectedUrlForSchedule(null);
    } catch (err: any) {
      setError(err.message || 'Failed to schedule scan');
    }
  };

  const handleStartScanWithOptions = async (scanOptions: ScanOptions) => {
    if (!selectedUrlForScan) return;

    try {
      const token = await getToken();

      if (!token) {
        setError('Authentication token not available. Please sign in again.');
        return;
      }

      setScanningUrls(prev => new Set(prev).add(selectedUrlForScan._id));

      const response = await fetch(`${getApiUrl()}/api/scans/${selectedUrlForScan._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scanOptions }),
      });

      const data = await response.json();

      if (!response.ok) {
        // TEMPORARILY REMOVED: Pro tier restriction check
        // if (response.status === 403 && data.requiredTier === 'pro') {
        //   throw new Error('Performance and SEO scanning are Pro features. Please upgrade to Pro tier.');
        // }
        throw new Error(data.error || 'Failed to start scan');
      }

      // Add the new scan to the list
      
      // Ensure the scan has the correct structure
      const newScan = {
        ...data.scan,
        urlId: selectedUrlForScan._id, // Ensure urlId is set
        status: 'pending'
      };
      
      setScans([newScan, ...scans]);
      
      // Poll for scan completion
      pollScanStatus(newScan._id);
    } catch (err: any) {
      setError(err.message || 'Failed to start scan');
    } finally {
      setScanningUrls(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedUrlForScan._id);
        return newSet;
      });
      setSelectedUrlForScan(null);
    }
  };

  const pollScanStatus = async (scanId: string) => {
    const token = await getToken();
    if (!token) return;

    const poll = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/api/scans/${scanId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const scanData = await response.json();
          
          // Handle both possible response formats
          const scan = scanData.scan || scanData;
          
          // Update the scan in the list
          setScans(prev => prev.map(s => s._id === scanId ? scan : s));

          // Update URL status when scan completes
          if (scan.status === 'completed' || scan.status === 'failed') {
            const scanUrlId = scan.urlId && typeof scan.urlId === 'object' ? scan.urlId._id : scan.urlId;
            setUrls(prev => prev.map(url => 
              String(url._id) === String(scanUrlId)
                ? { ...url, status: scan.status === 'completed' ? 'completed' : 'failed' }
                : url
            ));
          }

          // If scan is still in progress, poll again
          if (scan.status === 'pending' || scan.status === 'scanning') {
            setTimeout(poll, 2000); // Poll every 2 seconds
          }
        } else {
        }
      } catch (err) {
      }
    };

    // Start polling immediately
    poll();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'scanning':
        return <Clock className="w-4 h-4 text-blue-500" />;
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

  const getScanForUrl = (urlId: string) => {
    return scans.find(scan => String(scan.urlId) === String(urlId));
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScanCategoriesText = (scan: Scan) => {
    if (!scan.scanOptions) return 'All';
    
    const categories: string[] = [];
    if (scan.scanOptions.gdpr) categories.push('GDPR');
    if (scan.scanOptions.accessibility) categories.push('Accessibility');
    if (scan.scanOptions.security) categories.push('Security');
    if (scan.scanOptions.performance) categories.push('Performance');
    if (scan.scanOptions.seo) categories.push('SEO');
    
    return categories.join(', ') || 'None';
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
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-slate-600">Loading project...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-red-600 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        ) : project ? (
          <>
            {/* Project Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.name}</h1>
                    {project.description && (
                      <p className="text-slate-600 mb-4">{project.description}</p>
                    )}
                    <div className="flex items-center space-x-6 text-sm text-slate-500">
                      <div className="flex items-center space-x-2">
                        <Link className="w-4 h-4" />
                        <span>{urls.length} URLs</span>
                      </div>
                      <div>Created {new Date(project.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowAddUrlModal(true)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add URL</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* URLs Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Website URLs</h2>
                
                {urls.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="w-16 h-16 text-slate-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No URLs added yet</h3>
                    <p className="text-slate-600 mb-6">
                      Add your first website URL to start compliance scanning.
                    </p>
                    <button
                      onClick={() => setShowAddUrlModal(true)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Your First URL</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {urls.map((url) => {
                      const latestScan = getScanForUrl(url._id);
                      const isScanning = scanningUrls.has(url._id);
                      
                      return (
                        <div
                          key={url._id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(url.status)}
                              <div>
                                <h3 className="font-medium text-slate-900">{url.name || url.url}</h3>
                                <p className="text-sm text-slate-600">{url.url}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {latestScan && latestScan.status === 'completed' && latestScan.results && (
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(latestScan.results.overall.grade)}`}>
                                  Grade {latestScan.results.overall.grade}
                                </span>
                                <span className="text-sm text-slate-600">
                                  {latestScan.results.overall.score}%
                                </span>
                              </div>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              url.status === 'completed' ? 'bg-green-100 text-green-700' :
                              url.status === 'scanning' ? 'bg-blue-100 text-blue-700' :
                              url.status === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {getStatusText(url.status)}
                            </span>
                            <button
                              onClick={() => handleRunScan(url)}
                              disabled={isScanning || latestScan?.status === 'scanning'}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Run Scan with Options"
                            >
                              {isScanning ? (
                                <Clock className="w-4 h-4 animate-spin" />
                              ) : (
                                <Settings className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleScheduleScan(url)}
                              disabled={isScanning || latestScan?.status === 'scanning'}
                              className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Schedule Scan"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUrl(url._id)}
                              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Scan History Section */}
            {scans.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8"
              >
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">Recent Scans</h2>
                        <p className="text-sm text-slate-600">Latest scan results and performance metrics</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600">Total Scans:</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {scans.length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-slate-200">
                          <th className="text-left py-4 px-4 font-semibold text-slate-700 bg-slate-50 rounded-tl-lg">Website Name</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700 bg-slate-50">Categories</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700 bg-slate-50">Status</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700 bg-slate-50">Grade</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700 bg-slate-50">Score</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700 bg-slate-50">Duration</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700 bg-slate-50 rounded-tr-lg">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scans.slice(0, 10).map((scan, index) => {
                          // Handle populated urlId field (contains full URL object) or string ID
                          let url: any = null;
                          let urlId: string | null = null;
                          
                          if (scan.urlId && typeof scan.urlId === 'object' && (scan.urlId as any)._id) {
                            // urlId is populated (contains full URL object)
                            url = scan.urlId;
                            urlId = String((scan.urlId as any)._id);
                          } else if (scan.urlId) {
                            // urlId is a string/ID, find the URL
                            urlId = String(scan.urlId);
                            url = urls.find(u => String(u._id) === urlId);
                          }
                          
                  
                          if (index === 0) {
                          }
                          
                          return (
                            <tr 
                              key={`scan-${scan._id}-${index}`} 
                              className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                              }`} 
                              onClick={() => router.push(`/scans/${scan._id}`)}
                            >
                              <td className="py-4 px-4">
                                {url ? (
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                      <Globe className="w-4 h-4 text-white" />
                              </div>
                                    <div>
                                      <div className="text-sm font-semibold text-slate-900 truncate max-w-xs">
                                        {url.name || 'Unnamed Website'}
                                      </div>
                                      <div className="text-xs text-slate-500 truncate max-w-xs">
                                        {url.url}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                                      <Globe className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div>
                                      <div className="text-sm text-slate-400 italic">
                                        URL not found
                                      </div>
                                      <div className="text-xs text-slate-400">
                                        ID: {urlId || 'undefined'} | URLs: {urls.length}
                                      </div>
                                    </div>
                                  </div>
                                )}
                            </td>
                              <td className="py-4 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {scan.scanOptions && (
                                    <>
                                      {scan.scanOptions.gdpr && (
                                        <span key="gdpr" className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                                          GDPR
                                        </span>
                                      )}
                                      {scan.scanOptions.accessibility && (
                                        <span key="accessibility" className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                                          Accessibility
                                        </span>
                                      )}
                                      {scan.scanOptions.security && (
                                        <span key="security" className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200">
                                          Security
                                        </span>
                                      )}
                                      {scan.scanOptions.performance && (
                                        <span key="performance" className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200">
                                          Performance
                                        </span>
                                      )}
                                      {scan.scanOptions.seo && (
                                        <span key="seo" className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
                                          SEO
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  {scan.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                  {scan.status === 'scanning' && <Clock className="w-4 h-4 text-blue-500 animate-spin" />}
                                  {scan.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                                  {scan.status === 'pending' && <Clock className="w-4 h-4 text-gray-500" />}
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
                              <td className="py-4 px-4">
                              {scan.results ? (
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getGradeColor(scan.results.overall.grade)}`}>
                                  {scan.results.overall.grade}
                                </span>
                                  </div>
                              ) : (
                                  <span className="text-slate-400 text-sm">-</span>
                              )}
                            </td>
                              <td className="py-4 px-4">
                              {scan.results ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
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
                                ) : scan.status === 'scanning' ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                                      <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                                    </div>
                                    <span className="text-sm font-medium text-blue-600">
                                      Scanning...
                                    </span>
                                  </div>
                                ) : scan.status === 'pending' ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                                      <div className="h-full bg-yellow-500 rounded-full animate-pulse" style={{ width: '30%' }} />
                                    </div>
                                    <span className="text-sm font-medium text-yellow-600">
                                      Queued
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-sm">-</span>
                              )}
                            </td>
                              <td className="py-4 px-4">
                              {scan.scanDuration ? (
                                  <div className="flex items-center space-x-2">
                                    <Zap className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700">
                                  {Math.round(scan.scanDuration / 1000)}s
                                </span>
                                  </div>
                              ) : (
                                  <span className="text-slate-400 text-sm">-</span>
                              )}
                            </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-slate-600">
                                {new Date(scan.createdAt).toLocaleDateString()}
                              </span>
                                </div>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {scans.length > 10 && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-slate-600">
                        Showing latest 10 scans of {scans.length} total scans
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        ) : null}
      </div>

      {/* Add URL Modal */}
      {showAddUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddUrlModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Add Website URL</h2>
                  <p className="text-sm text-slate-600">Add a URL to scan for compliance</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddUrlModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUrl} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Website Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newUrlName}
                    onChange={(e) => setNewUrlName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    placeholder="Homepage, About Page, etc."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-2">
                    Website URL *
                  </label>
                  <input
                    type="url"
                    id="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    placeholder="https://example.com"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddUrlModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newUrl.trim() || !newUrlName.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Add URL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scan Options Modal */}
      {showScanOptionsModal && selectedUrlForScan && (
        <ScanOptionsModal
          isOpen={showScanOptionsModal}
          onClose={() => {
            setShowScanOptionsModal(false);
            setSelectedUrlForScan(null);
          }}
          onStartScan={handleStartScanWithOptions}
          urlName={selectedUrlForScan.name || selectedUrlForScan.url}
          url={selectedUrlForScan.url}
          isSupporter={isSupporter}
        />
      )}

      {/* Schedule Scan Modal */}
      {showScheduleScanModal && selectedUrlForSchedule && (
        <ScheduleScanModal
          isOpen={showScheduleScanModal}
          onClose={() => {
            setShowScheduleScanModal(false);
            setSelectedUrlForSchedule(null);
          }}
          onSchedule={handleScheduleScanSubmit}
          urlId={selectedUrlForSchedule._id}
          urlName={selectedUrlForSchedule.name || selectedUrlForSchedule.url}
        />
      )}
    </Layout>
  );
} 