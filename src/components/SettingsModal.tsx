import React, { useState } from 'react';
import { PlayerStats } from '../types/chemistry';
import { sound } from '../utils/audio';
import { X, Volume2, VolumeX, RotateCcw, AlertTriangle, CheckCircle2, BarChart3 } from 'lucide-react';

interface SettingsModalProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  stats,
  onUpdateStats,
  onResetProgress,
  onClose,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const toggleSound = () => {
    const updated = !stats.soundEnabled;
    sound.setEnabled(updated);
    if (updated) sound.playClick();
    onUpdateStats({ ...stats, soundEnabled: updated });
  };

  const accuracy = stats.questionsAnswered > 0
    ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 sm:p-6 relative text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h2 className="text-xl font-black text-white">
            Game Settings & Lab Stats
          </h2>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Toggle */}
        <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {stats.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-cyan-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
            <div>
              <div className="text-sm font-bold text-white">Procedural Audio FX</div>
              <div className="text-[11px] text-slate-400">Web Audio synthesis chimes & clinks</div>
            </div>
          </div>
          <button
            onClick={toggleSound}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              stats.soundEnabled
                ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {stats.soundEnabled ? 'Enabled' : 'Muted'}
          </button>
        </div>

        {/* Player Lifetime Stats */}
        <div className="mb-5">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Lifetime Performance</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">High Score</span>
              <span className="text-base font-mono font-bold text-cyan-400">{stats.highScore}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">Compounds Built</span>
              <span className="text-base font-mono font-bold text-emerald-400">{stats.compoundsCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">MCQ Accuracy</span>
              <span className="text-base font-mono font-bold text-amber-400">
                {accuracy}% ({stats.correctAnswers}/{stats.questionsAnswered})
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">Best Streak</span>
              <span className="text-base font-mono font-bold text-purple-400">{stats.highestStreak}🔥</span>
            </div>
          </div>
        </div>

        {/* Reset Progress Section */}
        <div className="pt-3 border-t border-slate-800">
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-2.5 px-3 bg-slate-800/80 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Game Data & High Score</span>
            </button>
          ) : (
            <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-xs space-y-2.5 animate-fadeIn">
              <div className="flex items-start gap-2 text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  Are you sure? This will permanently wipe your discovered compounds, high score, and unlocked levels.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    onResetProgress();
                    setShowConfirmReset(false);
                  }}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs transition-colors"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
