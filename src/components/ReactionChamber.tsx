import React, { useRef, useState, useEffect } from 'react';
import { ChamberAtom, Compound } from '../types/chemistry';
import { ELEMENT_MAP } from '../data/elements';
import { CATEGORY_THEMES } from '../data/categories';
import { ParticleCanvas, ParticleEffect } from './ParticleCanvas';
import { Trash2, AlertCircle, Zap, Magnet, Sparkles, X } from 'lucide-react';

export interface FloatingText {
  id: string;
  text: string;
  x: number; // percentage
  y: number; // percentage
  color?: string;
}

interface ReactionChamberProps {
  atoms: ChamberAtom[];
  aimPosition: number; // 10% to 90%
  onAimChange: (newAim: number) => void;
  onDropTrigger: () => void;
  fallingAtom: ChamberAtom | null;
  partialHints: { compound: Compound; missing: { symbol: string; count: number }[] }[];
  onClearChamber: () => void;
  onZapAtom?: (atomId: string) => void;
  onMagnetPull?: () => void;
  isPaused: boolean;
  disabled?: boolean;
  floatingScores: FloatingText[];
  burstParticles: ParticleEffect[];
  activeCombo: number;
}

export const ReactionChamber: React.FC<ReactionChamberProps> = ({
  atoms,
  aimPosition,
  onAimChange,
  onDropTrigger,
  fallingAtom,
  partialHints,
  onClearChamber,
  onZapAtom,
  onMagnetPull,
  isPaused,
  disabled = false,
  floatingScores,
  burstParticles,
  activeCombo,
}) => {
  const chamberRef = useRef<HTMLDivElement>(null);
  const [zapModeActive, setZapModeActive] = useState<boolean>(false);
  const isPointerDownRef = useRef<boolean>(false);

  // Handle pointer interactions across the entire chamber for fluid Suika-style aiming & dropping
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || isPaused || !chamberRef.current || zapModeActive) return;
    isPointerDownRef.current = true;
    updateAimFromEvent(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || isPaused || !chamberRef.current || !isPointerDownRef.current || zapModeActive) return;
    updateAimFromEvent(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || zapModeActive) return;
    isPointerDownRef.current = false;
    // On pointer release, trigger the drop for intuitive drag-and-release fun!
    if (!disabled && !isPaused && !fallingAtom) {
      onDropTrigger();
    }
  };

  const updateAimFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!chamberRef.current) return;
    const rect = chamberRef.current.getBoundingClientRect();
    const relX = Math.max(12, Math.min(88, ((e.clientX - rect.left) / rect.width) * 100));
    onAimChange(relX);
  };

  // Group current atoms to show convenient summary counts
  const summaryCounts: Record<string, number> = {};
  atoms.filter((a) => a.landed).forEach((a) => {
    summaryCounts[a.elementSymbol] = (summaryCounts[a.elementSymbol] || 0) + 1;
  });

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Chamber Header & Arcade Power-Ups */}
      <div className="w-full max-w-sm px-2 mb-2 flex items-center justify-between text-xs">
        {/* Combo Multiplier Banner */}
        <div className="flex items-center gap-1.5">
          {activeCombo > 1 ? (
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/30 animate-pulse flex items-center gap-1">
              <span>🔥 COMBO x{activeCombo}!</span>
            </span>
          ) : (
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Reaction Vessel
            </span>
          )}
        </div>

        {/* Lab Action Tools */}
        <div className="flex items-center gap-1.5">
          {/* Laser Zap Tool Toggle */}
          {atoms.length > 0 && onZapAtom && (
            <button
              onClick={() => setZapModeActive(!zapModeActive)}
              title={zapModeActive ? 'Cancel Zap' : 'Laser Zap single atom'}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                zapModeActive
                  ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/30 ring-2 ring-rose-400'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-rose-300 border border-slate-700'
              }`}
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>{zapModeActive ? 'Tap Atom' : 'Laser'}</span>
            </button>
          )}

          {/* Magnet Pull Tool */}
          {atoms.length >= 2 && onMagnetPull && (
            <button
              onClick={onMagnetPull}
              title="Magnetic Bond Pull"
              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1 transition-all active:scale-95"
            >
              <Magnet className="w-3 h-3 text-cyan-400" />
              <span>Bond</span>
            </button>
          )}

          {/* Purge Chamber */}
          {atoms.length > 0 && (
            <button
              onClick={onClearChamber}
              title="Clear all atoms from chamber"
              className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Glass Laboratory Chamber */}
      <div
        ref={chamberRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          isPointerDownRef.current = false;
        }}
        className={`
          relative w-full max-w-sm h-72 sm:h-80 rounded-3xl lab-glass lab-chamber-glow
          border-2 border-cyan-500/40 overflow-hidden cursor-pointer touch-none transition-all
          ${isPaused ? 'opacity-60 pointer-events-none' : ''}
          ${zapModeActive ? 'ring-2 ring-rose-500 border-rose-400 cursor-crosshair' : ''}
        `}
      >
        {/* Particle Canvas on top of chamber */}
        <ParticleCanvas bursts={burstParticles} />

        {/* Laboratory beaker graduation markings */}
        <div className="absolute right-3 top-4 bottom-4 flex flex-col justify-between items-end pointer-events-none opacity-40 text-[9px] font-mono text-cyan-300">
          <div className="flex items-center gap-1"><span>800ml</span><div className="w-3 h-0.5 bg-cyan-400" /></div>
          <div className="flex items-center gap-1"><span>600ml</span><div className="w-2 h-0.5 bg-cyan-400" /></div>
          <div className="flex items-center gap-1"><span>400ml</span><div className="w-3 h-0.5 bg-cyan-400" /></div>
          <div className="flex items-center gap-1"><span>200ml</span><div className="w-2 h-0.5 bg-cyan-400" /></div>
        </div>

        {/* Floating animated scores and combo popups */}
        {floatingScores.map((score) => (
          <div
            key={score.id}
            style={{
              left: `${score.x}%`,
              top: `${score.y}%`,
            }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 font-black text-sm sm:text-base font-mono drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] pointer-events-none z-40 animate-bounce text-cyan-300"
          >
            {score.text}
          </div>
        ))}

        {/* Laser zap mode indicator banner */}
        {zapModeActive && (
          <div className="absolute top-2 inset-x-2 py-1 bg-rose-600/90 text-white font-bold text-xs rounded-xl text-center shadow-lg z-30 animate-pulse flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Laser Ready: Tap any atom below to dissolve it</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZapModeActive(false);
              }}
              className="ml-2 p-0.5 bg-rose-950/80 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Aim indicator line with glowing laser nozzle */}
        {!zapModeActive && (
          <div
            style={{ left: `${aimPosition}%` }}
            className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed border-cyan-400/50 pointer-events-none transition-all duration-75"
          >
            {/* Aim nozzle icon */}
            <div className="absolute top-0 -left-2.5 w-5 h-3 bg-cyan-400 rounded-b-md shadow-[0_0_12px_rgba(6,182,212,1)]" />
            {/* Subtle laser targeting dot at floor */}
            <div className="absolute bottom-2 -left-1 w-2 h-2 rounded-full bg-cyan-400/80 shadow-[0_0_8px_rgba(6,182,212,1)] animate-ping" />
          </div>
        )}

        {/* Chamber Floor Catalyst Bed */}
        <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-cyan-950 to-transparent border-t border-cyan-500/20 flex items-center justify-center">
          <div className="w-20 h-1 rounded-full bg-cyan-400/40" />
        </div>

        {/* Landed Atoms inside the chamber */}
        {atoms.map((atom) => {
          const el = ELEMENT_MAP.get(atom.elementSymbol);
          const theme = el ? CATEGORY_THEMES[el.category] : CATEGORY_THEMES['reactive-nonmetal'];

          return (
            <div
              key={atom.id}
              onClick={(e) => {
                if (zapModeActive && onZapAtom) {
                  e.stopPropagation();
                  onZapAtom(atom.id);
                  setZapModeActive(false);
                }
              }}
              style={{
                left: `${atom.x}%`,
                top: `${atom.y}%`,
                transform: `translate(-50%, -50%) rotate(${atom.rotation}deg)`,
                boxShadow: `0 0 16px ${theme.glow}, inset 0 2px 4px rgba(255,255,255,0.4)`,
              }}
              className={`
                absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex flex-col items-center justify-center
                ${theme.bg} ${theme.border} ${theme.text}
                transition-all duration-300 font-bold shadow-xl select-none
                ${zapModeActive ? 'cursor-pointer hover:scale-110 hover:border-rose-400 hover:ring-2 hover:ring-rose-400 animate-pulse' : 'hover:scale-105'}
              `}
            >
              {/* Glossy top-left 3D shine */}
              <div className="absolute top-1 left-2 w-3.5 h-2 rounded-full bg-white/35 blur-[0.5px] pointer-events-none" />

              <span className="text-base sm:text-lg font-black leading-none drop-shadow-md text-white">
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
              boxShadow: '0 0 24px rgba(6,182,212,0.9), inset 0 2px 6px rgba(255,255,255,0.6)',
            }}
            className="absolute w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 border-cyan-300 bg-cyan-950/90 text-white flex flex-col items-center justify-center z-20 font-black shadow-2xl transition-all duration-75"
          >
            <div className="absolute top-1 left-2 w-4 h-2 rounded-full bg-white/40 blur-[0.5px]" />
            <span className="text-lg leading-none drop-shadow">
              {fallingAtom.elementSymbol}
            </span>
          </div>
        )}

        {/* Empty state hint */}
        {atoms.length === 0 && !fallingAtom && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 px-6 text-center">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Drag & Release or Tap DROP</span>
            </span>
            <span className="text-[11px] mt-1 text-slate-400">
              Combine elements to trigger chemical bonds!
            </span>
          </div>
        )}
      </div>

      {/* Chamber inventory status row */}
      <div className="w-full max-w-sm mt-2 px-1 flex flex-wrap items-center justify-between gap-1.5 min-h-[28px]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400">In Vessel:</span>
          {Object.keys(summaryCounts).length === 0 ? (
            <span className="text-[11px] text-slate-500 italic">Empty</span>
          ) : (
            Object.entries(summaryCounts).map(([symbol, count]) => (
              <span
                key={symbol}
                className="px-2 py-0.5 bg-slate-900 border border-cyan-500/30 rounded-lg text-xs text-cyan-300 font-mono font-bold"
              >
                {count}× {symbol}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Educational Hint: Missing atoms notice */}
      {partialHints.length > 0 && atoms.length > 0 && (
        <div className="w-full max-w-sm mt-1.5 p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-2 text-xs text-cyan-200 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="leading-tight">
            <span className="font-semibold text-cyan-300">
              {partialHints[0].compound.name} ({partialHints[0].compound.formattedFormula})
            </span>{' '}
            needs:{' '}
            <span className="text-amber-300 font-mono font-bold">
              {partialHints[0].missing.map((m) => `${m.count} more ${m.symbol}`).join(' and ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
