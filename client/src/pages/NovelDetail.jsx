import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import PageTransition from '../components/PageTransition'
import Breadcrumb from '../components/Breadcrumb'
import Toast from '../components/Toast'
import Modal from '../components/Modal'
import Footer from '../components/Footer'
import useToast from '../components/useToast'
import { getNovel, deleteNovel } from '../services/api'
import { genreColor } from '../utils/genreColor'

const statusBadge = {
  sudah:  { bg: 'var(--sage-soft)',  color: '#4a7c63', label: '✅ Sudah Dibaca' },
  sedang: { bg: 'var(--peach-soft)', color: '#b36b2e', label: '📖 Sedang Dibaca' },
  belum:  { bg: 'var(--sky-soft)',   color: '#3a7aaa', label: '🔖 Belum Dibaca' },
}

const StarRating = ({ rating }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1,2,3,4,5].map(s => (
      <span key={s} style={{ color: s <= rating ? '#f4b8c1' : '#e0d5cc', fontSize: 24 }}>★</span>
    ))}
    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', alignSelf: 'center', marginLeft: 4 }}>
      {rating}/5
    </span>
  </div>
)

export default function NovelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [novel, setNovel]               = useState(null)
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    getNovel(id).then(r => setNovel(r.data)).finally(() => setLoading(false))
  }, [id])

  const confirmDelete = async () => {
    await deleteNovel(id)
    showToast(`"${novel.title}" berhasil dihapus`, 'success')
    setTimeout(() => navigate('/collection'), 1200)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>Memuat...</div>
      <Footer />
    </div>
  )

  if (!novel) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Novel tidak ditemukan.</p>
        <Link to="/collection" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>← Kembali ke Koleksi</Link>
      </div>
      <Footer />
    </div>
  )

  const badge  = statusBadge[novel.status]
  const gColor = genreColor[novel.genre] || genreColor.default

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <PageTransition>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

          <Breadcrumb items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Koleksi', to: '/collection' },
            { label: novel.title },
          ]} />

          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <div style={{
                width: 240, minHeight: 320, background: 'var(--bg-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 72, flexShrink: 0,
              }}>
                {novel.cover_image
                  ? <img src={`http://localhost:3000/uploads/${novel.cover_image}`} alt={novel.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 320 }} />
                  : '📖'}
              </div>

              <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 260 }}>
                <div>
                  <h1 style={{ fontSize: '1.8rem', lineHeight: 1.3, marginBottom: 8 }}>{novel.title}</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    oleh{' '}
                    <Link
                      to={`/author/${encodeURIComponent(novel.author)}`}
                      style={{ fontWeight: 700, color: 'var(--text-primary)', borderBottom: '2px solid var(--pink)', paddingBottom: 1 }}
                    >
                      {novel.author}
                    </Link>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ background: badge.bg, color: badge.color, padding: '5px 14px', borderRadius: 99, fontSize: '0.82rem', fontWeight: 500 }}>
                    {badge.label}
                  </span>
                  {novel.genre && (
                    <span style={{ background: gColor.bg, color: gColor.text, padding: '5px 14px', borderRadius: 99, fontSize: '0.82rem', fontWeight: 500 }}>
                      {novel.genre}
                    </span>
                  )}
                  {novel.year && (
                    <span style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)', padding: '5px 14px', borderRadius: 99, fontSize: '0.82rem' }}>
                      {novel.year}
                    </span>
                  )}
                  {novel.tags && novel.tags.split(',').filter(Boolean).map(tag => (
                    <span key={tag} style={{
                      background: 'var(--lavender-soft)', color: '#6b52a0',
                      padding: '5px 14px', borderRadius: 99, fontSize: '0.82rem', fontWeight: 500,
                    }}>{tag.trim()}</span>
                  ))}
                </div>

                {novel.rating && <StarRating rating={novel.rating} />}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Ditambahkan: {new Date(novel.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Diperbarui: {new Date(novel.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                  <Link to={`/edit/${novel.id}`} style={{
                    padding: '10px 24px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--pink)', fontWeight: 600, fontSize: '0.9rem',
                  }}>Edit Novel</Link>
                  <button onClick={() => setShowModal(true)} style={{
                    padding: '10px 24px', borderRadius: 'var(--radius-sm)',
                    background: '#fef0f0', color: '#c0392b', border: '1px solid #f5c6c6',
                    fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}>Hapus</button>
                </div>
              </div>
            </div>

            {(novel.synopsis || novel.review) && (
              <div style={{ borderTop: '1px solid var(--border)', padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                {novel.synopsis && (
                  <div>
                    <h3 style={{ fontSize: '0.78rem', marginBottom: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Sinopsis</h3>
                    <p style={{ lineHeight: 1.8, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{novel.synopsis}</p>
                  </div>
                )}
                {novel.review && (
                  <div>
                    <h3 style={{ fontSize: '0.78rem', marginBottom: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Review & Catatan Pribadi</h3>
                    <div style={{
                      background: 'var(--bg-subtle)', borderLeft: '3px solid var(--pink)',
                      padding: '16px 20px', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                      lineHeight: 1.8, fontSize: '0.95rem', fontStyle: 'italic',
                    }}>{novel.review}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </PageTransition>
      <Footer />

      {showModal && (
        <Modal
          title="Hapus Novel?"
          message={`"${novel.title}" akan dihapus permanen dan tidak bisa dikembalikan.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowModal(false)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}