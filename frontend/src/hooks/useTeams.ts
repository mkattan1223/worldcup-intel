import { useState, useEffect } from 'react'
import { api } from '../services/api'
import type { Standing, Scorer } from '../types'

export function useStandings() {
  const [standings, setStandings] = useState<Standing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getStandings()
      .then(setStandings)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const groups = standings.reduce<Record<string, Standing[]>>((acc, s) => {
    // Normalize "Group A" → "GROUP_A" so Dashboard filter (startsWith 'GROUP_') works
    const raw = s.group ?? s.stage ?? 'UNKNOWN'
    const key = raw.toUpperCase().replace(/\s+/g, '_')
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  return { standings, groups, loading, error }
}

export function useScorers(limit = 20) {
  const [scorers, setScorers] = useState<Scorer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getScorers(limit)
      .then(setScorers)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [limit])

  return { scorers, loading, error }
}
