import { useState, useEffect } from 'react'
import { api } from '../services/api'
import type { MatchLineups, Player } from '../types'

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
  '3-5-2': [
    { x: 50, y: 90, label: 'GK' },
    { x: 24, y: 74, label: 'CB' }, { x: 50, y: 77, label: 'CB' }, { x: 76, y: 74, label: 'CB' },
    { x: 8, y: 52, label: 'LWB' }, { x: 28, y: 50, label: 'CM' },
    { x: 50, y: 48, label: 'CM' }, { x: 72, y: 50, label: 'CM' }, { x: 92, y: 52, label: 'RWB' },
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
  '5-3-2': [
    { x: 50, y: 90, label: 'GK' },
    { x: 8, y: 65, label: 'LWB' }, { x: 28, y: 74, label: 'CB' },
    { x: 50, y: 77, label: 'CB' }, { x: 72, y: 74, label: 'CB' }, { x: 92, y: 65, label: 'RWB' },
    { x: 24, y: 48, label: 'CM' }, { x: 50, y: 46, label: 'CM' }, { x: 76, y: 48, label: 'CM' },
    { x: 34, y: 20, label: 'ST' }, { x: 66, y: 20, label: 'ST' },
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
}

const KNOWN_FORMATIONS = Object.keys(FORMATIONS)

function guessFormation(formation: string | null | undefined): string {
  if (!formation) return '4-3-3'
  const clean = formation.replace(/\s+/g, '-')
  return KNOWN_FORMATIONS.includes(clean) ? clean : '4-3-3'
}

function Pitch({
  formation, color, flip = false, players,
}: {
  formation: string
  color: string
  flip?: boolean
  players?: Player[]
}) {
  const positions = FORMATIONS[formation] ?? FORMATIONS['4-3-3']

  return (
    <svg viewBox="0 0 220 340" className="w-full max-w-[220px] mx-auto select-none">
      {/* Pitch stripes */}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x="0" y={i * 49} width="220" height="49"
          fill={i % 2 === 0 ? '#14532d' : '#166534'} />
      ))}
      {/* Outer border */}
      <rect x="8" y="8" width="204" height="324" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" rx="2" />
      {/* Halfway line */}
      <line x1="8" y1="170" x2="212" y2="170" stroke="white" strokeWidth="1.2" opacity="0.6" />
      {/* Centre circle */}
      <circle cx="110" cy="170" r="32" fill="none" stroke="white" strokeWidth="1.2" opacity="0.6" />
      <circle cx="110" cy="170" r="2" fill="white" opacity="0.6" />
      {/* Top penalty area */}
      <rect x="50" y="8" width="120" height="56" fill="none" stroke="white" strokeWidth="1.2" opacity="0.6" />
      <rect x="76" y="8" width="68" height="26" fill="none" stroke="white" strokeWidth="1.2" opacity="0.6" />
      <circle cx="110" cy="40" r="2" fill="white" opacity="0.6" />
      {/* Bottom penalty area */}
      <rect x="50" y="276" width="120" height="56" fill="none" stroke="white" strokeWidth="1.2" opacity="0.6" />
      <rect x="76" y="306" width="68" height="26" fill="none" stroke="white" strokeWidth="1.2" opacity="0.6" />
      <circle cx="110" cy="292" r="2" fill="white" opacity="0.6" />

      {/* Players */}
      {positions.map((pos, i) => {
        const rawX = (pos.x / 100) * 204 + 8
        const rawY = flip
          ? (1 - pos.y / 100) * 324 + 8
          : (pos.y / 100) * 324 + 8
        const player = players?.[i]
        const shirtNum = player?.shirtNumber
        const lastName = player?.name
          ? player.name.split(' ').slice(-1)[0].slice(0, 8)
          : null

        return (
          <g key={i}>
            {/* Shadow */}
            <circle cx={rawX + 1} cy={rawY + 1} r={11} fill="black" opacity="0.3" />
            {/* Main circle */}
            <circle cx={rawX} cy={rawY} r={11} fill={color} stroke="white" strokeWidth="1.5" />
            {/* Shirt number or position label */}
            <text x={rawX} y={rawY + 0.5}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={shirtNum != null ? "7.5" : "5.5"} fontWeight="800" fill="white">
              {shirtNum != null ? shirtNum : pos.label}
            </text>
            {/* Last name below circle */}
            {lastName && (
              <text x={rawX} y={rawY + 18}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="4.8" fontWeight="600" fill="white" opacity="0.9"
                style={{ textShadow: '0 1px 2px black' }}>
                {lastName}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

interface Props {
  matchId: number
  homeTeamName: string
  awayTeamName: string
  homeColor?: string
  awayColor?: string
}

export default function FormationDiagram({
  matchId, homeTeamName, awayTeamName,
  homeColor = '#22c55e',
  awayColor = '#3b82f6',
}: Props) {
  const [lineups, setLineups] = useState<MatchLineups | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.getMatchLineups(matchId)
      .then(setLineups)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [matchId])

  const hf = guessFormation(lineups?.home?.formation)
  const af = guessFormation(lineups?.away?.formation)
  const homeLineup = lineups?.home?.lineup ?? []
  const awayLineup = lineups?.away?.lineup ?? []
  const hasLineups = homeLineup.length > 0

  return (
    <div className="space-y-4">
      {loading && (
        <div className="h-64 bg-slate-700/40 rounded-xl animate-pulse" />
      )}

      {error && (
        <div className="rounded-xl bg-red-950/30 border border-red-800/30 p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {!loading && (
        <>
          {!hasLineups && (
            <div className="rounded-xl bg-slate-700/30 border border-slate-600/40 p-3 text-xs text-slate-400 text-center">
              {lineups?.status && ['SCHEDULED', 'TIMED'].includes(lineups.status)
                ? 'Lineups are released ~1 hour before kick-off.'
                : 'Official lineups not available for this match.'}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Home */}
            <div>
              <p className="text-center text-sm font-bold mb-0.5" style={{ color: homeColor }}>
                {homeTeamName}
              </p>
              <p className="text-center text-xs text-slate-500 mb-2">
                {lineups?.home?.formation
                  ? lineups.home.formation
                  : KNOWN_FORMATIONS.includes(hf) ? `${hf} (est.)` : '4-3-3 (est.)'
                }
              </p>
              <Pitch
                formation={hf}
                color={homeColor}
                players={hasLineups ? homeLineup : undefined}
              />
            </div>

            {/* Away */}
            <div>
              <p className="text-center text-sm font-bold mb-0.5" style={{ color: awayColor }}>
                {awayTeamName}
              </p>
              <p className="text-center text-xs text-slate-500 mb-2">
                {lineups?.away?.formation
                  ? lineups.away.formation
                  : KNOWN_FORMATIONS.includes(af) ? `${af} (est.)` : '4-3-3 (est.)'
                }
              </p>
              <Pitch
                formation={af}
                color={awayColor}
                flip
                players={hasLineups ? awayLineup : undefined}
              />
            </div>
          </div>

          {/* Bench */}
          {hasLineups && lineups && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { label: homeTeamName, bench: lineups.home.bench, color: homeColor },
                { label: awayTeamName, bench: lineups.away.bench, color: awayColor },
              ].map(({ label, bench, color }) => bench.length > 0 && (
                <div key={label}>
                  <p className="text-xs text-slate-500 mb-1.5 font-semibold">Bench</p>
                  <div className="flex flex-wrap gap-1">
                    {bench.map((p, i) => (
                      <span key={i} title={p.name}
                        className="inline-flex items-center gap-1 text-xs rounded-md px-1.5 py-0.5 border border-slate-600/50 text-slate-400">
                        <span className="font-bold" style={{ color }}>{p.shirtNumber ?? '?'}</span>
                        {p.name.split(' ').pop()?.slice(0, 8)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
