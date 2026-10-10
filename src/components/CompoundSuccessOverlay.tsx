import React from 'react';
import { Compound } from '../types/chemistry';
import { MoleculeVisualizer } from './MoleculeVisualizer';
import { Sparkles, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

interface CompoundSuccessOverlayProps {
  compound: Compound;
  onProceedToMCQ: () => void;
}

export const CompoundSuccessOverlay: React.FC<CompoundSuccessOverlayProps> = ({
  compound,
  onProceedToMCQ,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/50 p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow ambient circle */}
        <div className="absolute -top-16 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Tag */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 border border-cyan-400/40 rounded-full text-cyan-300 text-xs font-bold tracking-wide uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>Chemical Reaction Complete!</span>
        </div>

        {/* Compound Name & Formula */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {compound.name}
        </h2>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-mono font-bold text-cyan-400 bg-cyan-950/60 px-3 py-0.5 rounded-lg border border-cyan-500/30">
            {compound.formattedFormula}
          </span>
          <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
            {compound.bondingType}
          </span>
        </div>

        {/* 2D/3D Molecule Structure Visual */}
        <div className="my-4">
          <MoleculeVisualizer compound={compound} size="md" />
        </div>

        {/* Balanced Equation */}
        <div className="w-full bg-slate-950/70 rounded-xl p-3 border border-slate-800 mb-3 text-left">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mb-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Balanced Reaction Equation</span>
          </div>
          <div className="font-mono text-sm sm:text-base font-semibold text-emerald-400 tracking-wide">
            {compound.balancedEquation}
          </div>
        </div>

        {/* Educational explanation */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 text-left bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          {compound.description}
        </p>

        {/* Action Button */}
        <button
          onClick={onProceedToMCQ}
          className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Take Chemistry MCQ Challenge</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
