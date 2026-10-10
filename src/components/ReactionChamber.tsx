import React, { useRef, useEffect } from 'react';
import { ChamberAtom, Compound } from '../types/chemistry';
import { ELEMENT_MAP } from '../data/elements';
import { CATEGORY_THEMES } from '../data/categories';
import { Trash2, AlertCircle } from 'lucide-react';

interface ReactionChamberProps {
  atoms: ChamberAtom[];
  aimPosition: number; // 10% to 90%
  onAimChange: (newAim: number) => void;
  onDropTrigger: () => void;
  fallingAtom: ChamberAtom | null;
  partialHints: { compound: Compound; missing: { symbol: string; count: number }[] }[];
  onClearChamber: () => void;
  isPaused: boolean;
  disabled?: boolean;
}

export const ReactionChamber: React.FC<ReactionChamberProps> = ({
  atoms,
  aimPosition,
  onAimChange,
  onDropTrigger,
  fallingAtom,
  partialHints,
  onClearChamber,
  isPaused,
  disabled = false,
}) => {
  const chamberRef = useRef<HTMLDivElement>(null);

  // Handle touch or mouse drag to reposition the aim line
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || isPaused || !chamberRef.current) return;
    const rect = chamberRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const relX = Math.max(10, Math.min(90, ((clientX - rect.left) / rect.width) * 100));
    onAimChange(relX);
  };

  // Click on chamber to aim and drop
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || isPaused || !chamberRef.current) return;
    handlePointerMove(e);
  };

  // Group current atoms to show convenient summary counts
  const summaryCounts: Record<string, number> = {};
  atoms.filter(a => a.landed).forEach(a => {
    summaryCounts[a.elementSymbol] = (summaryCounts[a.elementSymbol] || 0) + 1;
  });

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Aim track controller */}
      <div className="w-full max-w-sm px-4 mb-2 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          Aim & Drop Chamber
        </span>
        <div className="flex items-center gap-2">
          {atoms.length > 0 && (
            <button
              onClick={onClearChamber}
              title="Dissolve atoms in chamber"
              className="px-2 py-1 bg-slate-800/80 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 rounded text-[11px] transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Purge</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Glass Laboratory Chamber */}
      <div
        ref={chamberRef}
        onPointerDown={handlePointerDown}
        onPointerMove={(e) => {
          if (e.buttons === 1) handlePointerMove(e);
        }}
        className={`
          relative w-full max-w-sm h-72 sm:h-80 rounded-2xl lab-glass lab-chamber-glow
          border-2 border-cyan-500/30 overflow-hidden cursor-crosshair touch-none transition-all
          ${isPaused ? 'opacity-60 pointer-events-none' : ''}
        `}
      >
        {/* Laboratory beaker graduation markings */}
        <div className="absolute right-3 top-4 bottom-4 flex flex-col justify-between items-end pointer-events-none opacity-40 text-[9px] font-mono text-cyan-300">
          <div className="flex items-center gap-1"><span>800ml</span><div className="w-3 h-0.5 bg-cyan-400" /></div>
          <div className="flex items-center gap-1"><span>600ml</span><div className="w-2 h-0.5 bg-cyan-400" /></div>
          <div className="flex items-center gap-1"><span>400ml</span><div className="w-3 h-0.5 bg-cyan-400" /></div>
          <div className="flex items-center gap-1"><span>200ml</span><div className="w-2 h-0.5 bg-cyan-400" /></div>
        </div>

        {/* Ambient background particles / bubbles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-1/4 w-2 h-2 rounded-full bg-cyan-400/20 animate-bubble" style={{ animationDelay: '0.2s', animationDuration: '3.5s' }} />
          <div className="absolute left-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400/30 animate-bubble" style={{ animationDelay: '1.2s', animationDuration: '4.2s' }} />
          <div className="absolute left-3/4 w-2.5 h-2.5 rounded-full bg-teal-400/20 animate-bubble" style={{ animationDelay: '2.0s', animationDuration: '3.8s' }} />
        </div>

        {/* Aim indicator line */}
        <div
          style={{ left: `${aimPosition}%` }}
          className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed border-cyan-400/40 pointer-events-none transition-all duration-75"
        >
          {/* Aim nozzle icon at top */}
          <div className="absolute top-0 -left-2 w-4 h-2 bg-cyan-400 rounded-b shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        </div>

        {/* Chamber Floor / Reaction Catalyst Bed */}
        <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-cyan-950 to-transparent border-t border-cyan-500/20 flex items-center justify-center">
          <div className="w-16 h-1 rounded-full bg-cyan-400/30" />
        </div>

        {/* Landed Atoms inside the chamber */}
        {atoms.map((atom) => {
          const el = ELEMENT_MAP.get(atom.elementSymbol);
          const theme = el ? CATEGORY_THEMES[el.category] : CATEGORY_THEMES['reactive-nonmetal'];
          return (
            <div
              key={atom.id}
              style={{
                left: `${atom.x}%`,
                top: `${atom.y}%`,
                transform: `translate(-50%, -50%) rotate(${atom.rotation}deg)`,
                boxShadow: `0 0 12px ${theme.glow}, inset 0 0 6px ${theme.glow}`,
              }}
              className={`
                absolute w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex flex-col items-center justify-center
                ${theme.bg} ${theme.border} ${theme.text}
                transition-all duration-300 font-bold shadow-lg select-none
              `}
            >
              <span className="text-sm sm:text-base font-black leading-none drop-shadow">
                {atom.elementSymbol}
              </span>
              <span className="text-[8px] font-mono opacity-80 leading-none mt-0.5">
                {el?.atomicNumber}
              </span>
            </div>
          );
        })}

        {/* Currently falling atom animation */}
        {fallingAtom && (
          <div
            style={{
              left: `${fallingAtom.x}%`,
              top: `${fallingAtom.y}%`,
              transform: `translate(-50%, -50%) rotate(${fallingAtom.rotation}deg)`,
              boxShadow: '0 0 20px rgba(6,182,212,0.8)',
            }}
            className="absolute w-12 h-12 rounded-full border-2 border-cyan-300 bg-cyan-950/90 text-cyan-200 flex flex-col items-center justify-center z-20 font-black shadow-2xl transition-all duration-75"
          >
            <span className="text-lg leading-none drop-shadow">
              {fallingAtom.elementSymbol}
            </span>
          </div>
        )}

        {/* Empty state hint */}
        {atoms.length === 0 && !fallingAtom && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-500/80 px-6 text-center">
            <span className="text-xs font-medium">Reagent Chamber Empty</span>
            <span className="text-[11px] mt-1 text-slate-400">Aim nozzle & press DROP to place elements</span>
          </div>
        )}
      </div>

      {/* Chamber inventory status row */}
      <div className="w-full max-w-sm mt-2 px-1 flex flex-wrap items-center justify-between gap-1.5 min-h-[28px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400">In Chamber:</span>
          {Object.keys(summaryCounts).length === 0 ? (
            <span className="text-[11px] text-slate-500 italic">None</span>
          ) : (
            Object.entries(summaryCounts).map(([symbol, count]) => (
              <span
                key={symbol}
                className="px-2 py-0.5 bg-slate-900 border border-cyan-500/30 rounded text-xs text-cyan-300 font-mono font-bold"
              >
                {count}× {symbol}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Educational Hint: Missing atoms notice */}
      {partialHints.length > 0 && atoms.length > 0 && (
        <div className="w-full max-w-sm mt-2 p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-2 text-xs text-cyan-200 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="leading-tight">
            <span className="font-semibold text-cyan-300">
              {partialHints[0].compound.name} ({partialHints[0].compound.formattedFormula})
            </span>{' '}
            needs:{' '}
            <span className="text-amber-300 font-mono font-bold">
              {partialHints[0].missing.map(m => `${m.count} more ${m.symbol}`).join(' and ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
