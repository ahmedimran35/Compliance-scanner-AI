import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Plus, 
  Search, 
  Clock, 
  Settings, 
  BarChart3, 
  Calendar,
  Shield,
  Globe,
  FileText,
  ArrowRight,
  Star,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuickActionsPanelProps {
  onQuickScan: () => void;
  onCreateProject: () => void;
  totalProjects: number;
  totalUrls: number;
  recentSearches?: string[];
}

export default function QuickActionsPanel({ 
  onQuickScan, 
  onCreateProject,
  totalProjects, 
  totalUrls,
  recentSearches = []
}: QuickActionsPanelProps) {
  const router = useRouter();

  const quickActions = [
    {
      icon: Zap,
      title: 'Quick Scan',
      description: 'Scan any website instantly',
      action: onQuickScan,
      color: 'from-green-500 to-emerald-500',
      hoverColor: 'hover:from-green-600 hover:to-emerald-600'
    },
    {
      icon: Plus,
      title: 'New Project',
      description: 'Create a new project',
      action: onCreateProject,
      color: 'from-blue-500 to-indigo-500',
      hoverColor: 'hover:from-blue-600 hover:to-indigo-600'
    },
    {
      icon: Search,
      title: 'View Projects',
      description: 'Browse all projects',
      action: () => router.push('/projects'),
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'hover:from-purple-600 hover:to-pink-600'
    },
    {
      icon: Calendar,
      title: 'Schedule Scan',
      description: 'Set up automated scans',
      action: () => router.push('/scheduled-scans'),
      color: 'from-orange-500 to-red-500',
      hoverColor: 'hover:from-orange-600 hover:to-red-600'
    }
  ];


  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 h-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Quick Actions</h3>
        <p className="text-slate-600 text-sm">Get things done faster</p>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.title}
              onClick={action.action}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-gradient-to-r ${action.color} ${action.hoverColor} text-white p-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl group relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold block">{action.title}</span>
                  <span className="text-xs opacity-90">{action.description}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Your Progress</p>
              <p className="text-xs text-slate-600">Keep up the great work!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">{totalProjects}</p>
            <p className="text-xs text-slate-600">Projects</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-600">{totalUrls} URLs monitored</span>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-500" />
            <span className="text-slate-600">Active</span>
          </div>
        </div>
      </div>


      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Recent Searches</h4>
          <div className="space-y-1">
            {recentSearches.slice(0, 3).map((search, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02, x: 4 }}
                className="flex items-center space-x-2 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm w-full text-left"
              >
                <Clock className="w-3 h-3" />
                <span className="truncate">{search}</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Pro Tip */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Shield className="w-3 h-3 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-900">Pro Tip</p>
            <p className="text-xs text-blue-700 mt-1">
              Use Quick Scan for immediate results on any website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
