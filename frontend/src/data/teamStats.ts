export interface RadarStats {
  attack: number     // 0-10 goal threat
  defense: number    // 0-10 defensive solidity
  pressing: number   // 0-10 high press intensity
  possession: number // 0-10 ball retention
  pace: number       // 0-10 team speed
  setPieces: number  // 0-10 set piece quality
}

const DEFAULT: RadarStats = { attack: 6, defense: 6, pressing: 6, possession: 6, pace: 6, setPieces: 6 }

export const TEAM_STATS: Record<string, RadarStats> = {
  // ── Top Tier ─────────────────────────────────────────────────────────
  'Argentina':       { attack: 9.5, defense: 8.5, pressing: 8.0, possession: 9.0, pace: 8.0, setPieces: 9.0 },
  'France':          { attack: 9.5, defense: 8.5, pressing: 8.5, possession: 8.5, pace: 9.5, setPieces: 8.0 },
  'Spain':           { attack: 8.5, defense: 8.5, pressing: 9.0, possession: 9.5, pace: 7.5, setPieces: 7.5 },
  'England':         { attack: 8.5, defense: 8.0, pressing: 8.0, possession: 8.0, pace: 8.5, setPieces: 9.0 },
  'Brazil':          { attack: 8.5, defense: 7.5, pressing: 7.5, possession: 8.0, pace: 9.0, setPieces: 8.0 },
  'Germany':         { attack: 8.5, defense: 8.0, pressing: 8.5, possession: 8.5, pace: 8.0, setPieces: 8.0 },
  'Portugal':        { attack: 9.0, defense: 7.5, pressing: 7.5, possession: 8.0, pace: 8.0, setPieces: 8.5 },
  'Netherlands':     { attack: 8.5, defense: 8.0, pressing: 8.5, possession: 8.0, pace: 8.0, setPieces: 7.5 },

  // ── Strong Teams ─────────────────────────────────────────────────────
  'Belgium':         { attack: 8.0, defense: 7.5, pressing: 7.5, possession: 7.5, pace: 8.0, setPieces: 8.0 },
  'Italy':           { attack: 7.5, defense: 9.0, pressing: 8.0, possession: 8.5, pace: 7.0, setPieces: 8.0 },
  'Croatia':         { attack: 7.5, defense: 8.0, pressing: 7.5, possession: 8.0, pace: 6.5, setPieces: 7.5 },
  'Denmark':         { attack: 7.5, defense: 8.0, pressing: 8.0, possession: 7.5, pace: 7.5, setPieces: 7.5 },
  'Morocco':         { attack: 7.5, defense: 8.5, pressing: 8.0, possession: 7.5, pace: 8.0, setPieces: 7.5 },
  'Uruguay':         { attack: 7.5, defense: 8.5, pressing: 7.5, possession: 7.5, pace: 7.0, setPieces: 7.5 },
  'Colombia':        { attack: 8.0, defense: 7.5, pressing: 7.5, possession: 7.5, pace: 8.0, setPieces: 7.5 },
  'Japan':           { attack: 7.5, defense: 8.0, pressing: 9.0, possession: 7.0, pace: 8.0, setPieces: 7.0 },
  'Austria':         { attack: 7.5, defense: 7.5, pressing: 8.5, possession: 7.5, pace: 7.5, setPieces: 7.5 },
  'Switzerland':     { attack: 7.0, defense: 8.0, pressing: 7.5, possession: 7.5, pace: 7.0, setPieces: 7.0 },
  'Poland':          { attack: 7.0, defense: 7.5, pressing: 7.0, possession: 7.0, pace: 7.0, setPieces: 8.0 },
  'Serbia':          { attack: 7.5, defense: 7.5, pressing: 7.5, possession: 7.0, pace: 7.5, setPieces: 8.0 },
  'Turkey':          { attack: 7.5, defense: 7.0, pressing: 7.5, possession: 7.0, pace: 8.0, setPieces: 7.5 },
  'Ukraine':         { attack: 7.0, defense: 7.5, pressing: 7.5, possession: 7.0, pace: 7.5, setPieces: 7.5 },
  'South Korea':     { attack: 7.5, defense: 7.5, pressing: 8.0, possession: 7.5, pace: 8.0, setPieces: 7.0 },
  'Ecuador':         { attack: 7.0, defense: 7.5, pressing: 7.5, possession: 7.0, pace: 7.5, setPieces: 7.0 },
  'Venezuela':       { attack: 7.0, defense: 7.0, pressing: 7.5, possession: 7.0, pace: 8.0, setPieces: 6.5 },
  'Senegal':         { attack: 7.5, defense: 7.5, pressing: 7.5, possession: 7.0, pace: 8.5, setPieces: 7.0 },
  'Nigeria':         { attack: 7.5, defense: 7.0, pressing: 7.5, possession: 6.5, pace: 9.0, setPieces: 7.0 },
  "Côte d'Ivoire":   { attack: 7.5, defense: 7.0, pressing: 7.5, possession: 7.0, pace: 8.5, setPieces: 7.0 },
  'Ivory Coast':     { attack: 7.5, defense: 7.0, pressing: 7.5, possession: 7.0, pace: 8.5, setPieces: 7.0 },

  // ── Hosts ─────────────────────────────────────────────────────────────
  'United States':   { attack: 7.5, defense: 7.5, pressing: 8.0, possession: 7.0, pace: 8.5, setPieces: 7.5 },
  'USA':             { attack: 7.5, defense: 7.5, pressing: 8.0, possession: 7.0, pace: 8.5, setPieces: 7.5 },
  'Mexico':          { attack: 7.5, defense: 7.5, pressing: 7.5, possession: 7.5, pace: 7.5, setPieces: 7.5 },
  'Canada':          { attack: 7.5, defense: 7.5, pressing: 8.0, possession: 7.0, pace: 8.0, setPieces: 7.0 },

  // ── Africa ────────────────────────────────────────────────────────────
  'Egypt':           { attack: 7.0, defense: 7.5, pressing: 7.0, possession: 7.0, pace: 7.0, setPieces: 7.5 },
  'Cameroon':        { attack: 7.0, defense: 7.0, pressing: 7.5, possession: 6.5, pace: 8.5, setPieces: 6.5 },
  'Ghana':           { attack: 6.5, defense: 6.5, pressing: 7.0, possession: 6.5, pace: 7.5, setPieces: 6.5 },
  'Algeria':         { attack: 7.0, defense: 7.0, pressing: 7.0, possession: 7.0, pace: 7.5, setPieces: 7.0 },
  'South Africa':    { attack: 6.0, defense: 7.0, pressing: 7.0, possession: 6.0, pace: 7.5, setPieces: 6.5 },
  'DR Congo':        { attack: 6.5, defense: 6.5, pressing: 7.0, possession: 6.0, pace: 8.0, setPieces: 6.5 },
  'Mali':            { attack: 6.5, defense: 6.5, pressing: 7.0, possession: 6.5, pace: 7.5, setPieces: 6.5 },
  'Tunisia':         { attack: 6.5, defense: 7.5, pressing: 7.0, possession: 6.5, pace: 7.0, setPieces: 7.0 },

  // ── Asia ──────────────────────────────────────────────────────────────
  'Australia':       { attack: 6.5, defense: 7.5, pressing: 8.0, possession: 6.5, pace: 7.5, setPieces: 7.0 },
  'Iran':            { attack: 6.5, defense: 8.0, pressing: 7.5, possession: 6.5, pace: 7.0, setPieces: 7.0 },
  'Saudi Arabia':    { attack: 6.5, defense: 7.0, pressing: 7.0, possession: 6.5, pace: 7.0, setPieces: 6.5 },
  'Iraq':            { attack: 6.5, defense: 6.5, pressing: 7.0, possession: 6.5, pace: 7.5, setPieces: 6.5 },
  'Jordan':          { attack: 6.5, defense: 7.0, pressing: 7.0, possession: 6.5, pace: 7.0, setPieces: 6.5 },
  'Uzbekistan':      { attack: 6.5, defense: 6.5, pressing: 7.0, possession: 6.5, pace: 7.5, setPieces: 6.5 },
  'Qatar':           { attack: 6.0, defense: 6.5, pressing: 7.0, possession: 6.5, pace: 7.0, setPieces: 6.5 },

  // ── CONCACAF ──────────────────────────────────────────────────────────
  'Jamaica':         { attack: 6.0, defense: 6.5, pressing: 7.0, possession: 6.0, pace: 8.5, setPieces: 6.0 },
  'Panama':          { attack: 6.0, defense: 7.5, pressing: 7.0, possession: 6.0, pace: 7.0, setPieces: 7.0 },
  'Costa Rica':      { attack: 6.0, defense: 7.5, pressing: 7.0, possession: 6.5, pace: 6.5, setPieces: 6.5 },
  'Honduras':        { attack: 5.5, defense: 6.5, pressing: 6.5, possession: 6.0, pace: 7.0, setPieces: 6.0 },

  // ── South America extras ───────────────────────────────────────────────
  'Chile':           { attack: 6.5, defense: 6.5, pressing: 8.0, possession: 7.0, pace: 7.5, setPieces: 6.5 },
  'Paraguay':        { attack: 6.5, defense: 7.0, pressing: 7.0, possession: 6.5, pace: 7.0, setPieces: 7.0 },
  'Peru':            { attack: 6.5, defense: 7.0, pressing: 7.0, possession: 7.0, pace: 7.0, setPieces: 6.5 },
  'Bolivia':         { attack: 5.5, defense: 6.0, pressing: 6.0, possession: 6.0, pace: 6.5, setPieces: 6.0 },

  // ── OFC ───────────────────────────────────────────────────────────────
  'New Zealand':     { attack: 5.5, defense: 6.5, pressing: 7.0, possession: 6.0, pace: 7.0, setPieces: 6.0 },

  // ── Europe extras ─────────────────────────────────────────────────────
  'Scotland':        { attack: 7.0, defense: 7.5, pressing: 8.0, possession: 7.0, pace: 7.5, setPieces: 7.5 },
  'Romania':         { attack: 7.0, defense: 7.5, pressing: 7.5, possession: 7.0, pace: 7.5, setPieces: 7.0 },
  'Hungary':         { attack: 6.5, defense: 7.5, pressing: 7.5, possession: 7.0, pace: 7.0, setPieces: 7.5 },
  'Albania':         { attack: 6.5, defense: 7.0, pressing: 7.5, possession: 6.5, pace: 7.5, setPieces: 7.0 },
  'Slovakia':        { attack: 6.5, defense: 7.5, pressing: 7.5, possession: 7.0, pace: 7.0, setPieces: 7.0 },
  'Slovenia':        { attack: 7.0, defense: 7.5, pressing: 8.0, possession: 7.0, pace: 7.5, setPieces: 7.0 },
  'Czech Republic':  { attack: 7.0, defense: 7.5, pressing: 7.5, possession: 7.0, pace: 7.0, setPieces: 7.5 },
  'Greece':          { attack: 6.5, defense: 8.0, pressing: 7.0, possession: 6.5, pace: 6.5, setPieces: 7.5 },
}

export function getTeamStats(name: string): RadarStats {
  if (!name) return DEFAULT
  // Exact match
  if (TEAM_STATS[name]) return TEAM_STATS[name]
  // Case-insensitive / partial
  const lower = name.toLowerCase()
  const key = Object.keys(TEAM_STATS).find(k =>
    k.toLowerCase() === lower ||
    lower.includes(k.toLowerCase()) ||
    k.toLowerCase().includes(lower)
  )
  return key ? TEAM_STATS[key] : DEFAULT
}
