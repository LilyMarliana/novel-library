import pool from '../db.js'
import fs from 'fs'

export const getAllNovels = async (req, res) => {
  try {
    const { search, status, genre, sort = 'created_at', order = 'DESC' } = req.query
    let query = 'SELECT * FROM novels WHERE 1=1'
    const params = []

    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }
    if (status) { query += ' AND status = ?'; params.push(status) }
    if (genre)  { query += ' AND genre = ?';  params.push(genre)  }

    const allowedSort = ['title', 'author', 'rating', 'created_at', 'updated_at', 'year']
    const safeSort = allowedSort.includes(sort) ? sort : 'created_at'
    query += ` ORDER BY ${safeSort} ${order === 'ASC' ? 'ASC' : 'DESC'}`

    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getStats = async (req, res) => {
  try {
    const [[{ total }]]     = await pool.query('SELECT COUNT(*) as total FROM novels')
    const [[{ sudah }]]     = await pool.query("SELECT COUNT(*) as sudah FROM novels WHERE status='sudah'")
    const [[{ sedang }]]    = await pool.query("SELECT COUNT(*) as sedang FROM novels WHERE status='sedang'")
    const [[{ belum }]]     = await pool.query("SELECT COUNT(*) as belum FROM novels WHERE status='belum'")
    const [[{ avgRating }]] = await pool.query('SELECT ROUND(AVG(rating),1) as avgRating FROM novels WHERE rating IS NOT NULL')
    const [genres]          = await pool.query('SELECT genre, COUNT(*) as count FROM novels WHERE genre IS NOT NULL GROUP BY genre ORDER BY count DESC LIMIT 5')

    res.json({ total, sudah, sedang, belum, avgRating, genres })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getDetailedStats = async (req, res) => {
  try {
    const [perMonth] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        DATE_FORMAT(created_at, '%b %Y') as label,
        COUNT(*) as total,
        SUM(CASE WHEN status='sudah' THEN 1 ELSE 0 END) as selesai
      FROM novels
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b %Y')
      ORDER BY month ASC
    `)

    const [ratingDist] = await pool.query(`
      SELECT rating, COUNT(*) as count
      FROM novels
      WHERE rating IS NOT NULL
      GROUP BY rating
      ORDER BY rating ASC
    `)

    const [genreDist] = await pool.query(`
      SELECT genre, COUNT(*) as count,
        ROUND(AVG(rating), 1) as avgRating
      FROM novels
      WHERE genre IS NOT NULL
      GROUP BY genre
      ORDER BY count DESC
    `)

    const [topAuthors] = await pool.query(`
      SELECT author, COUNT(*) as total,
        SUM(CASE WHEN status='sudah' THEN 1 ELSE 0 END) as selesai,
        ROUND(AVG(rating), 1) as avgRating
      FROM novels
      GROUP BY author
      ORDER BY total DESC
      LIMIT 10
    `)

    const [selesaiPerMonth] = await pool.query(`
      SELECT 
        DATE_FORMAT(updated_at, '%Y-%m') as month,
        DATE_FORMAT(updated_at, '%b %Y') as label,
        COUNT(*) as total
      FROM novels
      WHERE status = 'sudah'
        AND updated_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(updated_at, '%Y-%m'), DATE_FORMAT(updated_at, '%b %Y')
      ORDER BY month ASC
    `)

    res.json({ perMonth, ratingDist, genreDist, topAuthors, selesaiPerMonth })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getNovel = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM novels WHERE id = ?', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Novel tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const createNovel = async (req, res) => {
  try {
    const { title, author, genre, year, synopsis, status, rating, review, tags } = req.body
    const cover_image = req.file ? req.file.filename : null
    const [result] = await pool.query(
      'INSERT INTO novels (title, author, genre, year, synopsis, cover_image, status, rating, review, tags) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [title, author, genre, year, synopsis, cover_image, status || 'belum', rating || null, review || null, tags || null]
    )
    res.status(201).json({ id: result.insertId, message: 'Novel berhasil ditambahkan' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updateNovel = async (req, res) => {
  try {
    const { title, author, genre, year, synopsis, status, rating, review, tags } = req.body
    const [existing] = await pool.query('SELECT cover_image FROM novels WHERE id = ?', [req.params.id])
    if (!existing.length) return res.status(404).json({ error: 'Novel tidak ditemukan' })

    let cover_image = existing[0].cover_image
    if (req.file) {
      if (cover_image) fs.unlink(`uploads/${cover_image}`, () => {})
      cover_image = req.file.filename
    }

    await pool.query(
      'UPDATE novels SET title=?, author=?, genre=?, year=?, synopsis=?, cover_image=?, status=?, rating=?, review=?, tags=?, updated_at=NOW() WHERE id=?',
      [title, author, genre, year, synopsis, cover_image, status, rating || null, review || null, tags || null, req.params.id]
    )
    res.json({ message: 'Novel berhasil diupdate' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteNovel = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT cover_image FROM novels WHERE id = ?', [req.params.id])
    if (!existing.length) return res.status(404).json({ error: 'Novel tidak ditemukan' })
    if (existing[0].cover_image) fs.unlink(`uploads/${existing[0].cover_image}`, () => {})
    await pool.query('DELETE FROM novels WHERE id = ?', [req.params.id])
    res.json({ message: 'Novel berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}