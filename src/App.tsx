import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayerStats,
  ScreenMode,
  ChamberAtom,
  Compound,
} from './types/chemistry';
import { ELEMENTS, ELEMENT_MAP } from './data/elements';
import { COMPOUNDS, COMPOUND_MAP } from './data/compounds';
import { LEVELS, LevelConfig } from './data/levels';
import { evaluateChamberReactions, getNextRandomElement } from './utils/reactionEngine';
import { loadPlayerStats, savePlayerStats, resetPlayerStats } from './utils/storage';
import { sound } from './utils/audio';
import { getTodayDateKey, isDailyChallengeCompleted } from './utils/dailyChallenge';

import { ElementTile } from './components/ElementTile';
import { ReactionChamber, FloatingText } from './components/ReactionChamber';
import { ParticleEffect } from './components/ParticleCanvas';
import { RecipeTargetBar } from './components/RecipeTargetBar';
import { MoleculeVisualizer } from './components/MoleculeVisualizer';
import { CompoundReactionModal } from './components/CompoundReactionModal';
import { MainMenu } from './components/MainMenu';
import { PeriodicTableModal } from './components/PeriodicTableModal';
import { MyCompoundsModal } from './components/MyCompoundsModal';
import { LearnChemistryModal } from './components/LearnChemistryModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { ChemAIAssistantModal } from './components/ChemAIAssistantModal';

import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  Home,
  Sparkles,
  Flame,
  ArrowDown,
  Repeat,
  Zap,
  Bot,
} from 'lucide-react';

