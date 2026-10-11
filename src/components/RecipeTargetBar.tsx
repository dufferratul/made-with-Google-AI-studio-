import React from 'react';
import { Compound } from '../types/chemistry';
import { COMPOUND_MAP } from '../data/compounds';
import { Sparkles, Check, ChevronRight } from 'lucide-react';

interface RecipeTargetBarProps {
  targetCompoundId: string;
  chamberAtoms: { elementSymbol: string }[];
  onOpenDetails: (compound: Compound) => void;
}

export const RecipeTargetBar: React.FC<RecipeTargetBarProps> = ({
  targetCompoundId,
  chamberAtoms,
  onOpenDetails,
}) => {
  const target = COMPOUND_MAP.get(targetCompoundId);
  if (!target) return null;

  // Count current chamber atoms
  const currentCounts: Record<string, number> = {};
  chamberAtoms.forEach((a) => {
    currentCounts[a.elementSymbol] = (currentCounts[a.elementSymbol] || 0) + 1;
  });

  // Build the list of required atom slots
  const slots: { symbol: string; satisfied: boolean; index: number }[] = [];
  const trackingCount: Record<string, number> = {};

  for (const [symbol, count] of Object.entries(target.requiredElements)) {
    for (let i = 0; i < count; i++) {
      trackingCount[symbol] = (trackingCount[symbol] || 0) + 1;
      const satisfied = (currentCounts[symbol] || 0) >= trackingCount[symbol];
      slots.push({ symbol, satisfied, index: slots.length });
    }
  }

  const allSatisfied = slots.every((s) => s.satisfied);

  return (
    <div
      onClick={() => onOpenDetails(target)}
      className="w-full max-w-sm mx-auto mb-2 p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-850/90 to-slate-900/90 border border-cyan-500/40 shadow-lg cursor-pointer hover:border-cyan-400 transition-all select-none"
    >
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
            Target Recipe:
          </span>
          <span className="text-xs font-bold text-white">
            {target.name}
          </span>
          <span className="text-xs font-mono font-extrabold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-500/30">
            {target.formattedFormula}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 flex items-center gap-0.5 hover:text-white">
          <span>Formula</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>

      {/* Ingredient Slots */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
          {slots.map((slot) => (
            <div
              key={slot.index}
              className={`flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold font-mono transition-all duration-300 ${
                slot.satisfied
                  ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300 shadow-sm shadow-emerald-500/20 scale-105'
                  : 'bg-slate-800/80 border border-slate-700/80 text-slate-400'
              }`}
            >
              {slot.satisfied ? (
                <Check className="w-3 h-3 stroke-[3] text-emerald-400 animate-bounce" />
              ) : null}
              <span>{slot.symbol}</span>
            </div>
          ))}
        </div>

        {allSatisfied && (
          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/40 animate-pulse whitespace-nowrap">
            ✨ READY TO BOND!
          </span>
        )}
      </div>
    </div>
  );
};
