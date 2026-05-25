import { useState } from 'react'

export default function TagInput({ value, onChange }) {
  const [input, setInput] = useState('')
  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : []

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      if (!tags.includes(input.trim()) && tags.length < 10) {
        const newTags = [...tags, input.trim()]
        onChange(newTags.join(','))
      }
      setInput('')
    }
  }

  const removeTag = (tag) => {
    const newTags = tags.filter(t => t !== tag)
    onChange(newTags.join(','))
  }

  return (
    <div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6,
        padding: '8px 10px', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)', background: 'var(--bg-main)',
        minHeight: 44, alignItems: 'center',
      }}>
        {tags.map(tag => (
          <span key={tag} style={{
            background: 'var(--lavender-soft)', color: '#6b52a0',
            padding: '3px 10px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {tag}
            <span onClick={() => removeTag(tag)} style={{ cursor: 'pointer', fontSize: 14, lineHeight: 1, opacity: 0.7 }}>×</span>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={addTag}
          placeholder={tags.length === 0 ? 'Ketik tag lalu Enter...' : ''}
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-body)', fontSize: '0.9rem',
            color: 'var(--text-primary)', flex: 1, minWidth: 120,
          }}
        />
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 5 }}>
        Tekan Enter atau koma untuk tambah tag. Maks 10 tag. Contoh: favorit, pinjaman, seri
      </p>
    </div>
  )
}