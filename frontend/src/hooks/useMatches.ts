import { useState, useEffect } from 'react'
import { api } from '../services/api'
import type { Match } from '../types'

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

  const liveCount = matches.filter(m =>
    ['LIVE', 'IN_PLAY', 'PAUSED'].includes(m.status)
  ).length

  const finishedCount = matches.filter(m => m.status === 'FINISHED').length

  const totalGoals = matches.reduce((sum, m) => {
    return sum + (m.ft_home ?? 0) + (m.ft_away ?? 0)
  }, 0)

  return { matches, loading, error, liveCount, finishedCount, totalGoals }
}

export function useMatch(id: number) {
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.getMatch(id)
      .then(setMatch)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  return { match, loading, error }
}
