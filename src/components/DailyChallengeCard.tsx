import React, { useState, useEffect } from 'react';
import { Compound, PlayerStats } from '../types/chemistry';
import {
  getDailyChallenge,
  getTimeUntilMidnight,
  isDailyChallengeCompleted,
} from '../utils/dailyChallenge';
import { sound } from '../utils/audio';
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  Play,
  Info,
} from 'lucide-react';

interface DailyChallengeCardProps {
  stats: PlayerStats;
  onStartDailyChallenge: (compound: Compound) => void;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  stats,
  onStartDailyChallenge,
}) => {
  const { compound, info } = getDailyChallenge();
  const [timeLeft, setTimeLeft] = useState<string>(getTimeUntilMidnight().formatted);
  const [showScientificDetails, setShowScientificDetails] = useState<boolean>(false);

  const completed = isDailyChallengeCompleted(stats, info.dateKey);

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight().formatted);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full mt-2.5 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-amber-950/20 border border-amber-500/35 shadow-md text-left relative overflow-hidden transition-all">
      {/* Subtle warm accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/60 via-amber-400 to-transparent" />

      {/* Top micro bar: Title, Bonus, and Countdown */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <FlaskConical className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-white tracking-tight truncate">
            Daily Challenge
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/30 text-[10px] font-mono font-bold text-amber-300 shrink-0">
            +{info.bonusPoints} PTS
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono font-medium text-amber-300/90 shrink-0">
          <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>{timeLeft}</span>
        </div>
      </div>

      {/* Main compact body */}
      <div className="flex items-center justify-between gap-2 bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-100">{compound.name}</span>
            <span className="font-mono text-cyan-400 text-xs font-bold bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-500/30">
              {compound.formattedFormula}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-mono truncate">
            <span className="text-slate-500">Mix:</span>
            {Object.entries(compound.requiredElements).map(([symbol, count]) => (
              <span
                key={symbol}
                className="px-1 py-0.2 rounded bg-slate-850 text-amber-300 border border-slate-700/60 font-semibold"
              >
                {count}×{symbol}
              </span>
            ))}
            <button
              onClick={() => setShowScientificDetails(!showScientificDetails)}
              className="ml-1 text-[10px] text-slate-400 hover:text-cyan-300 underline cursor-pointer"
              title="Toggle PubChem details"
            >
              <Info className="w-3 h-3 inline mr-0.5" />
              {showScientificDetails ? 'Hide' : 'Info'}
            </button>
          </div>
        </div>

        {/* Action Button */}
        {completed ? (
          <div className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Done</span>
          </div>
        ) : (
          <button
            onClick={() => {
              sound.playClick();
              onStartDailyChallenge(compound);
            }}
            className="shrink-0 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Play Bounty</span>
          </button>
        )}
      </div>

      {/* Collapsible Scientific Details */}
      {showScientificDetails && (
        <div className="mt-1.5 p-2 rounded-lg bg-slate-950/90 border border-slate-800 text-[10px] font-mono grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-300 animate-fadeIn">
          <div><span className="text-slate-500">PubChem:</span> <span className="text-cyan-400">{compound.pubchemCid || 'N/A'}</span></div>
          <div><span className="text-slate-500">Weight:</span> <span className="text-slate-200">{compound.molecularWeight ? `${compound.molecularWeight} g/mol` : 'N/A'}</span></div>
          <div className="col-span-2 truncate"><span className="text-slate-500">Equation:</span> <span className="text-emerald-400">{compound.balancedEquation}</span></div>
        </div>
      )}
    </div>
  );
};
