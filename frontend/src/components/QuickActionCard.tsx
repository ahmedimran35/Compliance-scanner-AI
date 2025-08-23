import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'slate';
  onClick: () => void;
  buttonText: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    button: 'bg-blue-500 hover:bg-blue-600',
    icon: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    button: 'bg-green-500 hover:bg-green-600',
    icon: 'text-green-600'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    button: 'bg-purple-500 hover:bg-purple-600',
    icon: 'text-purple-600'
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    button: 'bg-orange-500 hover:bg-orange-600',
    icon: 'text-orange-600'
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    button: 'bg-red-500 hover:bg-red-600',
    icon: 'text-red-600'
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    button: 'bg-slate-500 hover:bg-slate-600',
    icon: 'text-slate-600'
  }
};

export default function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  onClick, 
  buttonText 
}: QuickActionCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm border ${colors.border} hover:shadow-lg transition-all duration-200 group`}
    >
      <div className="flex items-center mb-4">
        <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      
      <p className="text-slate-600 mb-6 leading-relaxed">
        {description}
      </p>
      
      <button 
        onClick={onClick}
        className={`w-full ${colors.button} text-white py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02]`}
      >
        {buttonText}
      </button>
    </motion.div>
  );
} 