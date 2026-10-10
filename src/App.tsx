import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayerStats,
  ScreenMode,
  ChamberAtom,
  Compound,
  ElementData,
} from './types/chemistry';
import { ELEMENTS, ELEMENT_MAP } from './data/elements';
import { COMPOUNDS, COMPOUND_MAP } from './data/compounds';
import { LEVELS, LevelConfig } from './data/levels';
import { evaluateChamberReactions, getNextRandomElement } from './utils/reactionEngine';
import { loadPlayerStats, savePlayerStats, resetPlayerStats } from './utils/storage';
import { sound } from './utils/audio';

import { ElementTile } from './components/ElementTile';
import { ReactionChamber } from './components/ReactionChamber';
import { CompoundSuccessOverlay } from './components/CompoundSuccessOverlay';
import { MCQModal } from './components/MCQModal';
import { MainMenu } from './components/MainMenu';
import { PeriodicTableModal } from './components/PeriodicTableModal';
import { MyCompoundsModal } from './components/MyCompoundsModal';
import { LearnChemistryModal } from './components/LearnChemistryModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';

import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Home,
  Sparkles,
  Trophy,
  Award,
  Flame,
  ArrowDown,
  Info,
  Layers,
} from 'lucide-react';

export default function App() {
  // --- Persistent Player Stats ---
  const [stats, setStats] = useState<PlayerStats>(() => loadPlayerStats());

  // Save stats whenever updated
  useEffect(() => {
    savePlayerStats(stats);
  }, [stats]);

  // Sync sound engine enabled state
  useEffect(() => {
    sound.setEnabled(stats.soundEnabled);
  }, [stats.soundEnabled]);

  // --- Navigation & Modals ---
  const [screenMode, setScreenMode] = useState<ScreenMode>('MAIN_MENU');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // --- Active Gameplay State ---
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(stats.currentLevel);
  const currentLevelConfig = LEVELS.find(l => l.levelNumber === currentLevelNumber) || LEVELS[0];

  const [currentScore, setCurrentScore] = useState<number>(stats.totalScore);
  const [chamberAtoms, setChamberAtoms] = useState<ChamberAtom[]>([]);
  const [aimPosition, setAimPosition] = useState<number>(50); // 10 to 90%
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [fallingAtom, setFallingAtom] = useState<ChamberAtom | null>(null);

  // Current and Next Element in spawner
  const [currentElementSymbol, setCurrentElementSymbol] = useState<string>('H');
  const [nextElementSymbol, setNextElementSymbol] = useState<string>('O');

  // Successful Compound & MCQ Workflow
  const [synthesizedCompound, setSynthesizedCompound] = useState<Compound | null>(null);
  const [activeMCQCompound, setActiveMCQCompound] = useState<Compound | null>(null);

  // Level Progression tracking
  const [compoundsCreatedThisLevel, setCompoundsCreatedThisLevel] = useState<number>(0);
  const [showLevelComplete, setShowLevelComplete] = useState<boolean>(false);

  // Partial match hints for chamber
  const [partialHints, setPartialHints] = useState<{ compound: Compound; missing: { symbol: string; count: number }[] }[]>([]);

  // Prevent duplicate reaction evaluations
  const reactionLockRef = useRef<boolean>(false);

  // Track animation frame for falling atom
  const fallAnimRef = useRef<number | null>(null);

  // Initialize or change levels
  const startLevel = (lvlNum: number) => {
    setCurrentLevelNumber(lvlNum);
    setChamberAtoms([]);
    setFallingAtom(null);
    setIsDropping(false);
    setIsPaused(false);
    setSynthesizedCompound(null);
    setActiveMCQCompound(null);
    setShowLevelComplete(false);
    setCompoundsCreatedThisLevel(0);
    reactionLockRef.current = false;

    // Pick initial elements for this level
    const first = getNextRandomElement(lvlNum, []);
    const second = getNextRandomElement(lvlNum, []);
    setCurrentElementSymbol(first);
    setNextElementSymbol(second);

    // Track element as discovered
    discoverElement(first);
    discoverElement(second);

    setScreenMode('PLAYING');
  };

  const discoverElement = (symbol: string) => {
    setStats(prev => {
      if (prev.discoveredElements.includes(symbol)) return prev;
      return {
        ...prev,
        discoveredElements: [...prev.discoveredElements, symbol],
      };
    });
  };

  // Switch sound toggle
  const toggleSound = () => {
    setStats(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  // --- Falling Atom Animation & Stacking Mechanics ---
  const triggerDrop = useCallback(() => {
    if (isDropping || isPaused || screenMode !== 'PLAYING' || synthesizedCompound || activeMCQCompound || showLevelComplete) {
      return;
    }

    // Limit chamber to 10 atoms maximum to prevent overcrowding
    if (chamberAtoms.length >= 10) {
      sound.playIncorrect();
      return;
    }

    sound.playDrop();
    setIsDropping(true);

    const newAtom: ChamberAtom = {
      id: `atom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      elementSymbol: currentElementSymbol,
      x: aimPosition,
      y: 8, // starts at top of chamber (8%)
      vy: 1.2,
      rotation: (Math.random() - 0.5) * 20,
      landed: false,
    };

    setFallingAtom(newAtom);

    // Advance spawner: current becomes next, next is newly drawn
    setCurrentElementSymbol(nextElementSymbol);
    const upcoming = getNextRandomElement(currentLevelNumber, [...chamberAtoms, newAtom]);
    setNextElementSymbol(upcoming);
    discoverElement(upcoming);
  }, [
    isDropping,
    isPaused,
    screenMode,
    synthesizedCompound,
    activeMCQCompound,
    showLevelComplete,
    chamberAtoms,
    currentElementSymbol,
    nextElementSymbol,
    aimPosition,
    currentLevelNumber,
  ]);

  // Keyboard controls: ArrowLeft, ArrowRight, ArrowDown, Space, P (pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screenMode !== 'PLAYING') return;

      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
        return;
      }

      if (isPaused || synthesizedCompound || activeMCQCompound || showLevelComplete) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setAimPosition(prev => Math.max(12, prev - 6));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setAimPosition(prev => Math.min(88, prev + 6));
      } else if (e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        triggerDrop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screenMode, isPaused, synthesizedCompound, activeMCQCompound, showLevelComplete, triggerDrop]);

  // Physics animation loop for the falling element
  useEffect(() => {
    if (!fallingAtom || isPaused) return;

    let currentY = fallingAtom.y;
    let velocity = fallingAtom.vy || 1.2;
    const gravity = 0.22;

    // Determine target landing floor height based on existing atoms near this horizontal column
    // Base chamber floor is at ~86%
    let targetFloor = 86;
    for (const landed of chamberAtoms) {
      if (Math.abs(landed.x - fallingAtom.x) < 18) {
        // Stack on top of closest atom
        const stackHeight = landed.y - 12;
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
        setChamberAtoms(prev => [...prev, landedAtom]);
      } else {
        setFallingAtom(prev => (prev ? { ...prev, y: currentY, vy: velocity } : null));
      }
    }, 20);

    return () => clearInterval(interval);
  }, [fallingAtom, isPaused, chamberAtoms]);

  // Reaction evaluation effect: runs whenever chamber atoms change and land
  useEffect(() => {
    if (isDropping || isPaused || reactionLockRef.current) return;

    const landedAtoms = chamberAtoms.filter(a => a.landed);
    if (landedAtoms.length < 2) {
      setPartialHints([]);
      return;
    }

    const result = evaluateChamberReactions(landedAtoms, currentLevelNumber);

    if (result.formedCompound) {
      reactionLockRef.current = true;
      sound.playBondFormed();

      const comp = result.formedCompound;
      const consumedIds = new Set(result.consumedAtomIds);

      // Award compound points (+100 points)
      const compoundPoints = 100;
      setCurrentScore(prev => {
        const nextScore = prev + compoundPoints;
        setStats(s => ({
          ...s,
          totalScore: nextScore,
          highScore: Math.max(s.highScore, nextScore),
          compoundsCount: s.compoundsCount + 1,
        }));
        return nextScore;
      });

      // Remove consumed atoms from chamber
      setChamberAtoms(prev => prev.filter(a => !consumedIds.has(a.id)));

      // Trigger compound celebration overlay!
      setSynthesizedCompound(comp);
      setPartialHints([]);
    } else {
      setPartialHints(result.missingElementsForHints);
    }
  }, [chamberAtoms, isDropping, isPaused, currentLevelNumber]);

  // Proceed from Compound Success to MCQ
  const handleProceedToMCQ = () => {
    const comp = synthesizedCompound;
    setSynthesizedCompound(null);
    if (comp) {
      setActiveMCQCompound(comp);
    }
  };

  // Complete MCQ Question
  const handleMCQComplete = (isCorrect: boolean) => {
    const comp = activeMCQCompound;
    setActiveMCQCompound(null);

    let streakBonus = 0;
    let newStreak = isCorrect ? stats.currentStreak + 1 : 0;
    if (newStreak > 0 && newStreak % 3 === 0) {
      streakBonus = 100; // Bonus for 3-streak
    }

    const questionPoints = isCorrect ? 50 + streakBonus : 0;

    setCurrentScore(prev => {
      const nextScore = prev + questionPoints;
      setStats(s => {
        const discovered = comp && !s.discoveredCompounds.includes(comp.id)
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

    // Update level completed count
    const updatedCount = compoundsCreatedThisLevel + 1;
    setCompoundsCreatedThisLevel(updatedCount);

    // Check level completion
    if (updatedCount >= currentLevelConfig.compoundsToComplete) {
      sound.playLevelUp();
      setShowLevelComplete(true);
      // Unlock next level
      const nextLvl = currentLevelNumber + 1;
      if (nextLvl <= 4) {
        setStats(s => ({
          ...s,
          unlockedLevels: Array.from(new Set([...s.unlockedLevels, nextLvl])),
        }));
      }
    }

    // Release reaction lock
    reactionLockRef.current = false;
  };

  // Level complete handlers
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

  // Clear Chamber (Purge tool)
  const handleClearChamber = () => {
    sound.playClick();
    setChamberAtoms([]);
    setPartialHints([]);
    reactionLockRef.current = false;
  };

  // Reset progress from settings
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
          onToggleSound={toggleSound}
        />
      )}

      {/* 2. ACTIVE GAMEPLAY SCREEN */}
      {screenMode === 'PLAYING' && (
        <div className="min-h-screen w-full flex flex-col items-center justify-between p-2 sm:p-4 max-w-lg mx-auto relative">
          {/* A. TOP HEADER */}
          <header className="w-full flex items-center justify-between py-2 px-1 border-b border-slate-850 shrink-0">
            {/* Title & Level Indicator */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setScreenMode('MAIN_MENU');
                }}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Return to Menu"
              >
                <Home className="w-4 h-4" />
              </button>
              <div>
                <div className="text-[10px] font-black tracking-widest text-cyan-400 uppercase leading-none">
                  ELEMENT BOND
                </div>
                <div className="text-xs font-bold text-white leading-tight mt-0.5">
                  L{currentLevelNumber}: {currentLevelConfig.subtitle}
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

              <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                {/* Pause Button */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsPaused(prev => !prev);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isPaused ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                  title={isPaused ? 'Resume' : 'Pause'}
                >
                  {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
                </button>

                {/* Sound Button */}
                <button
                  onClick={() => {
                    sound.playClick();
                    toggleSound();
                  }}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title={stats.soundEnabled ? 'Mute' : 'Unmute'}
                >
                  {stats.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </header>

          {/* Target Mission Progress Bar */}
          <div className="w-full my-1.5 px-2 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Goal: {compoundsCreatedThisLevel}/{currentLevelConfig.compoundsToComplete} Compounds</span>
            </div>
            {stats.currentStreak >= 2 && (
              <span className="text-amber-400 font-mono font-bold text-[11px] flex items-center gap-0.5">
                <Flame className="w-3.5 h-3.5" />
                <span>{stats.currentStreak} Streak</span>
              </span>
            )}
          </div>

          {/* B. ELEMENT SPAWNING & PREVIEW AREA */}
          <div className="w-full flex items-center justify-center gap-4 py-1 shrink-0">
            {/* Current Element Tile in Spawner */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1 flex items-center gap-1">
                <span>Active Reagent</span>
              </span>
              <ElementTile
                element={currentElementSymbol}
                size="spawner"
                highlight={!isDropping && !isPaused}
              />
            </div>

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

          {/* C. REACTION CHAMBER */}
          <div className="w-full my-auto flex flex-col items-center">
            <ReactionChamber
              atoms={chamberAtoms}
              aimPosition={aimPosition}
              onAimChange={setAimPosition}
              onDropTrigger={triggerDrop}
              fallingAtom={fallingAtom}
              partialHints={partialHints}
              onClearChamber={handleClearChamber}
              isPaused={isPaused}
              disabled={isDropping || !!synthesizedCompound || !!activeMCQCompound || showLevelComplete}
            />
          </div>

          {/* D. DROP CONTROL & ACTIONS */}
          <div className="w-full max-w-sm mt-2 flex flex-col items-center gap-2 shrink-0">
            {/* Horizontal Aimer Slider */}
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

            {/* Large DROP Button */}
            <button
              onClick={triggerDrop}
              disabled={isDropping || isPaused || !!synthesizedCompound || !!activeMCQCompound || showLevelComplete}
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

          {/* Pause Overlay if active */}
          {isPaused && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700 text-center max-w-xs shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-2">Experiment Paused</h3>
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

          {/* Compound Formed Celebration Overlay */}
          {synthesizedCompound && (
            <CompoundSuccessOverlay
              compound={synthesizedCompound}
              onProceedToMCQ={handleProceedToMCQ}
            />
          )}

          {/* Multiple Choice Question Modal */}
          {activeMCQCompound && (
            <MCQModal
              compound={activeMCQCompound}
              onAnswerComplete={handleMCQComplete}
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
    </div>
  );
}
