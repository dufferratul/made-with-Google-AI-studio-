import React, { useState, useMemo } from 'react';
import { ElementData, ElementCategory } from '../types/chemistry';
import { ELEMENTS } from '../data/elements';
import { CATEGORY_THEMES } from '../data/categories';
import { ElementTile } from './ElementTile';
import { sound } from '../utils/audio';
import { Search, X, CheckCircle2, Info, Sparkles, Filter } from 'lucide-react';

interface PeriodicTableModalProps {
  discoveredSymbols: string[];
  onClose: () => void;
}

export const PeriodicTableModal: React.FC<PeriodicTableModalProps> = ({
  discoveredSymbols,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);

  const discoveredSet = useMemo(() => new Set(discoveredSymbols), [discoveredSymbols]);

  const filteredElements = useMemo(() => {
    return ELEMENTS.filter((el) => {
      const matchesSearch =
        el.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        el.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        el.atomicNumber.toString() === searchTerm.trim();

      const matchesCat =
        selectedCategory === 'all' ||
        (selectedCategory === 'discovered' && discoveredSet.has(el.symbol)) ||
        el.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchTerm, selectedCategory, discoveredSet]);

  const categoriesList: { id: string; label: string }[] = [
    { id: 'all', label: 'All 118 Elements' },
    { id: 'discovered', label: `Discovered in Lab (${discoveredSet.size})` },
    { id: 'reactive-nonmetal', label: 'Reactive Nonmetals' },
    { id: 'noble-gas', label: 'Noble Gases' },
    { id: 'alkali-metal', label: 'Alkali Metals' },
    { id: 'alkaline-earth', label: 'Alkaline Earth' },
    { id: 'transition-metal', label: 'Transition Metals' },
    { id: 'post-transition', label: 'Post-Transition' },
    { id: 'metalloid', label: 'Metalloids' },
    { id: 'halogen', label: 'Halogens' },
    { id: 'lanthanide', label: 'Lanthanides' },
    { id: 'actinide', label: 'Actinides' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl h-[92vh] max-h-[850px] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/80">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Periodic Table of Elements</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                118 Elements
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Browse atomic properties, categories, and educational chemistry facts.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="p-3 sm:p-4 bg-slate-950/50 border-b border-slate-800/80 flex flex-col sm:flex-row gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, symbol, or atomic number..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown/Selector */}
          <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                sound.playClick();
                setSelectedCategory(e.target.value);
              }}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
            >
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Elements Grid View */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5 content-start">
          {filteredElements.map((el) => {
            const isDiscovered = discoveredSet.has(el.symbol);
            return (
              <div key={el.atomicNumber} className="relative group">
                <ElementTile
                  element={el}
                  size="sm"
                  interactive
                  onClick={() => {
                    sound.playClick();
                    setSelectedElement(el);
                  }}
                  className="w-full h-16 sm:h-20"
                />
                {isDiscovered && (
                  <div
                    title="Discovered in game"
                    className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 text-slate-950 rounded-full flex items-center justify-center text-[9px] font-bold shadow pointer-events-none"
                  >
                    ✓
                  </div>
                )}
              </div>
            );
          })}

          {filteredElements.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm">
              No chemical elements found matching &quot;{searchTerm}&quot;.
            </div>
          )}
        </div>

        {/* Selected Element Details Modal Bottom Sheet */}
        {selectedElement && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-cyan-500/50 p-5 shadow-2xl relative text-left">
              <button
                onClick={() => setSelectedElement(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <ElementTile element={selectedElement} size="lg" />
                <div>
                  <h3 className="text-2xl font-black text-white">
                    {selectedElement.name}
                  </h3>
                  <div className="text-xs text-cyan-300 font-semibold uppercase mt-0.5">
                    {CATEGORY_THEMES[selectedElement.category]?.name || selectedElement.category}
                  </div>
                  <div className="mt-1 text-xs text-slate-400 flex items-center gap-2">
                    <span>Atomic No: <strong>{selectedElement.atomicNumber}</strong></span>
                    <span>·</span>
                    <span>Mass: <strong>{selectedElement.atomicMass}</strong></span>
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 mb-4 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Period</div>
                  <div className="text-sm font-mono font-bold text-slate-200">{selectedElement.period}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Group</div>
                  <div className="text-sm font-mono font-bold text-slate-200">{selectedElement.group}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Valence e⁻</div>
                  <div className="text-sm font-mono font-bold text-slate-200">{selectedElement.valenceElectrons ?? '—'}</div>
                </div>
              </div>

              {/* Educational Fact */}
              <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-3 mb-4">
                <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Educational Fact</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {selectedElement.fact}
                </p>
              </div>

              <button
                onClick={() => setSelectedElement(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Element Inspector
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
