import { Compound, DailyChallengeInfo, PlayerStats } from '../types/chemistry';
import { COMPOUNDS, COMPOUND_MAP } from '../data/compounds';

/**
 * Returns current local date as "YYYY-MM-DD"
 */
export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Computes remaining time until the next 24-hour reset (midnight local time)
 */
export function getTimeUntilMidnight(): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatted = `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

  return { hours, minutes, seconds, formatted };
}

/**
 * Deterministically picks a compound for the date so all players on the same day share the challenge.
 */
export function getDailyChallenge(dateKey: string = getTodayDateKey()): {
  info: DailyChallengeInfo;
  compound: Compound;
} {
  // Simple integer hash of the dateKey
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash << 5) - hash + dateKey.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COMPOUNDS.length;
  const compound = COMPOUNDS[index];

  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  return {
    info: {
      dateKey,
      compoundId: compound.id,
      bonusPoints: 500, // Extra points reward
      expiresAt: midnight.getTime(),
    },
    compound,
  };
}

/**
 * Checks whether the player completed the challenge for the given date
 */
export function isDailyChallengeCompleted(stats: PlayerStats, dateKey: string = getTodayDateKey()): boolean {
  return (stats.dailyChallengeCompletedDates || []).includes(dateKey);
}
