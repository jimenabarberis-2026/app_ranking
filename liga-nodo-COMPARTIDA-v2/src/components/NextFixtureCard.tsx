import React from 'react';
import { NextFixture } from '../types';
import { Calendar, Clock, MapPin, BellRing, Info } from 'lucide-react';

interface NextFixtureCardProps {
  fixture: NextFixture;
  onOpenNotifications: () => void;
  subscribersCount?: number;
}

export const NextFixtureCard: React.FC<NextFixtureCardProps> = ({
  fixture,
  onOpenNotifications,
  subscribersCount = 0,
}) => {
  return (
    <div className="w-full max-w-[440px] mx-auto px-4 mb-5">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#18332d] to-[#122823] rounded-2xl p-4 border border-[#2d574e] nodo-brand-shadow">
        {/* Subtle decorative glows (lime and pink) */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#c6f135]/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#f472b6]/15 rounded-full blur-xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f9a8d4] animate-pulse" />
            <h3 className="text-xs font-black tracking-wider uppercase text-[#c6f135]">
              Próxima Fecha Destacada
            </h3>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#f9a8d4]/20 text-[#f9a8d4] border border-[#f9a8d4]/40">
            NODO Ladies
          </span>
        </div>

        {/* Date, Time, Venue Details */}
        <div className="space-y-2 text-sm text-white/90 font-semibold mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#c6f135]/10 border border-[#c6f135]/20 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-[#c6f135]" />
            </div>
            <span className="text-white font-bold">{fixture.dateText}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#c6f135]/10 border border-[#c6f135]/20 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-[#c6f135]" />
            </div>
            <span>{fixture.timeText}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#c6f135]/10 border border-[#c6f135]/20 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-[#c6f135]" />
            </div>
            <span className="text-white/90">{fixture.venueText}</span>
          </div>

          {fixture.notes && (
            <div className="flex items-start gap-2.5 pt-1 text-xs text-white/70 font-normal italic">
              <Info className="w-3.5 h-3.5 text-[#c6f135] shrink-0 mt-0.5" />
              <span>{fixture.notes}</span>
            </div>
          )}
        </div>

        {/* WhatsApp Notification CTA Button */}
        <button
          onClick={onOpenNotifications}
          className="w-full mt-2 py-2.5 px-3 rounded-xl bg-[#c6f135] hover:bg-[#b5de2f] text-[#1F3D37] font-extrabold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer active:scale-[0.98]"
        >
          <BellRing className="w-4 h-4 text-[#1F3D37]" />
          <span>Recibir Alertas por WhatsApp</span>
          {subscribersCount > 0 && (
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-[#1F3D37]/20 text-[#1F3D37] font-bold">
              {subscribersCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
