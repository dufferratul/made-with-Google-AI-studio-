import React, { useState, useEffect, useRef } from 'react';
import {
  ChatMessage,
  ChemContext,
  detectStateSymbols,
  STATE_SYMBOLS,
  askChemAITutor,
} from '../utils/chemAI';
import { sound } from '../utils/audio';
import {
  Bot,
  Send,
  X,
  Sparkles,
  HelpCircle,
  Zap,
  Info,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface ChemAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: ChemContext;
  initialQuestion?: string;
}

export const ChemAIAssistantModal: React.FC<ChemAIAssistantModalProps> = ({
  isOpen,
  onClose,
  context,
  initialQuestion,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect state symbols in context equation or question
  const detectedSymbols = React.useMemo(() => {
    const combined = `${context?.balancedEquation || ''} ${context?.questionText || ''}`;
    return detectStateSymbols(combined);
  }, [context]);

  // Initial welcome message based on context
  useEffect(() => {
    if (!isOpen) return;

    const welcomeText = context?.compoundName
      ? `Hey chemist! 🧪 I'm your ChemAI Tutor. We're currently looking at **${context.compoundName} (${context.formula || ''})** with the reaction \`${context.balancedEquation || ''}\`.\n\nNotice symbols like **(g)**, **(s)**, or subscripts? Ask me what they mean or tap any question below to learn faster!`
      : `Welcome to the Lab! 🔬 I'm your ChemAI Assistant. Wondering what **(g)** in brackets means, how chemical bonds form, or need a hint for the current challenge? Ask me anything!`;

    const initialMsgs: ChatMessage[] = [
      {
        id: 'welcome',
        sender: 'assistant',
        text: welcomeText,
        timestamp: Date.now(),
        suggestedQuestions: [
          'What does (g) on the brackets mean?',
          'What are subscripts vs coefficients?',
          'What is ionic vs covalent bonding?',
          context?.compoundName ? `Explain ${context.compoundName}` : 'What are valence electrons?',
        ],
      },
    ];

    setMessages(initialMsgs);

    // If an initial question was passed (e.g. user clicked a quick help button), send it automatically
    if (initialQuestion) {
      handleAskQuestion(initialQuestion);
    }
  }, [isOpen, context?.compoundName, context?.formula]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleAskQuestion = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    sound.playClick();

    try {
      const answer = await askChemAITutor(queryText, context);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: Date.now(),
        suggestedQuestions: getFollowUpSuggestions(queryText),
      };

      setMessages((prev) => [...prev, aiMsg]);
      sound.playBondFormed();
    } catch (err) {
      console.error('AI chat failed:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text:
          'In chemical reactions, state symbols like **(g)** indicate gas, **(s)** indicates solid, **(l)** indicates liquid, and **(aq)** indicates aqueous solution in water. Elements bond to achieve stable outer electron octets!',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFollowUpSuggestions = (query: string): string[] => {
    const q = query.toLowerCase();
    if (q.includes('g') || q.includes('bracket') || q.includes('state')) {
      return [
        'What does (aq) mean?',
        'Why are equations balanced?',
        'What are subscripts vs coefficients?',
      ];
    }
    if (q.includes('covalent') || q.includes('ionic')) {
      return [
        'How do valence electrons work?',
        'What is an octet rule?',
        'What does (s) and (g) mean in the equation?',
      ];
    }
    return [
      'What does (g) in brackets mean?',
      'How does the reaction chamber work?',
      'Why does water have a bent shape?',
    ];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg h-[88vh] max-h-[700px] rounded-3xl bg-slate-900 border-2 border-cyan-500/50 shadow-2xl flex flex-col overflow-hidden text-left relative">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/30">
              <Bot className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-sm sm:text-base leading-none">
                  ChemAI Lab Tutor
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Powered by Gemini & Science Skill Knowledge
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close ChemAI"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fast State Symbols Bar (If detected in current equation or question) */}
        <div className="bg-slate-950/90 border-b border-slate-800/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 shrink-0 flex items-center gap-1">
            <Info className="w-3 h-3 text-cyan-400" />
            <span>State Symbols:</span>
          </span>
          {Object.values(STATE_SYMBOLS).map((sym) => (
            <button
              key={sym.symbol}
              onClick={() => handleAskQuestion(`Explain what ${sym.symbol} means in chemical equations`)}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-cyan-950 hover:border-cyan-500 border border-slate-700 text-slate-200 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span className="font-mono font-bold text-cyan-300">{sym.symbol}</span>
              <span className="text-[10px] text-slate-400">{sym.name.replace(' State', '')}</span>
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-slate-950 font-semibold rounded-br-sm shadow-md shadow-cyan-600/20'
                    : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-bl-sm shadow-md'
                }`}
              >
                {/* Format paragraphs and bullet points */}
                <div className="space-y-1.5">
                  {msg.text.split('\n\n').map((para, pIdx) => (
                    <div key={pIdx}>
                      {para.split('\n').map((line, lIdx) => {
                        // Render bullet point line
                        if (line.startsWith('• ') || line.startsWith('* ')) {
                          const content = line.substring(2);
                          return (
                            <div key={lIdx} className="flex items-start gap-1.5 my-0.5 pl-1">
                              <span className="text-cyan-400 font-bold shrink-0">•</span>
                              <span>{renderFormattedText(content)}</span>
                            </div>
                          );
                        }
                        return <p key={lIdx}>{renderFormattedText(line)}</p>;
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested follow-up questions from AI */}
              {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                  {msg.suggestedQuestions.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      disabled={isLoading}
                      onClick={() => handleAskQuestion(q)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-slate-850 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-cyan-300 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-bl-sm p-3 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span className="text-xs text-slate-300">ChemAI is analyzing reaction...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Context Hint Indicator (if viewing a compound) */}
        {context?.compoundName && (
          <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 truncate">
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Current Reaction:</span>
              <span className="font-mono font-bold text-emerald-400 truncate">
                {context.balancedEquation || context.compoundName}
              </span>
            </span>
            <span className="text-[10px] text-slate-500 shrink-0 font-mono">
              {context.bondingType || ''}
            </span>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-2.5 sm:p-3 border-t border-slate-800 bg-slate-950/90 flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAskQuestion(inputValue);
              }
            }}
            placeholder="Ask anything (e.g. what does (g) in brackets mean?)..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 focus:border-cyan-400 focus:outline-none text-xs sm:text-sm text-white placeholder-slate-500 font-medium"
          />

          <button
            disabled={!inputValue.trim() || isLoading}
            onClick={() => handleAskQuestion(inputValue)}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            aria-label="Send query"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Basic markdown-style formatter for bold text (**text**).
 */
function renderFormattedText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
