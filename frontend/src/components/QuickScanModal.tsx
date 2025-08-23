import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Shield, Zap, Target, AlertTriangle, CheckCircle, Clock, Globe, Activity, BarChart3, TrendingUp, TrendingDown, Eye, Settings, Edit, Trash2, Plus, Calendar, Link, Users, Sparkles, Crown, Star, Heart, Bell, Settings as SettingsIcon, User, LogOut, ChevronDown, Menu, X as XIcon, Loader2 } from 'lucide-react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config/api';

interface QuickScanModalProps {
  onClose: () => void;
  onComplete: (scanId?: string) => void;
}

interface ScanResult {
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  results?: any;
  error?: string;
}

export default function QuickScanModal({ onClose, onComplete }: QuickScanModalProps) {
  const { getToken } = useAuth();
  const [projectName, setProjectName] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [scanning, setScanning] = React.useState(false);
  const [scanResult, setScanResult] = React.useState<ScanResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [completedScanId, setCompletedScanId] = React.useState<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const minDurationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingResultRef = useRef<ScanResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [minDurationElapsed, setMinDurationElapsed] = useState(false);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (minDurationTimerRef.current) clearTimeout(minDurationTimerRef.current);
    };
  }, []);

  const startVisualProgress = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setProgress(0);
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        const increment = prev < 30 ? 3 : prev < 60 ? 2 : 1;
        return Math.min(90, prev + increment);
      });
    }, 120);
  };

  const ensureMinDuration = (ms: number) => {
    if (minDurationTimerRef.current) clearTimeout(minDurationTimerRef.current);
    setMinDurationElapsed(false);
    minDurationTimerRef.current = setTimeout(() => {
      setMinDurationElapsed(true);
      if (pendingResultRef.current) {
        setScanResult(pendingResultRef.current);
        setProgress(100);
        pendingResultRef.current = null;
        setScanning(false);
      }
    }, ms);
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleScan = async () => {
    if (!projectName.trim()) {
      setError('Please enter a project name');
      return;
    }

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setError(null);
    setScanning(true);
    setScanResult({ status: 'scanning' });
    startVisualProgress();
    ensureMinDuration(6000);

    try {
      const token = await getToken();
      const baseUrl = getApiUrl();

      console.log('Starting quick scan for URL:', url);

      // First, create a temporary project and URL
      const projectResponse = await fetch(`${baseUrl}/api/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName.trim(),
          description: 'Quick scan project',
          urls: [{
            url: url,
            name: url
          }]
        }),
      });

      if (!projectResponse.ok) {
        const errorText = await projectResponse.text();
        console.error('Project creation failed:', projectResponse.status, errorText);
        
        // Try to parse error message
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || errorData.error || `Failed to create project: ${projectResponse.statusText}`);
        } catch {
          throw new Error(`Failed to create project: ${projectResponse.statusText}`);
        }
      }

      const projectData = await projectResponse.json();
      console.log('Project created:', projectData);
      const urlId = projectData.urls[0]._id;

      // Start the scan
      const scanResponse = await fetch(`${baseUrl}/api/scans/${urlId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scanOptions: {
            gdpr: true,
            accessibility: true,
            security: true,
            performance: true,
            seo: true,
            customRules: []
          }
        }),
      });

      if (!scanResponse.ok) {
        const errorText = await scanResponse.text();
        console.error('Scan start failed:', scanResponse.status, errorText);
        
        // Try to parse error message
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || errorData.error || `Failed to start scan: ${scanResponse.statusText}`);
        } catch {
          throw new Error(`Failed to start scan: ${scanResponse.statusText}`);
        }
      }

      const scanData = await scanResponse.json();
      console.log('Scan started:', scanData);
      
      // Get the scan ID from the response
      const scanId = scanData.scan._id;
      console.log('Scan ID for polling:', scanId);
      
      // Validate scan ID exists
      if (!scanId) {
        throw new Error('Failed to get scan ID from response');
      }
      
      // Poll for scan completion
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max
      
      const pollScan = async () => {
        if (attempts >= maxAttempts) {
          setScanResult({ status: 'failed', error: 'Scan timeout - please try again' });
          setScanning(false);
          return;
        }

        console.log(`Polling scan status (attempt ${attempts + 1}/${maxAttempts})`);

        try {
          const statusResponse = await fetch(`${baseUrl}/api/scans/${scanId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!statusResponse.ok) {
            const errorText = await statusResponse.text();
            console.error('Scan status check failed:', statusResponse.status, errorText);
            
            // If it's a 404, the scan might not exist yet, continue polling
            if (statusResponse.status === 404) {
              attempts++;
              setTimeout(pollScan, 5000); // Poll every 5 seconds
              return;
            }
            
            throw new Error(`Failed to check scan status: ${statusResponse.statusText}`);
          }

          const statusData = await statusResponse.json();
          console.log('Scan status:', statusData.status, statusData);
          
          if (statusData.status === 'completed') {
            const completed: ScanResult = { status: 'completed', results: statusData.results };
            setCompletedScanId(scanId);
            if (minDurationElapsed) {
              setScanResult(completed);
              setProgress(100);
              setScanning(false);
            } else {
              pendingResultRef.current = completed;
            }
            return;
          } else if (statusData.status === 'failed') {
            const failed: ScanResult = { status: 'failed', error: statusData.error || 'Scan failed' };
            if (minDurationElapsed) {
              setScanResult(failed);
              setProgress(100);
              setScanning(false);
            } else {
              pendingResultRef.current = failed;
            }
            return;
          }

          // Continue polling for pending/scanning status
          attempts++;
          setTimeout(pollScan, 5000); // Poll every 5 seconds
        } catch (error) {
          console.error('Error polling scan status:', error);
          
          // If we've tried too many times, give up
          if (attempts >= maxAttempts - 1) {
            setScanResult({ status: 'failed', error: 'Failed to check scan status - please try again' });
            setScanning(false);
            return;
          }
          
          // Otherwise, continue polling
          attempts++;
          setTimeout(pollScan, 5000);
        }
      };

      pollScan();

    } catch (err) {
      console.error('Scan error:', err);
      setScanResult({ status: 'failed', error: err instanceof Error ? err.message : 'Unknown error' });
      setScanning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Quick Scan</h2>
                  <p className="text-sm text-slate-600">Scan a single URL</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!scanning && !scanResult && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My Quick Scan Project"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    disabled={scanning}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Website URL
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      disabled={scanning}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}

                <button
                  onClick={handleScan}
                  disabled={scanning || !projectName.trim() || !url.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Scan
                </button>
              </div>
            )}

            {scanning && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Scanning Website</h3>
                <p className="text-slate-600 mb-4">
                  Analyzing {url} for compliance issues...
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-3 overflow-hidden">
                  <div className="bg-green-500 h-2.5 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-slate-500">{progress}%</p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                    <Shield className="w-4 h-4" />
                    <span>Security Analysis</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                    <Shield className="w-4 h-4" />
                    <span>GDPR Compliance</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                    <Shield className="w-4 h-4" />
                    <span>Accessibility Check</span>
                  </div>
                </div>
              </div>
            )}

            {scanResult && scanResult.status === 'completed' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Scan Complete!</h3>
                  
                  {scanResult.results?.overall?.score && (
                    <div className="mb-4">
                      <div className={`text-3xl font-bold ${getScoreColor(scanResult.results.overall.score)}`}>
                        {scanResult.results.overall.score}%
                      </div>
                      <div className="text-sm text-slate-600">
                        {getScoreLabel(scanResult.results.overall.score)} Compliance Score
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {scanResult.results?.gdpr && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium">GDPR</span>
                      <span className={`text-sm font-medium ${scanResult.results.gdpr.score >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                        {scanResult.results.gdpr.score}%
                      </span>
                    </div>
                  )}
                  
                  {scanResult.results?.security && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium">Security</span>
                      <span className={`text-sm font-medium ${scanResult.results.security.score >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                        {scanResult.results.security.score}%
                      </span>
                    </div>
                  )}
                  
                  {scanResult.results?.accessibility && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium">Accessibility</span>
                      <span className={`text-sm font-medium ${scanResult.results.accessibility.score >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                        {scanResult.results.accessibility.score}%
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onComplete(completedScanId || undefined)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  View Full Report
                </button>

                <button
                  onClick={onClose}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {scanResult && scanResult.status === 'failed' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Scan Failed</h3>
                <p className="text-slate-600 mb-4">
                  {scanResult.error || 'An error occurred during the scan'}
                </p>
                <button
                  onClick={() => {
                    setScanResult(null);
                    setScanning(false);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 