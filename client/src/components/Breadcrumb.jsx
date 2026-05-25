import { Link } from 'react-router-dom'

export default function Breadcrumb({ items }) {
  // items = [{ label: 'Dashboard', to: '/' }, { label: 'Koleksi', to: '/collection' }, { label: 'Detail' }]
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>›</span>}
            {isLast || !item.to ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.label}</span>
            ) : (
              <Link to={item.to} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}