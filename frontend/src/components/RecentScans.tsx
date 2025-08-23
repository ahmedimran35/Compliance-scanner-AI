import { Clock, CheckCircle, AlertTriangle, Loader2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Recent Scans</h2>
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
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(scan.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      Scan #{scan._id.slice(-6)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(scan.status)}`}>
                      {getStatusText(scan.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-500">
                      {formatDate(scan.createdAt)}
                    </p>
                    {scan.results?.overall?.score && (
                      <p className="text-xs font-medium text-slate-700">
                        Score: {scan.results.overall.score}%
                      </p>
                    )}
                  </div>
                </div>
                
                <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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