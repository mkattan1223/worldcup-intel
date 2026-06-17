export interface Match {
  id: number
  utc_date: string
  status: 'SCHEDULED' | 'TIMED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED'
  matchday: number | null
  stage: string
  group: string | null
  venue: string | null
  home_team_id: number
  home_team_name: string
  home_team_tla: string | null
  home_team_crest: string | null
  away_team_id: number
  away_team_name: string
  away_team_tla: string | null
  away_team_crest: string | null
  score_winner: string | null
  score_duration: string | null
  ft_home: number | null
  ft_away: number | null
  ht_home: number | null
  ht_away: number | null
  fetched_at: string
}

export interface Standing {
  team_id: number
  team_name: string
  team_tla: string | null
  stage: string
  group: string | null
  position: number
  played: number
  won: number
  draw: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

export interface Scorer {
  player: { id: number; name: string; nationality: string | null }
  team: { id: number; name: string; tla: string | null; crest: string | null }
  goals: number
  assists: number | null
  penalties: number | null
}

export interface AutoAnalysis {
  grid: number[][]
  labels: number[]
  home_win_prob: number
  draw_prob: number
  away_win_prob: number
  top_scorelines: Array<{ home: number; away: number; probability: number }>
  home_lambda: number
  away_lambda: number
  home_stats: { avg_scored: number; avg_conceded: number; matches_used: number }
  away_stats: { avg_scored: number; avg_conceded: number; matches_used: number }
  home_team_name: string
  away_team_name: string
  home_team_crest: string | null
  away_team_crest: string | null
}

export interface Player {
  id: number | null
  name: string
  shirtNumber: number | null
  position: string | null
}

export interface MatchLineups {
  home: { formation: string | null; lineup: Player[]; bench: Player[] }
  away: { formation: string | null; lineup: Player[]; bench: Player[] }
  status: string
  isPredicted?: boolean
  isOfficial?: boolean
  basedOn?: string | null
  minutesUntilKickoff?: number | null
  awaitingOfficial?: boolean
  source?: string
}

export interface H2HMatch {
  id: number
  utc_date: string
  status: string
  competition: string | null
  stage: string | null
  home_team_id: number | null
  home_team_name: string
  home_team_crest: string | null
  away_team_id: number | null
  away_team_name: string
  away_team_crest: string | null
  ft_home: number | null
  ft_away: number | null
  venue: string | null
}

export interface H2HData {
  matches: H2HMatch[]
  aggregates: {
    numberOfMatches?: number
    totalGoals?: number
    homeTeam?: { id?: number; name?: string; wins: number; draws: number; losses: number }
    awayTeam?: { id?: number; name?: string; wins: number; draws: number; losses: number }
  }
}

export interface CsvMatch {
  date: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  tournament: string
  city: string
  country: string
  neutral: string
}

export interface FullH2HData {
  team_a_name: string
  team_b_name: string
  team_a_csv: string
  team_b_csv: string
  matches: CsvMatch[]
  aggregates: {
    total_matches: number
    team_a_wins: number
    draws: number
    team_b_wins: number
  }
}

export interface ControlChartData {
  values: number[]
  moving_ranges: number[]
  center_line: number
  ucl: number
  lcl: number
  sigma: number
  out_of_control: Array<{ index: number; value: number }>
}
