import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import PageTransition from '../components/PageTransition'
import Breadcrumb from '../components/Breadcrumb'
import Toast from '../components/Toast'
import TagInput from '../components/TagInput'
import Footer from '../components/Footer'
import useToast from '../components/useToast'
import { createNovel, getNovel, updateNovel } from '../services/api'

const genres = ['Romance', 'Fantasy', 'Mystery', 'Horror', 'Historical', 'Sci-Fi', 'Thriller']

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)', background: 'var(--bg-main)',
  fontFamily: 'var(--font-body)', fontSize: '0.9rem',
  color: 'var(--text-primary)', outline: 'none',
}

const labelStyle = {
  display: 'block', marginBottom: 6,
  fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)',
}

export default function NovelForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const { toast, showToast, hideToast } = useToast()

  const [form, setForm] = useState({
    title: '', author: '', genre: '', book_type: '',
    synopsis: '', status: 'belum', rating: '', review: '', tags: ''
  })
  const [coverFile, setCoverFile]         = useState(null)
  const [previewUrl, setPreviewUrl]       = useState(null)
  const [existingCover, setExistingCover] = useState(null)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')

  useEffect(() => {
    if (isEdit) {
      getNovel(id).then(r => {
        const n = r.data
        setForm({
          title: n.title || '', author: n.author || '',
          genre: n.genre || '', book_type: n.book_type || '',
          synopsis: n.synopsis || '', status: n.status || 'belum',
          rating: n.rating || '', review: n.review || '', tags: n.tags || ''
        })
        if (n.cover_image) setExistingCover(n.cover_image)
      })
    }
  }, [id])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleCover = e => {
    const file = e.target.files[0]
    if (!file) return
    setCoverFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title || !form.author) { setError('Judul dan penulis wajib diisi'); return }
    setLoading(true); setError('')
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, v))
      if (coverFile) data.append('cover', coverFile)
      if (isEdit) await updateNovel(id, data)
      else        await createNovel(data)
      showToast(isEdit ? 'Novel berhasil diperbarui!' : 'Novel berhasil ditambahkan!', 'success')
      setTimeout(() => navigate('/collection'), 1200)
    } catch {
      setError('Terjadi kesalahan, coba lagi')
      showToast('Terjadi kesalahan', 'error')
    } finally {
      setLoading(false)
    }
  }

  const StarPicker = () => (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} onClick={() => setForm(f => ({ ...f, rating: f.rating == s ? '' : s }))}
          style={{ fontSize: 28, cursor: 'pointer', color: s <= form.rating ? '#f4b8c1' : '#e0d5cc', transition: 'color 0.15s' }}
        >★</span>
      ))}
      {form.rating && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'center', marginLeft: 4 }}>{form.rating}/5</span>}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <PageTransition>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>

          <Breadcrumb items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Koleksi', to: '/collection' },
            { label: isEdit ? 'Edit Novel' : 'Tambah Novel' },
          ]} />

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: 6 }}>{isEdit ? 'Edit Novel' : 'Tambah Novel'}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {isEdit ? 'Perbarui informasi novel' : 'Tambahkan novel baru ke koleksi kamu'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: 'var(--shadow-sm)',
              display: 'flex', flexDirection: 'column', gap: 20,
            }}>
              {error && (
                <div style={{ background: '#fef0f0', color: '#c0392b', padding: '10px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                  {error}
                </div>
              )}

              {/* Cover */}
              <div>
                <label style={labelStyle}>Cover Novel</label>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{
                    width: 100, height: 140, background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                    overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
                  }}>
                    {previewUrl
                      ? <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : existingCover
                        ? <img src={`http://localhost:3000/uploads/${existingCover}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '📖'}
                  </div>
                  <div>
                    <input type="file" accept="image/*" id="cover" onChange={handleCover} style={{ display: 'none' }} />
                    <label htmlFor="cover" style={{
                      display: 'inline-block', padding: '8px 18px',
                      background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                    }}>
                      {previewUrl || existingCover ? 'Ganti Cover' : 'Pilih Gambar'}
                    </label>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 6 }}>JPG, PNG, WEBP — maks 3MB</p>
                  </div>
                </div>
              </div>

              {/* Judul & Penulis */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Judul <span style={{ color: '#c0392b' }}>*</span></label>
                  <input name="title" value={form.title} onChange={handleChange} placeholder="Judul novel" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Penulis <span style={{ color: '#c0392b' }}>*</span></label>
                  <input name="author" value={form.author} onChange={handleChange} placeholder="Nama penulis" style={inputStyle} />
                </div>
              </div>

              {/* Genre & Jenis Buku */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Genre</label>
                  <select name="genre" value={form.genre} onChange={handleChange} style={inputStyle}>
                    <option value="">Pilih genre</option>
                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Jenis Buku</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { value: 'hardcover', label: '📕 Hardcover' },
                      { value: 'softcover', label: '📗 Softcover' },
                    ].map(t => (
                      <button key={t.value} type="button"
                        onClick={() => setForm(f => ({ ...f, book_type: f.book_type === t.value ? '' : t.value }))}
                        style={{
                          flex: 1, padding: '10px 8px', borderRadius: 'var(--radius-sm)',
                          border: `2px solid ${form.book_type === t.value ? 'var(--pink)' : 'var(--border)'}`,
                          background: form.book_type === t.value ? 'var(--pink-soft)' : 'var(--bg-main)',
                          cursor: 'pointer', fontFamily: 'var(--font-body)',
                          fontSize: '0.82rem', fontWeight: form.book_type === t.value ? 600 : 400,
                          transition: 'all 0.2s',
                        }}
                      >{t.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <label style={labelStyle}>Sinopsis</label>
                <textarea name="synopsis" value={form.synopsis} onChange={handleChange} placeholder="Ceritakan sedikit tentang novel ini..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              {/* Status */}
              <div>
                <label style={labelStyle}>Status Baca</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { value: 'belum',  label: '🔖 Belum Dibaca',  bg: 'var(--sky-soft)',   active: '#aecfea' },
                    { value: 'sedang', label: '📖 Sedang Dibaca', bg: 'var(--peach-soft)', active: '#f9c9a8' },
                    { value: 'sudah',  label: '✅ Sudah Dibaca',  bg: 'var(--sage-soft)',  active: '#b5d5c5' },
                  ].map(s => (
                    <button key={s.value} type="button"
                      onClick={() => setForm(f => ({ ...f, status: s.value }))}
                      style={{
                        flex: 1, padding: '10px 8px', borderRadius: 'var(--radius-sm)',
                        border: `2px solid ${form.status === s.value ? s.active : 'var(--border)'}`,
                        background: form.status === s.value ? s.bg : 'var(--bg-main)',
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                        fontSize: '0.82rem', fontWeight: form.status === s.value ? 600 : 400,
                        transition: 'all 0.2s',
                      }}
                    >{s.label}</button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label style={labelStyle}>Rating Pribadi</label>
                <StarPicker />
              </div>

              {/* Review */}
              <div>
                <label style={labelStyle}>Review / Catatan</label>
                <textarea name="review" value={form.review} onChange={handleChange} placeholder="Tulis review atau catatan pribadi kamu..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              {/* Tags */}
              <div>
                <label style={labelStyle}>Tag Pribadi</label>
                <TagInput value={form.tags} onChange={(val) => setForm(f => ({ ...f, tags: val }))} />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="button" onClick={() => navigate(-1)} style={{
                  flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', background: 'var(--bg-subtle)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.95rem',
                }}>Batal</button>
                <button type="submit" disabled={loading} style={{
                  flex: 2, padding: '12px', borderRadius: 'var(--radius-sm)',
                  border: 'none', background: loading ? 'var(--border)' : 'var(--pink)',
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
                  fontWeight: 600, fontSize: '0.95rem', transition: 'background 0.2s',
                }}>
                  {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Novel'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </PageTransition>
      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}