import { useState, useEffect, useCallback } from 'react'
import { getTeamTactics } from '../data/teamTactics'
import { api } from '../services/api'
import type { MatchLineups } from '../types'

interface Position { x: number; y: number; label: string }

const FORMATIONS: Record<string, Position[]> = {
  '4-3-3': [
    { x: 50, y: 90, label: 'GK' },
    { x: 14, y: 72, label: 'LB' }, { x: 36, y: 76, label: 'CB' },
    { x: 64, y: 76, label: 'CB' }, { x: 86, y: 72, label: 'RB' },
    { x: 22, y: 52, label: 'CM' }, { x: 50, y: 50, label: 'CM' }, { x: 78, y: 52, label: 'CM' },
    { x: 16, y: 22, label: 'LW' }, { x: 50, y: 18, label: 'ST' }, { x: 84, y: 22, label: 'RW' },
  ],
  '4-4-2': [
    { x: 50, y: 90, label: 'GK' },
    { x: 12, y: 72, label: 'LB' }, { x: 36, y: 76, label: 'CB' },
    { x: 64, y: 76, label: 'CB' }, { x: 88, y: 72, label: 'RB' },
    { x: 10, y: 50, label: 'LM' }, { x: 36, y: 52, label: 'CM' },
    { x: 64, y: 52, label: 'CM' }, { x: 90, y: 50, label: 'RM' },
    { x: 34, y: 20, label: 'ST' }, { x: 66, y: 20, label: 'ST' },
  ],
  '4-2-3-1': [
    { x: 50, y: 90, label: 'GK' },
    { x: 12, y: 72, label: 'LB' }, { x: 36, y: 76, label: 'CB' },
    { x: 64, y: 76, label: 'CB' }, { x: 88, y: 72, label: 'RB' },
    { x: 34, y: 58, label: 'DM' }, { x: 66, y: 58, label: 'DM' },
    { x: 14, y: 38, label: 'LM' }, { x: 50, y: 36, label: 'AM' }, { x: 86, y: 38, label: 'RM' },
    { x: 50, y: 16, label: 'ST' },
  ],
  '3-5-2': [
    { x: 50, y: 90, label: 'GK' },
    { x: 24, y: 74, label: 'CB' }, { x: 50, y: 77, label: 'CB' }, { x: 76, y: 74, label: 'CB' },
    { x: 8, y: 52, label: 'LWB' }, { x: 28, y: 50, label: 'CM' },
    { x: 50, y: 48, label: 'CM' }, { x: 72, y: 50, label: 'CM' }, { x: 92, y: 52, label: 'RWB' },
    { x: 34, y: 20, label: 'ST' }, { x: 66, y: 20, label: 'ST' },
  ],
  '3-4-3': [
    { x: 50, y: 90, label: 'GK' },
    { x: 24, y: 74, label: 'CB' }, { x: 50, y: 77, label: 'CB' }, { x: 76, y: 74, label: 'CB' },
    { x: 8, y: 52, label: 'LWB' }, { x: 34, y: 52, label: 'CM' },
    { x: 66, y: 52, label: 'CM' }, { x: 92, y: 52, label: 'RWB' },
    { x: 16, y: 22, label: 'LW' }, { x: 50, y: 18, label: 'ST' }, { x: 84, y: 22, label: 'RW' },
  ],
  '4-1-4-1': [
    { x: 50, y: 90, label: 'GK' },
    { x: 12, y: 72, label: 'LB' }, { x: 36, y: 76, label: 'CB' },
    { x: 64, y: 76, label: 'CB' }, { x: 88, y: 72, label: 'RB' },
    { x: 50, y: 61, label: 'DM' },
    { x: 10, y: 48, label: 'LM' }, { x: 34, y: 50, label: 'CM' },
    { x: 66, y: 50, label: 'CM' }, { x: 90, y: 48, label: 'RM' },
    { x: 50, y: 16, label: 'ST' },
  ],
  '5-3-2': [
    { x: 50, y: 90, label: 'GK' },
    { x: 8, y: 65, label: 'LWB' }, { x: 28, y: 74, label: 'CB' },
    { x: 50, y: 77, label: 'CB' }, { x: 72, y: 74, label: 'CB' }, { x: 92, y: 65, label: 'RWB' },
    { x: 24, y: 48, label: 'CM' }, { x: 50, y: 46, label: 'CM' }, { x: 76, y: 48, label: 'CM' },
    { x: 34, y: 20, label: 'ST' }, { x: 66, y: 20, label: 'ST' },
  ],
  '4-5-1': [
    { x: 50, y: 90, label: 'GK' },
    { x: 12, y: 72, label: 'LB' }, { x: 36, y: 76, label: 'CB' },
    { x: 64, y: 76, label: 'CB' }, { x: 88, y: 72, label: 'RB' },
    { x: 8, y: 48, label: 'LM' }, { x: 28, y: 50, label: 'CM' },
    { x: 50, y: 52, label: 'DM' }, { x: 72, y: 50, label: 'CM' }, { x: 92, y: 48, label: 'RM' },
    { x: 50, y: 16, label: 'ST' },
  ],
}

