// Official FIFA World Cup 2026 venue assignments by match ID
export const MATCH_VENUE_MAP: Record<number, string> = {
  537327: 'AT&T Stadium',            // Mexico vs South Africa
  537328: 'SoFi Stadium',            // South Korea vs Czechia
  537333: 'BMO Field',               // Canada vs Bosnia
  537334: 'MetLife Stadium',         // Qatar vs Switzerland
  537339: 'Rose Bowl Stadium',       // Brazil vs Morocco
  537340: "Levi's Stadium",          // Haiti vs Scotland
  537345: 'SoFi Stadium',            // USA vs Paraguay
  537346: 'AT&T Stadium',            // Australia vs Turkey
  537351: 'Gillette Stadium',        // Germany vs Curacao
  537352: 'NRG Stadium',             // Ivory Coast vs Ecuador
  537357: 'Lincoln Financial Field', // Netherlands vs Japan
  537358: 'Lumen Field',             // Sweden vs Tunisia
  537363: 'Arrowhead Stadium',       // Belgium vs Egypt
  537364: 'AT&T Stadium',            // Iran vs New Zealand
  537369: 'MetLife Stadium',         // Spain vs Cape Verde
  537370: "Levi's Stadium",          // Saudi Arabia vs Uruguay
  537391: 'MetLife Stadium',         // France vs Senegal
  537392: 'Gillette Stadium',        // Iraq vs Norway
  537397: 'Arrowhead Stadium',       // Argentina vs Algeria
  537398: "Levi's Stadium",          // Austria vs Jordan
}

// Group + matchday fallback (each group pair shares two host-city venues)
// Normalises "Group A" or "GROUP_A" → GROUP_A for lookup
const GROUP_MD_VENUES: Record<string, [string, string, string]> = {
  GROUP_A: ['AT&T Stadium',            'SoFi Stadium',            'AT&T Stadium'],
  GROUP_B: ['SoFi Stadium',            'AT&T Stadium',            'SoFi Stadium'],
  GROUP_C: ['Rose Bowl Stadium',        'Lumen Field',             'Rose Bowl Stadium'],
  GROUP_D: ['Lumen Field',             'Rose Bowl Stadium',        'Lumen Field'],
  GROUP_E: ['Gillette Stadium',        'Lincoln Financial Field',  'Gillette Stadium'],
  GROUP_F: ['Lincoln Financial Field', 'Gillette Stadium',         'Lincoln Financial Field'],
  GROUP_G: ['Arrowhead Stadium',       'NRG Stadium',              'Arrowhead Stadium'],
  GROUP_H: ['NRG Stadium',             'Arrowhead Stadium',        'NRG Stadium'],
  GROUP_I: ['MetLife Stadium',         "Levi's Stadium",           'MetLife Stadium'],
  GROUP_J: ["Levi's Stadium",          'MetLife Stadium',          "Levi's Stadium"],
  GROUP_K: ['Mercedes-Benz Stadium',   'Camping World Stadium',    'Mercedes-Benz Stadium'],
  GROUP_L: ['Camping World Stadium',   'Mercedes-Benz Stadium',    'Camping World Stadium'],
}

const KNOCKOUT_VENUES: Record<string, string> = {
  LAST_32:        'MetLife Stadium',
  LAST_16:        'AT&T Stadium',
  QUARTER_FINALS: 'SoFi Stadium',
  SEMI_FINALS:    'AT&T Stadium',
  THIRD_PLACE:    'Hard Rock Stadium',
  FINAL:          'MetLife Stadium',
}

export function resolveVenueByMatch(
  matchId: number,
  group: string | null | undefined,
  matchday: number | null | undefined,
  stage: string | null | undefined,
): string | null {
  // 1. Exact match-ID hardcoded from official schedule
  if (MATCH_VENUE_MAP[matchId]) return MATCH_VENUE_MAP[matchId]

  // 2. Group stage: group + matchday rotation
  if (group && matchday != null) {
    const key = group.replace(/\s+/g, '_').toUpperCase()
    const rotation = GROUP_MD_VENUES[key]
    if (rotation) {
      const idx = Math.max(0, Math.min((matchday ?? 1) - 1, 2))
      return rotation[idx]
    }
  }

  // 3. Knockout round fallback
  if (stage && stage !== 'GROUP_STAGE') return KNOCKOUT_VENUES[stage] ?? null

  return null
}
