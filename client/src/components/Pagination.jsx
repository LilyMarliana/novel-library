export default function Pagination({ current, total, onChange }) {
  if (total <= 1) return null

  const pages = Array.from({ length: total }, (_, i) => i + 1)

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 40 }}>
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        style={btnStyle(false, current === 1)}
      >←</button>

      {pages.map(p => {
        const isEllipsis = total > 7 && p !== 1 && p !== total && (p < current - 1 || p > current + 1)
        if (isEllipsis) {
          if (p === current - 2 || p === current + 2) return <span key={p} style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>…</span>
          return null
        }
        return (
          <button key={p} onClick={() => onChange(p)} style={btnStyle(p === current, false)}>
            {p}
          </button>
        )
      })}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        style={btnStyle(false, current === total)}
      >→</button>
    </div>
  )
}

const btnStyle = (active, disabled) => ({
  width: 36, height: 36,
  borderRadius: 'var(--radius-sm)',
  border: `1px solid ${active ? 'var(--pink)' : 'var(--border)'}`,
  background: active ? 'var(--pink-soft)' : 'var(--bg-card)',
  color: active ? 'var(--text-primary)' : disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'var(--font-body)', fontWeight: active ? 600 : 400,
  fontSize: '0.9rem', transition: 'all 0.2s',
  opacity: disabled ? 0.5 : 1,
})