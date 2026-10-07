import React from 'react';
import { ComputedPlayerRanking, DateId } from '../types';
import { ALL_DATES, DATE_NAMES, RESULT_LABELS, tournamentLabel } from '../utils/points';
import { X, Sparkles, Trophy, Calendar, CheckCircle2, CircleDashed } from 'lucide-react';

interface PlayerDetailModalProps {
  playerRanking: ComputedPlayerRanking | null;
  onClose: () => void;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  playerRanking,
  onClose,
}) => {
  if (!playerRanking) return null;

  const { player, totalPoints, basePoints, hasConsistencyBonus, consistencyBonusPoints, datesPlayedCount, dateBreakdown, position } = playerRanking;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[440px] bg-[#162D28] border border-[#2d574e] rounded-3xl p-5 shadow-2xl overflow-hidden text-white my-auto">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c6f135]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c6f135]/20 text-[#c6f135] text-xs font-bold border border-[#c6f135]/30 mb-2">
            <span>Posición #{position}</span>
            <span>&bull;</span>
            <span>Cat. {player.category}</span>
          </div>

          <h2 className="text-2xl font-black text-white leading-tight">
            {player.name} {player.lastName}
          </h2>

          {hasConsistencyBonus && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#c6f135] text-[#1F3D37] text-xs font-black shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bonus Consistencia Activo (+15 pts)</span>
            </div>
          )}
        </div>

        {/* Summary Points Card */}
        <div className="bg-[#1D3B35] rounded-2xl p-4 border border-[#2d574e] mb-5 grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-xs text-white/60 font-semibold mb-0.5">Fechas Jugadas</div>
            <div className="text-xl font-black text-white">{datesPlayedCount} / 6</div>
          </div>
          <div>
            <div className="text-xs text-white/60 font-semibold mb-0.5">Puntaje Total</div>
            <div className="text-2xl font-black text-[#c6f135]">{totalPoints} pts</div>
          </div>
        </div>

        {/* Date by Date Breakdown */}
        <h3 className="text-xs font-black uppercase tracking-wider text-[#c6f135] mb-3 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Desglose por Fecha (F1 a F6)
        </h3>

        <div className="space-y-2 mb-5 max-h-[260px] overflow-y-auto pr-1">
          {ALL_DATES.map((dateId) => {
            const group = dateBreakdown[dateId];
            const dateName = DATE_NAMES[dateId];

            if (group) {
              const multi = group.details.length > 1;
              return (
                <div
                  key={dateId}
                  className="p-3 rounded-xl bg-[#1D3B35]/80 border border-[#2d574e]"
                >
                  {/* Encabezado de la fecha */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#c6f135] shrink-0" />
                      <div className="text-xs font-bold text-white">{dateName}</div>
                    </div>
                    {multi && (
                      <span className="text-[11px] font-black text-[#c6f135]">
                        {group.points} pts en total
                      </span>
                    )}
                  </div>

                  {/* Un reglón por torneo jugado esa fecha */}
                  <div className={multi ? 'space-y-1 pl-6' : 'pl-6'}>
                    {group.details.map((detail, i) => {
                      const labelInfo = RESULT_LABELS[detail.resultType];
                      const tLabel = tournamentLabel(detail.tournament);
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <div className="text-[11px] text-white/70">
                            {multi && (
                              <span className="font-bold text-white/90">{tLabel}: </span>
                            )}
                            {labelInfo?.full || detail.resultType}
                          </div>
                          <span className={`inline-block px-2 py-0.5 rounded-lg border text-xs font-extrabold ${labelInfo?.bgClass} ${labelInfo?.textClass}`}>
                            +{detail.points} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            } else {
              return (
                <div
                  key={dateId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-white/40"
                >
                  <div className="flex items-center gap-2.5">
                    <CircleDashed className="w-4 h-4 shrink-0 text-white/30" />
                    <span className="text-xs font-medium">{dateName}</span>
                  </div>
                  <span className="text-xs italic">Sin participar (0 pts)</span>
                </div>
              );
            }
          })}
        </div>

        {/* Bonus Formula Explanation */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 space-y-1">
          <div className="flex justify-between font-medium">
            <span>Puntos por Fechas Jugadas:</span>
            <span className="font-bold text-white">{basePoints} pts</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Bonus Consistencia (&ge;4 Fechas):</span>
            <span className={`font-bold ${hasConsistencyBonus ? 'text-[#c6f135]' : 'text-white/40'}`}>
              +{consistencyBonusPoints} pts
            </span>
          </div>
          <div className="border-t border-white/10 pt-1 flex justify-between font-black text-white text-sm">
            <span>Total Final:</span>
            <span className="text-[#c6f135]">{totalPoints} pts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
