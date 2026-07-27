import { Category, DateId, ResultType, Player, ResultRecord, ComputedPlayerRanking, DateResultDetail } from '../types';

export const RESULT_POINTS: Record<ResultType, number> = {
  P: 20,
  SF: 25,
  F: 30,
  C: 40,
};

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
 * Consistency Bonus: +15 pts if player played >= 4 dates.
 */
export function computeRankingsForCategory(
  players: Player[],
  results: ResultRecord[],
  category: Category
): ComputedPlayerRanking[] {
  const categoryPlayers = players.filter((p) => p.category === category);

  const rankings: ComputedPlayerRanking[] = categoryPlayers.map((player) => {
    const playerResults = results.filter((r) => r.playerId === player.id);

    const dateBreakdown: Record<DateId, DateResultDetail | null> = {
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
      dateBreakdown[r.dateId] = {
        dateId: r.dateId,
        resultType: r.resultType,
        points: pts,
        label: RESULT_LABELS[r.resultType]?.full || r.resultType,
      };
    });

    const datesPlayedCount = playerResults.length;
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
