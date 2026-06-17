// Scouting ratings on 0-100 scale based on 2025-26 international form
export interface RadarStats {
  attack: number     // goal threat & creativity
  defense: number    // defensive solidity
  pressing: number   // high press intensity
  possession: number // ball retention / passing quality
  pace: number       // team speed
  setPieces: number  // set piece quality
}

const DEFAULT: RadarStats = { attack: 60, defense: 60, pressing: 60, possession: 60, pace: 60, setPieces: 60 }

export const TEAM_STATS: Record<string, RadarStats> = {
  // ── Elite Tier ───────────────────────────────────────────────────────
  'Argentina':        { attack: 95, defense: 85, pressing: 80, possession: 90, pace: 80, setPieces: 90 },
  'France':           { attack: 95, defense: 85, pressing: 85, possession: 85, pace: 95, setPieces: 80 },
  'Spain':            { attack: 85, defense: 85, pressing: 90, possession: 95, pace: 75, setPieces: 75 },
  'England':          { attack: 85, defense: 80, pressing: 80, possession: 80, pace: 85, setPieces: 90 },
  'Brazil':           { attack: 85, defense: 75, pressing: 75, possession: 80, pace: 90, setPieces: 80 },
  'Germany':          { attack: 85, defense: 80, pressing: 85, possession: 85, pace: 80, setPieces: 80 },
  'Portugal':         { attack: 90, defense: 75, pressing: 75, possession: 80, pace: 80, setPieces: 85 },
  'Netherlands':      { attack: 85, defense: 80, pressing: 85, possession: 80, pace: 80, setPieces: 75 },

  // ── Strong Teams ─────────────────────────────────────────────────────
  'Belgium':          { attack: 80, defense: 75, pressing: 75, possession: 75, pace: 80, setPieces: 80 },
  'Italy':            { attack: 75, defense: 90, pressing: 80, possession: 85, pace: 70, setPieces: 80 },
  'Croatia':          { attack: 75, defense: 80, pressing: 75, possession: 80, pace: 65, setPieces: 75 },
  'Denmark':          { attack: 75, defense: 80, pressing: 80, possession: 75, pace: 75, setPieces: 75 },
  'Morocco':          { attack: 75, defense: 85, pressing: 80, possession: 75, pace: 80, setPieces: 75 },
  'Uruguay':          { attack: 75, defense: 85, pressing: 75, possession: 75, pace: 70, setPieces: 75 },
  'Colombia':         { attack: 80, defense: 75, pressing: 75, possession: 75, pace: 80, setPieces: 75 },
  'Japan':            { attack: 75, defense: 80, pressing: 90, possession: 70, pace: 80, setPieces: 70 },
  'Austria':          { attack: 75, defense: 75, pressing: 85, possession: 75, pace: 75, setPieces: 75 },
  'Switzerland':      { attack: 70, defense: 80, pressing: 75, possession: 75, pace: 70, setPieces: 70 },
  'Poland':           { attack: 70, defense: 75, pressing: 70, possession: 70, pace: 70, setPieces: 80 },
  'Serbia':           { attack: 75, defense: 75, pressing: 75, possession: 70, pace: 75, setPieces: 80 },
  'Turkey':           { attack: 75, defense: 70, pressing: 75, possession: 70, pace: 80, setPieces: 75 },
  'Ukraine':          { attack: 70, defense: 75, pressing: 75, possession: 70, pace: 75, setPieces: 75 },
  'South Korea':      { attack: 75, defense: 75, pressing: 80, possession: 75, pace: 80, setPieces: 70 },
  'Ecuador':          { attack: 70, defense: 75, pressing: 75, possession: 70, pace: 75, setPieces: 70 },
  'Venezuela':        { attack: 70, defense: 70, pressing: 75, possession: 70, pace: 80, setPieces: 65 },
  'Senegal':          { attack: 75, defense: 75, pressing: 75, possession: 70, pace: 85, setPieces: 70 },
  'Nigeria':          { attack: 75, defense: 70, pressing: 75, possession: 65, pace: 90, setPieces: 70 },
  "Côte d'Ivoire":    { attack: 75, defense: 70, pressing: 75, possession: 70, pace: 85, setPieces: 70 },
  'Ivory Coast':      { attack: 75, defense: 70, pressing: 75, possession: 70, pace: 85, setPieces: 70 },
  'Sweden':           { attack: 72, defense: 74, pressing: 70, possession: 70, pace: 73, setPieces: 72 },
  'Norway':           { attack: 78, defense: 70, pressing: 73, possession: 68, pace: 78, setPieces: 75 },

  // ── Hosts ──────────────────────────────────────────────────────────────
  'United States':    { attack: 75, defense: 75, pressing: 80, possession: 70, pace: 85, setPieces: 75 },
  'USA':              { attack: 75, defense: 75, pressing: 80, possession: 70, pace: 85, setPieces: 75 },
  'Mexico':           { attack: 75, defense: 75, pressing: 75, possession: 75, pace: 75, setPieces: 75 },
  'Canada':           { attack: 75, defense: 75, pressing: 80, possession: 70, pace: 80, setPieces: 70 },

  // ── Africa ─────────────────────────────────────────────────────────────
  'Egypt':            { attack: 70, defense: 75, pressing: 70, possession: 70, pace: 70, setPieces: 75 },
  'Cameroon':         { attack: 70, defense: 70, pressing: 75, possession: 65, pace: 85, setPieces: 65 },
  'Ghana':            { attack: 65, defense: 65, pressing: 70, possession: 65, pace: 75, setPieces: 65 },
  'Algeria':          { attack: 70, defense: 70, pressing: 70, possession: 70, pace: 75, setPieces: 70 },
  'South Africa':     { attack: 60, defense: 70, pressing: 70, possession: 60, pace: 75, setPieces: 65 },
  'DR Congo':         { attack: 65, defense: 65, pressing: 70, possession: 60, pace: 80, setPieces: 65 },
  'Congo':            { attack: 65, defense: 65, pressing: 70, possession: 60, pace: 80, setPieces: 65 },
  'Mali':             { attack: 65, defense: 65, pressing: 70, possession: 65, pace: 75, setPieces: 65 },
  'Tunisia':          { attack: 65, defense: 75, pressing: 70, possession: 65, pace: 70, setPieces: 70 },
  'Cape Verde':       { attack: 62, defense: 66, pressing: 65, possession: 62, pace: 72, setPieces: 63 },

  // ── Asia & Oceania ─────────────────────────────────────────────────────
  'Australia':        { attack: 65, defense: 75, pressing: 80, possession: 65, pace: 75, setPieces: 70 },
  'Iran':             { attack: 65, defense: 80, pressing: 75, possession: 65, pace: 70, setPieces: 70 },
  'Saudi Arabia':     { attack: 65, defense: 70, pressing: 70, possession: 65, pace: 70, setPieces: 65 },
  'Iraq':             { attack: 65, defense: 65, pressing: 70, possession: 65, pace: 75, setPieces: 65 },
  'Jordan':           { attack: 65, defense: 70, pressing: 70, possession: 65, pace: 70, setPieces: 65 },
  'Uzbekistan':       { attack: 65, defense: 65, pressing: 70, possession: 65, pace: 75, setPieces: 65 },
  'Qatar':            { attack: 60, defense: 65, pressing: 70, possession: 65, pace: 70, setPieces: 65 },
  'New Zealand':      { attack: 55, defense: 65, pressing: 70, possession: 60, pace: 70, setPieces: 60 },

  // ── CONCACAF extras ─────────────────────────────────────────────────────
  'Jamaica':          { attack: 60, defense: 65, pressing: 70, possession: 60, pace: 85, setPieces: 60 },
  'Panama':           { attack: 60, defense: 75, pressing: 70, possession: 60, pace: 70, setPieces: 70 },
  'Costa Rica':       { attack: 60, defense: 75, pressing: 70, possession: 65, pace: 65, setPieces: 65 },
  'Honduras':         { attack: 55, defense: 65, pressing: 65, possession: 60, pace: 70, setPieces: 60 },
  'Haiti':            { attack: 58, defense: 60, pressing: 63, possession: 58, pace: 72, setPieces: 58 },

  // ── CONMEBOL extras ──────────────────────────────────────────────────────
  'Chile':            { attack: 65, defense: 65, pressing: 80, possession: 70, pace: 75, setPieces: 65 },
  'Paraguay':         { attack: 65, defense: 70, pressing: 70, possession: 65, pace: 70, setPieces: 70 },
  'Peru':             { attack: 65, defense: 70, pressing: 70, possession: 70, pace: 70, setPieces: 65 },
  'Bolivia':          { attack: 55, defense: 60, pressing: 60, possession: 60, pace: 65, setPieces: 60 },

  // ── Others ──────────────────────────────────────────────────────────────
  'Scotland':         { attack: 70, defense: 75, pressing: 80, possession: 70, pace: 75, setPieces: 75 },
  'Romania':          { attack: 70, defense: 75, pressing: 75, possession: 70, pace: 75, setPieces: 70 },
  'Czechia':          { attack: 70, defense: 75, pressing: 75, possession: 70, pace: 70, setPieces: 75 },
  'Czech Republic':   { attack: 70, defense: 75, pressing: 75, possession: 70, pace: 70, setPieces: 75 },
  'Bosnia and Herzegovina': { attack: 68, defense: 68, pressing: 65, possession: 65, pace: 68, setPieces: 68 },
  'Bosnia':           { attack: 68, defense: 68, pressing: 65, possession: 65, pace: 68, setPieces: 68 },
  'Curaçao':          { attack: 55, defense: 58, pressing: 58, possession: 58, pace: 68, setPieces: 55 },
  'Curacao':          { attack: 55, defense: 58, pressing: 58, possession: 58, pace: 68, setPieces: 55 },
}

export function getTeamStats(name: string): RadarStats {
  if (!name) return DEFAULT
  if (TEAM_STATS[name]) return TEAM_STATS[name]
  const lower = name.toLowerCase()
  const key = Object.keys(TEAM_STATS).find(k =>
    k.toLowerCase() === lower ||
    lower.includes(k.toLowerCase()) ||
    k.toLowerCase().includes(lower)
  )
  return key ? TEAM_STATS[key] : DEFAULT
}
