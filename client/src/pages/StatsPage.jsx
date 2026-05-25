import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import PageTransition from '../components/PageTransition'
import Breadcrumb from '../components/Breadcrumb'
import Footer from '../components/Footer'
import { getDetailedStats, getStats } from '../services/api'

const BAR_COLORS = ['var(--pink)', 'var(--peach)', 'var(--sage)', 'var(--lavender)', 'var(--sky)']

const SectionTitle = ({ children }) => (
  <h2 style={{ fontSize: '1.1rem', marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
    {children}
  </h2>
)

const StatCard = ({ label, value, color, emoji }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: '20px',
    boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 14,
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
    }}>{emoji}</div>
    <div>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{value ?? '-'}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{label}</div>
    </div>
  </div>
)

export default function StatsPage() {
  const [stats, setStats]     = useState(null)
  const [detail, setDetail]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStats(), getDetailedStats()]).then(([s, d]) => {
      setStats(s.data)
      setDetail(d.data)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>Memuat statistik...</div>
    </div>
  )

  const maxPerMonth = Math.max(...(detail?.perMonth?.map(m => m.total) || [1]))
  const maxAuthor   = Math.max(...(detail?.topAuthors?.map(a => a.total) || [1]))
  const maxGenre    = Math.max(...(detail?.genreDist?.map(g => g.count) || [1]))
  const totalRated  = detail?.ratingDist?.reduce((a, b) => a + b.count, 0) || 1

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <PageTransition>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Statistik' }]} />

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: 6 }}>Statistik Koleksi</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Analisis lengkap koleksi novel kamu</p>
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 36 }}>
            <StatCard label="Total Novel"      value={stats?.total}     color="var(--pink-soft)"     emoji="📚" />
            <StatCard label="Sudah Dibaca"     value={stats?.sudah}     color="var(--sage-soft)"     emoji="✅" />
            <StatCard label="Sedang Dibaca"    value={stats?.sedang}    color="var(--peach-soft)"    emoji="📖" />
            <StatCard label="Belum Dibaca"     value={stats?.belum}     color="var(--sky-soft)"      emoji="🔖" />
            <StatCard label="Rating Rata-rata" value={stats?.avgRating} color="var(--lavender-soft)" emoji="⭐" />
          </div>

          {/* Novel Ditambahkan Per Bulan */}
          {detail?.perMonth?.length > 0 && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: 24,
              boxShadow: 'var(--shadow-sm)', marginBottom: 24,
            }}>
              <SectionTitle>📅 Novel Ditambahkan per Bulan</SectionTitle>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, overflowX: 'auto', paddingBottom: 8 }}>
                {detail.perMonth.map((m, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 52 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.total}</div>
                    <div style={{
                      width: 36, borderRadius: '6px 6px 0 0',
                      background: 'var(--pink)',
                      height: `${Math.max((m.total / maxPerMonth) * 120, 4)}px`,
                      transition: 'height 0.5s ease',
                    }} />
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2 }}>
                      {m.label.split(' ')[0]}<br/>{m.label.split(' ')[1]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

            {/* Distribusi Rating */}
            {detail?.ratingDist?.length > 0 && (
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: 24, boxShadow: 'var(--shadow-sm)',
              }}>
                <SectionTitle>⭐ Distribusi Rating</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[5,4,3,2,1].map(r => {
                    const found = detail.ratingDist.find(d => Number(d.rating) === r)
                    const count = found ? found.count : 0
                    const pct   = Math.round((count / totalRated) * 100)
                    return (
                      <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex', gap: 2, width: 80, flexShrink: 0 }}>
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ color: s <= r ? '#f4b8c1' : '#e0d5cc', fontSize: 13 }}>★</span>
                          ))}
                        </div>
                        <div style={{ flex: 1, background: 'var(--bg-subtle)', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                          <div style={{
                            height: 10, borderRadius: 99, background: 'var(--pink)',
                            width: `${pct}%`, transition: 'width 0.5s ease',
                          }} />
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', width: 40, textAlign: 'right', flexShrink: 0 }}>
                          {count} ({pct}%)
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Genre Favorit */}
            {detail?.genreDist?.length > 0 && (
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: 24, boxShadow: 'var(--shadow-sm)',
              }}>
                <SectionTitle>🎭 Genre Favorit</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {detail.genreDist.map((g, i) => (
                    <div key={g.genre}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 500 }}>{g.genre}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {g.count} novel {g.avgRating && `· ⭐ ${g.avgRating}`}
                        </span>
                      </div>
                      <div style={{ background: 'var(--bg-subtle)', borderRadius: 99, height: 8 }}>
                        <div style={{
                          height: 8, borderRadius: 99,
                          background: BAR_COLORS[i % BAR_COLORS.length],
                          width: `${(g.count / maxGenre) * 100}%`,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Top Penulis */}
          {detail?.topAuthors?.length > 0 && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: 24,
              boxShadow: 'var(--shadow-sm)', marginBottom: 24,
            }}>
              <SectionTitle>✍️ Penulis Terbanyak</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {detail.topAuthors.map((a, i) => (
                  <div key={a.author} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Rank */}
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: i < 3 ? ['var(--peach)', 'var(--sky)', 'var(--sage)'][i] : 'var(--bg-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)',
                    }}>{i + 1}</div>

                    {/* Avatar */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--pink)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-display)',
                    }}>{a.author.charAt(0).toUpperCase()}</div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <a href={`/author/${encodeURIComponent(a.author)}`} style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {a.author}
                        </a>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {a.total} novel {a.avgRating && `· ⭐ ${a.avgRating}`}
                        </span>
                      </div>
                      <div style={{ background: 'var(--bg-subtle)', borderRadius: 99, height: 8 }}>
                        <div style={{
                          height: 8, borderRadius: 99, background: 'var(--pink)',
                          width: `${(a.total / maxAuthor) * 100}%`, transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        {a.selesai > 0 && (
                          <span style={{ background: 'var(--sage-soft)', color: '#4a7c63', padding: '2px 8px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 500 }}>
                            ✅ {a.selesai} selesai
                          </span>
                        )}
                        {(a.total - a.selesai) > 0 && (
                          <span style={{ background: 'var(--sky-soft)', color: '#3a7aaa', padding: '2px 8px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 500 }}>
                            🔖 {a.total - a.selesai} belum selesai
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </PageTransition>
      <Footer />
    </div>
  )
}