import { LucideIcon } from 'lucide-react';
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
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    icon: 'text-blue-600',
    border: 'border-blue-200',
    gradient: 'from-blue-500 to-blue-600'
  },
  green: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
    border: 'border-green-200',
    gradient: 'from-green-500 to-green-600'
  },
  purple: {
    bg: 'bg-purple-100',
    icon: 'text-purple-600',
    border: 'border-purple-200',
    gradient: 'from-purple-500 to-purple-600'
  },
  orange: {
    bg: 'bg-orange-100',
    icon: 'text-orange-600',
    border: 'border-orange-200',
    gradient: 'from-orange-500 to-orange-600'
  },
  red: {
    bg: 'bg-red-100',
    icon: 'text-red-600',
    border: 'border-red-200',
    gradient: 'from-red-500 to-red-600'
  },
  slate: {
    bg: 'bg-slate-100',
    icon: 'text-slate-600',
    border: 'border-slate-200',
    gradient: 'from-slate-500 to-slate-600'
  }
};

export default function StatsCard({ title, value, icon: Icon, color, loading = false, trend }: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      data-testid="stats-card"
      data-loading={loading}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-200 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-600 text-sm font-medium mb-1">{title}</p>
          {loading ? (
            <div className="h-8 bg-slate-200 rounded animate-pulse mb-2"></div>
          ) : (
            <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
          )}
          {trend && !loading && (
            <div className="flex items-center space-x-1">
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-slate-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
          <Icon data-testid="stats-icon" className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </motion.div>
  );
} 