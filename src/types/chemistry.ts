export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'transition-metal'
  | 'post-transition'
  | 'metalloid'
  | 'reactive-nonmetal'
  | 'noble-gas'
  | 'halogen'
  | 'lanthanide'
  | 'actinide';

export interface CategoryTheme {
  name: string;
  bg: string;
  border: string;
  badgeBg: string;
  text: string;
  glow: string;
  colorName: string;
}

export interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category: ElementCategory;
  period: number;
  group: number;
  valenceElectrons?: number;
  fact: string;
  discovered?: boolean;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Compound {
  id: string;
  name: string;
  formula: string;
  formattedFormula: string; // e.g., H₂O
  requiredElements: Record<string, number>; // e.g., { H: 2, O: 1 }
  balancedEquation: string; // e.g., 2H₂ + O₂ → 2H₂O
  category: 'Covalent Molecule' | 'Ionic Compound' | 'Acid' | 'Base' | 'Oxide' | 'Organic Molecule';
  bondingType: 'Polar Covalent' | 'Nonpolar Covalent' | 'Ionic' | 'Covalent Network';
  description: string;
  educationalFact: string;
  difficultyLevel: 1 | 2 | 3 | 4;
  energyCondition: string;
  mcqQuestions: MCQQuestion[];
  structureVisual: 'water' | 'nacl' | 'co2' | 'ammonia' | 'methane' | 'hcl' | 'mgo' | 'caco3' | 'co' | 'h2o2' | 'so2' | 'naoh' | 'generic';
}

export interface ChamberAtom {
  id: string;
  elementSymbol: string;
  x: number; // percentage 5% - 85%
  y: number; // percentage in chamber
  vx?: number;
  vy?: number;
  rotation: number;
  landed: boolean;
}

export interface PlayerStats {
  totalScore: number;
  highScore: number;
  currentLevel: number;
  unlockedLevels: number[];
  discoveredCompounds: string[];
  discoveredElements: string[];
  compoundsCount: number;
  questionsAnswered: number;
  correctAnswers: number;
  currentStreak: number;
  highestStreak: number;
  soundEnabled: boolean;
}

export type ScreenMode =
  | 'MAIN_MENU'
  | 'PLAYING'
  | 'LEARN_CHEMISTRY'
  | 'PERIODIC_TABLE'
  | 'MY_COMPOUNDS'
  | 'HOW_TO_PLAY'
  | 'SETTINGS';
