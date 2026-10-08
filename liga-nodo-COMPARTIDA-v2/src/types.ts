export type Category = '8va' | '7ma' | '6ta';

export type ResultType = 'P' | 'SF' | 'F' | 'C'; // P: Participación (20), SF: Semifinal (25), F: Final (30), C: Campeona (40)

export type DateId = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6';

// Torneo / formato dentro de una misma fecha.
// 'unico' = jornada normal de un solo torneo. El resto son torneos que pueden
// coexistir en la misma fecha. Es texto libre: estos son los sugeridos del
// desplegable, pero la admin puede escribir cualquier otro nombre ("Otro...").
export type TournamentType = string; // 'unico' | '8va' | '7ma' | '6ta' | 'Suma 12' | 'Suma 13' | 'Suma 15' | <libre>

export interface Player {
  id: string;
  name: string;
  lastName: string;
  category: Category;
  createdAt: string;
}

export interface ResultRecord {
  id: string;
  playerId: string;
  dateId: DateId;
  resultType: ResultType;
  tournament?: TournamentType; // undefined / 'unico' = torneo único de la fecha
  updatedAt: string;
}

export interface DateSchedule {
  dateId: DateId;
  name: string; // e.g. "Fecha 1 (Junio)"
  dateText: string; // e.g. "Sábado 14 de Junio 2026"
  timeText: string; // e.g. "09:00 hs"
  status: 'completada' | 'proxima' | 'pendiente';
}

export interface NextFixture {
  dateText: string;
  timeText: string;
  venueText: string;
  notes?: string;
  updatedAt: string;
}

export interface Subscriber {
  id: string;
  phone: string;
  name?: string;
  createdAt: string;
}

export interface PublicLeagueData {
  players: Player[];
  results: ResultRecord[];
  nextFixture: NextFixture;
  datesSchedule: DateSchedule[];
  subscribersCount: number;
}

export interface DateResultDetail {
  dateId: DateId;
  resultType: ResultType;
  tournament: TournamentType;
  points: number;
  label: string;
}

// Agrupa todos los resultados de una misma fecha (uno o varios torneos).
// Regla: cuenta el MEJOR resultado del día; si jugó 2+ torneos, suma un plus fijo.
export interface DateGroup {
  dateId: DateId;
  details: DateResultDetail[];   // todos los torneos jugados esa fecha (para mostrar)
  bestPoints: number;            // puntos del mejor resultado del día (el que cuenta)
  multiBonus: number;            // +10 si jugó 2+ torneos esa fecha, si no 0
  points: number;                // total de la fecha = bestPoints + multiBonus
}

export interface ComputedPlayerRanking {
  position: number;
  player: Player;
  category: Category;
  totalPoints: number;
  basePoints: number;
  datesPlayedCount: number;
  hasConsistencyBonus: boolean; // played >= 4 dates
  consistencyBonusPoints: number; // 15 if datesPlayedCount >= 4 else 0
  dateBreakdown: Record<DateId, DateGroup | null>;
  countsByResult: {
    C: number;
    F: number;
    SF: number;
    P: number;
  };
}
