import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { X, BookOpen, Atom, Share2, Scale, Flame, Sparkles } from 'lucide-react';

interface LearnChemistryModalProps {
  onClose: () => void;
}

export const LearnChemistryModal: React.FC<LearnChemistryModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'bonding' | 'equations' | 'octet'>('concepts');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl h-[90vh] max-h-[800px] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Chemistry Field Guide
              </h2>
              <p className="text-xs text-slate-400">
                Foundational chemical principles for Element Bond mastery.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-4 bg-slate-950/40 shrink-0 overflow-x-auto gap-2">
          {[
            { id: 'concepts', label: 'Atoms vs Molecules', icon: Atom },
            { id: 'bonding', label: 'Ionic & Covalent', icon: Share2 },
            { id: 'equations', label: 'Balanced Equations', icon: Scale },
            { id: 'octet', label: 'Valence & Octet Rule', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
          {activeTab === 'concepts' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  What is an Atom?
                </h3>
                <p>
                  An <strong>atom</strong> is the smallest fundamental unit of a chemical element that retains the chemical properties of that element. It consists of a dense nucleus of protons and neutrons surrounded by a cloud of orbiting electrons.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Molecules vs. Formula Units
                </h3>
                <p className="mb-2">
                  Chemistry distinguishes clearly between two ways substances hold together:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                  <li>
                    <strong>Molecules (Covalent):</strong> Discrete, isolated groups of atoms sharing electrons (e.g., a Water molecule H₂O, Carbon Dioxide CO₂, or Methane CH₄).
                  </li>
                  <li>
                    <strong>Formula Units (Ionic):</strong> The lowest whole-number ratio of ions in a continuous, infinite 3-dimensional crystal lattice (e.g., Sodium Chloride NaCl or Magnesium Oxide MgO).
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Diatomic Elemental Gases
                </h3>
                <p>
                  In nature, pure hydrogen, oxygen, nitrogen, and halogens do not exist as isolated free atoms. They bond in pairs to form diatomic molecules: <strong>H₂</strong>, <strong>O₂</strong>, <strong>N₂</strong>, <strong>F₂</strong>, and <strong>Cl₂</strong>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'bonding' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                <h3 className="text-base font-bold text-cyan-300 mb-1">
                  1. Covalent Bonding (Electron Sharing)
                </h3>
                <p className="mb-2">
                  Forms typically between <strong>nonmetal atoms</strong> with similar electronegativities. Atoms share pairs of valence electrons to achieve stable noble-gas electron configurations.
                </p>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-200">
                  H· + ·H → H:H (H₂) · Single Covalent Bond
                  <br />
                  O=C=O (CO₂) · Double Covalent Bonds (Linear 180°)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                <h3 className="text-base font-bold text-rose-300 mb-1">
                  2. Ionic Bonding (Electron Transfer)
                </h3>
                <p className="mb-2">
                  Occurs when a <strong>metal</strong> (low electronegativity) transfers one or more electrons completely to a <strong>nonmetal</strong> (high electronegativity).
                </p>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-200">
                  Na ([Ne] 3s¹) → Na⁺ + e⁻ (Sodium Cation)
                  <br />
                  Cl ([Ne] 3s² 3p⁵) + e⁻ → Cl⁻ (Chloride Anion)
                  <br />
                  Na⁺ + Cl⁻ → NaCl (Strong Electrostatic Attraction)
                </div>
              </div>
            </div>
          )}

          {activeTab === 'equations' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                <h3 className="text-base font-bold text-white mb-2">
                  Law of Conservation of Mass
                </h3>
                <p className="mb-3">
                  Matter is neither created nor destroyed during chemical reactions. Every atom present in the reactants must appear in the products!
                </p>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono space-y-2">
                  <div className="text-rose-400">
                    ❌ Unbalanced: H₂ + O₂ → H₂O (2 oxygens in, only 1 out!)
                  </div>
                  <div className="text-emerald-400 font-bold">
                    ✓ Balanced: 2H₂ + O₂ → 2H₂O (4 H and 2 O on both sides!)
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                <h3 className="text-base font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  Reaction Energy & Activation Barrier
                </h3>
                <p>
                  Elements don&apos;t always react spontaneously at room temperature. Many reactions require an <strong>activation energy</strong> (such as a spark, heat, or catalyst) to overcome bond dissociation barriers.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'octet' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
                <h3 className="text-base font-bold text-purple-300 mb-1">
                  The Octet Rule
                </h3>
                <p className="mb-2">
                  Main-group atoms are most stable when their outermost valence shell contains <strong>8 electrons</strong> (or 2 for Hydrogen and Helium, known as the duet rule).
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div>Carbon (Group 14): 4 valence e⁻</div>
                  <div>Nitrogen (Group 15): 5 valence e⁻</div>
                  <div>Oxygen (Group 16): 6 valence e⁻</div>
                  <div>Halogens (Group 17): 7 valence e⁻</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="py-2 px-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors"
          >
            Ready to Play
          </button>
        </div>
      </div>
    </div>
  );
};
