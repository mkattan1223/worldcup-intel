import type {
  Match, Standing, Scorer, AutoAnalysis, MatchLineups, H2HData, ControlChartData,
  FullH2HData,
} from '../types'

const API_PREFIX = (import.meta.env.VITE_API_URL as string | undefined) || '/api'

async function get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const fullPath = API_PREFIX + path
  const url = fullPath.startsWith('http')
    ? new URL(fullPath)
    : new URL(fullPath, window.location.origin)

  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  }

  let res: Response
  try {
    res = await fetch(url.toString())
  } catch (err) {
    const msg = `Cannot reach backend at ${API_PREFIX}. Is the FastAPI server running?`
    console.error('[api]', msg, err)
    throw new Error(msg)
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    const msg = `HTTP ${res.status}: ${path}${body ? ` — ${body.slice(0, 200)}` : ''}`
    console.error('[api]', msg)
    throw new Error(msg)
  }

  return res.json() as Promise<T>
}

export const api = {
  // Matches
  getMatches: (status?: string) =>
    get<Match[]>('/matches/', status ? { status } : undefined),

  getMatch: (id: number) =>
    get<Match>(`/matches/${id}`),

  getMatchLineups: (id: number) =>
    get<MatchLineups>(`/matches/${id}/lineups`),

  getMatchAutoAnalysis: (id: number) =>
    get<AutoAnalysis>(`/matches/${id}/auto-analysis`),

  getMatchHead2Head: (id: number) =>
    get<H2HData>(`/matches/${id}/head2head`),

  getMatchHead2HeadFull: (id: number) =>
    get<FullH2HData>(`/matches/${id}/head2head-full`),

  // Teams
  getStandings: () =>
    get<Standing[]>('/teams/standings'),

  getTeamMatches: (teamId: number) =>
    get<Match[]>(`/teams/${teamId}/matches`),

  getTeamControlChart: (teamId: number, metric = 'goals_scored') =>
    get<ControlChartData>(`/teams/${teamId}/control-chart`, { metric }),

  // Analytics
  getScorers: (limit = 20) =>
    get<Scorer[]>('/analytics/scorers', { limit }),
}
