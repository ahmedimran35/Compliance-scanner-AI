import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'pulse' | 'dots' | 'bars' | 'ripple' | 'orbit';
  color?: 'primary' | 'secondary' | 'white' | 'blue' | 'purple' | 'gradient';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'default',
  color = 'primary',
  className = '',
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    gradient: 'text-transparent bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
            <div className="w-full h-full bg-current rounded-full animate-pulse"></div>
          </div>
        );

      case 'dots':
        return (
          <div className={`flex space-x-1 ${className}`}>
            <div className={`w-2 h-2 bg-current rounded-full animate-bounce ${colorClasses[color]}`} style={{ animationDelay: '0s' }}></div>
            <div className={`w-2 h-2 bg-current rounded-full animate-bounce ${colorClasses[color]}`} style={{ animationDelay: '0.2s' }}></div>
            <div className={`w-2 h-2 bg-current rounded-full animate-bounce ${colorClasses[color]}`} style={{ animationDelay: '0.4s' }}></div>
          </div>
        );

      case 'bars':
        return (
          <div className={`flex space-x-1 ${className}`}>
            <div className={`w-1 h-4 bg-current rounded-full animate-pulse ${colorClasses[color]}`} style={{ animationDelay: '0s' }}></div>
            <div className={`w-1 h-4 bg-current rounded-full animate-pulse ${colorClasses[color]}`} style={{ animationDelay: '0.2s' }}></div>
            <div className={`w-1 h-4 bg-current rounded-full animate-pulse ${colorClasses[color]}`} style={{ animationDelay: '0.4s' }}></div>
            <div className={`w-1 h-4 bg-current rounded-full animate-pulse ${colorClasses[color]}`} style={{ animationDelay: '0.6s' }}></div>
          </div>
        );

      case 'ripple':
        return (
          <div className={`relative ${sizeClasses[size]} ${className}`}>
            <div className={`absolute inset-0 border-2 border-current rounded-full animate-ping ${colorClasses[color]}`} style={{ animationDuration: '1s' }}></div>
            <div className={`absolute inset-0 border-2 border-current rounded-full animate-ping ${colorClasses[color]}`} style={{ animationDuration: '1s', animationDelay: '0.3s' }}></div>
            <div className={`absolute inset-0 border-2 border-current rounded-full animate-ping ${colorClasses[color]}`} style={{ animationDuration: '1s', animationDelay: '0.6s' }}></div>
          </div>
        );

      case 'orbit':
        return (
          <div className={`relative ${sizeClasses[size]} ${className}`}>
            {/* Outer Ring */}
            <div className={`absolute inset-0 border-2 border-current/30 rounded-full animate-spin ${colorClasses[color]}`}></div>
            <div className={`absolute inset-0 border-2 border-transparent border-t-current rounded-full animate-spin ${colorClasses[color]}`} style={{ animationDuration: '2s' }}></div>
            
            {/* Inner Ring */}
            <div className={`absolute inset-2 border-2 border-current/30 rounded-full animate-spin ${colorClasses[color]}`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className={`absolute inset-2 border-2 border-transparent border-t-current rounded-full animate-spin ${colorClasses[color]}`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            
            {/* Center */}
            <div className={`absolute inset-4 bg-current rounded-full animate-pulse ${colorClasses[color]}`}></div>
          </div>
        );

      default:
        return (
          <div className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
            <svg
              className="animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {renderSpinner()}
      {text && (
        <div className={`mt-2 text-sm ${colorClasses[color]} animate-pulse`}>
          {text}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner; 