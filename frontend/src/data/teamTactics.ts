export interface TacticsData {
  coach: string
  coachNationality: string
  formation: string
  pressingIntensity: 'high' | 'medium' | 'low'
  defensiveLine: 'high' | 'medium' | 'low'
  playingStyle: string
  keyInstructions: string[]
}

const DEFAULT_TACTICS: TacticsData = {
  coach: 'Head Coach', coachNationality: 'Unknown', formation: '4-3-3',
  pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Balanced',
  keyInstructions: ['Compact defensive shape', 'Quick transitions'],
}

export const TEAM_TACTICS: Record<string, TacticsData> = {
  'Argentina': {
    coach: 'Lionel Scaloni', coachNationality: 'Argentine', formation: '4-4-2',
    pressingIntensity: 'high', defensiveLine: 'medium', playingStyle: 'Possession + Counter',
    keyInstructions: ['Messi drops deep to create space', 'High press to win ball in opponent half', 'Dynamic overloads on the right flank', 'Set pieces designed around Otamendi'],
  },
  'France': {
    coach: 'Didier Deschamps', coachNationality: 'French', formation: '4-2-3-1',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Counter-Attack',
    keyInstructions: ['Mbappé runs behind defensive line', 'Double pivot to protect back four', 'Wide players cut inside onto strong foot', 'Exploit pace in transition'],
  },
  'Spain': {
    coach: 'Luis de la Fuente', coachNationality: 'Spanish', formation: '4-3-3',
    pressingIntensity: 'high', defensiveLine: 'high', playingStyle: 'Possession (Tiki-Taka)',
    keyInstructions: ['Short passing triangles through midfield', 'High defensive line to compress space', 'Full-backs push high to create width', 'Press high to win ball immediately after losing it'],
  },
  'England': {
    coach: 'Gareth Southgate', coachNationality: 'English', formation: '4-2-3-1',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Structured + Direct',
    keyInstructions: ['Kane drops to link play', 'Wingers run channels', 'Set pieces a major weapon', 'Defensively solid before countering'],
  },
  'Brazil': {
    coach: 'Dorival Júnior', coachNationality: 'Brazilian', formation: '4-2-3-1',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Attacking',
    keyInstructions: ['Vinicius Jr. one-on-one on the left', 'Rodrygo creative through the middle', 'Casemiro shields the defence', 'Direct play to exploit pace in attack'],
  },
  'Germany': {
    coach: 'Julian Nagelsmann', coachNationality: 'German', formation: '4-2-3-1',
    pressingIntensity: 'high', defensiveLine: 'high', playingStyle: 'Gegenpressing',
    keyInstructions: ['Intensive press immediately after losing possession', 'Quick vertical passes to break lines', 'Full-backs join attacks aggressively', 'Midfield box dominance'],
  },
  'Portugal': {
    coach: 'Roberto Martínez', coachNationality: 'Spanish', formation: '4-3-3',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Attacking',
    keyInstructions: ['Ronaldo as target man', 'Bruno Fernandes creative from deep', 'Wide forwards to stretch play', 'Build-up from the back'],
  },
  'Netherlands': {
    coach: 'Ronald Koeman', coachNationality: 'Dutch', formation: '4-3-3',
    pressingIntensity: 'high', defensiveLine: 'high', playingStyle: 'Total Football',
    keyInstructions: ['Positional rotations across all lines', 'High block and high press', 'Full-backs as auxiliary wingers', 'Quick one-touch combinations'],
  },
  'Belgium': {
    coach: 'Domenico Tedesco', coachNationality: 'Italian/German', formation: '3-4-3',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Structured',
    keyInstructions: ['Wing-backs crucial to build play', 'De Bruyne as quarterback', 'Three-man defence absorbs pressure', 'Quick transition through midfield'],
  },
  'Italy': {
    coach: 'Luciano Spalletti', coachNationality: 'Italian', formation: '4-3-3',
    pressingIntensity: 'high', defensiveLine: 'medium', playingStyle: 'Possession',
    keyInstructions: ['Pressing traps in midfield thirds', 'Patient build-up through short passes', 'Strong collective defensive shape', 'Pirlo-style deep playmaker'],
  },
  'Croatia': {
    coach: 'Zlatko Dalić', coachNationality: 'Croatian', formation: '4-2-3-1',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Midfield Control',
    keyInstructions: ['Modrić controls tempo from deep', 'Maintain shape and exploit spaces', 'Defensively organised first', 'Transition quickly through central zones'],
  },
  'Morocco': {
    coach: 'Walid Regragui', coachNationality: 'Moroccan', formation: '4-1-4-1',
    pressingIntensity: 'high', defensiveLine: 'low', playingStyle: 'Counter-Attack',
    keyInstructions: ['Extremely compact defensive block', 'Fast breaks through Ziyech and En-Nesyri', 'Press aggressively in wide areas', 'Set pieces are a key weapon'],
  },
  'Uruguay': {
    coach: 'Marcelo Bielsa', coachNationality: 'Argentine', formation: '4-3-3',
    pressingIntensity: 'high', defensiveLine: 'high', playingStyle: 'Bielsismo',
    keyInstructions: ['Man-oriented pressing across the pitch', 'High defensive line to compress space', 'Vertical and aggressive style', 'High physical intensity throughout'],
  },
  'Colombia': {
    coach: 'Néstor Lorenzo', coachNationality: 'Argentine', formation: '4-2-3-1',
    pressingIntensity: 'high', defensiveLine: 'medium', playingStyle: 'Attacking',
    keyInstructions: ['Luis Díaz and Cuadrado terrorise flanks', 'Falcao / striker as focal point', 'Quick pressing to win ball high', 'James Rodríguez or AM as creator'],
  },
  'Japan': {
    coach: 'Hajime Moriyasu', coachNationality: 'Japanese', formation: '4-2-3-1',
    pressingIntensity: 'high', defensiveLine: 'medium', playingStyle: 'Pressing',
    keyInstructions: ['Relentless collective press', 'Compact 4-5-1 defensive shape', 'Quick transitions through Kamada/Doan', 'Defend deep then spring counter-attacks'],
  },
  'United States': {
    coach: 'Mauricio Pochettino', coachNationality: 'Argentine', formation: '4-3-3',
    pressingIntensity: 'high', defensiveLine: 'high', playingStyle: 'Pressing + Transition',
    keyInstructions: ['Physical intensity and athleticism', 'Press in packs to force turnovers', 'Pulisic as main creative threat', 'Wide forwards run channels at pace'],
  },
  'USA': {
    coach: 'Mauricio Pochettino', coachNationality: 'Argentine', formation: '4-3-3',
    pressingIntensity: 'high', defensiveLine: 'high', playingStyle: 'Pressing + Transition',
    keyInstructions: ['Physical intensity and athleticism', 'Press in packs to force turnovers', 'Pulisic as main creative threat', 'Wide forwards run channels at pace'],
  },
  'Mexico': {
    coach: 'Javier Aguirre', coachNationality: 'Mexican', formation: '4-3-3',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Possession',
    keyInstructions: ['Technical build-up from the back', 'Lozano and Antuna on the wings', 'Block narrow defensively', 'Counter with pace through channels'],
  },
  'Canada': {
    coach: 'Jesse Marsch', coachNationality: 'American', formation: '4-3-3',
    pressingIntensity: 'high', defensiveLine: 'high', playingStyle: 'High Press',
    keyInstructions: ['Alphonso Davies key on left flank', 'Aggressive press from the front', 'Jonathan David as striker target', 'Exploit set pieces with physicality'],
  },
  'Denmark': {
    coach: 'Kasper Hjulmand', coachNationality: 'Danish', formation: '3-4-3',
    pressingIntensity: 'high', defensiveLine: 'medium', playingStyle: 'Structured Press',
    keyInstructions: ['Wing-backs key to width and attacks', 'Eriksen controls play from deep', 'Compact blocks against top opposition', 'Quick vertical switches of play'],
  },
  'Switzerland': {
    coach: 'Murat Yakin', coachNationality: 'Swiss', formation: '3-4-2-1',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Organised',
    keyInstructions: ['Three-man defence provides stability', 'Xhaka orchestrates from midfield', 'Disciplined structure limits chances', 'Set pieces and transition threat'],
  },
  'Poland': {
    coach: 'Michał Probierz', coachNationality: 'Polish', formation: '4-3-3',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Direct',
    keyInstructions: ['Lewandowski as target man', 'Direct balls to exploit his movement', 'Compact mid-block defence', 'Set pieces designed for Lewandowski'],
  },
  'Austria': {
    coach: 'Ralf Rangnick', coachNationality: 'German', formation: '4-2-3-1',
    pressingIntensity: 'high', defensiveLine: 'high', playingStyle: 'RangnickBall (Gegenpressing)',
    keyInstructions: ['Ultra-high press after losing possession', 'High line to squeeze opponent', 'Quick vertical play through lines', 'Intense physical 90 minutes'],
  },
  'Serbia': {
    coach: 'Dragan Stojković', coachNationality: 'Serbian', formation: '3-4-2-1',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Balanced',
    keyInstructions: ['Mitrović aerial threat in the box', 'Creative wing-backs drive forward', 'Compact defensive block', 'Quality set piece routines'],
  },
  'Turkey': {
    coach: 'Vincenzo Montella', coachNationality: 'Italian', formation: '4-2-3-1',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Counter-Attack',
    keyInstructions: ['Calhanoglu dictates tempo', 'Arda Güler as trequartista', 'Press selectively in dangerous zones', 'Exploit space on the counter'],
  },
  'Ukraine': {
    coach: 'Serhiy Rebrov', coachNationality: 'Ukrainian', formation: '4-3-3',
    pressingIntensity: 'high', defensiveLine: 'medium', playingStyle: 'Aggressive',
    keyInstructions: ['Mudryk pace on the left flank', 'High energy collective press', 'Quick ball movement between lines', 'Set pieces are a key scoring route'],
  },
  'South Korea': {
    coach: 'Hong Myung-bo', coachNationality: 'South Korean', formation: '4-2-3-1',
    pressingIntensity: 'high', defensiveLine: 'medium', playingStyle: 'Counter-Press',
    keyInstructions: ['Son Heung-min as main threat', 'Intense press to win ball quickly', 'Fast transitions through Son and Lee', 'Disciplined defensive structure'],
  },
  'Australia': {
    coach: 'Tony Popovic', coachNationality: 'Australian', formation: '4-3-3',
    pressingIntensity: 'high', defensiveLine: 'medium', playingStyle: 'Pressing',
    keyInstructions: ['Physical intensity and work rate', 'Socceroos spirit — fight for every ball', 'Goodwin/Irvine run channels', 'Set pieces with aerial threat'],
  },
  'Iran': {
    coach: 'Amir Ghalenoei', coachNationality: 'Iranian', formation: '4-2-3-1',
    pressingIntensity: 'low', defensiveLine: 'low', playingStyle: 'Counter-Attack',
    keyInstructions: ['Deep defensive block', 'Compact 4-4-2 / 4-2-3-1 shape', 'Quick counters through Sardar Azmoun', 'Set pieces and aerial duels'],
  },
  'Saudi Arabia': {
    coach: 'Hervé Renard', coachNationality: 'French', formation: '4-5-1',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Organised Block',
    keyInstructions: ['5-man midfield to control centre', 'Counter-attack through Al-Dawsari', 'Disciplined structure in transition', 'Energy and organisation over individuals'],
  },
  'Ecuador': {
    coach: 'Sébastien Beccacece', coachNationality: 'Argentine', formation: '4-3-3',
    pressingIntensity: 'high', defensiveLine: 'medium', playingStyle: 'Vertical',
    keyInstructions: ['Enner Valencia target man', 'Pace and directness in attack', 'Aggressive pressing in midfield', 'Physicality in duels throughout'],
  },
  'Venezuela': {
    coach: 'Fernando Batista', coachNationality: 'Argentine', formation: '4-3-3',
    pressingIntensity: 'high', defensiveLine: 'medium', playingStyle: 'Pressing',
    keyInstructions: ['Compact pressing traps', 'Soteldo and Machis pace on flanks', 'Aggressive midfield battles', 'Direct vertical play'],
  },
  'Senegal': {
    coach: 'Aliou Cissé', coachNationality: 'Senegalese', formation: '4-3-3',
    pressingIntensity: 'high', defensiveLine: 'medium', playingStyle: 'Transition',
    keyInstructions: ['Sadio Mané (or successor) leads attack', 'Physicality and pace across the board', 'Win second balls in midfield', 'Quick vertical transitions'],
  },
  'Nigeria': {
    coach: 'Augustine Eguavoen', coachNationality: 'Nigerian', formation: '4-2-3-1',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Pace-Based Counter',
    keyInstructions: ['Victor Osimhen as focal point', 'Pace in behind on transitions', 'Midfield battlers to cover ground', 'Physicality and directness'],
  },
  'Egypt': {
    coach: 'Hossam Hassan', coachNationality: 'Egyptian', formation: '4-2-3-1',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Organised',
    keyInstructions: ['Mo Salah as main threat', 'Build from the back patiently', 'Defensive solidity first', 'Salah freedom to drift and create'],
  },
  'Cameroon': {
    coach: 'Marc Brys', coachNationality: 'Belgian', formation: '4-3-3',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Physical',
    keyInstructions: ['Aboubakar aerial threat', 'Physical battles in midfield', 'Wide players use pace', 'Defend in numbers and counter'],
  },
  "Côte d'Ivoire": {
    coach: 'Emerse Faé', coachNationality: 'Ivorian', formation: '4-3-3',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Attacking',
    keyInstructions: ['Sébastien Haller focal point', 'Zaha and Pépé provide width', 'Technical midfield trio', 'Pace and directness in wide areas'],
  },
  'Ivory Coast': {
    coach: 'Emerse Faé', coachNationality: 'Ivorian', formation: '4-3-3',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Attacking',
    keyInstructions: ['Sébastien Haller focal point', 'Zaha and Pépé provide width', 'Technical midfield trio', 'Pace and directness in wide areas'],
  },
  'Jamaica': {
    coach: 'Steve McClaren', coachNationality: 'English', formation: '4-3-3',
    pressingIntensity: 'medium', defensiveLine: 'medium', playingStyle: 'Counter-Attack',
    keyInstructions: ['Pace on transitions through forwards', 'Compact defensive block', 'Antonio as physical target man', 'Set pieces with aerial ability'],
  },
  'Panama': {
    coach: 'Thomas Christiansen', coachNationality: 'Danish/Spanish', formation: '4-4-2',
    pressingIntensity: 'medium', defensiveLine: 'low', playingStyle: 'Defensive',
    keyInstructions: ['Low defensive block', 'Physicality in duels', 'Set pieces as main weapon', 'Counter-attack with speed'],
  },
  'Costa Rica': {
    coach: 'Gustavo Alfaro', coachNationality: 'Argentine', formation: '4-5-1',
    pressingIntensity: 'low', defensiveLine: 'low', playingStyle: 'Defensive Block',
    keyInstructions: ['Keylor Navas / goalkeeper as key', 'Mid-low block absorbs pressure', 'Quick counters through forwards', 'Set pieces only scoring route'],
  },
  'Chile': {
    coach: 'Ricardo Gareca', coachNationality: 'Argentine', formation: '4-3-3',
    pressingIntensity: 'high', defensiveLine: 'high', playingStyle: 'High Press',
    keyInstructions: ['Pressing traps inspired by Sampaoli era', 'High line and compact shape', 'Wing-backs crucial to width', 'Alexis Sánchez experience key'],
  },
}

export function getTeamTactics(name: string): TacticsData {
  if (!name) return DEFAULT_TACTICS
  if (TEAM_TACTICS[name]) return TEAM_TACTICS[name]
  const lower = name.toLowerCase()
  const key = Object.keys(TEAM_TACTICS).find(k =>
    k.toLowerCase() === lower ||
    lower.includes(k.toLowerCase()) ||
    k.toLowerCase().includes(lower)
  )
  return key ? TEAM_TACTICS[key] : { ...DEFAULT_TACTICS, coach: `${name} Head Coach` }
}
