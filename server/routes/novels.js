import express from 'express'
import upload from '../middleware/upload.js'
import {
  getAllNovels, getNovel, createNovel,
  updateNovel, deleteNovel, getStats, getDetailedStats
} from '../controllers/novelController.js'

const router = express.Router()

router.get('/stats/detailed', getDetailedStats)
router.get('/stats', getStats)
router.get('/', getAllNovels)
router.get('/:id', getNovel)
router.post('/', upload.single('cover'), createNovel)
router.put('/:id', upload.single('cover'), updateNovel)
router.delete('/:id', deleteNovel)

export default router