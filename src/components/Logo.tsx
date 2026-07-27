import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'lime' | 'dark';
  className?: string;
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'light',
  className = '',
  showSubtitle = false,
}) => {
  // Size scales for NODO text and Ladies cursive overlay
  const nodoSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
    xl: 'text-6xl sm:text-7xl',
  };

  const ladiesSizes = {
    sm: 'text-2xl -bottom-1 -right-1',
    md: 'text-4xl -bottom-2 -right-1.5',
    lg: 'text-5xl -bottom-2.5 -right-2',
    xl: 'text-6xl sm:text-7xl -bottom-3 -right-2',
  };

  const textColor =
    variant === 'dark'
      ? 'text-[#122823]'
      : variant === 'lime'
      ? 'text-[#c6f135]'
      : 'text-white';

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* Logo Typography Container */}
      <div className="relative inline-block leading-none py-1.5 px-2">
        {/* NODO Main Geometric Typography */}
        <span
          className={`font-['Outfit','Montserrat',sans-serif] font-black uppercase ${textColor} ${nodoSizes[size]} leading-none block tracking-[0.03em]`}
        >
          NODO
        </span>

        {/* Ladies Script Overlay Typography */}
        <span
          className={`absolute font-['Caveat','Dancing_Script','Sacramento',cursive] font-bold text-[#f4a7db] ${ladiesSizes[size]} transform -rotate-6 pointer-events-none select-none`}
          style={{
            filter: 'drop-shadow(0px 2.5px 4px rgba(0,0,0,0.45))',
            lineHeight: 0.8,
          }}
        >
          Ladies
        </span>
      </div>

      {showSubtitle && (
        <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#c6f135] mt-1.5">
          Circuito de Pádel &bull; Villa Ramallo
        </span>
      )}
    </div>
  );
};
