import React, { useState, useEffect } from 'react';
import { Compound, MCQQuestion } from '../types/chemistry';
import { MoleculeVisualizer } from './MoleculeVisualizer';
import { sound } from '../utils/audio';
import { ChemAIAssistantModal } from './ChemAIAssistantModal';
import { detectStateSymbols, STATE_SYMBOLS } from '../utils/chemAI';
import {
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  XCircle,
  Award,
  Flame,
  Bot,
  HelpCircle,
  Info,
} from 'lucide-react';

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

  // ChemAI Modal state
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);
  const [initialAIQuestion, setInitialAIQuestion] = useState<string | undefined>(undefined);

  // Detect state symbols in the equation and question
  const stateSymbols = React.useMemo(() => {
    const combined = `${compound.balancedEquation} ${question.question}`;
    return detectStateSymbols(combined);
  }, [compound.balancedEquation, question.question]);

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

  const openAIWithQuestion = (customQuestion: string) => {
    sound.playClick();
    setInitialAIQuestion(customQuestion);
    setShowAIAssistant(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
        <div className="w-full max-w-md max-h-[94vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500/50 p-4 sm:p-5 shadow-2xl flex flex-col text-center relative">
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
          <div className="my-2.5 flex justify-center">
            <MoleculeVisualizer compound={compound} size="sm" />
          </div>

          {/* Balanced Equation Bar */}
          <div className="w-full bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 text-left mb-2">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between mb-0.5">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Balanced Reaction Equation</span>
              </span>
              <span className="text-[9px] font-mono text-cyan-400/80">
                (s)=solid • (g)=gas • (l)=liquid
              </span>
            </div>
            <div className="font-mono text-sm sm:text-base font-bold text-emerald-400">
              {compound.balancedEquation}
            </div>
          </div>

          {/* AI Explainer Callout Card for Chemistry Symbols */}
          <div className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-2.5 text-left mb-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>ChemAI Notation Explainer</span>
              </div>
              <button
                onClick={() => openAIWithQuestion(`Explain the reaction equation for ${compound.name}`)}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-900/60 hover:bg-cyan-900 px-2 py-0.5 rounded-lg border border-cyan-400/30 transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3 h-3 text-cyan-300" />
                <span>Ask AI</span>
              </button>
            </div>

            {/* Quick State Symbol Breakdown Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 text-[10px]">What do symbols mean?</span>
              <button
                onClick={() => openAIWithQuestion('What does (g) on the brackets mean in chemical equations?')}
                className="px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-cyan-950 border border-cyan-500/40 text-cyan-200 font-mono text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                title="Click for full explanation of (g)"
              >
                <span>(g) = Gas</span>
                <span className="text-[9px] text-cyan-400 font-sans font-normal">learn ↗</span>
              </button>
              <button
                onClick={() => openAIWithQuestion('What does (s) on the brackets mean in chemical equations?')}
                className="px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-cyan-950 border border-slate-700 text-slate-300 font-mono text-[11px] transition-colors cursor-pointer"
              >
                <span>(s) = Solid</span>
              </button>
              <button
                onClick={() => openAIWithQuestion('What does (l) and (aq) mean in chemical equations?')}
                className="px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-cyan-950 border border-slate-700 text-slate-300 font-mono text-[11px] transition-colors cursor-pointer"
              >
                <span>(l) / (aq)</span>
              </button>
            </div>
          </div>

          {/* Bonus Quiz Section */}
          <div className="w-full pt-2.5 border-t border-slate-800 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <span>⚡ Chemistry Mastery Question</span>
                <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded font-mono font-bold">
                  +50 PTS
                </span>
              </span>

              <div className="flex items-center gap-1.5">
                {currentStreak > 1 && (
                  <span className="text-[11px] font-mono font-bold text-rose-400 flex items-center gap-0.5">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>{currentStreak}x</span>
                  </span>
                )}
                {/* AI Help Button on MCQ */}
                <button
                  onClick={() => openAIWithQuestion(`Give me a helpful chemistry hint for this question: "${question.question}" without giving away the exact answer letter`)}
                  className="px-2 py-0.5 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  title="Ask AI for hint"
                >
                  <Bot className="w-3 h-3 text-cyan-400" />
                  <span>AI Hint</span>
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-100 mb-2 leading-snug">
              {question.question}
            </p>

            {/* Shuffled Options */}
            <div className="space-y-1.5 mb-2.5">
              {shuffledOptions.map((opt, idx) => {
                const isSelected = selectedIndex === idx;
                const isOptCorrect = opt.originalIndex === question.correctIndex;

                let btnStyle = 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-200';
                let icon = null;

                if (hasAnswered) {
                  if (isOptCorrect) {
                    btnStyle =
                      'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-sm shadow-emerald-500/30 font-bold';
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
                      !hasAnswered
                        ? 'hover:border-cyan-400 active:scale-[0.99] cursor-pointer'
                        : 'cursor-default'
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
                className={`p-2.5 rounded-xl border mb-2.5 text-xs leading-relaxed animate-fadeIn ${
                  isCorrect
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                    : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                }`}
              >
                <div className="font-bold flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1">
                    {isCorrect ? (
                      <>
                        <Award className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Brilliant! +50 Points awarded</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Explanation:</span>
                      </>
                    )}
                  </div>
                  {/* Ask AI to explain why */}
                  <button
                    onClick={() =>
                      openAIWithQuestion(
                        `Explain why this answer is correct in detail: "${question.explanation}"`
                      )
                    }
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 underline cursor-pointer"
                  >
                    <span>Explain deeper with AI</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <p>{question.explanation}</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleContinue}
            className="w-full mt-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>{hasAnswered ? 'Keep Dropping & Bonding!' : 'Skip to Next Drop'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* ChemAI Tutor Modal */}
      <ChemAIAssistantModal
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        context={{
          compoundName: compound.name,
          formula: compound.formattedFormula,
          balancedEquation: compound.balancedEquation,
          bondingType: compound.bondingType,
          questionText: question.question,
          options: question.options,
        }}
        initialQuestion={initialAIQuestion}
      />
    </>
  );
};
