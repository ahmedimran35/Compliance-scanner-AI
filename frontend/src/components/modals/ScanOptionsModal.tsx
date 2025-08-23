"use client";

import { useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Eye, 
  Zap, 
  Search, 
  FileText, 
  Settings, 
  XCircle, 
  CheckCircle, 
  AlertCircle,
  Crown,
  Info
} from 'lucide-react';

interface ScanOptions {
  gdpr: boolean;
  accessibility: boolean;
  security: boolean;
  performance: boolean;
  seo: boolean;
  customRules: string[];
}

interface ScanOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartScan: (options: ScanOptions) => void;
  urlName: string;
  url: string;
  isSupporter: boolean;
}

const scanCategories = [
  {
    id: 'gdpr',
    name: 'GDPR & Privacy',
    description: 'Check for cookie banners, privacy policies, and data protection compliance',
    icon: Shield,
    color: 'blue',
    available: true,
    free: true
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    description: 'Verify alt text, keyboard navigation, screen reader support, and WCAG compliance',
    icon: Eye,
    color: 'green',
    available: true,
    free: true
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Check HTTPS, security headers, CSP, and other security measures',
    icon: Shield,
    color: 'red',
    available: true,
    free: true
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Analyze load times, page size, optimization, and Core Web Vitals',
    icon: Zap,
    color: 'yellow',
    available: true,
    free: true // Now free for all users
  },
  {
    id: 'seo',
    name: 'SEO',
    description: 'Check meta tags, structured data, sitemaps, and search engine optimization',
    icon: Search,
    color: 'purple',
    available: true,
    free: true // Now free for all users
  }
];

export default function ScanOptionsModal({ 
  isOpen, 
  onClose, 
  onStartScan, 
  urlName, 
  url, 
  isSupporter 
}: ScanOptionsModalProps) {
  const { user } = useUser();
  const [scanOptions, setScanOptions] = useState<ScanOptions>({
    gdpr: true,
    accessibility: true,
    security: true,
    performance: true, // Available for all users
    seo: true, // Available for all users
    customRules: []
  });
  const [isStarting, setIsStarting] = useState(false);

  const handleOptionChange = (category: string, checked: boolean) => {
    setScanOptions(prev => ({
      ...prev,
      [category]: checked
    }));
  };

  const handleSelectAll = () => {
    // All options available for all users
    const allOptions: ScanOptions = {
      gdpr: true,
      accessibility: true,
      security: true,
      performance: true,
      seo: true,
      customRules: []
    };
    
    setScanOptions(allOptions);
  };

  const handleSelectNone = () => {
    setScanOptions({
      gdpr: false,
      accessibility: false,
      security: false,
      performance: false,
      seo: false,
      customRules: []
    });
  };

  const handleStartScan = async () => {
    // Check if at least one option is selected
    const hasSelection = Object.values(scanOptions).some(value => 
      typeof value === 'boolean' ? value : value.length > 0
    );

    if (!hasSelection) {
      alert('Please select at least one scan category');
        return;
      }

    setIsStarting(true);
    try {
      await onStartScan(scanOptions);
      onClose();
    } catch (error) {
    } finally {
      setIsStarting(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      red: 'bg-red-100 text-red-600 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const selectedCount = Object.values(scanOptions).filter(value => 
    typeof value === 'boolean' ? value : value.length > 0
  ).length;

  return (
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Scan Options</h2>
                  <p className="text-sm text-slate-600">Choose what to scan for {urlName || url}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
                <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Quick Actions */}
              <div className="flex space-x-2 mb-6">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={handleSelectNone}
                  className="px-3 py-1 text-sm bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Select None
                </button>
                <div className="flex-1" />
                <div className="flex items-center space-x-1 text-sm text-slate-500">
                  <span>{selectedCount} selected</span>
                </div>
              </div>

              {/* Scan Categories */}
            <div className="space-y-4">
                {scanCategories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = scanOptions[category.id as keyof ScanOptions] as boolean;
                  // TEMPORARILY REMOVED: Tier-based availability restrictions
                  const isAvailable = true; // All categories are now available for testing
                
                return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                      onClick={() => handleOptionChange(category.id, !isSelected)}
                  >
                    <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getColorClasses(category.color)}`}>
                          <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-slate-900">{category.name}</h3>
                            {!category.free && (
                              <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                              <Crown className="w-3 h-3" />
                                <span>Pro</span>
                            </div>
                          )}
                            {/* TEMPORARILY REMOVED: Upgrade Required message */}
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {isSelected ? (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                );
              })}
            </div>

              {/* Info Section */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-slate-500 mt-0.5" />
                  <div className="text-sm text-slate-600">
                    <p className="font-medium mb-1">Scan Information:</p>
                    <ul className="space-y-1">
                      <li>• All scan categories are temporarily available for testing</li>
                      <li>• Pro tags are shown for reference but restrictions are disabled</li>
                      <li>• Monthly scan limits are temporarily removed</li>
                      <li>• Full functionality available to all users during testing</li>
                    </ul>
                </div>
                </div>
              </div>
            </div>

            {/* Footer */}
          <div className="flex space-x-3 p-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartScan}
                disabled={isStarting || selectedCount === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
                {isStarting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Starting Scan...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Start Scan ({selectedCount} categories)</span>
                  </>
                )}
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
} 