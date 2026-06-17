import { getCoach } from '../data/coaches'

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value * 10}%`, background: color }} />
      </div>
      <span className="text-xs text-slate-400 w-5 text-right">{value}</span>
    </div>
  )
}

function CoachCard({ teamName, color }: { teamName: string; color: string }) {
  const c = getCoach(teamName)
  return (
    <div className="space-y-4">
      {/* Coach header */}
      <div className="bg-slate-700/30 rounded-xl p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-white font-bold text-sm">{c.name}</p>
            <p className="text-slate-400 text-xs mt-0.5">{c.nationality}{c.age > 0 ? ` · Age ${c.age}` : ''}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-lg font-black" style={{ color }}>{c.formation}</span>
            <p className="text-xs text-slate-500">Formation</p>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium bg-slate-700/50 border-slate-600/50 text-slate-300">
          {c.style}
        </div>
      </div>

      {/* Intensity bars */}
      <div className="space-y-3">
        <div>
          <p className="text-xs text-slate-500 mb-1.5">Pressing Intensity</p>
          <Bar value={c.pressingIntensity} color={c.pressingIntensity >= 7 ? '#ef4444' : c.pressingIntensity >= 5 ? '#f59e0b' : '#64748b'} />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1.5">Defensive Line</p>
          <Bar value={c.defensiveLine} color={c.defensiveLine >= 7 ? '#ef4444' : c.defensiveLine >= 5 ? '#f59e0b' : '#64748b'} />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1.5">Tempo</p>
          <Bar value={c.tempo} color={color} />
        </div>
      </div>

      {/* Tactical traits */}
      <div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Key Traits</p>
        <div className="flex flex-wrap gap-1.5">
          {c.traits.map((t, i) => (
            <span key={i}
              className="inline-flex items-center text-xs px-2.5 py-1 rounded-full border"
              style={{ borderColor: color + '40', color, background: color + '10' }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

interface Props {
  homeTeamName: string
  awayTeamName: string
}

export default function Tactics({ homeTeamName, awayTeamName }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-3">{homeTeamName}</p>
        <CoachCard teamName={homeTeamName} color="#22c55e" />
      </div>
      <div className="sm:border-l sm:border-slate-700 sm:pl-6">
        <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-3">{awayTeamName}</p>
        <CoachCard teamName={awayTeamName} color="#3b82f6" />
      </div>
    </div>
  )
}
