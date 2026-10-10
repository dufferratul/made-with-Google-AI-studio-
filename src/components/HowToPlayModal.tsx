import React from 'react';
import { sound } from '../utils/audio';
import { X, Play, HelpCircle, Target, Sparkles, CheckCircle2, Award, Zap } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
  onStartGame?: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  onClose,
  onStartGame,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl h-[90vh] max-h-[750px] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                How to Play Element Bond
              </h2>
              <p className="text-xs text-slate-400">
                Master the controls, reaction mechanics, and scoring rules.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-slate-300 text-xs sm:text-sm">
          {/* Step 1: Aim & Drop */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold shrink-0">
              1
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">
                Aim & Drop Chemical Elements
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Elements appear at the top spawning station. Drag or tap across the chamber to choose your horizontal drop column. Tap the large <strong>DROP</strong> button (or press <strong>Spacebar</strong> or <strong>↓ Arrow</strong> on keyboard) to release the element into the reaction vessel.
              </p>
            </div>
          </div>

          {/* Step 2: Combine Elements */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-mono font-bold shrink-0">
              2
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">
                Form Valid Chemical Compounds
              </h3>
              <p className="text-slate-300 leading-relaxed mb-2">
                Accumulate the exact stoichiometric atoms needed for real compounds:
              </p>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 space-y-1">
                <div>• 2 H + 1 O = Water (H₂O)</div>
                <div>• 1 Na + 1 Cl = Sodium chloride (NaCl)</div>
                <div>• 1 C + 2 O = Carbon dioxide (CO₂)</div>
                <div>• 1 N + 3 H = Ammonia (NH₃)</div>
              </div>
            </div>
          </div>

          {/* Step 3: Missing Atom Guidance */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-mono font-bold shrink-0">
              3
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">
                Educational Hints & Missing Atoms
              </h3>
              <p className="text-slate-300 leading-relaxed">
                If you have only 1 Hydrogen and 1 Oxygen in the chamber, water will not trigger yet. An educational hint alert will notify you: <em>&quot;Water (H₂O) needs 1 more Hydrogen (H)&quot;</em>.
              </p>
            </div>
          </div>

          {/* Step 4: MCQs & Scoring */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono font-bold shrink-0">
              4
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">
                Chemistry MCQs & Scoring System
              </h3>
              <p className="text-slate-300 leading-relaxed mb-2">
                Upon valid compound formation, answer the chemical mastery question:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-900 p-2 rounded border border-slate-800 text-emerald-400 font-bold">
                  +100 Pts · Compound Created
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800 text-cyan-400 font-bold">
                  +50 Pts · Correct MCQ Answer
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800 text-purple-400 font-bold">
                  +100 Pts · 3-Streak Bonus
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800 text-amber-400 font-bold">
                  +200+ Pts · Level Completed
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: Purge tool */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center font-mono font-bold shrink-0">
              5
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">
                Chamber Purge Tool
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Made a misdrop or want to start a fresh batch? Tap the <strong>Purge</strong> button above the chamber to dissolve unwanted atoms safely without losing points.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-colors"
          >
            Close
          </button>
          {onStartGame && (
            <button
              onClick={() => {
                sound.playClick();
                onStartGame();
              }}
              className="py-2.5 px-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
