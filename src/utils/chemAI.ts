/**
 * ChemAI Science Knowledge & Gemini AI Tutor Client.
 * Follows the AI Studio Science Skill & Gemini API guidelines.
 * Provides instant chemical notation analysis, state symbol explanations,
 * and conversational science tutoring.
 */

export interface ChemStateSymbolInfo {
  symbol: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  example: string;
}

export const STATE_SYMBOLS: Record<string, ChemStateSymbolInfo> = {
  '(g)': {
    symbol: '(g)',
    name: 'Gas State',
    shortDesc: 'Substance is in a gaseous phase at reaction conditions.',
    fullDesc:
      'In a gas, molecules have high kinetic energy and move freely and rapidly, expanding to fill whatever container they occupy. For example, O₂(g) is oxygen gas and Cl₂(g) is chlorine gas.',
    example: '2H₂(g) + O₂(g) → 2H₂O(l) (Hydrogen and oxygen gases react)',
  },
  '(s)': {
    symbol: '(s)',
    name: 'Solid State',
    shortDesc: 'Substance is in a rigid, fixed solid phase.',
    fullDesc:
      'In a solid, atoms, ions, or molecules are tightly packed in fixed positions, often forming a crystalline lattice with high stability. For example, Na(s) is solid sodium metal and NaCl(s) is solid table salt crystals.',
    example: '2Na(s) + Cl₂(g) → 2NaCl(s) (Solid sodium and chlorine gas form solid salt crystals)',
  },
  '(l)': {
    symbol: '(l)',
    name: 'Liquid State',
    shortDesc: 'Substance is in a fluid liquid phase.',
    fullDesc:
      'In a liquid, particles are close together but free to flow past one another, maintaining a fixed volume while conforming to the shape of the container. Pure water at room temperature is written as H₂O(l).',
    example: '2H₂(g) + O₂(g) → 2H₂O(l) (Water forms as a liquid)',
  },
  '(aq)': {
    symbol: '(aq)',
    name: 'Aqueous Solution',
    shortDesc: 'Substance is completely dissolved in water (aqueous).',
    fullDesc:
      '"Aqueous" comes from the Latin word "aqua" for water. It signifies that the solute has been dissolved in water, where polar water molecules surround and separate the individual ions or molecules (hydration shells).',
    example: 'NaCl(aq) → Na⁺(aq) + Cl⁻(aq) (Salt dissolved in water)',
  },
};

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  tags?: string[];
  suggestedQuestions?: string[];
}

export interface ChemContext {
  compoundName?: string;
  formula?: string;
  balancedEquation?: string;
  questionText?: string;
  options?: string[];
  bondingType?: string;
  levelNumber?: number;
  chamberAtoms?: string[];
}

/**
 * Detects common chemistry symbols in a text string (e.g. (g), (s), (l), (aq)).
 */
export function detectStateSymbols(text: string): ChemStateSymbolInfo[] {
  if (!text) return [];
  const found: ChemStateSymbolInfo[] = [];
  const clean = text.toLowerCase();

  if (clean.includes('(g)')) found.push(STATE_SYMBOLS['(g)']);
  if (clean.includes('(s)')) found.push(STATE_SYMBOLS['(s)']);
  if (clean.includes('(l)')) found.push(STATE_SYMBOLS['(l)']);
  if (clean.includes('(aq)')) found.push(STATE_SYMBOLS['(aq)']);

  return found;
}

/**
 * Knowledge base rule-matcher for instant responses (low latency / offline guarantee).
 */
