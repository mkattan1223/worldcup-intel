interface VenueInfo {
  city: string
  country: string
  capacity: number
}

const VENUE_MAP: Record<string, VenueInfo> = {
  'AT&T Stadium':            { city: 'Arlington',       country: 'USA',    capacity: 80000 },
  'MetLife Stadium':         { city: 'East Rutherford', country: 'USA',    capacity: 82500 },
  'SoFi Stadium':            { city: 'Inglewood',       country: 'USA',    capacity: 70240 },
  "Levi's Stadium":          { city: 'Santa Clara',     country: 'USA',    capacity: 68500 },
  'Rose Bowl Stadium':       { city: 'Pasadena',        country: 'USA',    capacity: 92542 },
  'Arrowhead Stadium':       { city: 'Kansas City',     country: 'USA',    capacity: 76416 },
  'NRG Stadium':             { city: 'Houston',         country: 'USA',    capacity: 72000 },
  'Lincoln Financial Field': { city: 'Philadelphia',    country: 'USA',    capacity: 68532 },
  'Hard Rock Stadium':       { city: 'Miami Gardens',   country: 'USA',    capacity: 65326 },
  'Gillette Stadium':        { city: 'Foxborough',      country: 'USA',    capacity: 65878 },
  'Mercedes-Benz Stadium':   { city: 'Atlanta',         country: 'USA',    capacity: 71000 },
  'Lumen Field':             { city: 'Seattle',         country: 'USA',    capacity: 68740 },
  'Estadio Azteca':          { city: 'Mexico City',     country: 'Mexico', capacity: 87523 },
  'Estadio BBVA':            { city: 'Monterrey',       country: 'Mexico', capacity: 51346 },
  'Estadio Akron':           { city: 'Guadalajara',     country: 'Mexico', capacity: 49850 },
  'BMO Field':               { city: 'Toronto',         country: 'Canada', capacity: 45000 },
  'BC Place':                { city: 'Vancouver',       country: 'Canada', capacity: 54500 },
  'Commonwealth Stadium':    { city: 'Edmonton',        country: 'Canada', capacity: 56302 },
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
  return info ? `${venueName}, ${info.city}` : venueName
}
