import { PlayerStats } from '../types/chemistry';

const STORAGE_KEY = 'element_bond_chemistry_game_stats_v1';

export const DEFAULT_STATS: PlayerStats = {
  totalScore: 0,
  highScore: 0,
  currentLevel: 1,
  unlockedLevels: [1],
  discoveredCompounds: [],
  discoveredElements: ['H'], // Start with hydrogen
  compoundsCount: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  currentStreak: 0,
  highestStreak: 0,
  soundEnabled: true,
  dailyChallengeCompletedDates: [],
  dailyStreak: 0,
};

export function loadPlayerStats(): PlayerStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      // Ensure arrays exist
      unlockedLevels: parsed.unlockedLevels || [1],
      discoveredCompounds: parsed.discoveredCompounds || [],
      discoveredElements: parsed.discoveredElements || ['H'],
      dailyChallengeCompletedDates: parsed.dailyChallengeCompletedDates || [],
      dailyStreak: parsed.dailyStreak || 0,
    };
  } catch (err) {
    console.error('Failed to load player stats from localStorage:', err);
    return DEFAULT_STATS;
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save player stats to localStorage:', err);
  }
}

export function resetPlayerStats(): PlayerStats {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored
    }
  }
  return { ...DEFAULT_STATS };
}
