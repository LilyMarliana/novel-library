export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-card)',
      marginTop: 60,
      padding: '20px 24px',
      textAlign: 'center',
    }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
        📚 Novel Library · {new Date().getFullYear()} · Dibuat Oleh Marliana Lily
      </p>
    </footer>
  )
}