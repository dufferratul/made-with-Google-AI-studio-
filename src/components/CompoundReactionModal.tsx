import React, { useState, useEffect } from 'react';
import { Compound, MCQQuestion } from '../types/chemistry';
import { MoleculeVisualizer } from './MoleculeVisualizer';
import { sound } from '../utils/audio';
import { Sparkles, ArrowRight, Zap, CheckCircle2, XCircle, Award, Flame } from 'lucide-react';

interface CompoundReactionModalProps {
  compound: Compound;
  currentStreak: number;
  onFinish: (isCorrect: boolean) => void;
}

interface ShuffledOption {
  text: string;
  originalIndex: number;
}

export const CompoundReactionModal: React.FC<CompoundReactionModalProps> = ({
  compound,
  currentStreak,
  onFinish,
}) => {
  // Select one random question from this compound
  const [question] = useState<MCQQuestion>(() => {
    const list = compound.mcqQuestions;
    return list[Math.floor(Math.random() * list.length)];
  });

  const [shuffledOptions, setShuffledOptions] = useState<ShuffledOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  useEffect(() => {
    const opts = question.options.map((text, idx) => ({
      text,
      originalIndex: idx,
    }));
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    setShuffledOptions(opts);
  }, [question]);

  const handleSelectOption = (idx: number) => {
    if (hasAnswered) return;
    setSelectedIndex(idx);
    setHasAnswered(true);

    const chosen = shuffledOptions[idx];
    const correct = chosen.originalIndex === question.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      sound.playCorrect();
    } else {
      sound.playIncorrect();
    }
  };

  const handleContinue = () => {
    sound.playClick();
    onFinish(isCorrect);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500/50 p-5 sm:p-6 shadow-2xl flex flex-col text-center relative">
        {/* Glow ambient background */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="mx-auto flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 border border-cyan-400/40 rounded-full text-cyan-300 text-[11px] font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>Compound Formed! +100 PTS</span>
        </div>

        {/* Compound Title & Formula */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {compound.name}
        </h2>
        <div className="mt-1 flex items-center justify-center gap-2">
          <span className="text-xl sm:text-2xl font-mono font-black text-cyan-400 bg-cyan-950/80 px-3 py-0.5 rounded-xl border border-cyan-500/40">
            {compound.formattedFormula}
          </span>
          <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 font-semibold">
            {compound.bondingType}
          </span>
        </div>

        {/* Molecule Visualizer */}
        <div className="my-3 flex justify-center">
          <MoleculeVisualizer compound={compound} size="sm" />
        </div>

        {/* Balanced Equation Bar */}
        <div className="w-full bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 text-left mb-3.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 mb-0.5">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Balanced Reaction Equation</span>
          </div>
          <div className="font-mono text-sm sm:text-base font-bold text-emerald-400">
            {compound.balancedEquation}
          </div>
        </div>

        {/* Bonus Quiz Section */}
        <div className="w-full pt-3 border-t border-slate-800 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <span>⚡ Chemistry Bonus Quiz</span>
              <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded font-mono font-bold">+50 PTS</span>
            </span>
            {currentStreak > 1 && (
              <span className="text-[11px] font-mono font-bold text-rose-400 flex items-center gap-0.5">
                <Flame className="w-3 h-3 fill-current" />
                <span>{currentStreak}x Streak</span>
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm font-semibold text-slate-200 mb-2.5 leading-snug">
            {question.question}
          </p>

          {/* Shuffled Options */}
          <div className="space-y-1.5 mb-3">
            {shuffledOptions.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              const isOptCorrect = opt.originalIndex === question.correctIndex;

              let btnStyle = 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-200';
              let icon = null;

              if (hasAnswered) {
                if (isOptCorrect) {
                  btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-sm shadow-emerald-500/30 font-bold';
                  icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-auto" />;
                } else if (isSelected && !isOptCorrect) {
                  btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                  icon = <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-auto" />;
                } else {
                  btnStyle = 'bg-slate-900/60 border-slate-800/80 text-slate-500 opacity-50';
                }
              }

              const letter = String.fromCharCode(65 + idx);

              return (
                <button
                  key={idx}
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2.5 ${btnStyle} ${
                    !hasAnswered ? 'hover:border-cyan-400 active:scale-[0.99] cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                    {letter}
                  </span>
                  <span className="flex-1 leading-tight">{opt.text}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          {/* Explanation if answered */}
          {hasAnswered && (
            <div
              className={`p-2.5 rounded-xl border mb-3 text-xs leading-relaxed animate-fadeIn ${
                isCorrect
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1 mb-0.5">
                {isCorrect ? (
                  <>
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Brilliant! +50 Points awarded</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fact Review:</span>
                  </>
                )}
              </div>
              <p>{question.explanation}</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleContinue}
          className="w-full mt-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>{hasAnswered ? 'Keep Dropping & Bonding!' : 'Skip to Next Drop'}</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
