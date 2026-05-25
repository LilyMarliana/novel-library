import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard   from './pages/Dashboard'
import Collection  from './pages/Collection'
import NovelDetail from './pages/NovelDetail'
import NovelForm   from './pages/NovelForm'
import AuthorPage  from './pages/AuthorPage'
import StatsPage   from './pages/StatsPage'
import BulkImport  from './pages/BulkImport'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Dashboard />} />
        <Route path="/collection"   element={<Collection />} />
        <Route path="/novel/:id"    element={<NovelDetail />} />
        <Route path="/add"          element={<NovelForm />} />
        <Route path="/edit/:id"     element={<NovelForm />} />
        <Route path="/author/:name" element={<AuthorPage />} />
        <Route path="/stats"        element={<StatsPage />} />
        <Route path="/import"       element={<BulkImport />} />
      </Routes>
    </BrowserRouter>
  )
}