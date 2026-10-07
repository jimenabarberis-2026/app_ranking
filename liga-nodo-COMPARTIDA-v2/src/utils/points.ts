import { Category, DateId, ResultType, TournamentType, Player, ResultRecord, ComputedPlayerRanking, DateResultDetail, DateGroup } from '../types';

export const RESULT_POINTS: Record<ResultType, number> = {
  P: 20,
  SF: 25,
  F: 30,
  C: 40,
};

// Opciones sugeridas para el desplegable de "Torneo" al cargar un resultado.
// 'unico' es la jornada normal. El resto pueden coexistir en la misma fecha.
// La admin también puede escribir un nombre libre ("Otro...").
export const TOURNAMENT_OPTIONS: { value: TournamentType; label: string }[] = [
  { value: 'unico', label: 'Categ. Pura' },
  { value: 'Suma 12', label: 'Suma 12' },
  { value: 'Suma 13', label: 'Suma 13' },
  { value: 'Suma 15', label: 'Suma 15' },
];

// Etiqueta legible de un torneo (para mostrar en pantalla).
// 'Categ. Pura' es el torneo de la propia categoría; no necesita mostrarse como chip
// salvo que convivan varios torneos en la fecha.
export function tournamentLabel(t?: TournamentType): string {
  if (!t || t === 'unico') return 'Categ. Pura';
  const found = TOURNAMENT_OPTIONS.find((o) => o.value === t);
  return found ? found.label : t; // si es libre, se muestra tal cual
}

export const RESULT_LABELS: Record<ResultType, { short: string; full: string; bgClass: string; textClass: string }> = {
  P: { short: 'Part.', full: 'Participación', bgClass: 'bg-emerald-900/60 border-emerald-700/50', textClass: 'text-emerald-300' },
  SF: { short: 'Semi', full: 'Semifinal', bgClass: 'bg-blue-900/60 border-blue-700/50', textClass: 'text-blue-300' },
  F: { short: 'Final', full: 'Subcampeona', bgClass: 'bg-purple-900/60 border-purple-700/50', textClass: 'text-purple-300' },
  C: { short: 'Camp.', full: 'Campeona', bgClass: 'bg-amber-900/60 border-amber-500/60', textClass: 'text-amber-300 font-bold' },
};

export const ALL_DATES: DateId[] = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'];

export const DATE_NAMES: Record<DateId, string> = {
  F1: 'Fecha 1 (Junio)',
  F2: 'Fecha 2 (Julio)',
  F3: 'Fecha 3 (Agosto)',
  F4: 'Fecha 4 (Septiembre)',
  F5: 'Fecha 5 (Octubre)',
  F6: 'Fecha 6 (Noviembre)',
};

/**
 * Computes rankings for a given category with sorting and consistency bonus.
 * Consistency Bonus: +15 pts if player played >= 4 distinct dates.
 *
 * Una jugadora puede tener VARIOS resultados en la misma fecha (varios torneos:
 * p.ej. Suma 12 y Suma 15). Todos esos puntos se SUMAN. Para el bonus se cuentan
 * FECHAS DISTINTAS (no cantidad de torneos): jugar 2 torneos en F4 = 1 fecha.
 */
export function computeRankingsForCategory(
  players: Player[],
  results: ResultRecord[],
  category: Category
): ComputedPlayerRanking[] {
  const categoryPlayers = players.filter((p) => p.category === category);

  const rankings: ComputedPlayerRanking[] = categoryPlayers.map((player) => {
    const playerResults = results.filter((r) => r.playerId === player.id);

    const dateBreakdown: Record<DateId, DateGroup | null> = {
      F1: null,
      F2: null,
      F3: null,
      F4: null,
      F5: null,
      F6: null,
    };

    let basePoints = 0;
    const countsByResult = { C: 0, F: 0, SF: 0, P: 0 };

    playerResults.forEach((r) => {
      const pts = RESULT_POINTS[r.resultType] || 0;
      basePoints += pts;
      countsByResult[r.resultType] = (countsByResult[r.resultType] || 0) + 1;

      const detail: DateResultDetail = {
        dateId: r.dateId,
        resultType: r.resultType,
        tournament: r.tournament || 'unico',
        points: pts,
        label: RESULT_LABELS[r.resultType]?.full || r.resultType,
      };

      // Agrupar por fecha: si ya hay un torneo cargado en esa fecha, se agrega a la lista.
      const existing = dateBreakdown[r.dateId];
      if (existing) {
        existing.details.push(detail);
        existing.points += pts;
      } else {
        dateBreakdown[r.dateId] = {
          dateId: r.dateId,
          details: [detail],
          points: pts,
        };
      }
    });

    // Ordenar los torneos dentro de cada fecha de mejor a peor resultado (C > F > SF > P).
    const resultRank: Record<ResultType, number> = { C: 4, F: 3, SF: 2, P: 1 };
    ALL_DATES.forEach((d) => {
      const g = dateBreakdown[d];
      if (g && g.details.length > 1) {
        g.details.sort((x, y) => resultRank[y.resultType] - resultRank[x.resultType]);
      }
    });

    // Bonus por FECHAS DISTINTAS jugadas (no por cantidad de torneos).
    const datesPlayedCount = ALL_DATES.filter((d) => dateBreakdown[d] !== null).length;
    const hasConsistencyBonus = datesPlayedCount >= 4; // Threshold is explicitly 4 dates
    const consistencyBonusPoints = hasConsistencyBonus ? 15 : 0;
    const totalPoints = basePoints + consistencyBonusPoints;

    return {
      position: 0,
      player,
      category,
      totalPoints,
      basePoints,
      datesPlayedCount,
      hasConsistencyBonus,
      consistencyBonusPoints,
      dateBreakdown,
      countsByResult,
    };
  });

  // Sort descending by totalPoints
  // Tie breakers: Most Campeona (C), Most Final (F), Most Semifinal (SF), Alphabetical
  rankings.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.countsByResult.C !== a.countsByResult.C) return b.countsByResult.C - a.countsByResult.C;
    if (b.countsByResult.F !== a.countsByResult.F) return b.countsByResult.F - a.countsByResult.F;
    if (b.countsByResult.SF !== a.countsByResult.SF) return b.countsByResult.SF - a.countsByResult.SF;
    return `${a.player.lastName} ${a.player.name}`.localeCompare(`${b.player.lastName} ${b.player.name}`);
  });

  // Assign position numbers (handling ties)
  rankings.forEach((item, index) => {
    item.position = index + 1;
  });

  return rankings;
}
