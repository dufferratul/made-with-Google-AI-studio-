import React from 'react';
import { LevelConfig } from '../data/levels';
import { sound } from '../utils/audio';
import { Trophy, ArrowRight, RotateCcw, Home, Sparkles } from 'lucide-react';

interface LevelCompleteModalProps {
  levelConfig: LevelConfig;
  levelScore: number;
  totalScore: number;
  compoundsCreatedThisLevel: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onReturnMenu: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  levelConfig,
  levelScore,
  totalScore,
  compoundsCreatedThisLevel,
  hasNextLevel,
  onNextLevel,
  onReplayLevel,
  onReturnMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/50 p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-12 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center mb-4 shadow-lg">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-1">
          Laboratory Milestone Reached
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          {levelConfig.title} Completed!
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          {levelConfig.subtitle}
        </p>

        {/* Score Card */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-5 grid grid-cols-2 gap-3 text-left">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Level Bonus</span>
            <span className="text-xl font-mono font-bold text-emerald-400">
              +{levelConfig.pointsReward} PTS
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Score</span>
            <span className="text-xl font-mono font-bold text-cyan-400">
              {totalScore} PTS
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-2.5">
          {hasNextLevel ? (
            <button
              onClick={() => {
                sound.playClick();
                onNextLevel();
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Advance to Next Level</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl text-purple-200 text-xs mb-2">
              🎉 Congratulations! You have conquered all master chemistry levels!
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onReplayLevel();
              }}
              className="flex-1 py-2.5 px-3 bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Level</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onReturnMenu();
              }}
              className="flex-1 py-2.5 px-3 bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
