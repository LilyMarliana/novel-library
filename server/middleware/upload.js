import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/
  const ok = allowed.test(path.extname(file.originalname).toLowerCase())
  ok ? cb(null, true) : cb(new Error('Hanya gambar yang diizinkan'))
}

export default multer({ storage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } })