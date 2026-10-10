import React from 'react';
import { Compound } from '../types/chemistry';

interface MoleculeVisualizerProps {
  compound: Compound;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

export const MoleculeVisualizer: React.FC<MoleculeVisualizerProps> = ({
  compound,
  size = 'md',
  className = '',
  animate = true,
}) => {
  const dimensions = {
    sm: { width: 120, height: 90 },
    md: { width: 180, height: 140 },
    lg: { width: 260, height: 190 },
  }[size];

  const { width, height } = dimensions;

  // Custom SVG representations based on chemical structure
  const renderStructure = () => {
    switch (compound.structureVisual) {
      case 'water':
        // H2O: Bent 104.5 degrees. Central Oxygen (red/dark red) with 2 Hydrogens (cyan/white)
        return (
          <svg viewBox="0 0 200 150" className="w-full h-full">
            <defs>
              <radialGradient id="grad-o" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#dc2626" />
              </radialGradient>
              <radialGradient id="grad-h" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#38bdf8" />
              </radialGradient>
            </defs>
            {/* Bonds */}
            <line x1="100" y1="65" x2="55" y2="105" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            <line x1="100" y1="65" x2="145" y2="105" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            {/* Angle marker */}
            <path d="M 85 85 A 25 25 0 0 0 115 85" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x="100" y="98" fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="monospace">104.5°</text>
            
            {/* Oxygen (Center) */}
            <circle cx="100" cy="65" r="28" fill="url(#grad-o)" stroke="#fca5a5" strokeWidth="2" />
            <text x="100" y="71" fill="#ffffff" fontSize="18" fontWeight="bold" textAnchor="middle">O</text>
            <text x="100" y="45" fill="#fca5a5" fontSize="10" textAnchor="middle" fontFamily="monospace">δ⁻</text>

            {/* Hydrogen 1 (Left) */}
            <circle cx="55" cy="105" r="18" fill="url(#grad-h)" stroke="#bae6fd" strokeWidth="2" />
            <text x="55" y="110" fill="#0f172a" fontSize="14" fontWeight="bold" textAnchor="middle">H</text>
            <text x="40" y="95" fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="monospace">δ⁺</text>

            {/* Hydrogen 2 (Right) */}
            <circle cx="145" cy="105" r="18" fill="url(#grad-h)" stroke="#bae6fd" strokeWidth="2" />
            <text x="145" y="110" fill="#0f172a" fontSize="14" fontWeight="bold" textAnchor="middle">H</text>
            <text x="160" y="95" fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="monospace">δ⁺</text>
          </svg>
        );

      case 'nacl':
        // NaCl: Ionic Formula Unit. Na+ (rose) and Cl- (emerald/teal) with electrostatic ionic attraction
        return (
          <svg viewBox="0 0 200 150" className="w-full h-full">
            <defs>
              <radialGradient id="grad-na" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#fda4af" />
                <stop offset="100%" stopColor="#e11d48" />
              </radialGradient>
              <radialGradient id="grad-cl" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="100%" stopColor="#059669" />
              </radialGradient>
            </defs>
            {/* Electrostatic ionic attraction lines */}
            <g stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 3" opacity="0.8">
              <line x1="72" y1="70" x2="128" y2="70" />
              <line x1="72" y1="75" x2="128" y2="75" />
            </g>
            <text x="100" y="60" fill="#38bdf8" fontSize="9" textAnchor="middle" fontWeight="bold">IONIC ATTRACTION</text>

            {/* Na+ Cation (Smaller radius) */}
            <circle cx="65" cy="75" r="22" fill="url(#grad-na)" stroke="#fecdd3" strokeWidth="2" />
            <text x="65" y="80" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">Na⁺</text>

            {/* Cl- Anion (Larger ionic radius) */}
            <circle cx="138" cy="75" r="30" fill="url(#grad-cl)" stroke="#a7f3d0" strokeWidth="2" />
            <text x="138" y="81" fill="#ffffff" fontSize="16" fontWeight="bold" textAnchor="middle">Cl⁻</text>

            <text x="100" y="125" fill="#94a3b8" fontSize="10" textAnchor="middle">1:1 Ionic Crystal Ratio</text>
          </svg>
        );

      case 'co2':
        // CO2: Linear O=C=O (180°)
        return (
          <svg viewBox="0 0 200 150" className="w-full h-full">
            <defs>
              <radialGradient id="grad-c" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#334155" />
              </radialGradient>
              <radialGradient id="grad-o2" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#dc2626" />
              </radialGradient>
            </defs>
            {/* Double bonds Left */}
            <line x1="58" y1="70" x2="98" y2="70" stroke="#cbd5e1" strokeWidth="4" />
            <line x1="58" y1="78" x2="98" y2="78" stroke="#cbd5e1" strokeWidth="4" />

            {/* Double bonds Right */}
            <line x1="102" y1="70" x2="142" y2="70" stroke="#cbd5e1" strokeWidth="4" />
            <line x1="102" y1="78" x2="142" y2="78" stroke="#cbd5e1" strokeWidth="4" />

            {/* Left Oxygen */}
            <circle cx="48" cy="74" r="22" fill="url(#grad-o2)" stroke="#fca5a5" strokeWidth="2" />
            <text x="48" y="79" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">O</text>

            {/* Center Carbon */}
            <circle cx="100" cy="74" r="22" fill="url(#grad-c)" stroke="#cbd5e1" strokeWidth="2" />
            <text x="100" y="79" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">C</text>

            {/* Right Oxygen */}
            <circle cx="152" cy="74" r="22" fill="url(#grad-o2)" stroke="#fca5a5" strokeWidth="2" />
            <text x="152" y="79" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">O</text>

            <text x="100" y="122" fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="monospace">Linear (180°)</text>
          </svg>
        );

      case 'ammonia':
        // NH3: Trigonal pyramidal N with 3 H
        return (
          <svg viewBox="0 0 200 150" className="w-full h-full">
            <defs>
              <radialGradient id="grad-n" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4338ca" />
              </radialGradient>
              <radialGradient id="grad-h-nh3" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#38bdf8" />
              </radialGradient>
            </defs>
            {/* Bonds */}
            <line x1="100" y1="58" x2="55" y2="105" stroke="#94a3b8" strokeWidth="4" />
            <line x1="100" y1="58" x2="100" y2="115" stroke="#94a3b8" strokeWidth="4" />
            <line x1="100" y1="58" x2="145" y2="105" stroke="#94a3b8" strokeWidth="4" />

            {/* Lone pair */}
            <circle cx="94" cy="30" r="3" fill="#a5b4fc" />
            <circle cx="106" cy="30" r="3" fill="#a5b4fc" />
            <path d="M 88 32 Q 100 24 112 32" stroke="#818cf8" strokeWidth="1" fill="none" opacity="0.6" />

            {/* Nitrogen */}
            <circle cx="100" cy="58" r="24" fill="url(#grad-n)" stroke="#c7d2fe" strokeWidth="2" />
            <text x="100" y="64" fill="#ffffff" fontSize="16" fontWeight="bold" textAnchor="middle">N</text>

            {/* Hydrogens */}
            <circle cx="55" cy="105" r="16" fill="url(#grad-h-nh3)" stroke="#bae6fd" strokeWidth="2" />
            <text x="55" y="110" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">H</text>

            <circle cx="100" cy="115" r="16" fill="url(#grad-h-nh3)" stroke="#bae6fd" strokeWidth="2" />
            <text x="100" y="120" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">H</text>

            <circle cx="145" cy="105" r="16" fill="url(#grad-h-nh3)" stroke="#bae6fd" strokeWidth="2" />
            <text x="145" y="110" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">H</text>
          </svg>
        );

      case 'methane':
        // CH4: Tetrahedral
        return (
          <svg viewBox="0 0 200 150" className="w-full h-full">
            <defs>
              <radialGradient id="grad-c-ch4" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#334155" />
              </radialGradient>
              <radialGradient id="grad-h-ch4" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#38bdf8" />
              </radialGradient>
            </defs>
            {/* 4 Bonds */}
            <line x1="100" y1="75" x2="100" y2="30" stroke="#94a3b8" strokeWidth="4" />
            <line x1="100" y1="75" x2="50" y2="105" stroke="#94a3b8" strokeWidth="4" />
            <line x1="100" y1="75" x2="150" y2="105" stroke="#94a3b8" strokeWidth="4" />
            <line x1="100" y1="75" x2="90" y2="120" stroke="#94a3b8" strokeWidth="5" />

            {/* Central Carbon */}
            <circle cx="100" cy="75" r="22" fill="url(#grad-c-ch4)" stroke="#cbd5e1" strokeWidth="2" />
            <text x="100" y="80" fill="#ffffff" fontSize="15" fontWeight="bold" textAnchor="middle">C</text>

            {/* Hydrogens */}
            <circle cx="100" cy="30" r="15" fill="url(#grad-h-ch4)" stroke="#bae6fd" strokeWidth="2" />
            <text x="100" y="34" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">H</text>

            <circle cx="50" cy="105" r="15" fill="url(#grad-h-ch4)" stroke="#bae6fd" strokeWidth="2" />
            <text x="50" y="109" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">H</text>

            <circle cx="150" cy="105" r="15" fill="url(#grad-h-ch4)" stroke="#bae6fd" strokeWidth="2" />
            <text x="150" y="109" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">H</text>

            <circle cx="90" cy="120" r="15" fill="url(#grad-h-ch4)" stroke="#bae6fd" strokeWidth="2" />
            <text x="90" y="124" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">H</text>
          </svg>
        );

      default:
        // Generic clean compound representation
        return (
          <svg viewBox="0 0 200 150" className="w-full h-full">
            <g transform="translate(100, 75)">
              <circle cx="0" cy="0" r="32" fill="#0284c7" stroke="#38bdf8" strokeWidth="3" opacity="0.9" />
              <text x="0" y="7" fill="#ffffff" fontSize="18" fontWeight="bold" textAnchor="middle">
                {compound.formattedFormula}
              </text>
            </g>
          </svg>
        );
    }
  };

  return (
    <div
      style={{ width, height }}
      className={`relative flex items-center justify-center rounded-2xl bg-slate-900/80 border border-cyan-500/30 p-2 shadow-inner overflow-hidden ${className} ${
        animate ? 'animate-pulse-glow' : ''
      }`}
    >
      {renderStructure()}
    </div>
  );
};
