import React from 'react';
import { ElementData } from '../types/chemistry';
import { CATEGORY_THEMES } from '../data/categories';
import { ELEMENT_MAP } from '../data/elements';

interface ElementTileProps {
  element: ElementData | string; // Can be ElementData or symbol
  size?: 'sm' | 'md' | 'lg' | 'spawner';
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  showMass?: boolean;
  highlight?: boolean;
}

export const ElementTile: React.FC<ElementTileProps> = ({
  element: elementProp,
  size = 'md',
  interactive = false,
  onClick,
  className = '',
  showMass = true,
  highlight = false,
}) => {
  const element: ElementData | undefined =
    typeof elementProp === 'string' ? ELEMENT_MAP.get(elementProp) : elementProp;

  if (!element) {
    return (
      <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-xs text-slate-400">
        ?
      </div>
    );
  }

  const theme = CATEGORY_THEMES[element.category] || CATEGORY_THEMES['reactive-nonmetal'];

  // Size styling maps
  const sizeClasses = {
    sm: 'w-11 h-12 p-1 text-[10px]',
    md: 'w-16 h-20 p-1.5 text-xs',
    lg: 'w-24 h-28 p-2 text-sm',
    spawner: 'w-28 h-32 p-2.5 text-sm sm:w-32 sm:h-36',
  };

  const symbolSizes = {
    sm: 'text-base font-bold',
    md: 'text-2xl font-black',
    lg: 'text-3xl font-black',
    spawner: 'text-4xl sm:text-5xl font-black tracking-tight',
  };

  return (
    <div
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      style={{
        boxShadow: highlight
          ? `0 0 20px ${theme.glow}, inset 0 0 12px ${theme.glow}`
          : `0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`,
      }}
      className={`
        relative select-none rounded-xl border transition-all duration-200 flex flex-col justify-between items-center
        ${theme.bg} ${theme.border} ${theme.text}
        ${sizeClasses[size]}
        ${interactive ? 'cursor-pointer hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400' : ''}
        ${highlight ? 'ring-2 ring-cyan-400 animate-pulse' : ''}
        ${className}
      `}
    >
      {/* Top row: Atomic Number and Category Indicator */}
      <div className="w-full flex justify-between items-center px-0.5 leading-none">
        <span className="font-mono text-[9px] sm:text-[10px] opacity-80 font-bold">
          {element.atomicNumber}
        </span>
        {size !== 'sm' && (
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider opacity-60 font-semibold truncate max-w-[55px]">
            {element.category.replace('-', ' ')}
          </span>
        )}
      </div>

      {/* Center: Large Chemical Symbol */}
      <div className="flex flex-col items-center justify-center my-auto">
        <span className={`${symbolSizes[size]} text-white drop-shadow-md leading-none`}>
          {element.symbol}
        </span>
        {size !== 'sm' && (
          <span className="text-[9px] sm:text-[11px] font-semibold tracking-wide text-slate-200 mt-0.5 truncate max-w-full text-center px-0.5">
            {element.name}
          </span>
        )}
      </div>

      {/* Bottom: Atomic mass */}
      {showMass && size !== 'sm' && (
        <div className="w-full text-center leading-none">
          <span className="font-mono text-[8px] sm:text-[9px] opacity-75">
            {element.atomicMass.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};
