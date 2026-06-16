import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="text-2xl">⚽</span>
          <span className="text-white">WorldCup</span>
          <span className="text-green-400">Intel</span>
          <span className="ml-1 text-xs font-semibold bg-green-500 text-white px-1.5 py-0.5 rounded">
            2026
          </span>
        </Link>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          Live data · Football-Data.org
        </div>
      </div>
    </nav>
  )
}