export function getLocalScienceAnswer(question: string, context?: ChemContext): string | null {
  const q = question.toLowerCase().trim();

  // 1. Bracket notations / (g), (s), (l), (aq)
  if (
    q.includes('(g)') ||
    q.includes('meaning of g') ||
    q.includes('what does g mean') ||
    q.includes('g on the bracket') ||
    q.includes('g in the bracket') ||
    q.includes('g in bracket') ||
    q.includes('brackets mean') ||
    q.includes('state of matter') ||
    q.includes('state symbol')
  ) {
    return (
      '**State Symbols in Chemical Equations:**\n\n' +
      '• **(g) = Gas:** The substance is a gas (e.g., O₂(g), Cl₂(g), CO₂(g)). Molecules move freely and rapidly!\n' +
      '• **(s) = Solid:** The substance is a solid with a fixed shape and lattice structure (e.g., Na(s), NaCl(s)).\n' +
      '• **(l) = Liquid:** Pure fluid liquid (e.g., H₂O(l) water at room temperature).\n' +
      '• **(aq) = Aqueous:** Dissolved in water (from Latin *aqua*). For example, salt dissolved in water is NaCl(aq).\n\n' +
      'In equations like **2Na(s) + Cl₂(g) → 2NaCl(s)**, solid sodium reacts with chlorine gas to form solid table salt crystals!'
    );
  }

  // 2. Subscripts vs Coefficients (e.g. 2H₂ vs H₂O)
  if (
    q.includes('subscript') ||
    q.includes('coefficient') ||
    q.includes('numbers in front') ||
    q.includes('small numbers') ||
    q.includes('why 2 in front')
  ) {
    return (
      '**Numbers in Chemistry: Coefficients vs Subscripts:**\n\n' +
      '• **Big Numbers in Front (Coefficients):** Indicate how many separate molecules or units take part in the reaction. For example, in **2H₂O**, the big "2" means 2 whole water molecules.\n' +
      '• **Small Lower Numbers (Subscripts):** Indicate how many atoms of that specific element are chemically bonded inside that single molecule. In H₂O, the subscript "2" means there are 2 Hydrogen atoms attached to 1 Oxygen atom.\n\n' +
      '*Rule of Thumb:* Never change subscripts when balancing equations; only adjust coefficients!'
    );
  }

  // 3. Ionic vs Covalent bonding
  if (q.includes('ionic') || q.includes('covalent') || q.includes('bond type') || q.includes('how do bonds form')) {
    return (
      '**Chemical Bonding 101:**\n\n' +
      '• **Covalent Bonds (Sharing):** Usually form between **nonmetals** (like H, C, O, N). Atoms share valence electron pairs to fill their outer electron shells (e.g., H₂O, CO₂, CH₄).\n' +
      '• **Ionic Bonds (Transfer):** Form between a **metal** and a **nonmetal** (like Na and Cl). The metal gives away electrons to become a positive cation (Na⁺), and the nonmetal gains electrons to become a negative anion (Cl⁻). Electrostatic attraction holds them in a rigid crystalline lattice (e.g., NaCl, MgO).\n\n' +
      '• **Polar Covalent:** When electrons are shared unequally (like in H₂O), creating partial positive and negative poles.'
    );
  }

  // 4. Valence electrons & Octet Rule
  if (q.includes('valence') || q.includes('octet') || q.includes('outer shell')) {
    return (
      '**Valence Electrons & The Octet Rule:**\n\n' +
      '• **Valence electrons** are the electrons in an atom’s outermost electron shell. They determine how an element bonds with others!\n' +
      '• **The Octet Rule:** Most main-group atoms are most stable when they have **8 electrons** in their outer shell (like the unreactive noble gases).\n' +
      '• *Hydrogen exception:* Hydrogen only needs **2 electrons** to complete its first electron shell (duet rule).'
    );
  }

  // 5. Context-specific question: Current compound
  if (context?.compoundName && (q.includes('this compound') || q.includes('hint') || q.includes('explain'))) {
    return (
      `**About ${context.compoundName} (${context.formula || ''}):**\n\n` +
      `• **Bonding Type:** ${context.bondingType || 'Chemical compound'}\n` +
      `• **Reaction Equation:** ${context.balancedEquation || 'Synthesized in chamber'}\n` +
      (context.questionText ? `• **Quiz Insight:** Pay close attention to atom ratios and whether electrons are shared (covalent) or transferred (ionic)!\n` : '') +
      `Every atom bonds to achieve a stable, low-energy electron configuration.`
    );
  }

  return null;
}

/**
 * Sends a chemistry tutoring query to the server-side Gemini endpoint.
 * Gracefully uses local scientific knowledge if the API call is unavailable.
 */
export async function askChemAITutor(
  userQuery: string,
  context?: ChemContext
): Promise<string> {
  // Check if we can satisfy the query with instant local science knowledge first
  const localMatch = getLocalScienceAnswer(userQuery, context);

  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userQuery,
        context,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply && typeof data.reply === 'string' && data.reply.trim().length > 0) {
        return data.reply;
      }
    }
  } catch (err) {
    // Upstream server error or offline mode: fallback to local science knowledge
    console.warn('ChemAI server request skipped or failed, using science knowledge engine:', err);
  }

  // If local match was found, return it
  if (localMatch) {
    return localMatch;
  }

  // General fallback response
  return (
    `**ChemAI Lab Assistant Insight:**\n\n` +
    `In chemistry, elements combine according to their valence electrons and atomic configurations. ` +
    (context?.compoundName ? `Currently analyzing **${context.compoundName}** (${context.formula}). ` : '') +
    (context?.balancedEquation ? `Reaction: \`${context.balancedEquation}\`. ` : '') +
    `\n\n*Quick tip:* In chemical equations, state symbols in parentheses show phases: **(s)** = solid, **(l)** = liquid, **(g)** = gas, and **(aq)** = dissolved in water.`
  );
}
