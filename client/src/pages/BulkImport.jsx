import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import PageTransition from '../components/PageTransition'
import Breadcrumb from '../components/Breadcrumb'
import Footer from '../components/Footer'
import Toast from '../components/Toast'
import useToast from '../components/useToast'
import { createNovel } from '../services/api'

const TEMPLATE_CSV = `title,author,genre,year,status,rating,review,tags
Harry Potter dan Batu Bertuah,J.K. Rowling,Fantasy,1997,sudah,5,Novel luar biasa!,favorit
Laskar Pelangi,Andrea Hirata,Historical,2005,sudah,5,Sangat menginspirasi,favorit`

const VALID_STATUS = ['belum', 'sedang', 'sudah']
const VALID_GENRE  = ['Romance', 'Fantasy', 'Mystery', 'Horror', 'Historical', 'Sci-Fi', 'Thriller']

export default function BulkImport() {
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState([])
  const [errors, setErrors]     = useState([])
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const { toast, showToast, hideToast } = useToast()

  const parseCSV = (text) => {
    const lines  = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    return lines.slice(1).map((line, i) => {
      const vals = line.split(',').map(v => v.trim())
      const obj  = {}
      headers.forEach((h, j) => { obj[h] = vals[j] || '' })
      obj._row = i + 2
      return obj
    }).filter(row => row.title || row.author)
  }

  const validateRows = (rows) => {
    const errs = []
    rows.forEach(row => {
      if (!row.title)  errs.push(`Baris ${row._row}: Judul wajib diisi`)
      if (!row.author) errs.push(`Baris ${row._row}: Penulis wajib diisi`)
      if (row.status && !VALID_STATUS.includes(row.status))
        errs.push(`Baris ${row._row}: Status tidak valid (${row.status}) — gunakan: belum/sedang/sudah`)
      if (row.rating && (isNaN(row.rating) || row.rating < 1 || row.rating > 5))
        errs.push(`Baris ${row._row}: Rating harus angka 1-5`)
      if (row.genre && !VALID_GENRE.includes(row.genre))
        errs.push(`Baris ${row._row}: Genre tidak valid (${row.genre})`)
    })
    return errs
  }

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setResult(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target.result)
      const errs = validateRows(rows)
      setPreview(rows)
      setErrors(errs)
    }
    reader.readAsText(f)
  }

  const handleImport = async () => {
    if (errors.length > 0) return
    setLoading(true)
    let success = 0, failed = 0

    for (const row of preview) {
      try {
        const data = new FormData()
        data.append('title',   row.title)
        data.append('author',  row.author)
        data.append('genre',   row.genre || '')
        data.append('year',    row.year || '')
        data.append('status',  VALID_STATUS.includes(row.status) ? row.status : 'belum')
        data.append('rating',  row.rating || '')
        data.append('review',  row.review || '')
        data.append('tags',    row.tags || '')
        await createNovel(data)
        success++
      } catch {
        failed++
      }
    }

    setLoading(false)
    setResult({ success, failed })
    showToast(`${success} novel berhasil diimport!`, 'success')
    if (success > 0) { setPreview([]); setFile(null) }
  }

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'template_novel.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <PageTransition>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

          <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Import CSV' }]} />

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: 6 }}>Import Novel</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Upload CSV untuk tambah banyak novel sekaligus</p>
          </div>

          {/* Info & Template */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: 24,
            boxShadow: 'var(--shadow-sm)', marginBottom: 24,
          }}>
            <h2 style={{ fontSize: '1rem', marginBottom: 12 }}>📋 Format CSV</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 12 }}>
              File CSV harus memiliki kolom berikut (title & author wajib, lainnya opsional):
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {['title *', 'author *', 'genre', 'year', 'status', 'rating', 'review', 'tags'].map(col => (
                <span key={col} style={{
                  background: col.includes('*') ? 'var(--pink-soft)' : 'var(--bg-subtle)',
                  color: col.includes('*') ? '#a0526b' : 'var(--text-secondary)',
                  padding: '4px 12px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 500,
                }}>{col}</span>
              ))}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.8 }}>
              • <strong>status:</strong> belum / sedang / sudah<br />
              • <strong>rating:</strong> angka 1-5<br />
              • <strong>genre:</strong> Romance / Fantasy / Mystery / Horror / Historical / Sci-Fi / Thriller<br />
              • <strong>tags:</strong> pisahkan dengan titik koma (favorit;pinjaman)
            </div>
            <button onClick={downloadTemplate} style={{
              padding: '8px 18px', borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-subtle)', border: '1px solid var(--border)',
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              fontWeight: 500, fontSize: '0.85rem',
            }}>⬇️ Download Template CSV</button>
          </div>

          {/* Upload */}
          <div style={{
            background: 'var(--bg-card)', border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-md)', padding: 40,
            textAlign: 'center', marginBottom: 24, cursor: 'pointer',
          }}
            onClick={() => document.getElementById('csvFile').click()}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>
              {file ? file.name : 'Klik untuk pilih file CSV'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              {file ? `${preview.length} baris ditemukan` : 'Format: .csv'}
            </p>
            <input type="file" id="csvFile" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div style={{
              background: '#fef0f0', border: '1px solid #f5c6c6',
              borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 24,
            }}>
              <h3 style={{ color: '#c0392b', fontSize: '0.9rem', marginBottom: 10 }}>❌ {errors.length} error ditemukan:</h3>
              <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {errors.map((e, i) => (
                  <li key={i} style={{ color: '#c0392b', fontSize: '0.82rem' }}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Result */}
          {result && (
            <div style={{
              background: 'var(--sage-soft)', border: '1px solid var(--sage)',
              borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 24,
            }}>
              <p style={{ color: '#4a7c63', fontWeight: 600 }}>
                ✅ {result.success} novel berhasil diimport
                {result.failed > 0 && ` · ❌ ${result.failed} gagal`}
              </p>
              <Link to="/collection" style={{ color: '#4a7c63', fontSize: '0.88rem', fontWeight: 500 }}>
                Lihat koleksi →
              </Link>
            </div>
          )}

          {/* Preview Table */}
          {preview.length > 0 && errors.length === 0 && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)', marginBottom: 24,
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1rem' }}>Preview — {preview.length} novel</h2>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-subtle)' }}>
                      {['Judul', 'Penulis', 'Genre', 'Tahun', 'Status', 'Rating'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 500 }}>{row.title}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{row.author}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{row.genre || '-'}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{row.year || '-'}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            background: row.status === 'sudah' ? 'var(--sage-soft)' : row.status === 'sedang' ? 'var(--peach-soft)' : 'var(--sky-soft)',
                            color: row.status === 'sudah' ? '#4a7c63' : row.status === 'sedang' ? '#b36b2e' : '#3a7aaa',
                            padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 500,
                          }}>{row.status || 'belum'}</span>
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                          {row.rating ? `⭐ ${row.rating}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Button */}
          {preview.length > 0 && errors.length === 0 && (
            <button
              onClick={handleImport}
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                borderRadius: 'var(--radius-sm)', border: 'none',
                background: loading ? 'var(--border)' : 'var(--pink)',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem',
                transition: 'background 0.2s',
              }}
            >
              {loading ? `Mengimport... (${preview.length} novel)` : `Import ${preview.length} Novel Sekarang`}
            </button>
          )}

        </div>
      </PageTransition>
      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}