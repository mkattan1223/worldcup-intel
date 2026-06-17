interface VenueInfo {
  city: string
  country: string
  capacity: number
}

const VENUE_MAP: Record<string, VenueInfo> = {
  'AT&T Stadium':            { city: 'Arlington, TX',    country: 'USA',    capacity: 80000 },
  'MetLife Stadium':         { city: 'East Rutherford, NJ', country: 'USA', capacity: 82500 },
  'SoFi Stadium':            { city: 'Inglewood, CA',    country: 'USA',    capacity: 70240 },
  "Levi's Stadium":          { city: 'Santa Clara, CA',  country: 'USA',    capacity: 68500 },
  'Rose Bowl Stadium':       { city: 'Pasadena, CA',     country: 'USA',    capacity: 92542 },
  'Arrowhead Stadium':       { city: 'Kansas City, MO',  country: 'USA',    capacity: 76416 },
  'NRG Stadium':             { city: 'Houston, TX',      country: 'USA',    capacity: 72000 },
  'Lincoln Financial Field': { city: 'Philadelphia, PA', country: 'USA',    capacity: 68532 },
  'Hard Rock Stadium':       { city: 'Miami Gardens, FL',country: 'USA',    capacity: 65326 },
  'Gillette Stadium':        { city: 'Foxborough, MA',   country: 'USA',    capacity: 65878 },
  'Mercedes-Benz Stadium':   { city: 'Atlanta, GA',      country: 'USA',    capacity: 71000 },
  'Lumen Field':             { city: 'Seattle, WA',      country: 'USA',    capacity: 68740 },
  'Estadio Azteca':          { city: 'Mexico City',      country: 'Mexico', capacity: 87523 },
  'Estadio BBVA':            { city: 'Monterrey',        country: 'Mexico', capacity: 51346 },
  'Estadio Akron':           { city: 'Guadalajara',      country: 'Mexico', capacity: 49850 },
  'BMO Field':               { city: 'Toronto',          country: 'Canada', capacity: 45000 },
  'BC Place':                { city: 'Vancouver',        country: 'Canada', capacity: 54500 },
  'Commonwealth Stadium':    { city: 'Edmonton',         country: 'Canada', capacity: 56302 },
}

// Group stage venue rotation per matchday (matchday 1→2→3)
const GROUP_VENUES: Record<string, [string, string, string]> = {
  GROUP_A: ['Estadio Azteca',        'Estadio BBVA',            'Estadio Akron'],
  GROUP_B: ['MetLife Stadium',       'Gillette Stadium',        'Lincoln Financial Field'],
  GROUP_C: ['SoFi Stadium',          "Levi's Stadium",          'Rose Bowl Stadium'],
  GROUP_D: ['AT&T Stadium',          'NRG Stadium',             'Arrowhead Stadium'],
  GROUP_E: ['Mercedes-Benz Stadium', 'Hard Rock Stadium',       'Lincoln Financial Field'],
  GROUP_F: ['BC Place',              'Commonwealth Stadium',    'BMO Field'],
  GROUP_G: ['MetLife Stadium',       'Rose Bowl Stadium',       'SoFi Stadium'],
  GROUP_H: ['AT&T Stadium',          'Gillette Stadium',        'Mercedes-Benz Stadium'],
  GROUP_I: ['NRG Stadium',           'Arrowhead Stadium',       'Hard Rock Stadium'],
  GROUP_J: ['Lumen Field',           "Levi's Stadium",          'Rose Bowl Stadium'],
  GROUP_K: ['Estadio BBVA',          'Estadio Akron',           'Estadio Azteca'],
  GROUP_L: ['BC Place',              'BMO Field',               'Commonwealth Stadium'],
}

// Knockout round primary venues
const KNOCKOUT_VENUES: Record<string, string> = {
  LAST_32:         'MetLife Stadium',
  LAST_16:         'MetLife Stadium',
  QUARTER_FINALS:  'SoFi Stadium',
  SEMI_FINALS:     'AT&T Stadium',
  THIRD_PLACE:     'Hard Rock Stadium',
  FINAL:           'MetLife Stadium',
}

export function getVenueForMatch(match: {
  venue?: string | null
  group?: string | null
  matchday?: number | null
  stage?: string | null
}): string | null {
  if (match.venue) return match.venue

  // Group stage — rotate venues by matchday
  if (match.group && match.matchday != null) {
    const rotation = GROUP_VENUES[match.group]
    if (rotation) {
      const idx = Math.max(0, Math.min(match.matchday - 1, 2))
      return rotation[idx]
    }
  }

  // Knockout rounds
  if (match.stage && match.stage !== 'GROUP_STAGE') {
    return KNOCKOUT_VENUES[match.stage] ?? null
  }

  return null
}

export function getVenueInfo(venueName: string | null | undefined): VenueInfo | null {
  if (!venueName) return null
  const key = Object.keys(VENUE_MAP).find(k =>
    k.toLowerCase() === venueName.toLowerCase() ||
    venueName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(venueName.toLowerCase())
  )
  return key ? VENUE_MAP[key] : null
}

export function venueLabel(venueName: string | null | undefined): string {
  if (!venueName) return ''
  const info = getVenueInfo(venueName)
  return info ? `${venueName} · ${info.city}` : venueName
}
