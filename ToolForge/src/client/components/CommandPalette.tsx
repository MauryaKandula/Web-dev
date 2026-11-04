import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Terminal, Gamepad2, Crown, Shield, LayoutDashboard, Cpu, Code2, ArrowRight, X, Scale, FileText, Mail, ShieldCheck } from 'lucide-react';
import { Product } from '../types.ts';
import { sound } from '../services/sound.ts';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectTab: (tab: string) => void;
  onSelectProduct: (product: Product) => void;
  onSwitchRole: (role: 'customer' | 'creator' | 'admin') => void;
  onOpenTerminal: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'App' | 'Game' | 'Tool' | 'Action' | 'Role';
  icon: React.ElementType;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  products,
  onSelectTab,
  onSelectProduct,
  onSwitchRole,
  onOpenTerminal
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      sound.playClick();
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global key listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          sound.playClick();
          // open command palette
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build command list
  const baseCommands: CommandItem[] = [
    {
      id: 'cmd-terminal',
      title: 'Open Cyberpunk Terminal Sandbox',
      subtitle: 'Run CLI commands, inspect tool packages, and test scripts',
      category: 'Action',
      icon: Terminal,
      action: () => {
        onOpenTerminal();
        onClose();
      }
    },
    {
      id: 'cmd-animeclash',
      title: 'Play FightKro // Anime Clash Arena',
      subtitle: '60fps Canvas 2D Fighter with combo physics',
      category: 'Game',
      icon: Gamepad2,
      action: () => {
        onSelectTab('animeclash');
        onClose();
      }
    },
    {
      id: 'cmd-idlegame',
      title: 'Play Infinite Empire (Idle Clicker)',
      subtitle: 'Sci-fi civilization economy with Web Audio synthesis',
      category: 'Game',
      icon: Gamepad2,
      action: () => {
        onSelectTab('idlegame');
        onClose();
      }
    },
    {
      id: 'cmd-promptmatrix',
      title: 'PromptMatrix: LLM Prompt Studio & Evals',
      subtitle: 'Multi-model token pricing, prompt testing, and SDK export',
      category: 'App',
      icon: Sparkles,
      action: () => {
        onSelectTab('promptmatrix');
        onClose();
      }
    },
    {
      id: 'cmd-placementforge',
      title: 'PlacementForge: ATS Resume & Portfolio',
      subtitle: 'JD skill match analyzer and ATS resume builder',
      category: 'App',
      icon: Code2,
      action: () => {
        onSelectTab('placementforge');
        onClose();
      }
    },
    {
      id: 'cmd-patreon',
      title: 'Creator memberships · planned',
      subtitle: 'Recurring supporter plans are not enabled in this preview',
      category: 'Action',
      icon: Crown,
      action: () => {
        onSelectTab('sponsor');
        onClose();
      }
    },
    {
      id: 'cmd-github-repos',
      title: 'Open ToolForge source on GitHub',
      subtitle: 'View the published ToolForge project source',
      category: 'Action',
      icon: Code2,
      action: () => {
        window.open('https://github.com/MauryaKandula/Web-dev/tree/main/ToolForge', '_blank', 'noopener,noreferrer');
        onClose();
      }
    },
    {
      id: 'cmd-terms',
      title: 'Terms and Conditions',
      subtitle: 'Draft platform terms for review before launch',
      category: 'Action',
      icon: Scale,
      action: () => {
        onSelectTab('terms');
        onClose();
      }
    },
    {
      id: 'cmd-privacy',
      title: 'Privacy notice draft',
      subtitle: 'Review account storage and privacy launch requirements',
      category: 'Action',
      icon: ShieldCheck,
      action: () => {
        onSelectTab('privacy');
        onClose();
      }
    },
    {
      id: 'cmd-refund',
      title: 'Refund policy draft',
      subtitle: 'Draft policy; no live checkout is enabled',
      category: 'Action',
      icon: FileText,
      action: () => {
        onSelectTab('refund');
        onClose();
      }
    },
    {
      id: 'cmd-shipping',
      title: 'Digital delivery notes',
      subtitle: 'Preview notes for digital software delivery',
      category: 'Action',
      icon: Sparkles,
      action: () => {
        onSelectTab('shipping');
        onClose();
      }
    },
    {
      id: 'cmd-licensing',
      title: 'Licensing & Commercial Use Agreement',
      subtitle: 'Standard vs Commercial Developer License guidelines',
      category: 'Action',
      icon: Scale,
      action: () => {
        onSelectTab('licensing');
        onClose();
      }
    },
    {
      id: 'cmd-contact',
      title: 'Contact details draft',
      subtitle: 'Support contact information is not configured yet',
      category: 'Action',
      icon: Mail,
      action: () => {
        onSelectTab('contact');
        onClose();
      }
    },
    {
      id: 'cmd-role-customer',
      title: 'Switch Role to Customer (MK)',
      subtitle: 'Standard marketplace shopping & game player experience',
      category: 'Role',
      icon: Cpu,
      action: () => {
        onSwitchRole('customer');
        onClose();
      }
    },
    {
      id: 'cmd-role-creator',
      title: 'Switch Role to Creator (Arjun)',
      subtitle: 'Access product uploads, sales telemetry, and payout ledger',
      category: 'Role',
      icon: LayoutDashboard,
      action: () => {
        onSwitchRole('creator');
        onClose();
      }
    },
    {
      id: 'cmd-role-admin',
      title: 'Switch Role to Admin',
      subtitle: 'Manage platform take rates and verify submissions',
      category: 'Role',
      icon: Shield,
      action: () => {
        onSwitchRole('admin');
        onClose();
      }
    }
  ];

  // Add all products to commands
  const productCommands: CommandItem[] = products.map((p) => ({
    id: `prod-${p.id}`,
    title: p.title,
    subtitle: `${p.tagline} • ₹${p.price_inr}`,
    category: 'Tool',
    icon: Code2,
    action: () => {
      onSelectProduct(p);
      onClose();
    }
  }));

  const allItems = [...baseCommands, ...productCommands];

  const filteredItems = query.trim() === ''
    ? allItems.slice(0, 10)
    : allItems.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 12);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      sound.playHover();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      sound.playHover();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        sound.playClick();
        filteredItems[selectedIndex].action();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md">
      {/* Background click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden font-sans cyber-cut">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, tool, or shortcut (e.g. FightKro, debloat, sponsor, terminal)..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No developer tools or commands found matching "{query}"
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    item.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition ${
                    isSelected
                      ? 'bg-cyan-950/50 text-cyan-200 border border-cyan-500/30'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate flex items-center space-x-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate">{item.subtitle}</div>
                    </div>
                  </div>
                  {isSelected && <ArrowRight className="w-4 h-4 text-cyan-400 flex-shrink-0 ml-2" />}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/80 text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <span>Navigate with <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400">↑</kbd> <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400">↓</kbd></span>
          <span>Select with <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400">Enter</kbd></span>
          <span>Close with <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400">Esc</kbd></span>
        </div>
      </div>
    </div>
  );
};
