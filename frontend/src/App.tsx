import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import MatchDetail from './pages/MatchDetail'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/match/:id" element={<MatchDetail />} />
        </Routes>
      </main>
    </div>
  )
}
