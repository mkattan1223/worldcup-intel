import { Link } from 'react-router-dom'
import type { Match } from '../types'
import { getVenueForMatch, venueLabel } from '../utils/venues'

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: 'Group Stage', LAST_32: 'Round of 32', LAST_16: 'Round of 16',
  QUARTER_FINALS: 'QF', SEMI_FINALS: 'SF', FINAL: 'Final', THIRD_PLACE: '3rd Place',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function MatchCard({ match }: { match: Match }) {
  const isLive = ['LIVE', 'IN_PLAY', 'PAUSED'].includes(match.status)
  const isDone = match.status === 'FINISHED'

  return (
    <Link to={`/match/${match.id}`} className="block group">
      <div className={`
        relative rounded-2xl border transition-all duration-200
        ${isLive
          ? 'bg-gradient-to-r from-emerald-950/60 to-slate-800 border-emerald-500/50 shadow-lg shadow-emerald-900/20'
          : 'bg-slate-800/80 border-slate-700/60 hover:border-slate-500/80 hover:bg-slate-800'}
      `}>
        {/* Top bar: stage + status */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-slate-700/40">
          <span className="text-xs text-slate-400 font-medium">
            {STAGE_LABELS[match.stage] ?? match.stage}
            {match.group ? <span className="text-slate-500"> · {match.group}</span> : null}
            {match.matchday ? <span className="text-slate-500"> · MD {match.matchday}</span> : null}
          </span>

          {isLive ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          ) : isDone ? (
            <span className="text-xs text-slate-500 font-medium">FT</span>
          ) : (
            <span className="text-xs text-slate-500">{fmtDate(match.utc_date)}</span>
          )}
        </div>

        {/* Teams + Score */}
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Home */}
          <div className="flex-1 flex items-center gap-2.5 min-w-0">
            {match.home_team_crest ? (
              <img src={match.home_team_crest} alt="" className="w-8 h-8 object-contain flex-shrink-0 drop-shadow" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0" />
            )}
            <span className={`font-semibold text-sm leading-tight truncate ${
              isDone && match.score_winner === 'HOME_TEAM' ? 'text-white' : 'text-slate-300'
            }`}>
              {match.home_team_name}
            </span>
          </div>

          {/* Score / vs */}
          <div className="flex-shrink-0 text-center w-20">
            {isDone || isLive ? (
              <div className="flex items-center justify-center gap-1.5">
                <span className={`text-2xl font-black tabular-nums w-6 text-right ${
                  isDone && match.score_winner === 'HOME_TEAM' ? 'text-white'
                  : isLive ? 'text-emerald-400'
                  : 'text-slate-400'
                }`}>{match.ft_home ?? 0}</span>
                <span className="text-slate-600 text-lg">–</span>
                <span className={`text-2xl font-black tabular-nums w-6 text-left ${
                  isDone && match.score_winner === 'AWAY_TEAM' ? 'text-white'
                  : isLive ? 'text-emerald-400'
                  : 'text-slate-400'
                }`}>{match.ft_away ?? 0}</span>
              </div>
            ) : (
              <span className="text-slate-500 text-sm font-bold">vs</span>
            )}
            {isDone && match.ht_home !== null && (
              <div className="text-xs text-slate-600 mt-0.5">
                HT {match.ht_home}–{match.ht_away}
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex items-center gap-2.5 justify-end min-w-0">
            <span className={`font-semibold text-sm leading-tight truncate text-right ${
              isDone && match.score_winner === 'AWAY_TEAM' ? 'text-white' : 'text-slate-300'
            }`}>
              {match.away_team_name}
            </span>
            {match.away_team_crest ? (
              <img src={match.away_team_crest} alt="" className="w-8 h-8 object-contain flex-shrink-0 drop-shadow" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Venue + date footer */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 truncate">
            {(() => {
              const v = getVenueForMatch(match)
              return v ? venueLabel(v) : <span className="italic text-slate-600">Venue TBA</span>
            })()}
          </span>
          {(isDone || isLive) && (
            <span className="text-xs text-slate-600 ml-2 flex-shrink-0">
              {fmtDate(match.utc_date)}
            </span>
          )}
        </div>

        {/* Hover reveal */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  )
}
