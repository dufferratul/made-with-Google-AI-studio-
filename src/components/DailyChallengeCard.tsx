import React, { useState, useEffect } from 'react';
import { Compound, PlayerStats } from '../types/chemistry';
import {
  getDailyChallenge,
  getTimeUntilMidnight,
  isDailyChallengeCompleted,
} from '../utils/dailyChallenge';
import { MoleculeVisualizer } from './MoleculeVisualizer';
import { sound } from '../utils/audio';
import {
  Sparkles,
  Clock,
  Award,
  CheckCircle2,
  Play,
  Zap,
  Info,
  Flame,
  ArrowRight,
  FlaskConical,
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
    <div className="w-full my-3 p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border-2 border-amber-500/40 shadow-xl shadow-amber-500/10 text-left relative overflow-hidden transition-all">
      {/* Ambient warm alchemical glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-sm">
            <FlaskConical className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 leading-none">
              <span>Daily Chemistry Challenge</span>
            </h3>
            <span className="text-[10px] font-semibold text-amber-400/90 tracking-wide uppercase">
              24-Hour Special Bounty
            </span>
          </div>
        </div>

        {/* Live Countdown Badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 border border-amber-500/30 text-[10px] sm:text-xs font-mono font-bold text-amber-300">
          <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>{timeLeft}</span>
        </div>
      </div>

      {/* Compound Target Spotlight */}
      <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Today&apos;s Target Molecule
          </div>
          <div className="text-lg sm:text-xl font-black text-white flex items-center gap-2 mt-0.5">
            <span>{compound.name}</span>
            <span className="font-mono text-cyan-400 text-sm sm:text-base bg-cyan-950/80 px-2 py-0.5 rounded-lg border border-cyan-500/30">
              {compound.formattedFormula}
            </span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1 truncate">
            {compound.balancedEquation}
          </div>
        </div>

        {/* Mini Molecule Graphic Preview */}
        <div className="shrink-0 scale-90">
          <MoleculeVisualizer compound={compound} size="sm" animate={false} />
        </div>
      </div>

      {/* Required Ingredients Breakdown */}
      <div className="flex items-center justify-between gap-2 mb-3 px-1 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400">Recipe:</span>
          {Object.entries(compound.requiredElements).map(([symbol, count]) => (
            <span
              key={symbol}
              className="px-2 py-0.5 bg-slate-800 text-amber-300 rounded-lg font-mono font-bold text-[11px] border border-slate-700"
            >
              {count}× {symbol}
            </span>
          ))}
        </div>

        <button
          onClick={() => setShowScientificDetails(!showScientificDetails)}
          className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-0.5 underline transition-colors"
        >
          <Info className="w-3 h-3" />
          <span>{showScientificDetails ? 'Hide Data' : 'PubChem Data'}</span>
        </button>
      </div>

      {/* Science Skill Data Inspector Drawer */}
      {showScientificDetails && (
        <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono space-y-1 mb-3 animate-fadeIn text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">PubChem CID:</span>
            <span className="text-cyan-400 font-bold">{compound.pubchemCid || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Molecular Weight:</span>
            <span className="text-slate-200">{compound.molecularWeight ? `${compound.molecularWeight} g/mol` : 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Canonical SMILES:</span>
            <span className="text-amber-300 truncate max-w-[180px]">{compound.canonicalSmiles || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Bonding Type:</span>
            <span className="text-emerald-400">{compound.bondingType}</span>
          </div>
        </div>
      )}

      {/* Reward & Action Row */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-black text-amber-300 tracking-wide font-mono">
            +{info.bonusPoints} PTS REWARD
          </span>
        </div>

        {completed ? (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 rounded-xl text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Completed Today!</span>
          </div>
        ) : (
          <button
            onClick={() => {
              sound.playClick();
              onStartDailyChallenge(compound);
            }}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>PLAY CHALLENGE</span>
          </button>
        )}
      </div>
    </div>
  );
};
