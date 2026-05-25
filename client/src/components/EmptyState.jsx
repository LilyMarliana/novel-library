import { Link } from 'react-router-dom'

export default function EmptyState({ title, message, actionLabel, actionTo, emoji }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
    }}>
      {/* Ilustrasi SVG */}
      <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="30" width="55" height="75" rx="6" fill="#fde8eb" stroke="#f4b8c1" strokeWidth="1.5"/>
        <rect x="30" y="20" width="55" height="75" rx="6" fill="#fef0e6" stroke="#f9c9a8" strokeWidth="1.5"/>
        <rect x="40" y="10" width="55" height="75" rx="6" fill="#fff" stroke="#ecddd3" strokeWidth="1.5"/>
        <line x1="52" y1="28" x2="83" y2="28" stroke="#ecddd3" strokeWidth="2" strokeLinecap="round"/>
        <line x1="52" y1="36" x2="83" y2="36" stroke="#ecddd3" strokeWidth="2" strokeLinecap="round"/>
        <line x1="52" y1="44" x2="75" y2="44" stroke="#ecddd3" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="118" cy="90" r="28" fill="#f0ebfb" stroke="#c9b8e8" strokeWidth="1.5"/>
        <text x="118" y="97" textAnchor="middle" fontSize="22">{emoji || '📭'}</text>
        <circle cx="30" cy="110" r="10" fill="#e8f4ef" stroke="#b5d5c5" strokeWidth="1.5"/>
        <circle cx="145" cy="30" r="8" fill="#e5f2fb" stroke="#aecfea" strokeWidth="1.5"/>
      </svg>

      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 300 }}>{message}</p>
      </div>

      {actionLabel && actionTo && (
        <Link to={actionTo} style={{
          padding: '10px 24px',
          background: 'var(--pink)',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 600, fontSize: '0.9rem',
          marginTop: 8,
        }}>{actionLabel}</Link>
      )}
    </div>
  )
}