import { resolveVenueByMatch } from '../data/matchVenues'

export interface VenueInfo {
  city: string
  country: string
  capacity: number
}

export const VENUE_MAP: Record<string, VenueInfo> = {
  'AT&T Stadium':            { city: 'Arlington, TX',       country: 'USA',    capacity: 80000 },
  'MetLife Stadium':         { city: 'East Rutherford, NJ', country: 'USA',    capacity: 82500 },
  'SoFi Stadium':            { city: 'Inglewood, CA',       country: 'USA',    capacity: 70240 },
  "Levi's Stadium":          { city: 'Santa Clara, CA',     country: 'USA',    capacity: 68500 },
  'Rose Bowl Stadium':       { city: 'Pasadena, CA',        country: 'USA',    capacity: 92542 },
  'Arrowhead Stadium':       { city: 'Kansas City, MO',     country: 'USA',    capacity: 76416 },
  'NRG Stadium':             { city: 'Houston, TX',         country: 'USA',    capacity: 72000 },
  'Lincoln Financial Field': { city: 'Philadelphia, PA',    country: 'USA',    capacity: 68532 },
  'Hard Rock Stadium':       { city: 'Miami Gardens, FL',   country: 'USA',    capacity: 65326 },
  'Gillette Stadium':        { city: 'Foxborough, MA',      country: 'USA',    capacity: 65878 },
  'Mercedes-Benz Stadium':   { city: 'Atlanta, GA',         country: 'USA',    capacity: 71000 },
  'Lumen Field':             { city: 'Seattle, WA',         country: 'USA',    capacity: 68740 },
  'Camping World Stadium':   { city: 'Orlando, FL',         country: 'USA',    capacity: 65000 },
  'Estadio Azteca':          { city: 'Mexico City',         country: 'Mexico', capacity: 87523 },
  'Estadio BBVA':            { city: 'Monterrey',           country: 'Mexico', capacity: 51346 },
  'Estadio Akron':           { city: 'Guadalajara',         country: 'Mexico', capacity: 49850 },
  'BMO Field':               { city: 'Toronto',             country: 'Canada', capacity: 45000 },
  'BC Place':                { city: 'Vancouver',           country: 'Canada', capacity: 54500 },
  'Commonwealth Stadium':    { city: 'Edmonton',            country: 'Canada', capacity: 56302 },
}

export function getVenueInfo(name: string | null | undefined): VenueInfo | null {
  if (!name) return null
  const key = Object.keys(VENUE_MAP).find(k =>
    k.toLowerCase() === name.toLowerCase() ||
    name.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(name.toLowerCase())
  )
  return key ? VENUE_MAP[key] : null
}

export function venueLabel(name: string | null | undefined): string {
  if (!name) return ''
  const info = getVenueInfo(name)
  return info ? `${name} · ${info.city}` : name
}

/** Primary lookup: match ID first, then group/matchday rotation, then knockout stage. */
export function getVenueForMatch(match: {
  id?: number
  venue?: string | null
  group?: string | null
  matchday?: number | null
  stage?: string | null
}): string | null {
  // API-provided venue (rarely populated but respect it)
  if (match.venue) return match.venue
  // Hardcoded schedule + group rotation
  if (match.id) {
    return resolveVenueByMatch(match.id, match.group, match.matchday, match.stage)
  }
  return null
}
