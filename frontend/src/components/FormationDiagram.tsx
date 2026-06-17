import { getTeamTactics } from '../data/teamTactics'

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

function guessFormation(f: string | null | undefined): string {
  if (!f) return '4-3-3'
  const clean = f.trim().replace(/\s+/g, '-')
  return KNOWN.includes(clean) ? clean : '4-3-3'
}

function Pitch({
  formation, color, flip = false,
}: { formation: string; color: string; flip?: boolean }) {
  const positions = FORMATIONS[formation] ?? FORMATIONS['4-3-3']
  return (
    <svg viewBox="0 0 220 340" className="w-full max-w-[220px] mx-auto select-none">
      {Array.from({ length: 7 }).map((_, i) => (
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
        return (
          <g key={i}>
            <circle cx={rx + 1} cy={ry + 1} r={11} fill="black" opacity="0.25" />
            <circle cx={rx} cy={ry} r={11} fill={color} stroke="white" strokeWidth="1.5" />
            <text x={rx} y={ry + 0.5}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="5.5" fontWeight="800" fill="white">
              {pos.label}
            </text>
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
  homeTeamName, awayTeamName,
  homeColor = '#22c55e', awayColor = '#3b82f6',
}: Props) {
  const homeTactics = getTeamTactics(homeTeamName)
  const awayTactics = getTeamTactics(awayTeamName)
  const hf = guessFormation(homeTactics.formation)
  const af = guessFormation(awayTactics.formation)

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-700/20 border border-slate-600/30 px-3 py-2 text-xs text-slate-400 text-center">
        Tactical formations based on each coach's known preferred system.
        Official lineups are not available on the free tier.
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-center text-sm font-bold mb-0.5" style={{ color: homeColor }}>
            {homeTeamName}
          </p>
          <p className="text-center text-xs text-slate-500 mb-2">{hf}</p>
          <Pitch formation={hf} color={homeColor} />
        </div>
        <div>
          <p className="text-center text-sm font-bold mb-0.5" style={{ color: awayColor }}>
            {awayTeamName}
          </p>
          <p className="text-center text-xs text-slate-500 mb-2">{af}</p>
          <Pitch formation={af} color={awayColor} flip />
        </div>
      </div>
    </div>
  )
}
