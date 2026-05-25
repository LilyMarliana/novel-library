import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import PageTransition from '../components/PageTransition'
import Breadcrumb from '../components/Breadcrumb'
import EmptyState from '../components/EmptyState'
import Toast from '../components/Toast'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import Footer from '../components/Footer'
import { SkeletonGrid } from '../components/Skeleton'
import useToast from '../components/useToast'
import { getNovels, deleteNovel } from '../services/api'
import { genreColor } from '../utils/genreColor'

const PER_PAGE = 12

const statusBadge = {
  sudah:  { bg: 'var(--sage-soft)',  color: '#4a7c63', label: 'Sudah Dibaca' },
  sedang: { bg: 'var(--peach-soft)', color: '#b36b2e', label: 'Sedang Dibaca' },
  belum:  { bg: 'var(--sky-soft)',   color: '#3a7aaa', label: 'Belum Dibaca' },
}

const StarRating = ({ rating, small }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(s => (
      <span key={s} style={{ color: s <= rating ? '#f4b8c1' : '#e0d5cc', fontSize: small ? 12 : 14 }}>★</span>
    ))}
  </div>
)

const selectStyle = {
  padding: '8px 14px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)', background: 'var(--bg-main)',
  fontFamily: 'var(--font-body)', fontSize: '0.9rem',
  color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
}

