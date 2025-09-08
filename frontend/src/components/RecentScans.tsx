import { Clock, CheckCircle, AlertTriangle, Loader2, ExternalLink, ChevronLeft, ChevronRight, Eye, RotateCcw, Share2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Scan {
  _id: string;
  urlId: string;
  projectId: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  results?: any;
  createdAt: string;
  completedAt?: string;
}

interface RecentScansProps {
  scans: Scan[];
  loading: boolean;
}

const SCANS_PER_PAGE = 5;

const getStatusIcon = (status: Scan['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'failed':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'scanning':
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    default:
      return <Clock className="w-4 h-4 text-slate-400" />;
  }
};

const getStatusText = (status: Scan['status']) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'scanning':
      return 'Scanning';
    default:
      return 'Pending';
  }
};

const getStatusColor = (status: Scan['status']) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'failed':
      return 'text-red-600 bg-red-50';
    case 'scanning':
      return 'text-blue-600 bg-blue-50';
    default:
      return 'text-slate-600 bg-slate-50';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

export default function RecentScans({ scans, loading }: RecentScansProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  
  // Calculate pagination
  const totalPages = Math.ceil(scans.length / SCANS_PER_PAGE);
  const startIndex = (currentPage - 1) * SCANS_PER_PAGE;
  const endIndex = startIndex + SCANS_PER_PAGE;
  const currentScans = scans.slice(startIndex, endIndex);
  
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/80 to-blue-50/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recent Scans</h2>
            <p className="text-sm text-slate-600 mt-1">Latest scan results and status</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-600">Live</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading scans...</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No scans yet</h3>
          <p className="text-slate-600 mb-4">
            Start your first scan to see results here.
          </p>
          <div className="space-y-2 text-sm text-slate-500">
            <p>• Create a project and add URLs</p>
            <p>• Use Quick Scan for immediate results</p>
            <p>• View detailed compliance reports</p>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="space-y-3">
            {currentScans.map((scan, index) => (
              <motion.div
                key={scan._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group bg-slate-50/50 hover:bg-slate-100/50 rounded-xl p-4 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(scan.status)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Scan #{scan._id.slice(-6)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(scan.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(scan.status)}`}>
                    {getStatusText(scan.status)}
                  </span>
                </div>
                
                {/* Scan Results Preview */}
                {scan.results?.overall?.score && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">Compliance Score</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {scan.results.overall.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${scan.results.overall.score}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-2 rounded-full ${
                          scan.results.overall.score >= 80 ? 'bg-green-500' : 
                          scan.results.overall.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      ></motion.div>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Report"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Re-scan"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Download Report"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 text-sm text-slate-600 hover:text-slate-900 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 text-sm text-slate-600 hover:text-slate-900 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {scans.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <button className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors">
                View All Scans ({scans.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 