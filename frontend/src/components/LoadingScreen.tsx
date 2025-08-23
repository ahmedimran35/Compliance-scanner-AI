import React from 'react';
import { Shield } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingScreenProps {
  variant?: 'default' | 'minimal' | 'fancy' | 'tech' | 'gradient';
  theme?: 'light' | 'dark';
  message?: string;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  variant = 'default',
  theme = 'dark',
  message = 'Loading...',
  showProgress = false,
  progress = 0,
  className = ''
}) => {
  const isDark = theme === 'dark';
  const bgClass = isDark 
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100';
  
  const textClass = isDark ? 'text-gray-300' : 'text-slate-600';

  const renderLoadingContent = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div className="text-center">
            <LoadingSpinner variant="dots" color="primary" size="lg" />
            <p className={`mt-4 text-lg font-medium ${textClass}`}>{message}</p>
          </div>
        );

      case 'fancy':
        return (
          <div className="text-center">
            {/* Animated Logo */}
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse mx-auto">
                <Shield className="w-10 h-10 text-white" />
              </div>
              {/* Floating particles */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ComplianceScanner AI
            </h1>
            
            <LoadingSpinner variant="orbit" color="gradient" size="lg" />
            <p className={`mt-4 text-lg font-medium ${textClass}`}>{message}</p>
          </div>
        );

      case 'tech':
        return (
          <div className="text-center">
            {/* Tech-style loading */}
            <div className="mb-8">
              <div className="w-24 h-24 border-4 border-blue-500/30 rounded-full animate-spin mx-auto"></div>
              <div className="w-24 h-24 border-4 border-transparent border-t-blue-500 rounded-full animate-spin mx-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ animationDuration: '2s' }}></div>
            </div>
            
            <div className="space-y-4">
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                SYSTEM INITIALIZATION
              </h1>
              <LoadingSpinner variant="bars" color="blue" size="lg" />
              <p className={`text-sm font-mono ${textClass}`}>{message}</p>
              
              {showProgress && (
                <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        );

      case 'gradient':
        return (
          <div className="text-center">
            {/* Gradient animated background */}
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-full animate-pulse mx-auto animate-morph"></div>
              <div className="absolute inset-0 w-32 h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full animate-pulse mx-auto animate-morph" style={{ animationDelay: '2s' }}></div>
              <div className="absolute inset-4 w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <Shield className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            
            <h1 className={`text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4`}>
              ComplianceScanner AI
            </h1>
            
            <LoadingSpinner variant="ripple" color="gradient" size="lg" />
            <p className={`mt-4 text-lg font-medium ${textClass}`}>{message}</p>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <LoadingSpinner variant="default" color="primary" size="xl" />
            <p className={`mt-4 text-lg font-medium ${textClass}`}>{message}</p>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${bgClass} relative overflow-hidden ${className}`}>
      {/* Background Effects */}
      {variant !== 'minimal' && (
        <div className="absolute inset-0">
          {/* Floating orbs */}
          <div className={`absolute top-1/4 left-1/4 w-32 h-32 ${isDark ? 'bg-blue-500/20' : 'bg-blue-500/10'} rounded-full blur-xl animate-pulse`}></div>
          <div className={`absolute top-3/4 right-1/4 w-24 h-24 ${isDark ? 'bg-purple-500/20' : 'bg-purple-500/10'} rounded-full blur-xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className={`absolute inset-0 bg-[linear-gradient(${isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)'}_1px,transparent_1px),linear-gradient(90deg,${isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)'}_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse`}></div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        {renderLoadingContent()}
      </div>
    </div>
  );
};

export default LoadingScreen; 