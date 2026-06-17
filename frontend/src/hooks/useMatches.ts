import { useState, useEffect } from 'react'
import { api } from '../services/api'
import type { Match } from '../types'

const LIVE_STATUSES = ['LIVE', 'IN_PLAY', 'PAUSED']

export function useMatches(status?: string) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.getMatches(status)
      .then(setMatches)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [status])

  const liveCount = matches.filter(m => LIVE_STATUSES.includes(m.status)).length

  // Poll every 60s when live matches are present (respects FDB rate limit)
  useEffect(() => {
    if (liveCount === 0) return
    const timer = setInterval(() => {
      api.getMatches(status).then(setMatches).catch(() => {})
    }, 60_000)
    return () => clearInterval(timer)
  }, [liveCount, status])

  const finishedCount = matches.filter(m => m.status === 'FINISHED').length
  const totalGoals = matches.reduce((sum, m) => sum + (m.ft_home ?? 0) + (m.ft_away ?? 0), 0)

  return { matches, loading, error, liveCount, finishedCount, totalGoals }
}

export function useMatch(id: number) {
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    setLoading(true)
    api.getMatch(id)
      .then(m => { setMatch(m); setLastUpdated(new Date()) })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const isLive = match ? LIVE_STATUSES.includes(match.status) : false

  // Poll every 30s when match is live
  useEffect(() => {
    if (!isLive) return
    const timer = setInterval(() => {
      api.getMatch(id)
        .then(m => { setMatch(m); setLastUpdated(new Date()) })
        .catch(() => {})
    }, 30_000)
    return () => clearInterval(timer)
  }, [isLive, id])

  return { match, loading, error, lastUpdated }
}
