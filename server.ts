import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize server-side Gemini client per AI Studio gemini-api guidelines
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint for Cloud Run container probes
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ChemAI Chemistry Tutor Chat Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, context } = req.body || {};

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message string is required' });
      return;
    }

    if (!ai) {
      // Fallback message when GEMINI_API_KEY is not yet populated
      res.json({
        reply:
          `**ChemAI Science Assistant:**\n\n` +
          `In chemical equations, state symbols in parentheses specify physical phases:\n` +
          `• **(g)** = Gas (free particles with high kinetic energy, like O₂ or Cl₂)\n` +
          `• **(s)** = Solid (fixed crystal lattice, like Na or NaCl)\n` +
          `• **(l)** = Liquid (fluid state with definite volume, like H₂O)\n` +
          `• **(aq)** = Aqueous (solute dissolved in water)\n\n` +
          `Subscripts indicate atom counts in a molecule (e.g., H₂O has 2 H and 1 O), whereas leading coefficients show molecule counts in balanced reactions (2H₂ + O₂ → 2H₂O).`,
      });
      return;
    }

    const contextSummary = context
      ? `\nActive Game Context:
- Compound: ${context.compoundName || 'Unknown'} (${context.formula || ''})
- Reaction Equation: ${context.balancedEquation || 'N/A'}
- Bonding Type: ${context.bondingType || 'N/A'}
- Active Quiz Question: ${context.questionText || 'N/A'}
- Quiz Options: ${Array.isArray(context.options) ? context.options.join(', ') : 'N/A'}
- Chamber Atoms: ${Array.isArray(context.chamberAtoms) ? context.chamberAtoms.join(', ') : 'N/A'}
- Game Level: ${context.levelNumber || 1}`
      : '';

    const systemInstruction = `You are ChemAI, an expert, enthusiastic, and approachable chemistry tutor inside the educational web game ELEMENT BOND: Chemistry Challenge.
Your goal is to help players learn real chemistry concepts rapidly, intuitively, and enjoyably.
Guidelines:
1. Always explain chemistry terms, equations, and symbols with crystal clarity.
2. If asked about state symbols:
   - (g) = Gas (free particles, high kinetic energy, e.g. Cl₂(g), O₂(g))
   - (s) = Solid (crystalline lattice or fixed shape, e.g. Na(s), NaCl(s))
   - (l) = Liquid (fluid state, e.g. H₂O(l))
   - (aq) = Aqueous solution (dissolved in water)
3. Distinguish clearly between subscripts (atoms within a molecule, e.g. the 2 in H₂O) and coefficients (molecules in balanced equations, e.g. the 2 in 2H₂).
4. Explain ionic bonds (metal transfers electrons to nonmetal, forming + and - ions in a lattice) vs covalent bonds (sharing electrons between nonmetals).
5. Keep answers concise (2 to 4 short paragraphs or bullet points). Use formatting (bolding, bullet points) for readability on mobile screens. Keep tone encouraging and fun.`;

    const userPrompt = `${contextSummary}\n\nPlayer Question: "${message}"\nPlease provide a clear, concise, and helpful chemistry explanation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Chemistry is full of exciting connections! Keep experimenting!';
    res.json({ reply });
  } catch (error) {
    console.error('Gemini chat error:', error);
    res.json({
      reply:
        `**ChemAI Science Note:**\n\n` +
        `In chemical formulas and reactions:\n` +
        `• **(g)** stands for **Gas** phase (like gaseous chlorine Cl₂ or oxygen O₂).\n` +
        `• **(s)** stands for **Solid** (like metallic sodium Na or sodium chloride crystals NaCl).\n` +
        `• **(l)** stands for **Liquid** (like pure liquid water H₂O).\n` +
        `• **(aq)** stands for **Aqueous** (dissolved in liquid water).\n\n` +
        `Chemical reactions balance the total number of each type of atom before and after the reaction!`,
    });
  }
});

// ChemAI Quick Explainer Endpoint for MCQ Questions
app.post('/api/gemini/explain', async (req, res) => {
  try {
    const { compound, question } = req.body || {};

    if (!ai) {
      res.json({
        explanation:
          `In this reaction, elements combine in precise whole-number ratios to fulfill the octet rule. Symbols like (g) represent gases, (s) solids, and (l) liquids.`,
      });
      return;
    }

    const prompt = `Provide a friendly, 2-sentence chemistry explanation for learners about this compound and reaction:
Compound: ${compound?.name} (${compound?.formattedFormula || compound?.formula})
Reaction: ${compound?.balancedEquation || ''}
Bonding: ${compound?.bondingType || ''}
Question: ${question?.question || ''}
Explain why this reaction occurs and clarify any notation (such as (g) for gas, (s) for solid, or subscripts).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are ChemAI, an encouraging chemistry educator in the ELEMENT BOND game. Keep explanations under 60 words and ultra-clear for students.',
        temperature: 0.5,
      },
    });

    res.json({ explanation: response.text || compound?.educationalFact });
  } catch (err) {
    console.error('Gemini explain error:', err);
    res.json({
      explanation:
        req.body?.compound?.educationalFact ||
        'Atoms bond by transferring or sharing valence electrons to achieve stable electron configurations.',
    });
  }
});

// Mount Vite in dev mode or serve static files in production
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Element Bond full-stack server running on http://0.0.0.0:${PORT} (dev=${isDev})`);
});
