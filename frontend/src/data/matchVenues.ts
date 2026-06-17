// Official FIFA World Cup 2026 venue assignments — hardcoded by match ID
const MATCH_VENUES: Record<number, string> = {
  // ── Group Stage Matchday 1 ──────────────────────────────────────────────
  537327: "AT&T Stadium",            // Mexico vs South Africa
  537328: "SoFi Stadium",            // South Korea vs Czechia
  537333: "BMO Field",               // Canada vs Bosnia-Herzegovina
  537334: "MetLife Stadium",         // Qatar vs Switzerland
  537339: "Rose Bowl Stadium",       // Brazil vs Morocco
  537340: "Levi's Stadium",          // Haiti vs Scotland
  537345: "SoFi Stadium",            // USA vs Paraguay
  537346: "AT&T Stadium",            // Australia vs Turkey
  537351: "Gillette Stadium",        // Germany vs Curacao
  537352: "NRG Stadium",             // Ivory Coast vs Ecuador
  537357: "Lincoln Financial Field", // Netherlands vs Japan
  537358: "Lumen Field",             // Sweden vs Tunisia
  537363: "Arrowhead Stadium",       // Belgium vs Egypt
  537364: "AT&T Stadium",            // Iran vs New Zealand
  537369: "MetLife Stadium",         // Spain vs Cape Verde
  537370: "Hard Rock Stadium",       // Saudi Arabia vs Uruguay
  537391: "MetLife Stadium",         // France vs Senegal
  537392: "Gillette Stadium",        // Iraq vs Norway
  537397: "Arrowhead Stadium",       // Argentina vs Algeria
  537398: "Levi's Stadium",          // Austria vs Jordan
  537403: "Lumen Field",             // Portugal vs Congo DR
  537404: "NRG Stadium",             // Uzbekistan vs Colombia
  537409: "SoFi Stadium",            // England vs Croatia
  537410: "Rose Bowl Stadium",       // Ghana vs Panama
  // ── Group Stage Matchday 2 ──────────────────────────────────────────────
  537329: "Rose Bowl Stadium",       // Czechia vs South Africa
  537330: "AT&T Stadium",            // Mexico vs South Korea
  537335: "Levi's Stadium",          // Switzerland vs Bosnia
  537336: "Lincoln Financial Field", // Canada vs Qatar
  537341: "NRG Stadium",             // Brazil vs Haiti
  537342: "Lumen Field",             // Scotland vs Morocco
  537347: "Hard Rock Stadium",       // Turkey vs Paraguay
  537348: "SoFi Stadium",            // USA vs Australia
  537353: "MetLife Stadium",         // Germany vs Ivory Coast
  537354: "AT&T Stadium",            // Ecuador vs Curacao
  537359: "Rose Bowl Stadium",       // Netherlands vs Sweden
  537360: "BMO Field",               // Tunisia vs Japan
  537365: "Levi's Stadium",          // Belgium vs Iran
  537366: "NRG Stadium",             // New Zealand vs Egypt
  537371: "Hard Rock Stadium",       // Spain vs Saudi Arabia
  537372: "Hard Rock Stadium",       // Uruguay vs Cape Verde
  537393: "AT&T Stadium",            // France vs Iraq
  537394: "Lumen Field",             // Norway vs Senegal
  537399: "MetLife Stadium",         // Argentina vs Austria
  537400: "Rose Bowl Stadium",       // Jordan vs Algeria
  537405: "Gillette Stadium",        // Portugal vs Uzbekistan
  537406: "Lincoln Financial Field", // Colombia vs Congo DR
  537411: "SoFi Stadium",            // England vs Ghana
  537412: "NRG Stadium",             // Panama vs Croatia
  // ── Group Stage Matchday 3 ──────────────────────────────────────────────
  537331: "Levi's Stadium",          // Czechia vs Mexico
  537332: "Rose Bowl Stadium",       // South Africa vs South Korea
  537337: "AT&T Stadium",            // Switzerland vs Canada
  537338: "MetLife Stadium",         // Bosnia vs Qatar
  537343: "Gillette Stadium",        // Scotland vs Brazil
  537344: "Lincoln Financial Field", // Morocco vs Haiti
  537349: "Hard Rock Stadium",       // Turkey vs USA
  537350: "Lumen Field",             // Paraguay vs Australia
  537355: "SoFi Stadium",            // Ecuador vs Germany
  537356: "NRG Stadium",             // Curacao vs Ivory Coast
  537361: "Arrowhead Stadium",       // Tunisia vs Netherlands
  537362: "BMO Field",               // Japan vs Sweden
  537367: "AT&T Stadium",            // New Zealand vs Belgium
  537368: "Rose Bowl Stadium",       // Egypt vs Iran
  537373: "Hard Rock Stadium",       // Uruguay vs Spain
  537374: "MetLife Stadium",         // Cape Verde vs Saudi Arabia
  537395: "Levi's Stadium",          // Norway vs France
  537396: "Gillette Stadium",        // Senegal vs Iraq
  537401: "Lincoln Financial Field", // Jordan vs Argentina
  537402: "NRG Stadium",             // Algeria vs Austria
  537407: "SoFi Stadium",            // Colombia vs Portugal
  537408: "Arrowhead Stadium",       // Congo DR vs Uzbekistan
  537413: "BMO Field",               // Panama vs England
  537414: "AT&T Stadium",            // Croatia vs Ghana
}

export function resolveVenueByMatch(
  matchId: number,
  _group?: string | null,
  _matchday?: number | null,
  _stage?: string | null,
): string | null {
  return MATCH_VENUES[matchId] ?? null
}
