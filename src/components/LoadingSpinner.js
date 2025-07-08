import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div 
        className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin`}
        style={{
          width: size === 'small' ? '16px' : size === 'medium' ? '32px' : '48px',
          height: size === 'small' ? '16px' : size === 'medium' ? '32px' : '48px',
          border: '2px solid #d1d5db',
          borderTop: '2px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      {text && <p className="mt-2 text-gray-600">{text}</p>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner; 