const KNOWN = Object.keys(FORMATIONS)
const R = 14

function guessFormation(f: string | null | undefined): string {
  if (!f) return '4-3-3'
  const clean = f.trim().replace(/\s+/g, '-')
  return KNOWN.includes(clean) ? clean : '4-3-3'
}

function shortName(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 1) return name.slice(0, 8)
  return parts[parts.length - 1].slice(0, 8)
}

function Pitch({
  formation, color, flip = false, players = [],
}: { formation: string; color: string; flip?: boolean; players?: Array<{ name: string; shirtNumber?: string | number | null; position?: string | null }> }) {
  const positions = FORMATIONS[formation] ?? FORMATIONS['4-3-3']
  const hasPlayers = players.length >= 11
  return (
    <svg viewBox="0 0 220 352" className="w-full max-w-[220px] mx-auto select-none">
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="0" y={i * 49} width="220" height="49"
          fill={i % 2 === 0 ? '#14532d' : '#166534'} />
      ))}
      <rect x="8" y="8" width="204" height="324" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" rx="2" />
      <line x1="8" y1="170" x2="212" y2="170" stroke="white" strokeWidth="1.2" opacity="0.6" />
      <circle cx="110" cy="170" r="32" fill="none" stroke="white" strokeWidth="1.2" opacity="0.6" />
      <circle cx="110" cy="170" r="2" fill="white" opacity="0.6" />
      <rect x="50" y="8" width="120" height="56" fill="none" stroke="white" strokeWidth="1.2" opacity="0.6" />
      <rect x="76" y="8" width="68" height="26" fill="none" stroke="white" strokeWidth="1.2" opacity="0.6" />
      <circle cx="110" cy="40" r="2" fill="white" opacity="0.6" />
      <rect x="50" y="276" width="120" height="56" fill="none" stroke="white" strokeWidth="1.2" opacity="0.6" />
      <rect x="76" y="306" width="68" height="26" fill="none" stroke="white" strokeWidth="1.2" opacity="0.6" />
      <circle cx="110" cy="292" r="2" fill="white" opacity="0.6" />

      {positions.map((pos, i) => {
        const rx = (pos.x / 100) * 204 + 8
        const ry = flip
          ? (1 - pos.y / 100) * 324 + 8
          : (pos.y / 100) * 324 + 8
        const player = hasPlayers ? players[i] : null
        const numLabel = player ? String(player.shirtNumber ?? '') : pos.label
        const nameLabel = player ? shortName(player.name) : ''
        // Clamp name rect so it doesn't overflow left/right edges
        const rectW = 34
        const rectX = Math.max(2, Math.min(220 - rectW - 2, rx - rectW / 2))
        return (
          <g key={i}>
            <circle cx={rx + 1.5} cy={ry + 1.5} r={R} fill="black" opacity="0.25" />
            <circle cx={rx} cy={ry} r={R} fill={color} stroke="white" strokeWidth="1.5" />
            <text x={rx} y={ry}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={numLabel.length > 2 ? '5.5' : '7'} fontWeight="800" fill="white">
              {numLabel}
            </text>
            {nameLabel && (
              <>
                <rect x={rectX} y={ry + R + 1} width={rectW} height={11}
                  rx="2" fill="rgba(0,0,0,0.65)" />
                <text x={rx} y={ry + R + 7}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="4.5" fontWeight="600" fill="white">
                  {nameLabel}
                </text>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

interface Props {
  matchId?: number
  homeTeamName: string
  awayTeamName: string
  homeColor?: string
  awayColor?: string
}

export default function FormationDiagram({
  matchId, homeTeamName, awayTeamName,
  homeColor = '#22c55e', awayColor = '#3b82f6',
}: Props) {
  const homeTactics = getTeamTactics(homeTeamName)
  const awayTactics = getTeamTactics(awayTeamName)

  const [lineups, setLineups] = useState<MatchLineups | null>(null)

  const fetchLineups = useCallback(() => {
    if (!matchId) return
    api.getMatchLineups(matchId)
      .then(data => {
        if ((data.home?.lineup?.length ?? 0) > 0 || (data.away?.lineup?.length ?? 0) > 0) {
          setLineups(data)
        } else {
          setLineups(data)
        }
      })
      .catch(() => {})
  }, [matchId])

  useEffect(() => { fetchLineups() }, [fetchLineups])

  // Auto-refresh every 2 min when within 60 min of kickoff and lineup is predicted
  useEffect(() => {
    const mins = lineups?.minutesUntilKickoff
    if (mins === undefined || mins === null || mins <= 0 || mins > 60) return
    const timer = setInterval(fetchLineups, 120_000)
    return () => clearInterval(timer)
  }, [lineups?.minutesUntilKickoff, fetchLineups])

  const hFormation = guessFormation(lineups?.home?.formation ?? homeTactics.formation)
  const aFormation = guessFormation(lineups?.away?.formation ?? awayTactics.formation)
  const hPlayers = lineups?.home?.lineup ?? []
  const aPlayers = lineups?.away?.lineup ?? []
  const hasRealLineups = hPlayers.length >= 11 || aPlayers.length >= 11

  const mins = lineups?.minutesUntilKickoff
  const hoursLeft = mins !== null && mins !== undefined && mins > 0 ? Math.floor(mins / 60) : 0
  const minsLeft = mins !== null && mins !== undefined && mins > 0 ? Math.floor(mins % 60) : 0

  return (
    <div className="space-y-4">
      {/* Status banner */}
      {lineups?.isOfficial ? (
        <div className="rounded-xl bg-emerald-900/30 border border-emerald-500/40 px-3 py-2.5 flex items-center gap-2 text-xs text-emerald-300">
          <span className="text-base">✓</span>
          <span className="font-semibold">Official lineups confirmed</span>
          <span className="text-emerald-500 ml-auto">via ESPN · {hFormation} vs {aFormation}</span>
        </div>
      ) : lineups?.awaitingOfficial ? (
        <div className="rounded-xl bg-amber-900/30 border border-amber-500/40 px-3 py-2.5 space-y-1 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <span className="text-base">⏳</span>
            <span className="font-semibold">Official lineup not yet released</span>
            <span className="ml-auto text-amber-500">
              {hoursLeft > 0 ? `${hoursLeft}h ` : ''}{minsLeft}m to kickoff
            </span>
          </div>
          {lineups.basedOn && (
            <p className="text-amber-600 pl-7">Showing predicted XI · {lineups.basedOn}</p>
          )}
        </div>
      ) : lineups?.isPredicted ? (
        <div className="rounded-xl bg-yellow-900/25 border border-yellow-600/40 px-3 py-2.5 space-y-1 text-xs">
          <div className="flex items-center gap-2 text-yellow-300">
            <span className="text-base">~</span>
            <span className="font-semibold">Predicted starting XI</span>
          </div>
          {lineups.basedOn && (
            <p className="text-yellow-600 pl-5">{lineups.basedOn}</p>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-slate-700/20 border border-slate-600/30 px-3 py-2 text-xs text-slate-400 text-center">
          {hasRealLineups
            ? `Official lineups via ESPN · ${hFormation} vs ${aFormation}`
            : "Tactical formations based on each coach's known preferred system."}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-center text-sm font-bold mb-0.5" style={{ color: homeColor }}>
            {homeTeamName}
          </p>
          <p className="text-center text-xs text-slate-500 mb-2">{hFormation}</p>
          <Pitch formation={hFormation} color={homeColor} players={hPlayers} />
        </div>
        <div>
          <p className="text-center text-sm font-bold mb-0.5" style={{ color: awayColor }}>
            {awayTeamName}
          </p>
          <p className="text-center text-xs text-slate-500 mb-2">{aFormation}</p>
          <Pitch formation={aFormation} color={awayColor} flip players={aPlayers} />
        </div>
      </div>

      {/* Bench section */}
      {(lineups?.home?.bench?.length ?? 0) > 0 || (lineups?.away?.bench?.length ?? 0) > 0 ? (
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700/40">
          {[
            { label: homeTeamName, color: homeColor, bench: lineups?.home?.bench ?? [] },
            { label: awayTeamName, color: awayColor, bench: lineups?.away?.bench ?? [] },
          ].map(({ label, color, bench }) => (
            bench.length > 0 ? (
              <div key={label}>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
                  Bench
                </p>
                <div className="space-y-0.5">
                  {bench.slice(0, 7).map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="w-4 text-right text-[10px] font-bold"
                        style={{ color }}>{p.shirtNumber}</span>
                      <span className="truncate">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div key={label} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
