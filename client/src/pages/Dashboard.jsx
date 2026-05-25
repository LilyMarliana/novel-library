import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import PageTransition from '../components/PageTransition'
import EmptyState from '../components/EmptyState'
import Footer from '../components/Footer'
import { getStats, getNovels } from '../services/api'

const StatCard = ({ label, value, color, emoji }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex', alignItems: 'center', gap: 16,
  }}>
    <div style={{
      width: 52, height: 52, borderRadius: '50%',
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
    }}>{emoji}</div>
    <div>
      <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{value ?? '-'}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</div>
    </div>
  </div>
)

const NovelCard = ({ novel }) => (
  <Link to={`/novel/${novel.id}`} style={{ textDecoration: 'none' }}>
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
    >
      <div style={{
        height: 140, background: 'var(--bg-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 48, overflow: 'hidden',
      }}>
        {novel.cover_image
          ? <img src={`http://localhost:3000/uploads/${novel.cover_image}`} alt={novel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : '📖'}
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4, lineHeight: 1.3 }}>{novel.title}</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{novel.author}</div>
      </div>
    </div>
  </Link>
)

export default function Dashboard() {
  const [stats, setStats]           = useState(null)
  const [recent, setRecent]         = useState([])
  const [lastEdited, setLastEdited] = useState([])
  const [unread, setUnread]         = useState([])
  const [random, setRandom]         = useState(null)

  useEffect(() => {
    getStats().then(r => setStats(r.data))
    getNovels({ sort: 'created_at', order: 'DESC' }).then(r => setRecent(r.data.slice(0, 4)))
    getNovels({ sort: 'updated_at', order: 'DESC' }).then(r => setLastEdited(r.data.slice(0, 4)))
    getNovels({ status: 'belum' }).then(r => {
      setUnread(r.data)
      if (r.data.length > 0) setRandom(r.data[Math.floor(Math.random() * r.data.length)])
    })
  }, [])

  const rerollRandom = () => {
    if (unread.length === 0) return
    setRandom(unread[Math.floor(Math.random() * unread.length)])
  }

  const readPercent = stats?.total > 0 ? Math.round((stats.sudah / stats.total) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <PageTransition>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: 6 }}>Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Ringkasan koleksi novel kamu</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard label="Total Novel"      value={stats?.total}     color="var(--pink-soft)"     emoji="📚" />
            <StatCard label="Sudah Dibaca"     value={stats?.sudah}     color="var(--sage-soft)"     emoji="✅" />
            <StatCard label="Sedang Dibaca"    value={stats?.sedang}    color="var(--peach-soft)"    emoji="📖" />
            <StatCard label="Belum Dibaca"     value={stats?.belum}     color="var(--sky-soft)"      emoji="🔖" />
            <StatCard label="Rating Rata-rata" value={stats?.avgRating} color="var(--lavender-soft)" emoji="⭐" />
          </div>

          {stats?.total > 0 && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: 24,
              boxShadow: 'var(--shadow-sm)', marginBottom: 28,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ fontSize: '1rem' }}>Progress Membaca</h2>
                <span style={{ fontWeight: 700, color: '#4a7c63', fontSize: '1.1rem' }}>{readPercent}%</span>
              </div>
              <div style={{ background: 'var(--bg-subtle)', borderRadius: 99, height: 14, overflow: 'hidden' }}>
                <div style={{
                  height: 14, borderRadius: 99,
                  background: 'linear-gradient(90deg, var(--sage), var(--pink))',
                  width: `${readPercent}%`, transition: 'width 0.8s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>0 novel</span>
                <span>{stats.sudah} dari {stats.total} novel selesai dibaca</span>
                <span>{stats.total} novel</span>
              </div>
            </div>
          )}

          {random && (
            <div style={{
              background: 'linear-gradient(135deg, var(--pink-soft), var(--lavender-soft))',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
              padding: 24, marginBottom: 28,
              display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
            }}>
              <div style={{
                width: 70, height: 100, borderRadius: 'var(--radius-sm)',
                overflow: 'hidden', flexShrink: 0, background: 'var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
                boxShadow: 'var(--shadow-sm)',
              }}>
                {random.cover_image
                  ? <img src={`http://localhost:3000/uploads/${random.cover_image}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '📖'}
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                  ✨ Baca Novel Ini!
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>{random.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>oleh {random.author}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/novel/${random.id}`} style={{
                    padding: '7px 16px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--pink)', fontWeight: 600, fontSize: '0.85rem',
                  }}>Lihat Detail</Link>
                  <button onClick={rerollRandom} style={{
                    padding: '7px 16px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer',
                  }}>🎲 Acak Lagi</button>
                </div>
              </div>
            </div>
          )}

          {stats?.genres?.length > 0 && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: 24,
              boxShadow: 'var(--shadow-sm)', marginBottom: 28,
            }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: 20 }}>Genre Terbanyak</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.genres.map(g => (
                  <div key={g.genre}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.9rem' }}>
                      <span>{g.genre}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{g.count} novel</span>
                    </div>
                    <div style={{ background: 'var(--bg-subtle)', borderRadius: 99, height: 8 }}>
                      <div style={{
                        height: 8, borderRadius: 99, background: 'var(--pink)',
                        width: `${(g.count / stats.total) * 100}%`, transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.1rem' }}>Baru Ditambahkan</h2>
              <Link to="/collection" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Lihat semua →</Link>
            </div>
            {recent.length === 0 ? (
              <EmptyState
                title="Koleksi Masih Kosong"
                message="Mulai tambahkan novel pertama kamu ke koleksi!"
                actionLabel="+ Tambah Novel"
                actionTo="/add"
                emoji="📚"
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {recent.map(n => <NovelCard key={n.id} novel={n} />)}
              </div>
            )}
          </div>

          {lastEdited.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.1rem' }}>Terakhir Diedit</h2>
                <Link to="/collection" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Lihat semua →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {lastEdited.map(n => <NovelCard key={n.id} novel={n} />)}
              </div>
            </div>
          )}

        </div>
      </PageTransition>
      <Footer />
    </div>
  )
}