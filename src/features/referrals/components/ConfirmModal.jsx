// src/features/referrals/components/ConfirmModal.jsx
import { useEffect } from 'react';

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const colors = {
    danger: { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', hover: '#B91C1C' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706', hover: '#B45309' },
    info: { bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB', hover: '#1D4ED8' },
  };

  const style = colors[type] || colors.danger;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          maxWidth: '440px',
          width: '100%',
          padding: '28px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: style.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            {type === 'danger' ? '⚠️' : 'ℹ️'}
          </div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>{title}</h3>
        </div>
        <p style={{ color: '#4B5563', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              background: '#fff',
              color: '#374151',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F4F6')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: style.text,
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = style.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = style.text)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}