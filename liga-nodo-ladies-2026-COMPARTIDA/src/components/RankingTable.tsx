import React, { useState } from 'react';
import { ComputedPlayerRanking, Category } from '../types';
import { Search, Sparkles, ChevronRight, Trophy, Star, Award, ShieldAlert } from 'lucide-react';

interface RankingTableProps {
  rankings: ComputedPlayerRanking[];
  category: Category;
  onSelectPlayer: (playerRanking: ComputedPlayerRanking) => void;
}

export const RankingTable: React.FC<RankingTableProps> = ({
  rankings,
  category,
  onSelectPlayer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter by search query
  const filteredRankings = rankings.filter((r) => {
    const fullName = `${r.player.name} ${r.player.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase().trim());
  });

  return (
    <div className="w-full max-w-[440px] mx-auto px-4 pb-12">
      {/* Search Input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-white/40" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Buscar jugadora en ${category}...`}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#162D28] border border-[#2d574e] text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#c6f135] focus:ring-1 focus:ring-[#c6f135] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-white/50 hover:text-white"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Rules Banner Info */}
      <div className="flex items-center justify-between text-[11px] text-white/60 px-1 mb-2.5 font-medium">
        <span>Puntos: C=40 &bull; F=30 &bull; SF=25 &bull; P=20</span>
        <span className="text-[#c6f135] flex items-center gap-1 font-bold">
          <Sparkles className="w-3 h-3" />
          Bonus +15 (&ge;4 fechas)
        </span>
      </div>

      {/* Ranking List */}
      {filteredRankings.length === 0 ? (
        <div className="bg-[#162D28] rounded-2xl p-6 text-center border border-[#2d574e] text-white/60">
          <p className="text-sm font-semibold mb-1">No se encontraron jugadoras</p>
          <p className="text-xs text-white/40">
            {searchQuery
              ? `No hay coincidencias para "${searchQuery}"`
              : `Aún no hay participantes registradas en categoría ${category}`}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredRankings.map((item) => {
            const isTop1 = item.position === 1;
            const isTop2 = item.position === 2;
            const isTop3 = item.position === 3;

            return (
              <div
                key={item.player.id}
                onClick={() => onSelectPlayer(item)}
                className={`relative group overflow-hidden rounded-2xl p-3.5 transition-all duration-200 cursor-pointer border flex items-center justify-between ${
                  isTop1
                    ? 'bg-gradient-to-r from-[#23483f] to-[#1A3732] border-[#c6f135]/50 shadow-md hover:border-[#c6f135]'
                    : isTop2
                    ? 'bg-[#18332d] border-[#2d574e] hover:border-white/30'
                    : isTop3
                    ? 'bg-[#18332d] border-[#2d574e] hover:border-white/30'
                    : 'bg-[#162D28]/90 border-[#254740] hover:border-white/20'
                }`}
              >
                {/* Left side: Position + Player Info */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {/* Position Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${
                      isTop1
                        ? 'bg-[#c6f135] text-[#1F3D37] ring-2 ring-[#c6f135]/30'
                        : isTop2
                        ? 'bg-slate-200 text-slate-900'
                        : isTop3
                        ? 'bg-amber-700/80 text-amber-100 border border-amber-500/50'
                        : 'bg-white/10 text-white/80'
                    }`}
                  >
                    {isTop1 ? (
                      <Trophy className="w-5 h-5 text-[#1F3D37]" />
                    ) : (
                      <span>#{item.position}</span>
                    )}
                  </div>

                  {/* Player Name and Badges */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-white text-base leading-tight truncate">
                        {item.player.lastName}, {item.player.name}
                      </h4>

                      {/* Consistency Bonus Badge */}
                      {item.hasConsistencyBonus && (
                        <span
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#c6f135]/20 text-[#c6f135] border border-[#c6f135]/40 text-[10px] font-black shrink-0"
                          title="Bonus de Consistencia (+15 pts por jugar 4 o más fechas)"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          +15 Bonus
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-white/60 font-medium mt-0.5">
                      <span>{item.datesPlayedCount}/6 Fechas jugadas</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Points & Arrow */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-black text-[#c6f135] tracking-tight leading-none">
                      {item.totalPoints}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">
                      puntos
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-[#c6f135] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