export default function Collection() {
  const [novels, setNovels]             = useState([])
  const [search, setSearch]             = useState('')
  const [status, setStatus]             = useState('')
  const [genre, setGenre]               = useState('')
  const [sort, setSort]                 = useState('created_at')
  const [loading, setLoading]           = useState(true)
  const [page, setPage]                 = useState(1)
  const [viewMode, setViewMode]         = useState(() => localStorage.getItem('viewMode') || 'grid')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { toast, showToast, hideToast } = useToast()

  const fetchNovels = async () => {
    setLoading(true)
    const params = { sort, order: 'DESC' }
    if (search) params.search = search
    if (status) params.status = status
    if (genre)  params.genre  = genre
    const res = await getNovels(params)
    setNovels(res.data)
    setLoading(false)
  }

  useEffect(() => { fetchNovels() }, [status, genre, sort])
  useEffect(() => { setPage(1) }, [status, genre, sort, novels.length])

  const toggleView = (mode) => {
    setViewMode(mode)
    localStorage.setItem('viewMode', mode)
  }

  const handleSearch = (e) => { e.preventDefault(); fetchNovels() }
  const handleDelete = (id, title) => setDeleteTarget({ id, title })

  const confirmDelete = async () => {
    const title = deleteTarget.title
    await deleteNovel(deleteTarget.id)
    setDeleteTarget(null)
    showToast(`"${title}" berhasil dihapus`, 'success')
    fetchNovels()
  }

  const totalPages = Math.ceil(novels.length / PER_PAGE)
  const paginated  = novels.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Grouped by author
  const grouped = novels.reduce((acc, novel) => {
    const author = novel.author || 'Tidak Diketahui'
    if (!acc[author]) acc[author] = []
    acc[author].push(novel)
    return acc
  }, {})
  const groupedEntries = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length)

  const GridCard = ({ novel }) => {
    const badge  = statusBadge[novel.status]
    const gColor = genreColor[novel.genre] || genreColor.default
    return (
      <div style={{
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
            height: 180, background: 'var(--bg-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 56, overflow: 'hidden',
          }}>
            {novel.cover_image
              ? <img src={`http://localhost:3000/uploads/${novel.cover_image}`} alt={novel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : '📖'}
          </div>
        </Link>
        <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to={`/novel/${novel.id}`} style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.3 }}>{novel.title}</Link>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{novel.author}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 500 }}>
              {badge.label}
            </span>
            {novel.genre && (
              <span style={{ background: gColor.bg, color: gColor.text, padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 500 }}>
                {novel.genre}
              </span>
            )}
            {novel.tags && novel.tags.split(',').filter(Boolean).slice(0, 2).map(tag => (
              <span key={tag} style={{ background: 'var(--lavender-soft)', color: '#6b52a0', padding: '3px 8px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 500 }}>
                {tag.trim()}
              </span>
            ))}
          </div>
          {novel.rating && <StarRating rating={novel.rating} />}
          <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
            <Link to={`/edit/${novel.id}`} style={{
              flex: 1, textAlign: 'center', padding: '6px', borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-subtle)', fontSize: '0.8rem', fontWeight: 500, border: '1px solid var(--border)',
            }}>Edit</Link>
            <button onClick={() => handleDelete(novel.id, novel.title)} style={{
              flex: 1, padding: '6px', borderRadius: 'var(--radius-sm)',
              background: '#fef0f0', color: '#c0392b', border: '1px solid #f5c6c6',
              fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>Hapus</button>
          </div>
        </div>
      </div>
    )
  }

  const ListCard = ({ novel }) => {
    const badge  = statusBadge[novel.status]
    const gColor = genreColor[novel.genre] || genreColor.default
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.2s',
        display: 'flex', alignItems: 'center',
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
      >
        <Link to={`/novel/${novel.id}`} style={{ flexShrink: 0 }}>
          <div style={{
            width: 70, height: 100, background: 'var(--bg-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, overflow: 'hidden',
          }}>
            {novel.cover_image
              ? <img src={`http://localhost:3000/uploads/${novel.cover_image}`} alt={novel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : '📖'}
          </div>
        </Link>
        <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <Link to={`/novel/${novel.id}`} style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.3 }}>{novel.title}</Link>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>{novel.author} {novel.year && `· ${novel.year}`}</div>
            </div>
            {novel.rating && <StarRating rating={novel.rating} small />}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ background: badge.bg, color: badge.color, padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 500 }}>
              {badge.label}
            </span>
            {novel.genre && (
              <span style={{ background: gColor.bg, color: gColor.text, padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 500 }}>
                {novel.genre}
              </span>
            )}
            {novel.tags && novel.tags.split(',').filter(Boolean).slice(0, 3).map(tag => (
              <span key={tag} style={{ background: 'var(--lavender-soft)', color: '#6b52a0', padding: '2px 8px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 500 }}>
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '0 16px', flexShrink: 0 }}>
          <Link to={`/edit/${novel.id}`} style={{
            padding: '6px 14px', borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-subtle)', fontSize: '0.8rem', fontWeight: 500, border: '1px solid var(--border)',
          }}>Edit</Link>
          <button onClick={() => handleDelete(novel.id, novel.title)} style={{
            padding: '6px 14px', borderRadius: 'var(--radius-sm)',
            background: '#fef0f0', color: '#c0392b', border: '1px solid #f5c6c6',
            fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>Hapus</button>
        </div>
      </div>
    )
  }

  const AuthorGroup = ({ author, novels }) => {
    const sudah  = novels.filter(n => n.status === 'sudah').length
    const sedang = novels.filter(n => n.status === 'sedang').length
    const belum  = novels.filter(n => n.status === 'belum').length
    const ratings = novels.filter(n => n.rating).map(n => n.rating)
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + Number(b), 0) / ratings.length).toFixed(1) : null

    return (
      <div style={{ marginBottom: 32 }}>
        {/* Author Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--pink-soft), var(--peach-soft))',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--pink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
            }}>
              {author.charAt(0).toUpperCase()}
            </div>
            <div>
              <Link
                  to={`/author/${encodeURIComponent(author)}`}
                  style={{ fontWeight: 700, fontSize: '1.05rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', borderBottom: '2px solid var(--pink)', paddingBottom: 1 }}
                >
                  {author}
                </Link>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{novels.length} novel</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {sudah > 0 && (
              <span style={{ background: 'var(--sage-soft)', color: '#4a7c63', padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 500 }}>
                ✅ {sudah} selesai
              </span>
            )}
            {sedang > 0 && (
              <span style={{ background: 'var(--peach-soft)', color: '#b36b2e', padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 500 }}>
                📖 {sedang} dibaca
              </span>
            )}
            {belum > 0 && (
              <span style={{ background: 'var(--sky-soft)', color: '#3a7aaa', padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 500 }}>
                🔖 {belum} belum
              </span>
            )}
            {avgRating && (
              <span style={{ background: 'var(--lavender-soft)', color: '#6b52a0', padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 500 }}>
                ⭐ {avgRating}
              </span>
            )}
          </div>
        </div>

        {/* Novels Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, paddingLeft: 8 }}>
          {novels.map(novel => (
            <div key={novel.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex', flexDirection: 'column',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
            >
              <Link to={`/novel/${novel.id}`}>
                <div style={{
                  height: 150, background: 'var(--bg-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 44, overflow: 'hidden',
                }}>
                  {novel.cover_image
                    ? <img src={`http://localhost:3000/uploads/${novel.cover_image}`} alt={novel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '📖'}
                </div>
              </Link>
              <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Link to={`/novel/${novel.id}`} style={{ fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.3 }}>{novel.title}</Link>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  <span style={{
                    background: statusBadge[novel.status].bg, color: statusBadge[novel.status].color,
                    padding: '2px 8px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 500,
                  }}>{statusBadge[novel.status].label}</span>
                </div>
                {novel.rating && <StarRating rating={novel.rating} small />}
                <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 6 }}>
                  <Link to={`/edit/${novel.id}`} style={{
                    flex: 1, textAlign: 'center', padding: '5px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-subtle)', fontSize: '0.75rem', fontWeight: 500, border: '1px solid var(--border)',
                  }}>Edit</Link>
                  <button onClick={() => handleDelete(novel.id, novel.title)} style={{
                    flex: 1, padding: '5px', borderRadius: 'var(--radius-sm)',
                    background: '#fef0f0', color: '#c0392b', border: '1px solid #f5c6c6',
                    fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}>Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <PageTransition>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Koleksi' }]} />

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: 6 }}>Koleksi Novel</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {viewMode === 'grouped'
                ? `${groupedEntries.length} penulis · ${novels.length} novel`
                : `${novels.length} novel ditemukan`}
            </p>
          </div>

          {/* Filter Bar */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 28,
            display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
          }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari judul atau penulis..."
                style={{
                  flex: 1, padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', background: 'var(--bg-main)',
                  fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                  color: 'var(--text-primary)', outline: 'none',
                }}
              />
              <button type="submit" style={{
                padding: '8px 16px', background: 'var(--pink)', border: 'none',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 500,
              }}>Cari</button>
            </form>

            {viewMode !== 'grouped' && (
              <>
                <select value={status} onChange={e => setStatus(e.target.value)} style={selectStyle}>
                  <option value="">Semua Status</option>
                  <option value="belum">Belum Dibaca</option>
                  <option value="sedang">Sedang Dibaca</option>
                  <option value="sudah">Sudah Dibaca</option>
                </select>

                <select value={genre} onChange={e => setGenre(e.target.value)} style={selectStyle}>
                  <option value="">Semua Genre</option>
                  {['Romance','Fantasy','Mystery','Horror','Historical','Sci-Fi','Thriller'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>

                <select value={sort} onChange={e => setSort(e.target.value)} style={selectStyle}>
                  <option value="created_at">Terbaru</option>
                  <option value="title">Judul A-Z</option>
                  <option value="author">Penulis A-Z</option>
                  <option value="rating">Rating</option>
                  <option value="year">Tahun</option>
                </select>
              </>
            )}

            {/* View toggle */}
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              {[
                { mode: 'grid',    icon: '⊞', title: 'Grid' },
                { mode: 'list',    icon: '☰', title: 'List' },
                { mode: 'grouped', icon: '👤', title: 'Per Penulis' },
              ].map((v, i) => (
                <button key={v.mode} onClick={() => toggleView(v.mode)} title={v.title} style={{
                  width: 36, height: 36, border: 'none',
                  borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                  background: viewMode === v.mode ? 'var(--pink-soft)' : 'var(--bg-main)',
                  cursor: 'pointer', fontSize: 16, transition: 'background 0.2s',
                }}>{v.icon}</button>
              ))}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <SkeletonGrid count={8} />
          ) : novels.length === 0 ? (
            <EmptyState
              title="Tidak Ada Novel Ditemukan"
              message={search || status || genre
                ? 'Coba ubah filter pencarian kamu.'
                : 'Koleksi kamu masih kosong, yuk tambah novel!'}
              actionLabel={!search && !status && !genre ? '+ Tambah Novel' : undefined}
              actionTo={!search && !status && !genre ? '/add' : undefined}
              emoji="🔍"
            />
          ) : viewMode === 'grouped' ? (
            <div>
              {groupedEntries.map(([author, authorNovels]) => (
                <AuthorGroup key={author} author={author} novels={authorNovels} />
              ))}
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                  {paginated.map(novel => <GridCard key={novel.id} novel={novel} />)}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {paginated.map(novel => <ListCard key={novel.id} novel={novel} />)}
                </div>
              )}
              <Pagination current={page} total={totalPages} onChange={setPage} />
            </>
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