export default function App() {
  // --- Persistent Player Stats ---
  const [stats, setStats] = useState<PlayerStats>(() => loadPlayerStats());

  useEffect(() => {
    savePlayerStats(stats);
  }, [stats]);

  useEffect(() => {
    sound.setEnabled(stats.soundEnabled);
  }, [stats.soundEnabled]);

  // --- Navigation & Modals ---
  const [screenMode, setScreenMode] = useState<ScreenMode>('MAIN_MENU');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // --- Active Gameplay State ---
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(stats.currentLevel);
  const currentLevelConfig = LEVELS.find((l) => l.levelNumber === currentLevelNumber) || LEVELS[0];

  const [currentScore, setCurrentScore] = useState<number>(stats.totalScore);
  const [chamberAtoms, setChamberAtoms] = useState<ChamberAtom[]>([]);
  const [aimPosition, setAimPosition] = useState<number>(50); // 10 to 90%
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [fallingAtom, setFallingAtom] = useState<ChamberAtom | null>(null);

  // Current and Next Element in spawner
  const [currentElementSymbol, setCurrentElementSymbol] = useState<string>('H');
  const [nextElementSymbol, setNextElementSymbol] = useState<string>('O');

  // Active Target Compound ID for this level
  const [currentTargetIndex, setCurrentTargetIndex] = useState<number>(0);
  const [isDailyChallengeActive, setIsDailyChallengeActive] = useState<boolean>(false);
  const [dailyChallengeTarget, setDailyChallengeTarget] = useState<Compound | null>(null);

  const activeTargetCompoundId = isDailyChallengeActive && dailyChallengeTarget
    ? dailyChallengeTarget.id
    : currentLevelConfig.targetCompounds[
        currentTargetIndex % currentLevelConfig.targetCompounds.length
      ];

  // Detailed compound preview modal (from tapping target bar)
  const [inspectCompound, setInspectCompound] = useState<Compound | null>(null);

  // Active reaction celebration modal
  const [activeReactionCompound, setActiveReactionCompound] = useState<Compound | null>(null);

  // Level Progression tracking
  const [compoundsCreatedThisLevel, setCompoundsCreatedThisLevel] = useState<number>(0);
  const [showLevelComplete, setShowLevelComplete] = useState<boolean>(false);

  // Partial match hints for chamber
  const [partialHints, setPartialHints] = useState<{ compound: Compound; missing: { symbol: string; count: number }[] }[]>([]);

  // Arcade Juice: Floating score texts and particle bursts
  const [floatingScores, setFloatingScores] = useState<FloatingText[]>([]);
  const [burstParticles, setBurstParticles] = useState<ParticleEffect[]>([]);
  const [activeCombo, setActiveCombo] = useState<number>(1);
  const lastReactionTimeRef = useRef<number>(0);

  // Global ChemAI Tutor Assistant state
  const [showGlobalAI, setShowGlobalAI] = useState<boolean>(false);
  const [globalAIInitialQuestion, setGlobalAIInitialQuestion] = useState<string | undefined>(undefined);

  // Prevent duplicate reaction evaluations
  const reactionLockRef = useRef<boolean>(false);

  const discoverElement = (symbol: string) => {
    setStats((prev) => {
      if (prev.discoveredElements.includes(symbol)) return prev;
      return {
        ...prev,
        discoveredElements: [...prev.discoveredElements, symbol],
      };
    });
  };

  // Initialize standard level
  const startLevel = (lvlNum: number) => {
    setIsDailyChallengeActive(false);
    setDailyChallengeTarget(null);
    setCurrentLevelNumber(lvlNum);
    setCurrentTargetIndex(0);
    setChamberAtoms([]);
    setFallingAtom(null);
    setIsDropping(false);
    setIsPaused(false);
    setActiveReactionCompound(null);
    setShowLevelComplete(false);
    setCompoundsCreatedThisLevel(0);
    setFloatingScores([]);
    setBurstParticles([]);
    setActiveCombo(1);
    reactionLockRef.current = false;

    const first = getNextRandomElement(lvlNum, []);
    const second = getNextRandomElement(lvlNum, []);
    setCurrentElementSymbol(first);
    setNextElementSymbol(second);

    discoverElement(first);
    discoverElement(second);

    setScreenMode('PLAYING');
  };

  // Start 24-Hour Daily Chemistry Challenge
  const startDailyChallenge = (compound: Compound) => {
    setIsDailyChallengeActive(true);
    setDailyChallengeTarget(compound);
    setCurrentLevelNumber(compound.difficultyLevel || 1);
    setChamberAtoms([]);
    setFallingAtom(null);
    setIsDropping(false);
    setIsPaused(false);
    setActiveReactionCompound(null);
    setShowLevelComplete(false);
    setCompoundsCreatedThisLevel(0);
    setFloatingScores([]);
    setBurstParticles([]);
    setActiveCombo(1);
    reactionLockRef.current = false;

    // Seed spawner with elements required for the daily compound
    const requiredSymbols = Object.keys(compound.requiredElements);
    const first = requiredSymbols[0] || 'H';
    const second = requiredSymbols[1] || requiredSymbols[0] || 'O';
    setCurrentElementSymbol(first);
    setNextElementSymbol(second);

    discoverElement(first);
    discoverElement(second);

    sound.playLevelUp();
    setScreenMode('PLAYING');
  };

  const toggleSound = () => {
    setStats((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  // Helper to spawn floating score text
  const addFloatingText = (text: string, x: number = 50, y: number = 50) => {
    const id = `float-${Date.now()}-${Math.random()}`;
    setFloatingScores((prev) => [...prev, { id, text, x, y }]);
    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((f) => f.id !== id));
    }, 1200);
  };

  // Helper to trigger particle burst
  const triggerBurst = (x: number = 50, y: number = 50, color?: string) => {
    setBurstParticles([{ x, y, color }]);
    setTimeout(() => {
      setBurstParticles([]);
    }, 100);
  };

  // Element Swap Power-Up: Switch current element with next element
  const handleSwapElements = () => {
    if (isDropping || isPaused || activeReactionCompound || showLevelComplete) return;
    sound.playSwap();
    const temp = currentElementSymbol;
    setCurrentElementSymbol(nextElementSymbol);
    setNextElementSymbol(temp);
    addFloatingText('🔄 Swapped!', aimPosition, 15);
  };

  // Laser Zap Power-Up: Dissolve an individual atom
  const handleZapAtom = (atomId: string) => {
    const atom = chamberAtoms.find((a) => a.id === atomId);
    if (!atom) return;
    sound.playZap();
    triggerBurst(atom.x, atom.y, '#f43f5e');
    addFloatingText(`⚡ Dissolved ${atom.elementSymbol}`, atom.x, atom.y);
    setChamberAtoms((prev) => prev.filter((a) => a.id !== atomId));
  };

  // Magnet Pull Power-Up: Pulls atoms towards center of chamber
  const handleMagnetPull = () => {
    if (chamberAtoms.length < 2) return;
    sound.playBondFormed();
    addFloatingText('🧲 Magnetic Pull!', 50, 40);
    triggerBurst(50, 70, '#38bdf8');
    setChamberAtoms((prev) =>
      prev.map((a) => ({
        ...a,
        x: a.x + (50 - a.x) * 0.45,
      }))
    );
  };

  // --- Falling Atom Mechanics ---
  const triggerDrop = useCallback(() => {
    if (
      isDropping ||
      isPaused ||
      screenMode !== 'PLAYING' ||
      activeReactionCompound ||
      showLevelComplete
    ) {
      return;
    }

    if (chamberAtoms.length >= 10) {
      sound.playIncorrect();
      addFloatingText('Chamber Full! Purge or Zap', 50, 45);
      return;
    }

    sound.playDrop();
    setIsDropping(true);

    const newAtom: ChamberAtom = {
      id: `atom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      elementSymbol: currentElementSymbol,
      x: aimPosition,
      y: 8,
      vy: 1.4,
      rotation: (Math.random() - 0.5) * 20,
      landed: false,
    };

    setFallingAtom(newAtom);

    // Advance spawner
    setCurrentElementSymbol(nextElementSymbol);
    const upcoming = getNextRandomElement(currentLevelNumber, [...chamberAtoms, newAtom]);
    setNextElementSymbol(upcoming);
    discoverElement(upcoming);
  }, [
    isDropping,
    isPaused,
    screenMode,
    activeReactionCompound,
    showLevelComplete,
    chamberAtoms,
    currentElementSymbol,
    nextElementSymbol,
    aimPosition,
    currentLevelNumber,
  ]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screenMode !== 'PLAYING') return;

      if (e.key === 'p' || e.key === 'P') {
        setIsPaused((prev) => !prev);
        return;
      }

      if (isPaused || activeReactionCompound || showLevelComplete) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setAimPosition((prev) => Math.max(12, prev - 6));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setAimPosition((prev) => Math.min(88, prev + 6));
      } else if (e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        triggerDrop();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSwapElements();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screenMode, isPaused, activeReactionCompound, showLevelComplete, triggerDrop]);

  // Falling physics animation loop
  useEffect(() => {
    if (!fallingAtom || isPaused) return;

    let currentY = fallingAtom.y;
    let velocity = fallingAtom.vy || 1.4;
    const gravity = 0.28;

    let targetFloor = 86;
    for (const landed of chamberAtoms) {
      if (Math.abs(landed.x - fallingAtom.x) < 18) {
        const stackHeight = landed.y - 13;
        if (stackHeight < targetFloor && stackHeight > 20) {
          targetFloor = stackHeight;
        }
      }
    }

    const interval = setInterval(() => {
      velocity += gravity;
      currentY += velocity;

      if (currentY >= targetFloor) {
        clearInterval(interval);
        sound.playLand();

        const landedAtom: ChamberAtom = {
          ...fallingAtom,
          y: targetFloor,
          landed: true,
        };

        setFallingAtom(null);
        setIsDropping(false);
        setChamberAtoms((prev) => [...prev, landedAtom]);
      } else {
        setFallingAtom((prev) => (prev ? { ...prev, y: currentY, vy: velocity } : null));
      }
    }, 20);

    return () => clearInterval(interval);
  }, [fallingAtom, isPaused, chamberAtoms]);

  // Reaction evaluation effect
  useEffect(() => {
    if (isDropping || isPaused || reactionLockRef.current) return;

    const landedAtoms = chamberAtoms.filter((a) => a.landed);
    if (landedAtoms.length < 2) {
      setPartialHints([]);
      return;
    }

    const result = evaluateChamberReactions(landedAtoms, currentLevelNumber);

    if (result.formedCompound) {
      reactionLockRef.current = true;
      const comp = result.formedCompound;
      const consumedIds = new Set(result.consumedAtomIds);

      // Check combo multiplier
      const now = Date.now();
      let combo = 1;
      if (now - lastReactionTimeRef.current < 18000) {
        combo = activeCombo + 1;
        sound.playCombo(combo);
      } else {
        sound.playBondFormed();
      }
      lastReactionTimeRef.current = now;
      setActiveCombo(combo);

      // Calculate reaction points with combo
      const basePoints = 100;
      const compoundPoints = basePoints * combo;

      // Visual fanfare
      triggerBurst(50, 50, '#38bdf8');
      addFloatingText(
        `+${compoundPoints} ${comp.name.toUpperCase()}!${combo > 1 ? ` (x${combo})` : ''}`,
        50,
        35
      );

      // Award points & stats
      setCurrentScore((prev) => {
        const nextScore = prev + compoundPoints;
        setStats((s) => ({
          ...s,
          totalScore: nextScore,
          highScore: Math.max(s.highScore, nextScore),
          compoundsCount: s.compoundsCount + 1,
        }));
        return nextScore;
      });

      // Check 24-Hour Daily Challenge Bounty!
      const todayKey = getTodayDateKey();
      if (
        isDailyChallengeActive &&
        dailyChallengeTarget &&
        comp.id === dailyChallengeTarget.id &&
        !isDailyChallengeCompleted(stats, todayKey)
      ) {
        const bountyBonus = 500;
        sound.playLevelUp();
        triggerBurst(50, 45, '#f59e0b');
        addFloatingText(`⭐ DAILY CHALLENGE COMPLETE! +${bountyBonus} PTS`, 50, 25);
        setCurrentScore((prev) => prev + bountyBonus);
        setStats((s) => ({
          ...s,
          totalScore: s.totalScore + bountyBonus,
          highScore: Math.max(s.highScore, s.totalScore + bountyBonus),
          dailyChallengeCompletedDates: [...(s.dailyChallengeCompletedDates || []), todayKey],
          dailyStreak: (s.dailyStreak || 0) + 1,
        }));
      }

      // Advance recipe target if matched!
      if (comp.id === activeTargetCompoundId) {
        setCurrentTargetIndex((prev) => prev + 1);
      }

      // Remove consumed atoms from chamber
      setChamberAtoms((prev) => prev.filter((a) => !consumedIds.has(a.id)));

      // Open streamlined celebration modal
      setActiveReactionCompound(comp);
      setPartialHints([]);
    } else {
      setPartialHints(result.missingElementsForHints);
    }
  }, [chamberAtoms, isDropping, isPaused, currentLevelNumber, activeCombo, activeTargetCompoundId]);

  // Handle reaction modal finish (quiz complete or skip)
  const handleReactionModalFinish = (isCorrect: boolean) => {
    const comp = activeReactionCompound;
    setActiveReactionCompound(null);

    let streakBonus = 0;
    const newStreak = isCorrect ? stats.currentStreak + 1 : 0;
    if (newStreak > 0 && newStreak % 3 === 0) {
      streakBonus = 100;
    }

    const questionPoints = isCorrect ? 50 + streakBonus : 0;

    if (isCorrect) {
      addFloatingText(`+${questionPoints} PTS! 🎯`, 50, 45);
      triggerBurst(50, 40, '#10b981');
    }

    setCurrentScore((prev) => {
      const nextScore = prev + questionPoints;
      setStats((s) => {
        const discovered =
          comp && !s.discoveredCompounds.includes(comp.id)
            ? [...s.discoveredCompounds, comp.id]
            : s.discoveredCompounds;

        return {
          ...s,
          totalScore: nextScore,
          highScore: Math.max(s.highScore, nextScore),
          questionsAnswered: s.questionsAnswered + 1,
          correctAnswers: s.correctAnswers + (isCorrect ? 1 : 0),
          currentStreak: newStreak,
          highestStreak: Math.max(s.highestStreak, newStreak),
          discoveredCompounds: discovered,
        };
      });
      return nextScore;
    });

    const updatedCount = compoundsCreatedThisLevel + 1;
    setCompoundsCreatedThisLevel(updatedCount);

    if (updatedCount >= currentLevelConfig.compoundsToComplete) {
      sound.playLevelUp();
      setShowLevelComplete(true);
      const nextLvl = currentLevelNumber + 1;
      if (nextLvl <= 4) {
        setStats((s) => ({
          ...s,
          unlockedLevels: Array.from(new Set([...s.unlockedLevels, nextLvl])),
        }));
      }
    }

    reactionLockRef.current = false;
  };

  const handleNextLevel = () => {
    const nextLvl = currentLevelNumber + 1;
    if (nextLvl <= 4) {
      startLevel(nextLvl);
    } else {
      setScreenMode('MAIN_MENU');
    }
  };

  const handleReplayLevel = () => {
    startLevel(currentLevelNumber);
  };

  const handleClearChamber = () => {
    sound.playZap();
    triggerBurst(50, 70, '#f43f5e');
    addFloatingText('Chamber Cleared!', 50, 50);
    setChamberAtoms([]);
    setPartialHints([]);
    reactionLockRef.current = false;
  };

  const handleResetProgress = () => {
    const fresh = resetPlayerStats();
    setStats(fresh);
    setCurrentScore(0);
    setCurrentLevelNumber(1);
    setChamberAtoms([]);
    setScreenMode('MAIN_MENU');
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* 1. MAIN MENU SCREEN */}
      {screenMode === 'MAIN_MENU' && (
        <MainMenu
          stats={stats}
          onNavigate={(screen) => setScreenMode(screen)}
          onStartLevel={(lvl) => startLevel(lvl)}
          onStartDailyChallenge={(comp) => startDailyChallenge(comp)}
          onToggleSound={toggleSound}
          onOpenAI={() => {
            setGlobalAIInitialQuestion(undefined);
            setShowGlobalAI(true);
          }}
        />
      )}

      {/* 2. ACTIVE GAMEPLAY SCREEN */}
      {screenMode === 'PLAYING' && (
        <div className="min-h-screen w-full flex flex-col items-center justify-between p-2 sm:p-4 max-w-lg mx-auto relative">
          {/* TOP HEADER */}
          <header className="w-full flex items-center justify-between py-2 px-1 border-b border-slate-850 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setScreenMode('MAIN_MENU');
                }}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Return to Menu"
              >
                <Home className="w-4 h-4" />
              </button>
              <div>
                <div className="text-[10px] font-black tracking-widest text-cyan-400 uppercase leading-none">
                  ELEMENT BOND
                </div>
                <div className="text-xs font-bold text-white leading-tight mt-0.5">
                  {isDailyChallengeActive
                    ? '24H Daily Challenge'
                    : `L${currentLevelNumber}: ${currentLevelConfig.subtitle}`}
                </div>
              </div>
            </div>

            {/* Score & Controls */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end leading-none">
                <span className="text-[9px] font-mono text-slate-400 uppercase">Score</span>
                <span className="text-sm sm:text-base font-mono font-bold text-cyan-300">
                  {currentScore}
                </span>
              </div>

              <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2">
                {/* AI Tutor Help Button */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setGlobalAIInitialQuestion(undefined);
                    setShowGlobalAI(true);
                  }}
                  className="px-2 py-1 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm shadow-cyan-500/20"
                  title="Ask ChemAI Tutor"
                >
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] font-bold">AI Help</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setIsPaused((prev) => !prev);
                  }}
                  className={`p-1.5 rounded-xl transition-colors ${
                    isPaused ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                  title={isPaused ? 'Resume' : 'Pause'}
                >
                  {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    toggleSound();
                  }}
                  className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title={stats.soundEnabled ? 'Mute' : 'Unmute'}
                >
                  {stats.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </header>

          {/* 24-HOUR DAILY CHALLENGE BANNER */}
          {isDailyChallengeActive && dailyChallengeTarget && (
            <div className="w-full mt-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/25 via-amber-500/15 to-amber-500/25 border border-amber-400/50 flex items-center justify-between text-xs text-amber-200 shadow-md">
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                <span className="font-black text-white text-[11px] uppercase tracking-wide">
                  Daily Bounty:
                </span>
                <span className="font-bold text-amber-300 truncate">{dailyChallengeTarget.name}</span>
                <span className="font-mono text-cyan-300 font-bold">
                  ({dailyChallengeTarget.formattedFormula})
                </span>
              </div>
              <span className="font-mono font-black text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded-lg border border-amber-400/40 text-[11px] shrink-0">
                +500 PTS
              </span>
            </div>
          )}

          {/* VISUAL RECIPE TARGET BAR */}
          <div className="w-full mt-1 shrink-0">
            <RecipeTargetBar
              targetCompoundId={activeTargetCompoundId}
              chamberAtoms={chamberAtoms}
              onOpenDetails={(compound) => setInspectCompound(compound)}
            />
          </div>

          {/* ELEMENT SPAWNING & PREVIEW AREA */}
          <div className="w-full flex items-center justify-center gap-3 py-1 shrink-0">
            {/* Active Reagent Tile */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1">
                Active Drop
              </span>
              <ElementTile
                element={currentElementSymbol}
                size="spawner"
                highlight={!isDropping && !isPaused}
              />
            </div>

            {/* Tactical Swap Button */}
            <button
              onClick={handleSwapElements}
              title="Swap current and next element (or press S)"
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 shadow-md transition-all active:scale-90 flex flex-col items-center gap-0.5"
            >
              <Repeat className="w-4 h-4 stroke-[2.5]" />
              <span className="text-[8px] font-bold uppercase tracking-wider">Swap</span>
            </button>

            {/* Next Element Preview */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                Next In Line
              </span>
              <div className="opacity-80 scale-90">
                <ElementTile element={nextElementSymbol} size="md" />
              </div>
            </div>
          </div>

          {/* REACTION CHAMBER */}
          <div className="w-full my-auto flex flex-col items-center">
            <ReactionChamber
              atoms={chamberAtoms}
              aimPosition={aimPosition}
              onAimChange={setAimPosition}
              onDropTrigger={triggerDrop}
              fallingAtom={fallingAtom}
              partialHints={partialHints}
              onClearChamber={handleClearChamber}
              onZapAtom={handleZapAtom}
              onMagnetPull={handleMagnetPull}
              isPaused={isPaused}
              disabled={isDropping || !!activeReactionCompound || showLevelComplete}
              floatingScores={floatingScores}
              burstParticles={burstParticles}
              activeCombo={activeCombo}
            />
          </div>

          {/* DROP CONTROLLER */}
          <div className="w-full max-w-sm mt-1.5 flex flex-col items-center gap-2 shrink-0">
            <div className="w-full px-2 flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500">Aim:</span>
              <input
                type="range"
                min="12"
                max="88"
                value={aimPosition}
                disabled={isDropping || isPaused}
                onChange={(e) => setAimPosition(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            <button
              onClick={triggerDrop}
              disabled={isDropping || isPaused || !!activeReactionCompound || showLevelComplete}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-base sm:text-lg tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all ${
                isDropping || isPaused
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-cyan-500/25 active:scale-95 cursor-pointer'
              }`}
            >
              <ArrowDown className="w-5 h-5 stroke-[3]" />
              <span>{isDropping ? 'Releasing Element...' : 'DROP ELEMENT'}</span>
            </button>
          </div>

          {/* Pause Overlay */}
          {isPaused && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 text-center max-w-xs shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-2">Game Paused</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Take a breath. Press resume when you are ready to continue bonding!
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => setIsPaused(false)}
                    className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                  >
                    Resume Experiment
                  </button>
                  <button
                    onClick={() => {
                      setIsPaused(false);
                      setScreenMode('MAIN_MENU');
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Exit to Main Menu
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Compound Reaction Celebration Modal */}
          {activeReactionCompound && (
            <CompoundReactionModal
              compound={activeReactionCompound}
              currentStreak={stats.currentStreak}
              onFinish={handleReactionModalFinish}
            />
          )}

          {/* Level Complete Celebration Modal */}
          {showLevelComplete && (
            <LevelCompleteModal
              levelConfig={currentLevelConfig}
              levelScore={currentScore}
              totalScore={stats.totalScore}
              compoundsCreatedThisLevel={compoundsCreatedThisLevel}
              hasNextLevel={currentLevelNumber < 4}
              onNextLevel={handleNextLevel}
              onReplayLevel={handleReplayLevel}
              onReturnMenu={() => setScreenMode('MAIN_MENU')}
            />
          )}

          {/* Floating AI Helper Quick Button during gameplay */}
          <button
            onClick={() => {
              sound.playClick();
              setGlobalAIInitialQuestion('What does (g) on the brackets mean?');
              setShowGlobalAI(true);
            }}
            className="fixed bottom-24 right-3 sm:right-6 z-30 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-850 border border-cyan-400/50 text-cyan-300 text-xs font-bold shadow-lg shadow-cyan-500/20 backdrop-blur-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Ask ChemAI for help"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>AI Help ✨</span>
          </button>
        </div>
      )}

      {/* 3. PERIODIC TABLE MODAL */}
      {screenMode === 'PERIODIC_TABLE' && (
        <PeriodicTableModal
          discoveredSymbols={stats.discoveredElements}
          onClose={() => setScreenMode('MAIN_MENU')}
        />
      )}

      {/* 4. MY COMPOUNDS MODAL */}
      {screenMode === 'MY_COMPOUNDS' && (
        <MyCompoundsModal
          discoveredCompoundIds={stats.discoveredCompounds}
          onClose={() => setScreenMode('MAIN_MENU')}
        />
      )}

      {/* 5. LEARN CHEMISTRY MODAL */}
      {screenMode === 'LEARN_CHEMISTRY' && (
        <LearnChemistryModal onClose={() => setScreenMode('MAIN_MENU')} />
      )}

      {/* 6. HOW TO PLAY MODAL */}
      {screenMode === 'HOW_TO_PLAY' && (
        <HowToPlayModal
          onClose={() => setScreenMode('MAIN_MENU')}
          onStartGame={() => startLevel(stats.currentLevel)}
        />
      )}

      {/* 7. SETTINGS MODAL */}
      {screenMode === 'SETTINGS' && (
        <SettingsModal
          stats={stats}
          onUpdateStats={setStats}
          onResetProgress={handleResetProgress}
          onClose={() => setScreenMode('MAIN_MENU')}
        />
      )}

      {/* 8. SCIENTIFIC COMPOUND INSPECTOR MODAL */}
      {inspectCompound && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-cyan-500/40 p-5 shadow-2xl relative text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                Scientific Formula Sheet
              </span>
              <button
                onClick={() => setInspectCompound(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-black text-white mt-1">
              {inspectCompound.name}
            </h3>
            <div className="text-sm font-mono font-bold text-cyan-300">
              {inspectCompound.formattedFormula}
            </div>

            {/* Molecule structure visual */}
            <div className="my-3 flex justify-center">
              <MoleculeVisualizer compound={inspectCompound} size="sm" />
            </div>

            {/* Balanced Equation */}
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 mb-2.5 font-mono text-xs">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Balanced Equation</span>
              <span className="text-emerald-400 font-bold">{inspectCompound.balancedEquation}</span>
            </div>

            {/* PubChem Scientific Properties */}
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1 mb-3 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">PubChem CID:</span>
                <span className="text-cyan-400 font-bold">{inspectCompound.pubchemCid || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Molecular Mass:</span>
                <span className="text-slate-200">{inspectCompound.molecularWeight ? `${inspectCompound.molecularWeight} g/mol` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SMILES:</span>
                <span className="text-amber-300 truncate max-w-[170px]">{inspectCompound.canonicalSmiles || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bond Type:</span>
                <span className="text-emerald-400">{inspectCompound.bondingType}</span>
              </div>
            </div>

            <button
              onClick={() => setInspectCompound(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Back to Laboratory
            </button>
          </div>
        </div>
      )}

      {/* 9. GLOBAL CHEMAI TUTOR MODAL */}
      <ChemAIAssistantModal
        isOpen={showGlobalAI}
        onClose={() => setShowGlobalAI(false)}
        context={{
          levelNumber: currentLevelNumber,
          compoundName: COMPOUND_MAP.get(activeTargetCompoundId)?.name,
          formula: COMPOUND_MAP.get(activeTargetCompoundId)?.formattedFormula,
          balancedEquation: COMPOUND_MAP.get(activeTargetCompoundId)?.balancedEquation,
          bondingType: COMPOUND_MAP.get(activeTargetCompoundId)?.bondingType,
          chamberAtoms: chamberAtoms.map((a) => a.elementSymbol),
        }}
        initialQuestion={globalAIInitialQuestion}
      />
    </div>
  );
}
