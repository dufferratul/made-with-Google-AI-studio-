import React, { useState } from 'react';
import { Compound } from '../types/chemistry';
import { COMPOUNDS, COMPOUND_MAP } from '../data/compounds';
import { MoleculeVisualizer } from './MoleculeVisualizer';
import { sound } from '../utils/audio';
import { X, Lock, CheckCircle2, Zap, ArrowRight, BookOpen } from 'lucide-react';

interface MyCompoundsModalProps {
  discoveredCompoundIds: string[];
  onClose: () => void;
}

export const MyCompoundsModal: React.FC<MyCompoundsModalProps> = ({
  discoveredCompoundIds,
  onClose,
}) => {
  const [selectedCompound, setSelectedCompound] = useState<Compound | null>(null);

  const discoveredSet = new Set(discoveredCompoundIds);
  const totalCount = COMPOUNDS.length;
  const discoveredCount = discoveredSet.size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl h-[90vh] max-h-[800px] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Compound Encyclopedia
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                {discoveredCount} / {totalCount} Synthesized
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Formulas, balanced formation equations, and molecular geometries.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-3 shrink-0">
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${(discoveredCount / totalCount) * 100}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
            />
          </div>
          <span className="text-xs font-mono font-bold text-cyan-300">
            {Math.round((discoveredCount / totalCount) * 100)}%
          </span>
        </div>

        {/* Compound Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 content-start">
          {COMPOUNDS.map((compound) => {
            const isDiscovered = discoveredSet.has(compound.id);

            return (
              <div
                key={compound.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedCompound(compound);
                }}
                className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer relative ${
                  isDiscovered
                    ? 'bg-slate-850/80 hover:bg-slate-800 border-cyan-500/30 hover:border-cyan-400/70 shadow-md'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-white">
                        {isDiscovered ? compound.name : 'Unknown Compound'}
                      </span>
                      {isDiscovered ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                    </div>
                    <div className="font-mono text-sm font-bold text-cyan-400 mt-0.5">
                      {isDiscovered ? compound.formattedFormula : '???'}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Level {compound.difficultyLevel}
                  </span>
                </div>

                {isDiscovered ? (
                  <div className="mt-3 text-xs text-slate-400 font-mono truncate">
                    {compound.balancedEquation}
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-slate-500 italic">
                    Synthesize in Level {compound.difficultyLevel} to uncover formula
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detailed Compound Card Modal */}
        {selectedCompound && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-cyan-500/50 p-5 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedCompound(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-3">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 uppercase font-bold tracking-wider">
                  {selectedCompound.category}
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {selectedCompound.name}
                </h3>
                <div className="text-xl font-mono font-bold text-cyan-300">
                  {selectedCompound.formattedFormula}
                </div>
              </div>

              {/* Molecule Visualizer */}
              <div className="flex justify-center my-3">
                <MoleculeVisualizer compound={selectedCompound} size="md" />
              </div>

              {/* Balanced Equation */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 mb-3">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mb-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Balanced Formation Equation</span>
                </div>
                <div className="font-mono text-sm font-bold text-emerald-400">
                  {selectedCompound.balancedEquation}
                </div>
              </div>

              {/* Atom Ratio & Bonding */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 mb-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Bonding Type</span>
                  <span className="font-semibold text-slate-200">{selectedCompound.bondingType}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Atom Requirements</span>
                  <span className="font-mono font-semibold text-cyan-300">
                    {Object.entries(selectedCompound.requiredElements)
                      .map(([sym, count]) => `${count}× ${sym}`)
                      .join(' + ')}
                  </span>
                </div>
              </div>

              {/* Educational Fact */}
              <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-3 mb-4 text-xs leading-relaxed text-slate-300">
                <p className="mb-2 font-medium">{selectedCompound.description}</p>
                <div className="pt-2 border-t border-cyan-900/40 text-[11px] text-cyan-200">
                  <strong>Scientific Fact:</strong> {selectedCompound.educationalFact}
                </div>
              </div>

              <button
                onClick={() => setSelectedCompound(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Compound Sheet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
