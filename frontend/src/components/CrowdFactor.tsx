import type { Match } from '../types'
import { getVenueInfo } from '../utils/venues'

const ATMOSPHERE_NOTES: Record<string, string> = {
  'Rose Bowl Stadium': 'Iconic WC94 Final venue — legendary atmosphere with 92k capacity.',
  'MetLife Stadium': 'WC2026 Final host — largest capacity in the tournament.',
  'AT&T Stadium': 'Retractable roof creates deafening acoustics for night matches.',
  'Estadio Azteca': 'WC66, WC70, WC86 host — the most iconic stadium in football history.',
  'NRG Stadium': 'Retractable roof amplifies crowd noise dramatically.',
  'SoFi Stadium': 'Ultra-modern dual scoreboard — premium fan experience.',
  'Hard Rock Stadium': 'Miami energy — large Latin-American fan base expected.',
  'Mercedes-Benz Stadium': 'ATL United culture — passionate Southern US crowd.',
}

function atmosphereRating(capacity: number): { stars: number; label: string; color: string } {
  if (capacity >= 85000) return { stars: 5, label: 'Electric', color: 'text-amber-400' }
  if (capacity >= 70000) return { stars: 4, label: 'Loud', color: 'text-emerald-400' }
  if (capacity >= 60000) return { stars: 3, label: 'Vibrant', color: 'text-blue-400' }
  return { stars: 2, label: 'Intimate', color: 'text-slate-400' }
}

function atmosphereIndex(capacity: number, stage: string): number {
  const baseByStage: Record<string, number> = {
    GROUP_STAGE: 78, LAST_32: 82, LAST_16: 88,
    QUARTER_FINALS: 93, SEMI_FINALS: 97, FINAL: 100, THIRD_PLACE: 90,
  }
  const stageScore = baseByStage[stage] ?? 80
  const sizeAdj = capacity > 80000 ? -3 : capacity < 55000 ? +4 : 0
  return Math.min(100, Math.max(0, stageScore + sizeAdj))
}

function Gauge({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 44
  const circ = 2 * Math.PI * radius
  const arc = (value / 100) * circ * 0.75
  return (
    <div className="flex flex-col items-center">
      <svg width="110" height="78" viewBox="0 0 110 82">
        <circle cx="55" cy="64" r={radius} fill="none" stroke="#1e293b" strokeWidth="9"
          strokeDasharray={`${circ * 0.75} ${circ}`} strokeDashoffset={circ * 0.125}
          strokeLinecap="round" />
        <circle cx="55" cy="64" r={radius} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={`${arc} ${circ}`} strokeDashoffset={circ * 0.125}
          strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x="55" y="60" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">{value}</text>
        <text x="55" y="74" textAnchor="middle" fill="#64748b" fontSize="8">{label}</text>
      </svg>
    </div>
  )
}

export default function CrowdFactor({ match }: { match: Match }) {
  const venueInfo = getVenueInfo(match.venue)
  const venueName = match.venue

  const isHostTeam = ['United States', 'Mexico', 'Canada'].some(h =>
    match.home_team_name.toLowerCase().includes(h.toLowerCase())
  )
  const crowdBias = isHostTeam ? 65 : 50

  if (!venueName) {
    return (
      <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 p-6 text-center">
        <p className="text-slate-400">Venue not yet assigned for this match.</p>
      </div>
    )
  }

  const capacity = venueInfo?.capacity ?? 70000
  const city = venueInfo ? `${venueInfo.city}, ${venueInfo.country}` : 'Unknown'
  const rating = atmosphereRating(capacity)
  const atmoScore = atmosphereIndex(capacity, match.stage)
  const note = Object.entries(ATMOSPHERE_NOTES).find(([k]) =>
    venueName.toLowerCase().includes(k.toLowerCase())
  )?.[1]

  const stageMultiplier: Record<string, string> = {
    GROUP_STAGE: 'Medium', LAST_32: 'High', LAST_16: 'High',
    QUARTER_FINALS: 'Very High', SEMI_FINALS: 'Extreme', FINAL: 'Maximum', THIRD_PLACE: 'High',
  }
  const intensity = stageMultiplier[match.stage] ?? 'High'

  return (
    <div className="space-y-4">
      {/* Hero venue card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/60 border border-slate-700/60 p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-white truncate">{venueName}</h3>
            <p className="text-slate-400 text-sm mt-0.5">{city}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`text-xl font-black ${rating.color}`}>{rating.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {'★'.repeat(rating.stars)}{'☆'.repeat(5 - rating.stars)}
            </div>
          </div>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-1">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(capacity / 95000, 1) * 100}%`,
              background: capacity >= 85000 ? '#f59e0b' : capacity >= 70000 ? '#10b981' : '#3b82f6',
            }}
          />
        </div>
        <p className="text-xs text-slate-500">{capacity.toLocaleString()} capacity</p>
        {note && (
          <p className="mt-3 text-xs text-slate-400 italic leading-relaxed border-t border-slate-700/50 pt-3">
            {note}
          </p>
        )}
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-3 gap-2">
        <Gauge value={atmoScore} label="Atmosphere" color="#22c55e" />
        <Gauge value={crowdBias} label="Home Bias %" color="#3b82f6" />
        <Gauge value={Math.round(capacity / 1000)} label="Capacity K" color="#a855f7" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-700/40 rounded-xl p-3">
          <p className="text-slate-500 text-xs mb-1">Crowd Intensity</p>
          <p className="text-white font-bold">{intensity}</p>
        </div>
        <div className="bg-slate-700/40 rounded-xl p-3">
          <p className="text-slate-500 text-xs mb-1">Host Nation Boost</p>
          <p className={`font-bold ${isHostTeam ? 'text-emerald-400' : 'text-slate-300'}`}>
            {isHostTeam ? `+15% for ${match.home_team_name}` : 'Neutral venue'}
          </p>
        </div>
        <div className="bg-slate-700/40 rounded-xl p-3">
          <p className="text-slate-500 text-xs mb-1">Stage</p>
          <p className="text-white font-bold">{match.stage.replace(/_/g, ' ')}</p>
        </div>
        <div className="bg-slate-700/40 rounded-xl p-3">
          <p className="text-slate-500 text-xs mb-1">Expected Fill</p>
          <p className="text-white font-bold">100% (Sold Out)</p>
        </div>
      </div>
    </div>
  )
}
