import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000/api' })

export const getNovels        = (params)     => api.get('/novels', { params })
export const getNovel         = (id)         => api.get(`/novels/${id}`)
export const getStats         = ()           => api.get('/novels/stats')
export const getDetailedStats = ()           => api.get('/novels/stats/detailed')
export const createNovel      = (data)       => api.post('/novels', data)
export const updateNovel      = (id, data)   => api.put(`/novels/${id}`, data)
export const deleteNovel      = (id)         => api.delete(`/novels/${id}`)