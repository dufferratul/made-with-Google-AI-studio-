import React from 'react';
import { Compound, PlayerStats, ScreenMode } from '../types/chemistry';
import { sound } from '../utils/audio';
import { LEVELS } from '../data/levels';
import { DailyChallengeCard } from './DailyChallengeCard';
import {
  Play,
  BookOpen,
  Grid,
  Database,
  HelpCircle,
  Settings,
  Trophy,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  Bot,
} from 'lucide-react';

interface MainMenuProps {
  stats: PlayerStats;
  onNavigate: (screen: ScreenMode) => void;
  onStartLevel: (levelNum: number) => void;
  onStartDailyChallenge: (compound: Compound) => void;
  onToggleSound: () => void;
  onOpenAI: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  stats,
  onNavigate,
  onStartLevel,
  onStartDailyChallenge,
  onToggleSound,
  onOpenAI,
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 bg-slate-950 text-slate-100 relative overflow-hidden select-none">
      {/* Background radial laboratory lighting */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Quick Stats & Sound */}
      <header className="w-full max-w-lg flex items-center justify-between py-2 border-b border-slate-900 z-10">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400">High Score:</span>
          <span className="text-sm font-mono font-bold text-amber-400">
            {stats.highScore}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick AI Tutor Help Button on Header */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAI();
            }}
            className="px-2.5 py-1 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Ask ChemAI Tutor"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>ChemAI Tutor ✨</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
            title={stats.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {stats.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Hero Branding Section */}
      <div className="my-auto py-4 flex flex-col items-center text-center z-10 w-full max-w-md">
        {/* Animated Molecular Emblem */}
        <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 animate-pulse" />
          <div className="relative flex items-center justify-center text-cyan-400 font-mono font-black text-2xl tracking-tighter">
            <span>E</span>
            <span className="text-amber-400">B</span>
          </div>
          {/* Orbiting particle rings */}
          <div
            className="absolute inset-0 border border-cyan-500/20 rounded-full animate-spin"
            style={{ animationDuration: '8s' }}
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
          ELEMENT{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            BOND
          </span>
        </h1>
        <div className="text-xs sm:text-sm font-semibold tracking-wider text-cyan-400 uppercase mt-0.5">
          Chemistry Challenge
        </div>

        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xs font-medium leading-relaxed">
          Drop Elements. Build Compounds. Master Chemistry.
        </p>

        {/* Level Quick Select */}
        <div className="w-full mt-3 bg-slate-900/70 border border-slate-800 rounded-2xl p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
            <span className="font-semibold text-slate-300">Select Mission Level:</span>
            <span className="font-mono text-cyan-400 font-bold">
              Level {stats.currentLevel}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {LEVELS.map((lvl) => {
              const isUnlocked = stats.unlockedLevels.includes(lvl.levelNumber);
              const isCurrent = stats.currentLevel === lvl.levelNumber;
              return (
                <button
                  key={lvl.levelNumber}
                  disabled={!isUnlocked}
                  onClick={() => {
                    sound.playClick();
                    onStartLevel(lvl.levelNumber);
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center transition-all ${
                    isCurrent
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/20 scale-105'
                      : isUnlocked
                      ? 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-slate-900/40 border-slate-850 text-slate-600 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xs font-mono font-bold">L{lvl.levelNumber}</span>
                  <span className="text-[10px] truncate max-w-full text-slate-400 mt-0.5">
                    {lvl.title.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Start Mission CTA Button */}
        <button
          onClick={() => {
            sound.playClick();
            onStartLevel(stats.currentLevel);
          }}
          className="w-full mt-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/30 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>START REACTION CHAMBER</span>
        </button>

        {/* 24-Hour Daily Chemistry Challenge Card (Compact, positioned below game start) */}
        <DailyChallengeCard
          stats={stats}
          onStartDailyChallenge={onStartDailyChallenge}
        />

        {/* Secondary Menu Buttons */}
        <div className="w-full grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={() => {
              sound.playClick();
              onOpenAI();
            }}
            className="py-2.5 px-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>ASK CHEMAI TUTOR</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('LEARN_CHEMISTRY');
            }}
            className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>LEARN CHEMISTRY</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('PERIODIC_TABLE');
            }}
            className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Grid className="w-4 h-4 text-emerald-400" />
            <span>PERIODIC TABLE</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('MY_COMPOUNDS');
            }}
            className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4 text-purple-400" />
            <span>MY COMPOUNDS</span>
          </button>
        </div>

        <div className="w-full flex items-center justify-center gap-4 mt-2">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('HOW_TO_PLAY');
            }}
            className="py-1 px-3 text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>HOW TO PLAY</span>
          </button>

          <span className="text-slate-700">•</span>

          <button
            onClick={() => {
              sound.playClick();
              onNavigate('SETTINGS');
            }}
            className="py-1 px-3 text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>SETTINGS & STATS</span>
          </button>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="w-full text-center py-2 text-[11px] text-slate-600">
        Element Bond © Chemistry Challenge · Scientifically Balanced
      </footer>
    </div>
  );
};
