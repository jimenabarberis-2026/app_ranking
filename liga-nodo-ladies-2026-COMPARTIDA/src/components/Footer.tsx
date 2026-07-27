import React from 'react';
import { Lock, Heart } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, isAdminLoggedIn }) => {
  return (
    <footer className="w-full max-w-[440px] mx-auto px-4 py-6 text-center text-xs text-white/50 border-t border-white/10 mt-auto">
      <div className="flex items-center justify-center gap-1.5 font-semibold text-white/70 mb-1">
        <span>Liga NODO Ladies 2026 &bull; Villa Ramallo, Arg.</span>
      </div>
      <p className="text-[11px] text-white/40 mb-3">
        6 Fechas &bull; Categorías 8va, 7ma y 6ta
      </p>

      <button
        onClick={onOpenAdmin}
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold text-white/40 hover:text-white/80 transition cursor-pointer bg-white/5 hover:bg-white/10"
      >
        <Lock className="w-3 h-3" />
        <span>{isAdminLoggedIn ? 'Panel Admin Activo' : 'Acceso Administrador'}</span>
      </button>
    </footer>
  );
};
