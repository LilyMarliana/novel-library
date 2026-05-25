import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [])

  const colors = {
    success: { bg: 'var(--sage-soft)',     border: 'var(--sage)',     icon: '✅' },
    error:   { bg: '#fef0f0',              border: '#f5c6c6',         icon: '❌' },
    info:    { bg: 'var(--sky-soft)',      border: 'var(--sky)',      icon: 'ℹ️' },
  }
  const c = colors[type]

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-md)',
      padding: '14px 20px',
      boxShadow: 'var(--shadow-md)',
      display: 'flex', alignItems: 'center', gap: 10,
      minWidth: 260, maxWidth: 360,
      animation: 'slideIn 0.3s ease',
    }}>
      <span style={{ fontSize: 18 }}>{c.icon}</span>
      <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      <span onClick={onClose} style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, lineHeight: 1 }}>×</span>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}