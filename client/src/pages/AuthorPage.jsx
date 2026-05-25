import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import PageTransition from '../components/PageTransition'
import Breadcrumb from '../components/Breadcrumb'
import Footer from '../components/Footer'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import useToast from '../components/useToast'
import { getNovels, deleteNovel } from '../services/api'
import { genreColor } from '../utils/genreColor'

const statusBadge = {
  sudah:  { bg: 'var(--sage-soft)',  color: '#4a7c63', label: 'Sudah Dibaca' },
  sedang: { bg: 'var(--peach-soft)', color: '#b36b2e', label: 'Sedang Dibaca' },
  belum:  { bg: 'var(--sky-soft)',   color: '#3a7aaa', label: 'Belum Dibaca' },
}

const StarRating = ({ rating }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(s => (
      <span key={s} style={{ color: s <= rating ? '#f4b8c1' : '#e0d5cc', fontSize: 14 }}>★</span>
    ))}
  </div>
)

export default function AuthorPage() {
  const { name } = useParams()
  const author = decodeURIComponent(name)
  const [novels, setNovels]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { toast, showToast, hideToast } = useToast()

  const fetchNovels = async () => {
    setLoading(true)
    const res = await getNovels({ search: author })
    const filtered = res.data.filter(n => n.author.toLowerCase() === author.toLowerCase())
    setNovels(filtered)
    setLoading(false)
  }

  useEffect(() => { fetchNovels() }, [author])

  const confirmDelete = async () => {
    const title = deleteTarget.title
    await deleteNovel(deleteTarget.id)
    setDeleteTarget(null)
    showToast(`"${title}" berhasil dihapus`, 'success')
    fetchNovels()
  }

  const sudah   = novels.filter(n => n.status === 'sudah').length
  const sedang  = novels.filter(n => n.status === 'sedang').length
  const belum   = novels.filter(n => n.status === 'belum').length
  const ratings = novels.filter(n => n.rating).map(n => Number(n.rating))
  const avgRating = ratings.length > 0
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <PageTransition>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

          <Breadcrumb items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Koleksi', to: '/collection' },
            { label: author },
          ]} />

          {/* Author Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--pink-soft), var(--lavender-soft))',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 32, marginBottom: 36,
            display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
          }}>
            {/* Avatar */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--pink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-md)', flexShrink: 0,
            }}>
              {author.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>{author}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
                {novels.length} novel dalam koleksi kamu
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {sudah > 0 && (
                  <span style={{ background: 'var(--sage-soft)', color: '#4a7c63', padding: '5px 14px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 500 }}>
                    ✅ {sudah} selesai
                  </span>
                )}
                {sedang > 0 && (
                  <span style={{ background: 'var(--peach-soft)', color: '#b36b2e', padding: '5px 14px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 500 }}>
                    📖 {sedang} sedang dibaca
                  </span>
                )}
                {belum > 0 && (
                  <span style={{ background: 'var(--sky-soft)', color: '#3a7aaa', padding: '5px 14px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 500 }}>
                    🔖 {belum} belum dibaca
                  </span>
                )}
                {avgRating && (
                  <span style={{ background: 'var(--lavender-soft)', color: '#6b52a0', padding: '5px 14px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 500 }}>
                    ⭐ Rating rata-rata {avgRating}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Novels Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Memuat...</div>
          ) : novels.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
              <p style={{ color: 'var(--text-secondary)' }}>Tidak ada novel dari penulis ini.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
              {novels.map(novel => {
                const badge  = statusBadge[novel.status]
                const gColor = genreColor[novel.genre] || genreColor.default
                return (
                  <div key={novel.id} style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s',
                    display: 'flex', flexDirection: 'column',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
                  >
                    <Link to={`/novel/${novel.id}`}>
                      <div style={{
                        height: 160, background: 'var(--bg-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 48, overflow: 'hidden',
                      }}>
                        {novel.cover_image
                          ? <img src={`http://localhost:3000/uploads/${novel.cover_image}`} alt={novel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : '📖'}
                      </div>
                    </Link>
                    <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Link to={`/novel/${novel.id}`} style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3 }}>{novel.title}</Link>
                      {novel.year && <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{novel.year}</div>}
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <span style={{ background: badge.bg, color: badge.color, padding: '3px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 500 }}>
                          {badge.label}
                        </span>
                        {novel.genre && (
                          <span style={{ background: gColor.bg, color: gColor.text, padding: '3px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 500 }}>
                            {novel.genre}
                          </span>
                        )}
                      </div>
                      {novel.rating && <StarRating rating={novel.rating} />}
                      <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 8 }}>
                        <Link to={`/edit/${novel.id}`} style={{
                          flex: 1, textAlign: 'center', padding: '6px',
                          borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)',
                          fontSize: '0.78rem', fontWeight: 500, border: '1px solid var(--border)',
                        }}>Edit</Link>
                        <button onClick={() => setDeleteTarget({ id: novel.id, title: novel.title })} style={{
                          flex: 1, padding: '6px', borderRadius: 'var(--radius-sm)',
                          background: '#fef0f0', color: '#c0392b', border: '1px solid #f5c6c6',
                          fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)',
                        }}>Hapus</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </PageTransition>
      <Footer />

      {deleteTarget && (
        <Modal
          title="Hapus Novel?"
          message={`"${deleteTarget.title}" akan dihapus permanen dan tidak bisa dikembalikan.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}