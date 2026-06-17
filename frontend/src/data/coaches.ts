export interface CoachData {
  name: string
  nationality: string
  age: number
  formation: string
  style: string
  pressingIntensity: number   // 0-10
  defensiveLine: number       // 0-10  (10 = very high)
  tempo: number               // 0-10  (10 = very fast)
  traits: string[]
}

const DEFAULT_COACH: CoachData = {
  name: 'Head Coach', nationality: 'Unknown', age: 0,
  formation: '4-3-3', style: 'Balanced', pressingIntensity: 5,
  defensiveLine: 5, tempo: 5, traits: ['Organised', 'Disciplined'],
}

export const COACHES: Record<string, CoachData> = {
  // ── Hosts ──────────────────────────────────────────────────────────────
  'Mexico': {
    name: 'Javier Aguirre', nationality: 'Mexican', age: 65,
    formation: '4-4-2', style: 'Counter-Attack',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Compact shape', 'Disciplined defence', 'Quick transitions', 'Experienced tactician'],
  },
  'United States': {
    name: 'Mauricio Pochettino', nationality: 'Argentine', age: 52,
    formation: '4-3-3', style: 'High Press',
    pressingIntensity: 8, defensiveLine: 7, tempo: 8,
    traits: ['High press', 'Vertical football', 'Intensity over 90 min', 'Youth development'],
  },
  'USA': {
    name: 'Mauricio Pochettino', nationality: 'Argentine', age: 52,
    formation: '4-3-3', style: 'High Press',
    pressingIntensity: 8, defensiveLine: 7, tempo: 8,
    traits: ['High press', 'Vertical football', 'Intensity over 90 min', 'Youth development'],
  },
  'Canada': {
    name: 'Jesse Marsch', nationality: 'American', age: 51,
    formation: '4-3-3', style: 'Gegenpressing',
    pressingIntensity: 9, defensiveLine: 7, tempo: 9,
    traits: ['RangnickBall principles', 'High block', 'Physicality', 'Alphonso Davies free role'],
  },

  // ── South America ──────────────────────────────────────────────────────
  'Argentina': {
    name: 'Lionel Scaloni', nationality: 'Argentine', age: 46,
    formation: '4-4-2', style: 'Possession + Counter',
    pressingIntensity: 7, defensiveLine: 6, tempo: 7,
    traits: ['Messi free role', 'Flexible shape', 'High press in transition', 'WC 2022 winners'],
  },
  'Brazil': {
    name: 'Dorival Júnior', nationality: 'Brazilian', age: 62,
    formation: '4-2-3-1', style: 'Attacking',
    pressingIntensity: 6, defensiveLine: 6, tempo: 7,
    traits: ['Vinicius Jr on left', 'Direct attacking play', 'Technical midfield', 'Home-style flair'],
  },
  'Uruguay': {
    name: 'Marcelo Bielsa', nationality: 'Argentine', age: 68,
    formation: '4-3-3', style: 'Bielsismo',
    pressingIntensity: 10, defensiveLine: 9, tempo: 10,
    traits: ['Man-oriented pressing', 'Ultra-high line', 'Positional rotations', 'Maximum intensity'],
  },
  'Colombia': {
    name: 'Néstor Lorenzo', nationality: 'Argentine', age: 56,
    formation: '4-2-3-1', style: 'Attacking',
    pressingIntensity: 7, defensiveLine: 6, tempo: 7,
    traits: ['Luis Díaz key threat', 'Press high', 'James Rodríguez creativity', 'Fluid attack'],
  },
  'Ecuador': {
    name: 'Sébastien Beccacece', nationality: 'Argentine', age: 47,
    formation: '4-3-3', style: 'Vertical',
    pressingIntensity: 7, defensiveLine: 6, tempo: 8,
    traits: ['Direct vertical passing', 'Physical duels', 'Aggressive press', 'Quick transitions'],
  },
  'Venezuela': {
    name: 'Fernando Batista', nationality: 'Argentine', age: 52,
    formation: '4-3-3', style: 'High Press',
    pressingIntensity: 7, defensiveLine: 6, tempo: 7,
    traits: ['Compact pressing', 'Pace on flanks', 'Organised structure', 'Aggressive midfield'],
  },
  'Chile': {
    name: 'Ricardo Gareca', nationality: 'Argentine', age: 66,
    formation: '4-3-3', style: 'High Press',
    pressingIntensity: 8, defensiveLine: 7, tempo: 8,
    traits: ['Sampaoli-inspired press', 'High line', 'Wing-backs push forward', 'Alexis Sánchez key'],
  },
  'Paraguay': {
    name: 'Gustavo Alfaro', nationality: 'Argentine', age: 61,
    formation: '4-4-2', style: 'Defensive',
    pressingIntensity: 5, defensiveLine: 4, tempo: 5,
    traits: ['Compact block', 'Set pieces weapon', 'Counter-attack', 'Team discipline'],
  },
  'Peru': {
    name: 'Jorge Fossati', nationality: 'Uruguayan', age: 71,
    formation: '4-4-2', style: 'Organised',
    pressingIntensity: 5, defensiveLine: 5, tempo: 5,
    traits: ['Structured midfield', 'Compact block', 'Patient build-up', 'Disciplined defence'],
  },
  'Bolivia': {
    name: 'Óscar Villegas', nationality: 'Bolivian', age: 52,
    formation: '4-4-2', style: 'Balanced',
    pressingIntensity: 5, defensiveLine: 5, tempo: 5,
    traits: ['Home altitude advantage', 'Physical approach', 'Team spirit', 'Counter-attack'],
  },

  // ── Europe ─────────────────────────────────────────────────────────────
  'France': {
    name: 'Didier Deschamps', nationality: 'French', age: 56,
    formation: '4-2-3-1', style: 'Counter-Attack',
    pressingIntensity: 6, defensiveLine: 6, tempo: 7,
    traits: ['Mbappé pace in transition', 'Double pivot shields defence', 'World-class individuals', 'Tournament experience'],
  },
  'Spain': {
    name: 'Luis de la Fuente', nationality: 'Spanish', age: 63,
    formation: '4-3-3', style: 'Possession',
    pressingIntensity: 9, defensiveLine: 8, tempo: 8,
    traits: ['Tiki-taka DNA', 'High press after loss', 'Full-backs as playmakers', 'Positional dominance'],
  },
  'England': {
    name: 'Thomas Tuchel', nationality: 'German', age: 51,
    formation: '3-4-3', style: 'Structured Pressing',
    pressingIntensity: 8, defensiveLine: 7, tempo: 8,
    traits: ['High-energy press', 'Wing-backs key to width', 'Flexible formation', 'Set piece expertise'],
  },
  'Germany': {
    name: 'Julian Nagelsmann', nationality: 'German', age: 37,
    formation: '4-2-3-1', style: 'Gegenpressing',
    pressingIntensity: 9, defensiveLine: 8, tempo: 9,
    traits: ['Immediate pressing after loss', 'Vertical passes through lines', 'High defensive line', 'Youth + experience blend'],
  },
  'Portugal': {
    name: 'Roberto Martínez', nationality: 'Spanish', age: 51,
    formation: '4-3-3', style: 'Attacking',
    pressingIntensity: 6, defensiveLine: 6, tempo: 7,
    traits: ['Ronaldo as focal point', 'Bruno Fernandes creativity', 'Technical wide play', 'Patient build-up'],
  },
  'Netherlands': {
    name: 'Ronald Koeman', nationality: 'Dutch', age: 61,
    formation: '4-3-3', style: 'Total Football',
    pressingIntensity: 8, defensiveLine: 7, tempo: 8,
    traits: ['Positional rotations', 'High press', 'Full-backs auxiliary wingers', 'De Jong controls tempo'],
  },
  'Italy': {
    name: 'Luciano Spalletti', nationality: 'Italian', age: 65,
    formation: '4-3-3', style: 'Possession',
    pressingIntensity: 8, defensiveLine: 6, tempo: 7,
    traits: ['Pressing traps', 'Short passing triangles', 'Defensive organisation', 'Positional rotations'],
  },
  'Belgium': {
    name: 'Domenico Tedesco', nationality: 'Italian-German', age: 39,
    formation: '3-4-3', style: 'Structured',
    pressingIntensity: 6, defensiveLine: 6, tempo: 6,
    traits: ['Wing-backs crucial', 'De Bruyne as quarterback', 'Flexible back 3/5', 'Quick transitions'],
  },
  'Croatia': {
    name: 'Zlatko Dalić', nationality: 'Croatian', age: 57,
    formation: '4-2-3-1', style: 'Midfield Control',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Modrić tempo control', 'Disciplined structure', 'Counter-attack threat', 'Tournament mentality'],
  },
  'Denmark': {
    name: 'Kasper Hjulmand', nationality: 'Danish', age: 52,
    formation: '3-4-3', style: 'Structured Press',
    pressingIntensity: 7, defensiveLine: 6, tempo: 7,
    traits: ['Wing-backs drive play', 'Eriksen creative hub', 'Compact defensive blocks', 'Set piece threats'],
  },
  'Switzerland': {
    name: 'Murat Yakin', nationality: 'Swiss', age: 49,
    formation: '3-4-2-1', style: 'Organised',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Xhaka deep playmaker', '3-man defence stable', 'Counter-press', 'Physical duels'],
  },
  'Austria': {
    name: 'Ralf Rangnick', nationality: 'German', age: 66,
    formation: '4-2-3-1', style: 'Gegenpressing',
    pressingIntensity: 10, defensiveLine: 8, tempo: 9,
    traits: ['Originator of Gegenpressung', 'Ultra-high press', 'Fast vertical play', 'Maximum intensity'],
  },
  'Turkey': {
    name: 'Vincenzo Montella', nationality: 'Italian', age: 50,
    formation: '4-2-3-1', style: 'Counter-Attack',
    pressingIntensity: 6, defensiveLine: 5, tempo: 7,
    traits: ['Arda Güler trequartista', 'Calhanoglu deep playmaker', 'Press selectively', 'Pace on counter'],
  },
  'Poland': {
    name: 'Michał Probierz', nationality: 'Polish', age: 52,
    formation: '4-3-3', style: 'Direct',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Lewandowski target man', 'Direct balls forward', 'Mid-block defence', 'Set piece quality'],
  },
  'Serbia': {
    name: 'Dragan Stojković', nationality: 'Serbian', age: 58,
    formation: '3-4-2-1', style: 'Balanced',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Mitrović aerial threat', 'Creative wing-backs', 'Compact block', 'Physical duels'],
  },
  'Ukraine': {
    name: 'Serhiy Rebrov', nationality: 'Ukrainian', age: 50,
    formation: '4-3-3', style: 'Aggressive',
    pressingIntensity: 7, defensiveLine: 6, tempo: 7,
    traits: ['Mudryk pace on left', 'High energy press', 'Quick ball movement', 'Set piece route'],
  },
  'Sweden': {
    name: 'Jon Dahl Tomasson', nationality: 'Danish', age: 48,
    formation: '4-4-2', style: 'Organised',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Physical and direct', 'Isak as focal point', 'Compact midfield', 'Tough to beat'],
  },
  'Scotland': {
    name: 'Steve Clarke', nationality: 'Scottish', age: 60,
    formation: '3-5-2', style: 'Organised',
    pressingIntensity: 7, defensiveLine: 5, tempo: 7,
    traits: ['3-back solidity', 'Robertson key wing-back', 'Work rate', 'Set piece threats'],
  },
  'Norway': {
    name: 'Ståle Solbakken', nationality: 'Norwegian', age: 56,
    formation: '4-3-3', style: 'Direct',
    pressingIntensity: 7, defensiveLine: 6, tempo: 7,
    traits: ['Haaland focal point', 'Direct long balls', 'Physical and intense', 'Set piece danger'],
  },
  'Czechia': {
    name: 'Ivan Hašek', nationality: 'Czech', age: 61,
    formation: '4-2-3-1', style: 'Organised',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Schick goal threat', 'Compact structure', 'Counter-attack', 'Technical midfield'],
  },

  // ── Africa ──────────────────────────────────────────────────────────────
  'South Africa': {
    name: 'Hugo Broos', nationality: 'Belgian', age: 72,
    formation: '4-4-2', style: 'Organised',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Compact shape', 'Physical duels', 'Set piece threat', 'Defensive discipline'],
  },
  'Senegal': {
    name: 'Pape Thiaw', nationality: 'Senegalese', age: 47,
    formation: '4-3-3', style: 'Transition',
    pressingIntensity: 7, defensiveLine: 6, tempo: 7,
    traits: ['Physicality across team', 'Quick vertical transitions', 'Pace in wide areas', 'Organised block'],
  },
  'Morocco': {
    name: 'Walid Regragui', nationality: 'Moroccan', age: 49,
    formation: '4-1-4-1', style: 'Counter-Attack',
    pressingIntensity: 8, defensiveLine: 4, tempo: 6,
    traits: ['Compact deep block', 'Fast counter-attacks', 'Aerial defensive duels', 'Set piece weapon'],
  },
  'Nigeria': {
    name: 'Augustine Eguavoen', nationality: 'Nigerian', age: 58,
    formation: '4-2-3-1', style: 'Pace-Based Counter',
    pressingIntensity: 6, defensiveLine: 5, tempo: 7,
    traits: ['Osimhen focal point', 'Pace on transitions', 'Midfield work rate', 'Physical & direct'],
  },
  'Egypt': {
    name: 'Hossam Hassan', nationality: 'Egyptian', age: 58,
    formation: '4-2-3-1', style: 'Organised',
    pressingIntensity: 5, defensiveLine: 5, tempo: 5,
    traits: ['Salah creative hub', 'Patient build-up', 'Defensive solidity first', 'Salah free role'],
  },
  'Cameroon': {
    name: 'Marc Brys', nationality: 'Belgian', age: 59,
    formation: '4-3-3', style: 'Physical',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Aboubakar aerial threat', 'Physical midfield', 'Wide pace', 'Defend and counter'],
  },
  "Côte d'Ivoire": {
    name: 'Emerse Faé', nationality: 'Ivorian', age: 41,
    formation: '4-3-3', style: 'Attacking',
    pressingIntensity: 6, defensiveLine: 6, tempo: 7,
    traits: ['Haller focal point', 'Zaha and Pépé provide width', 'Technical midfield', 'Pace in attack'],
  },
  'Ivory Coast': {
    name: 'Emerse Faé', nationality: 'Ivorian', age: 41,
    formation: '4-3-3', style: 'Attacking',
    pressingIntensity: 6, defensiveLine: 6, tempo: 7,
    traits: ['Haller focal point', 'Zaha and Pépé provide width', 'Technical midfield', 'Pace in attack'],
  },
  'Algeria': {
    name: 'Vladimir Petković', nationality: 'Swiss-Croatian', age: 63,
    formation: '4-2-3-1', style: 'Structured',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Mahrez creative freedom', 'Compact shape', 'Quick transitions', 'Set piece quality'],
  },
  'Tunisia': {
    name: 'Jalel Kadri', nationality: 'Tunisian', age: 54,
    formation: '4-4-2', style: 'Defensive',
    pressingIntensity: 5, defensiveLine: 4, tempo: 5,
    traits: ['Low block', 'Physical defending', 'Set pieces', 'Quick breaks on counter'],
  },
  'DR Congo': {
    name: 'Sébastien Migné', nationality: 'French', age: 53,
    formation: '4-3-3', style: 'Counter-Attack',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Pace in wide areas', 'Compact defensive block', 'Quick transition play', 'Physical strength'],
  },
  'Mali': {
    name: 'Éric Sékou Chelle', nationality: 'French-Malian', age: 47,
    formation: '4-3-3', style: 'Organised',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Organised defensive shape', 'Pace on flanks', 'Physical duels', 'Counter-attack threat'],
  },
  'Ghana': {
    name: 'Otto Addo', nationality: 'German-Ghanaian', age: 48,
    formation: '4-2-3-1', style: 'Flexible',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Young talent driven', 'Flexible shape', 'Physical pace', 'Transitional threat'],
  },
  'South Korea': {
    name: 'Hong Myung-bo', nationality: 'South Korean', age: 55,
    formation: '4-2-3-1', style: 'Counter-Press',
    pressingIntensity: 7, defensiveLine: 6, tempo: 7,
    traits: ['Son Heung-min key', 'Intense collective press', 'Lee Kang-in creativity', 'Disciplined structure'],
  },

  // ── Asia & Oceania ──────────────────────────────────────────────────────
  'Japan': {
    name: 'Hajime Moriyasu', nationality: 'Japanese', age: 56,
    formation: '4-2-3-1', style: 'Pressing',
    pressingIntensity: 9, defensiveLine: 7, tempo: 8,
    traits: ['Relentless collective press', 'Compact 4-5-1 shape', 'Fast transition through Doan', 'Defend deep then spring'],
  },
  'Australia': {
    name: 'Tony Popovic', nationality: 'Australian', age: 51,
    formation: '4-3-3', style: 'Pressing',
    pressingIntensity: 7, defensiveLine: 6, tempo: 7,
    traits: ['Physical intensity', 'High work rate', 'Goodwin and Irvine pace', 'Set piece strength'],
  },
  'Iran': {
    name: 'Amir Ghalenoei', nationality: 'Iranian', age: 55,
    formation: '4-2-3-1', style: 'Counter-Attack',
    pressingIntensity: 4, defensiveLine: 3, tempo: 5,
    traits: ['Deep defensive block', 'Sardar Azmoun target', 'Quick breaks', 'Aerial duels'],
  },
  'Saudi Arabia': {
    name: 'Hervé Renard', nationality: 'French', age: 55,
    formation: '4-5-1', style: 'Organised Block',
    pressingIntensity: 5, defensiveLine: 5, tempo: 5,
    traits: ['5-man midfield shield', 'Al-Dawsari counter threat', 'Disciplined transitions', 'Organisation key'],
  },
  'Iraq': {
    name: 'Graham Arnold', nationality: 'Australian', age: 61,
    formation: '4-3-3', style: 'Organised',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Compact shape', 'Quick transitions', 'Physical duels', 'Disciplined structure'],
  },
  'Jordan': {
    name: 'Hussein Ammouta', nationality: 'Moroccan-Jordanian', age: 55,
    formation: '4-4-2', style: 'Defensive',
    pressingIntensity: 5, defensiveLine: 4, tempo: 5,
    traits: ['Deep compact block', 'Set pieces key', 'Physical duels', 'Quick counter-attacks'],
  },
  'Qatar': {
    name: 'Marquez López', nationality: 'Spanish', age: 45,
    formation: '4-3-3', style: 'Possession',
    pressingIntensity: 7, defensiveLine: 6, tempo: 7,
    traits: ['Aspire Academy product', 'Technical possession game', 'Press high', 'Organised structure'],
  },
  'Uzbekistan': {
    name: 'Srecko Katanec', nationality: 'Slovenian', age: 62,
    formation: '4-2-3-1', style: 'Organised',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Compact midfield shape', 'Quick transitions', 'Physical duels', 'Talented young squad'],
  },
  'New Zealand': {
    name: 'Darren Bazeley', nationality: 'English', age: 54,
    formation: '4-4-2', style: 'Defensive',
    pressingIntensity: 5, defensiveLine: 4, tempo: 5,
    traits: ['Organised defensive block', 'Physical set pieces', 'Counter-attack', 'Team spirit'],
  },

  // ── CONCACAF ───────────────────────────────────────────────────────────
  'Jamaica': {
    name: 'Steve McClaren', nationality: 'English', age: 63,
    formation: '4-3-3', style: 'Counter-Attack',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Pace on transitions', 'Antonio physical threat', 'Compact defensive block', 'Set pieces'],
  },
  'Panama': {
    name: 'Thomas Christiansen', nationality: 'Danish-Spanish', age: 51,
    formation: '4-4-2', style: 'Defensive',
    pressingIntensity: 5, defensiveLine: 4, tempo: 5,
    traits: ['Low block', 'Physicality in duels', 'Set pieces weapon', 'Counter-attack'],
  },
  'Costa Rica': {
    name: 'Gustavo Alfaro', nationality: 'Argentine', age: 61,
    formation: '4-5-1', style: 'Defensive Block',
    pressingIntensity: 4, defensiveLine: 3, tempo: 4,
    traits: ['Mid-low block', 'Navas saves crucial', 'Counter through pace', 'Set pieces only route'],
  },
  'Honduras': {
    name: 'Reinaldo Rueda', nationality: 'Colombian', age: 65,
    formation: '4-4-2', style: 'Defensive',
    pressingIntensity: 5, defensiveLine: 4, tempo: 5,
    traits: ['Compact shape', 'Physical defending', 'Set pieces', 'Disciplined structure'],
  },
  'Haiti': {
    name: 'Marc Collat', nationality: 'French', age: 51,
    formation: '4-3-3', style: 'Counter-Attack',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Pace in attack', 'Defensive compact', 'Counter-attack', 'Team spirit'],
  },

  // ── Bosnia, Curacao, Cape Verde ─────────────────────────────────────────
  'Bosnia and Herzegovina': {
    name: 'Sergej Barbarez', nationality: 'Bosnian', age: 51,
    formation: '4-3-3', style: 'Balanced',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Džeko-style target man', 'Technical midfield', 'Physical defending', 'Counter threat'],
  },
  'Bosnia': {
    name: 'Sergej Barbarez', nationality: 'Bosnian', age: 51,
    formation: '4-3-3', style: 'Balanced',
    pressingIntensity: 6, defensiveLine: 5, tempo: 6,
    traits: ['Physical and direct', 'Compact shape', 'Counter threat', 'Set pieces'],
  },
  'Curaçao': {
    name: 'Remko Bicentini', nationality: 'Curaçaoan', age: 56,
    formation: '4-4-2', style: 'Organised',
    pressingIntensity: 5, defensiveLine: 5, tempo: 5,
    traits: ['Compact organisation', 'Physical duels', 'Quick counters', 'Team solidarity'],
  },
  'Curacao': {
    name: 'Remko Bicentini', nationality: 'Curaçaoan', age: 56,
    formation: '4-4-2', style: 'Organised',
    pressingIntensity: 5, defensiveLine: 5, tempo: 5,
    traits: ['Compact organisation', 'Physical duels', 'Quick counters', 'Team solidarity'],
  },
  'Cape Verde': {
    name: 'Pedro Brito Bubista', nationality: 'Cape Verdean', age: 53,
    formation: '4-4-2', style: 'Counter-Attack',
    pressingIntensity: 6, defensiveLine: 4, tempo: 6,
    traits: ['Compact defensive block', 'Pace in wide areas', 'Set pieces', 'Counter through pace'],
  },
}

export function getCoach(teamName: string): CoachData {
  if (!teamName) return DEFAULT_COACH
  if (COACHES[teamName]) return COACHES[teamName]
  const lower = teamName.toLowerCase()
  const key = Object.keys(COACHES).find(k =>
    k.toLowerCase() === lower ||
    lower.includes(k.toLowerCase()) ||
    k.toLowerCase().includes(lower)
  )
  return key ? COACHES[key] : { ...DEFAULT_COACH, name: `${teamName} Head Coach` }
}
