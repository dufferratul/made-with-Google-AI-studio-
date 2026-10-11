import React, { useState, useEffect } from 'react';
import { Compound, MCQQuestion } from '../types/chemistry';
import { sound } from '../utils/audio';
import { ChemAIAssistantModal } from './ChemAIAssistantModal';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Award,
  HelpCircle,
  Bot,
  Sparkles,
} from 'lucide-react';

interface MCQModalProps {
  compound: Compound;
  onAnswerComplete: (isCorrect: boolean) => void;
}

interface ShuffledOption {
  text: string;
  originalIndex: number;
}

export const MCQModal: React.FC<MCQModalProps> = ({
  compound,
  onAnswerComplete,
}) => {
  // Pick one question from the compound's question set
  const [currentQuestion] = useState<MCQQuestion>(() => {
    const list = compound.mcqQuestions;
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  });

  // Shuffled options list so correct answer isn't predictable
  const [shuffledOptions, setShuffledOptions] = useState<ShuffledOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // AI Assistant Modal state
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);
  const [initialAIQuestion, setInitialAIQuestion] = useState<string | undefined>(undefined);

  useEffect(() => {
    const opts = currentQuestion.options.map((text, idx) => ({
      text,
      originalIndex: idx,
    }));
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    setShuffledOptions(opts);
    setSelectedIndex(null);
    setHasSubmitted(false);
  }, [currentQuestion]);

  const handleSelectOption = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedIndex(idx);
    setHasSubmitted(true);

    const selectedOption = shuffledOptions[idx];
    const correct = selectedOption.originalIndex === currentQuestion.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      sound.playCorrect();
    } else {
      sound.playIncorrect();
    }
  };

  const handleContinue = () => {
    sound.playClick();
    onAnswerComplete(isCorrect);
  };

  const openAIWithQuestion = (queryText: string) => {
    sound.playClick();
    setInitialAIQuestion(queryText);
    setShowAIAssistant(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
        <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-cyan-500/40 p-6 shadow-2xl flex flex-col text-left">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                Chemistry Mastery Question
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAIWithQuestion('What does (g) in brackets mean in chemistry?')}
                className="px-2 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Ask ChemAI"
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Explainer</span>
              </button>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-500/30">
                {compound.formattedFormula}
              </span>
            </div>
          </div>

          {/* Question Text */}
          <div className="my-4">
            <p className="text-base sm:text-lg font-semibold text-slate-100 leading-snug">
              {currentQuestion.question}
            </p>
          </div>

          {/* Quick AI Notation Helper Bar */}
          <div className="mb-3.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Confused by (g), (s), or equations?</span>
            <button
              onClick={() =>
                openAIWithQuestion(
                  `Explain this chemistry question and notation: "${currentQuestion.question}"`
                )
              }
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Ask ChemAI</span>
            </button>
          </div>

          {/* Options */}
          <div className="space-y-2.5 mb-4">
            {shuffledOptions.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              const isOptionCorrect = opt.originalIndex === currentQuestion.correctIndex;

              let buttonStyle = 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-200';
              let icon = null;

              if (hasSubmitted) {
                if (isOptionCorrect) {
                  buttonStyle =
                    'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-sm shadow-emerald-500/20';
                  icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-auto" />;
                } else if (isSelected && !isOptionCorrect) {
                  buttonStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                  icon = <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-auto" />;
                } else {
                  buttonStyle = 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60';
                }
              }

              const letter = String.fromCharCode(65 + idx); // A, B, C, D

              return (
                <button
                  key={idx}
                  disabled={hasSubmitted}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-3 sm:p-3.5 rounded-xl border text-left text-sm font-medium transition-all flex items-center gap-3 ${buttonStyle} ${
                    !hasSubmitted
                      ? 'hover:border-cyan-400 active:scale-[0.99] cursor-pointer'
                      : 'cursor-default'
                  }`}
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                    {letter}
                  </span>
                  <span className="flex-1 leading-snug">{opt.text}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          {/* Feedback Section once submitted */}
          {hasSubmitted && (
            <div className="animate-fadeIn">
              <div
                className={`p-3.5 rounded-xl border mb-4 text-xs sm:text-sm leading-relaxed ${
                  isCorrect
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                    : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                }`}
              >
                <div className="font-bold flex items-center justify-between mb-1 text-sm">
                  <div className="flex items-center gap-1.5">
                    {isCorrect ? (
                      <>
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span>Correct! +50 Points awarded</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-amber-400" />
                        <span>Review Explanation:</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      openAIWithQuestion(
                        `Explain why this explanation is chemically true: "${currentQuestion.explanation}"`
                      )
                    }
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline font-normal cursor-pointer"
                  >
                    Deep dive with AI ↗
                  </button>
                </div>
                <p>{currentQuestion.explanation}</p>
              </div>

              <button
                onClick={handleContinue}
                className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <span>Continue Laboratory Experiment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
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
          questionText: currentQuestion.question,
          options: currentQuestion.options,
        }}
        initialQuestion={initialAIQuestion}
      />
    </>
  );
};
