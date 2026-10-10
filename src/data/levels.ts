export interface LevelConfig {
  levelNumber: number;
  title: string;
  subtitle: string;
  description: string;
  elementPool: string[]; // Element symbols
  targetCompounds: string[]; // compound IDs
  compoundsToComplete: number;
  pointsReward: number;
  weights: Record<string, number>; // Spawning probabilities
}

export const LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    title: 'Level 1: Element Explorer',
    subtitle: 'Elementary Bonds',
    description: 'Learn fundamental element symbols and create essential life compounds: Water (H₂O), Table Salt (NaCl), and Carbon Dioxide (CO₂).',
    elementPool: ['H', 'O', 'C', 'Na', 'Cl'],
    targetCompounds: ['water', 'sodium_chloride', 'carbon_dioxide'],
    compoundsToComplete: 3,
    pointsReward: 200,
    weights: {
      H: 35,
      O: 25,
      C: 15,
      Na: 12,
      Cl: 13,
    },
  },
  {
    levelNumber: 2,
    title: 'Level 2: Molecule Maker',
    subtitle: 'Atmospheric & Organic Molecules',
    description: 'Master stoichiometry ratios and balanced equations. Synthesize Ammonia (NH₃), Methane (CH₄), Hydrochloric Acid (HCl), and Carbon Monoxide (CO).',
    elementPool: ['H', 'O', 'C', 'N', 'Cl'],
    targetCompounds: ['ammonia', 'methane', 'hydrochloric_acid', 'carbon_monoxide'],
    compoundsToComplete: 4,
    pointsReward: 300,
    weights: {
      H: 35,
      N: 20,
      C: 18,
      O: 15,
      Cl: 12,
    },
  },
  {
    levelNumber: 3,
    title: 'Level 3: Chemistry Challenge',
    subtitle: 'Ionic Lattices & Acid-Base Chemistry',
    description: 'Investigate electron transfer and oxidation states. Create Magnesium Oxide (MgO), Sulfur Dioxide (SO₂), Caustic Soda (NaOH), and Hydrogen Peroxide (H₂O₂).',
    elementPool: ['H', 'O', 'Na', 'Mg', 'S', 'Cl'],
    targetCompounds: ['magnesium_oxide', 'sulfur_dioxide', 'sodium_hydroxide', 'hydrogen_peroxide'],
    compoundsToComplete: 4,
    pointsReward: 400,
    weights: {
      O: 30,
      H: 22,
      Mg: 16,
      S: 16,
      Na: 16,
    },
  },
  {
    levelNumber: 4,
    title: 'Level 4: Lab Master',
    subtitle: 'Advanced Mineral & Halide Chemistry',
    description: 'Synthesize complex geological minerals and high-energy halides: Calcium Carbonate (CaCO₃), Lithium Fluoride (LiF), and Potassium Chloride (KCl).',
    elementPool: ['Ca', 'C', 'O', 'Li', 'F', 'K', 'Cl'],
    targetCompounds: ['calcium_carbonate', 'lithium_fluoride', 'potassium_chloride'],
    compoundsToComplete: 4,
    pointsReward: 500,
    weights: {
      O: 30,
      Ca: 18,
      C: 14,
      Li: 13,
      F: 13,
      K: 12,
    },
  },
];
