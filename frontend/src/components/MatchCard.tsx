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
          ? 'bg-gradient-to-r from-emerald-950/70 to-slate-800 border-emerald-500/60 shadow-xl shadow-emerald-900/30 ring-1 ring-emerald-500/20'
          : 'bg-slate-800/90 border-slate-700/60 hover:border-slate-500/80 hover:bg-slate-800 hover:shadow-lg hover:shadow-black/30'}
      `}>
        {/* Top bar: stage + status */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-slate-700/40">
          <span className="text-xs text-slate-400 font-medium">
            {STAGE_LABELS[match.stage] ?? match.stage}
            {match.group ? (
              <span className="ml-1.5 bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                {match.group.replace('GROUP_', '')}
              </span>
            ) : null}
            {match.matchday ? <span className="text-slate-600 ml-1">MD {match.matchday}</span> : null}
          </span>

          {isLive ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-900/50 border border-emerald-500/40 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              LIVE
            </span>
          ) : isDone ? (
            <span className="text-xs text-slate-500 font-medium bg-slate-700/50 px-2 py-0.5 rounded">FT</span>
          ) : (
            <span className="text-xs text-slate-500">{fmtDate(match.utc_date)}</span>
          )}
        </div>

        {/* Teams + Score */}
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Home */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            {match.home_team_crest ? (
              <img src={match.home_team_crest} alt="" className="w-9 h-9 object-contain flex-shrink-0 drop-shadow-md" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-700 flex-shrink-0" />
            )}
            <span className={`font-bold text-base leading-tight truncate ${
              isDone && match.score_winner === 'HOME_TEAM' ? 'text-white'
              : isLive ? 'text-emerald-100'
              : 'text-slate-200'
            }`}>
              {match.home_team_name}
            </span>
          </div>

          {/* Score / vs */}
          <div className="flex-shrink-0 text-center w-20">
            {isDone || isLive ? (
              <div className="flex items-center justify-center gap-1">
                <span className={`text-3xl font-black tabular-nums w-7 text-right ${
                  isDone && match.score_winner === 'HOME_TEAM' ? 'text-white'
                  : isLive ? 'text-emerald-300'
                  : 'text-slate-400'
                }`}>{match.ft_home ?? 0}</span>
                <span className="text-slate-500 text-xl font-light">–</span>
                <span className={`text-3xl font-black tabular-nums w-7 text-left ${
                  isDone && match.score_winner === 'AWAY_TEAM' ? 'text-white'
                  : isLive ? 'text-emerald-300'
                  : 'text-slate-400'
                }`}>{match.ft_away ?? 0}</span>
              </div>
            ) : (
              <span className="text-slate-500 text-sm font-bold">vs</span>
            )}
            {isDone && match.ht_home !== null && (
              <div className="text-[10px] text-slate-600 mt-0.5">
                HT {match.ht_home}–{match.ht_away}
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex items-center gap-3 justify-end min-w-0">
            <span className={`font-bold text-base leading-tight truncate text-right ${
              isDone && match.score_winner === 'AWAY_TEAM' ? 'text-white'
              : isLive ? 'text-emerald-100'
              : 'text-slate-200'
            }`}>
              {match.away_team_name}
            </span>
            {match.away_team_crest ? (
              <img src={match.away_team_crest} alt="" className="w-9 h-9 object-contain flex-shrink-0 drop-shadow-md" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-700 flex-shrink-0" />
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
          {isLive && (
            <span className="text-xs text-emerald-500 ml-2 flex-shrink-0 font-medium">
              updating every 60s
            </span>
          )}
          {isDone && (
            <span className="text-xs text-slate-600 ml-2 flex-shrink-0">
              {fmtDate(match.utc_date)}
            </span>
          )}
        </div>

        {/* Bottom accent line on hover */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
    </Link>
  )
}
