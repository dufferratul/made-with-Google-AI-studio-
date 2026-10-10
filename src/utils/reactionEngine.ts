import { ChamberAtom, Compound } from '../types/chemistry';
import { COMPOUNDS, COMPOUND_MAP } from '../data/compounds';
import { LEVELS } from '../data/levels';

export interface ReactionCheckResult {
  formedCompound: Compound | null;
  consumedAtomIds: string[];
  missingElementsForHints: { compound: Compound; missing: { symbol: string; count: number }[] }[];
}

/**
 * Checks whether atoms in the reaction chamber can form any valid compound.
 * Prioritizes the target compounds of the active level, but accepts any valid compound.
 */
export function evaluateChamberReactions(
  atoms: ChamberAtom[],
  currentLevelNumber: number
): ReactionCheckResult {
  // Only consider atoms that have landed
  const landedAtoms = atoms.filter(a => a.landed);
  if (landedAtoms.length < 2) {
    return {
      formedCompound: null,
      consumedAtomIds: [],
      missingElementsForHints: [],
    };
  }

  // Count available elements
  const atomCountMap = new Map<string, ChamberAtom[]>();
  for (const atom of landedAtoms) {
    const list = atomCountMap.get(atom.elementSymbol) || [];
    list.push(atom);
    atomCountMap.set(atom.elementSymbol, list);
  }

  const currentLevelConfig = LEVELS.find(l => l.levelNumber === currentLevelNumber) || LEVELS[0];

  // Sort compounds: target compounds of current level first, then level-appropriate, then others
  const sortedCompounds = [...COMPOUNDS].sort((a, b) => {
    const aIsTarget = currentLevelConfig.targetCompounds.includes(a.id) ? 1 : 0;
    const bIsTarget = currentLevelConfig.targetCompounds.includes(b.id) ? 1 : 0;
    if (aIsTarget !== bIsTarget) return bIsTarget - aIsTarget;

    const aLevelDist = Math.abs(a.difficultyLevel - currentLevelNumber);
    const bLevelDist = Math.abs(b.difficultyLevel - currentLevelNumber);
    return aLevelDist - bLevelDist;
  });

  // Check for complete match
  for (const compound of sortedCompounds) {
    let canForm = true;
    const usedIds: string[] = [];

    for (const [symbol, neededCount] of Object.entries(compound.requiredElements)) {
      const available = atomCountMap.get(symbol) || [];
      if (available.length < neededCount) {
        canForm = false;
        break;
      } else {
        // Collect atom IDs for consumption
        for (let i = 0; i < neededCount; i++) {
          usedIds.push(available[i].id);
        }
      }
    }

    if (canForm) {
      return {
        formedCompound: compound,
        consumedAtomIds: usedIds,
        missingElementsForHints: [],
      };
    }
  }

  // If no compound formed, check for partial matches to provide educational guidance
  const partialMatches: { compound: Compound; missing: { symbol: string; count: number }[] }[] = [];

  for (const compound of sortedCompounds) {
    let hasAtLeastOneComponent = false;
    let missingList: { symbol: string; count: number }[] = [];

    for (const [symbol, neededCount] of Object.entries(compound.requiredElements)) {
      const available = atomCountMap.get(symbol) || [];
      if (available.length > 0) {
        hasAtLeastOneComponent = true;
      }
      if (available.length < neededCount) {
        missingList.push({
          symbol,
          count: neededCount - available.length,
        });
      }
    }

    // If some atoms exist and missing atoms <= 2, provide this hint
    if (hasAtLeastOneComponent && missingList.length > 0 && missingList.reduce((acc, m) => acc + m.count, 0) <= 2) {
      partialMatches.push({
        compound,
        missing: missingList,
      });
    }
  }

  return {
    formedCompound: null,
    consumedAtomIds: [],
    missingElementsForHints: partialMatches.slice(0, 2),
  };
}

/**
 * Controlled random element spawner based on current level configuration
 * and target compounds to ensure players never get an impossible loop.
 */
export function getNextRandomElement(
  levelNumber: number,
  currentChamberAtoms: ChamberAtom[]
): string {
  const levelConfig = LEVELS.find(l => l.levelNumber === levelNumber) || LEVELS[0];
  const pool = levelConfig.elementPool;

  // Check what the chamber is missing to complete a target compound!
  const chamberCounts: Record<string, number> = {};
  for (const atom of currentChamberAtoms) {
    chamberCounts[atom.elementSymbol] = (chamberCounts[atom.elementSymbol] || 0) + 1;
  }

  // Look for target compounds that are 1 atom away from completion
  for (const targetId of levelConfig.targetCompounds) {
    const comp = COMPOUND_MAP.get(targetId);
    if (!comp) continue;

    let missingSymbol: string | null = null;
    let totalMissing = 0;

    for (const [sym, count] of Object.entries(comp.requiredElements)) {
      const cur = chamberCounts[sym] || 0;
      if (cur < count) {
        totalMissing += count - cur;
        missingSymbol = sym;
      }
    }

    // 40% probability boost for the missing element to keep gameplay flowing smoothly!
    if (totalMissing === 1 && missingSymbol && pool.includes(missingSymbol)) {
      if (Math.random() < 0.45) {
        return missingSymbol;
      }
    }
  }

  // Fallback to level weights
  const weights = levelConfig.weights;
  let totalWeight = 0;
  for (const el of pool) {
    totalWeight += weights[el] || 10;
  }

  let randomVal = Math.random() * totalWeight;
  for (const el of pool) {
    const w = weights[el] || 10;
    if (randomVal <= w) {
      return el;
    }
    randomVal -= w;
  }

  return pool[0];
}
