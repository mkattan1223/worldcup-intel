import { getTeamTactics } from '../data/teamTactics'

const INTENSITY_COLOR = {
  high:   'bg-red-900/40 text-red-300 border-red-700/40',
  medium: 'bg-amber-900/40 text-amber-300 border-amber-700/40',
  low:    'bg-slate-700/40 text-slate-400 border-slate-600/40',
}

const LINE_COLOR = {
  high:   'text-red-400',
  medium: 'text-amber-400',
  low:    'text-slate-400',
}

function TacticsCard({ teamName, color }: { teamName: string; color: string }) {
  const t = getTeamTactics(teamName)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm truncate" style={{ color }}>{teamName}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.coach} · <span className="text-slate-400">{t.coachNationality}</span>
          </p>
        </div>
        <div className="flex-shrink-0 text-center">
          <span className="text-lg font-black text-white">{t.formation}</span>
          <p className="text-xs text-slate-500">Formation</p>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-700/40 rounded-lg p-2.5">
          <p className="text-slate-500 mb-1">Pressing Intensity</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold ${
            INTENSITY_COLOR[t.pressingIntensity]
          }`}>
            {t.pressingIntensity.charAt(0).toUpperCase() + t.pressingIntensity.slice(1)}
          </span>
        </div>
        <div className="bg-slate-700/40 rounded-lg p-2.5">
          <p className="text-slate-500 mb-1">Defensive Line</p>
          <span className={`font-bold ${LINE_COLOR[t.defensiveLine]}`}>
            {t.defensiveLine.charAt(0).toUpperCase() + t.defensiveLine.slice(1)} Block
          </span>
        </div>
      </div>

      {/* Playing style */}
      <div className="bg-slate-700/30 rounded-lg p-3">
        <p className="text-xs text-slate-500 mb-1">Playing Style</p>
        <p className="text-sm font-semibold text-white">{t.playingStyle}</p>
      </div>

      {/* Key instructions */}
      <div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Key Instructions</p>
        <ul className="space-y-1.5">
          {t.keyInstructions.map((inst, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: color + '33', color }}>
                {i + 1}
              </span>
              {inst}
            </li>
          ))}
        </ul>
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
      <TacticsCard teamName={homeTeamName} color="#22c55e" />
      <div className="sm:border-l sm:border-slate-700 sm:pl-6">
        <TacticsCard teamName={awayTeamName} color="#3b82f6" />
      </div>
    </div>
  )
}
