import React from 'react';
import { Category } from '../types';
import { ShieldCheck, MapPin, Trophy } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  selectedCategory: Category;
  onSelectCategory: (cat: Category) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const categories: Category[] = ['8va', '7ma', '6ta'];

  return (
    <header className="w-full max-w-[440px] mx-auto pt-6 pb-4 px-4 text-center select-none">
      {/* Top Bar with Admin Pin Trigger */}
      <div className="flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#162D28] border border-[#2d574e] text-xs text-[#c6f135] font-semibold tracking-wide">
          <MapPin className="w-3.5 h-3.5 text-[#c6f135]" />
          <span>Villa Ramallo, Arg.</span>
        </div>

        <button
          onClick={onOpenAdmin}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
            isAdminLoggedIn
              ? 'bg-[#f9a8d4] text-[#1F3D37] shadow-sm font-black'
              : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
          }`}
          title={isAdminLoggedIn ? 'Panel de Administración Activo' : 'Acceso Administración'}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isAdminLoggedIn ? 'Admin Activo' : 'Admin'}</span>
        </button>
      </div>

      {/* Brand Identity with NODO Ladies Logo */}
      <div className="relative py-2 flex flex-col items-center">
        <Logo size="xl" showSubtitle={true} />

        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-[#162D28] border border-[#2d574e]">
          <Trophy className="w-3.5 h-3.5 text-[#c6f135]" />
          <span className="text-xs text-white/90 font-semibold">
            Ranking Oficial <span className="text-[#f4a7db] font-extrabold">2026</span> &bull; 6 Fechas
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mt-5 p-1 bg-[#162D28] rounded-2xl border border-[#2d574e] grid grid-cols-3 gap-1 shadow-inner">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`py-2.5 px-3 rounded-xl font-extrabold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 ${
                isActive
                  ? 'bg-[#c6f135] text-[#1F3D37] shadow-lg scale-[1.02]'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{cat}</span>
              <span className="text-[10px] opacity-75 font-normal">Cat.</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

