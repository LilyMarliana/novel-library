export default function Modal({ title, message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(74,63,53,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: 32,
        maxWidth: 400, width: '100%',
        boxShadow: 'var(--shadow-md)',
        animation: 'popIn 0.2s ease',
      }}>
        <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 16 }}>🗑️</div>
        <h2 style={{ textAlign: 'center', marginBottom: 8, fontSize: '1.2rem' }}>{title}</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--bg-subtle)',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            fontWeight: 500,
          }}>Batal</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '10px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: '#fde8e8', color: '#c0392b',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            fontWeight: 600,
          }}>Hapus</button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn  { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  )
}