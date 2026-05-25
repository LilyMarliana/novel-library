import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { pathname } = useLocation()
  const { dark, setDark } = useTheme()

  const links = [
    { to: '/',          label: 'Dashboard' },
    { to: '/collection', label: 'Koleksi' },
    { to: '/stats',     label: 'Statistik' },
    { to: '/import',    label: 'Import' },
    { to: '/add',       label: '+ Tambah Novel' },
  ]

  return (
    <nav style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      position: 'sticky', top: 0, zIndex: 100,
      transition: 'background 0.3s ease',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>📚</span>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '1.3rem',
            fontWeight: 600, color: 'var(--text-primary)',
          }}>Novel Library</span>
        </Link>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {links.map(link => {
            const isActive = pathname === link.to
            const isAdd    = link.to === '/add'
            return (
              <Link key={link.to} to={link.to} style={{
                padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                fontWeight: 500, fontSize: '0.88rem', transition: 'all 0.2s',
                background: isAdd ? 'var(--pink)' : isActive ? 'var(--pink-soft)' : 'transparent',
                color: isActive || isAdd ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: isAdd ? 'none' : '1px solid transparent',
              }}>{link.label}</Link>
            )
          })}

          <button
            onClick={() => setDark(d => !d)}
            title={dark ? 'Mode Terang' : 'Mode Gelap'}
            style={{
              width: 38, height: 38, borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--bg-subtle)',
              cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', marginLeft: 4,
            }}
          >{dark ? '☀️' : '🌙'}</button>
        </div>
      </div>
    </nav>
  )
}