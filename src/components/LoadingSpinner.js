import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizePx = size === 'small' ? 16 : size === 'large' ? 48 : 32;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      background: 'rgba(255,255,255,0.85)'
    }}>
      <div
        style={{
          width: sizePx,
          height: sizePx,
          border: '4px solid #d1d5db',
          borderTop: '4px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          marginBottom: 16
        }}
      />
      {text && <p style={{ color: '#6366f1', fontWeight: 500, fontSize: 18 }}>{text}</p>}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default LoadingSpinner; 