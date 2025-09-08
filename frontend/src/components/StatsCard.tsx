import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'slate';
  loading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  progress?: number;
  status?: 'good' | 'warning' | 'critical' | 'neutral';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200',
    gradient: 'from-blue-500 to-blue-600',
    ring: 'ring-blue-100',
    progress: 'bg-blue-500'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200',
    gradient: 'from-green-500 to-green-600',
    ring: 'ring-green-100',
    progress: 'bg-green-500'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200',
    gradient: 'from-purple-500 to-purple-600',
    ring: 'ring-purple-100',
    progress: 'bg-purple-500'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    border: 'border-orange-200',
    gradient: 'from-orange-500 to-orange-600',
    ring: 'ring-orange-100',
    progress: 'bg-orange-500'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-200',
    gradient: 'from-red-500 to-red-600',
    ring: 'ring-red-100',
    progress: 'bg-red-500'
  },
  slate: {
    bg: 'bg-slate-50',
    icon: 'text-slate-600',
    border: 'border-slate-200',
    gradient: 'from-slate-500 to-slate-600',
    ring: 'ring-slate-100',
    progress: 'bg-slate-500'
  }
};

const statusClasses = {
  good: 'border-l-4 border-l-green-500 bg-green-50/50',
  warning: 'border-l-4 border-l-yellow-500 bg-yellow-50/50',
  critical: 'border-l-4 border-l-red-500 bg-red-50/50',
  neutral: 'border-l-4 border-l-slate-300 bg-slate-50/50'
};

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  loading = false, 
  trend, 
  subtitle, 
  progress, 
  status = 'neutral' 
}: StatsCardProps) {
  const colors = colorClasses[color];
  const statusStyle = statusClasses[status];

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value === 0) return <Minus className="w-3 h-3" />;
    return trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-slate-500';
    if (trend.value === 0) return 'text-slate-500';
    return trend.isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <motion.div
      data-testid="stats-card"
      data-loading={loading}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative group overflow-hidden rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${statusStyle}`}
      style={{
        background: `linear-gradient(135deg, ${color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : color === 'purple' ? '#8b5cf6' : color === 'orange' ? '#f59e0b' : color === 'red' ? '#ef4444' : '#64748b'}, ${color === 'blue' ? '#1d4ed8' : color === 'green' ? '#059669' : color === 'purple' ? '#7c3aed' : color === 'orange' ? '#d97706' : color === 'red' ? '#dc2626' : '#475569'})`
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
            <p className="text-white/80 text-xs font-medium mb-1 uppercase tracking-wide">{title}</p>
          {loading ? (
              <div className="h-8 bg-white/20 rounded animate-pulse mb-2"></div>
            ) : (
              <motion.p 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-3xl font-bold text-white mb-1"
              >
                {value}
              </motion.p>
            )}
            {subtitle && !loading && (
              <p className="text-white/70 text-xs font-medium">{subtitle}</p>
            )}
          </div>
          
          <motion.div 
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-md"
          >
            <Icon data-testid="stats-icon" className="w-6 h-6 text-white" />
          </motion.div>
        </div>

        {/* Compact Progress Bar */}
        {progress !== undefined && !loading && (
          <div className="mb-3">
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="h-1.5 rounded-full bg-white shadow-sm"
              ></motion.div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-white/70 text-xs">Progress</span>
              <span className="text-white text-xs font-semibold">{Math.round(progress)}%</span>
            </div>
          </div>
        )}

        {/* Compact Trend Indicator */}
          {trend && !loading && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="flex items-center space-x-2"
          >
            <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
              {getTrendIcon()}
              <span className="text-white font-semibold text-xs">
                {trend.value === 0 ? 'No change' : `${trend.isPositive ? '+' : ''}${trend.value}%`}
              </span>
            </div>
            <span className="text-white/70 text-xs">vs last month</span>
          </motion.div>
        )}

        {/* Compact Status Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mt-3 flex items-center space-x-2"
        >
          <div className={`w-1.5 h-1.5 rounded-full ${
            status === 'good' ? 'bg-green-400' : 
            status === 'warning' ? 'bg-yellow-400' : 
            status === 'critical' ? 'bg-red-400' : 'bg-slate-400'
          } animate-pulse`}></div>
          <span className="text-white/80 text-xs font-medium capitalize">
            {status === 'good' ? 'Excellent' : 
             status === 'warning' ? 'Needs Attention' : 
             status === 'critical' ? 'Critical' : 'Neutral'}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
} 