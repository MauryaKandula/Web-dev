import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Copy, Check } from 'lucide-react';
import { sound } from '../services/sound.ts';
import { Product } from '../types.ts';

interface InteractiveTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

interface HistoryItem {
  type: 'cmd' | 'output' | 'error';
  text: string;
}

export const InteractiveTerminalModal: React.FC<InteractiveTerminalModalProps> = ({ isOpen, onClose, products }) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    { type: 'output', text: 'ToolForge catalog terminal · local preview' },
    { type: 'output', text: 'Use "help" to see the commands supported by this preview.' },
    { type: 'output', text: 'Third-party packages are not executed or installed here.' }
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (!isOpen) return null;

  const handleCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;
    sound.playClick();
    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);

    const [mainCmd, ...args] = cmd.split(/\s+/);
    const arg = args.join(' ');
    const entries: HistoryItem[] = [{ type: 'cmd', text: `toolforge$ ${cmd}` }];

    switch (mainCmd.toLowerCase()) {
      case 'help':
        entries.push({
          type: 'output',
          text: 'Supported commands:\n  help  — show this list\n  list  — show products returned to this preview\n  repo <name>  — show a published GitHub source link, when one is listed\n  clear  — clear this terminal\n  exit  — close this panel'
        });
        break;
      case 'list':
        entries.push({ type: 'output', text: `Products in this preview: ${products.length}` });
        products.forEach((product) => entries.push({ type: 'output', text: `  ${product.title} — ${product.tagline}` }));
        break;
      case 'repo': {
        if (!arg) {
          entries.push({ type: 'error', text: 'Usage: repo <product name>' });
          break;
        }
        const product = products.find((item) => item.id === arg || item.title.toLowerCase().includes(arg.toLowerCase()));
        const url = (product as (Product & { github_url?: string }) | undefined)?.github_url;
        if (!product) entries.push({ type: 'error', text: `No product matched "${arg}".` });
        else if (url && /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?\/?$/.test(url)) {
          entries.push({ type: 'output', text: `${product.title}\n${url}` });
        } else entries.push({ type: 'output', text: `${product.title}: no source repository is listed yet.` });
        break;
      }
      case 'clear':
        setHistory([]);
        setInputVal('');
        return;
      case 'exit':
        onClose();
        return;
      default:
        entries.push({
          type: 'error',
          text: 'This preview does not execute, install, benchmark, or security-scan packages. Use help for supported commands.'
        });
    }

    setHistory((prev) => [...prev, ...entries]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCommand(inputVal);
    else if (e.key === 'ArrowUp' && commandHistory.length > 0) {
      e.preventDefault();
      const nextIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
      setHistoryIndex(nextIndex);
      setInputVal(commandHistory[commandHistory.length - 1 - nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  const handleCopyLogs = async () => {
    await navigator.clipboard.writeText(history.map((item) => item.text).join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className={`relative bg-slate-950 border border-cyan-500/50 shadow-2xl shadow-cyan-950/60 rounded-xl overflow-hidden flex flex-col font-mono text-xs transition-all duration-300 cyber-cut ${isExpanded ? 'w-full h-[90vh]' : 'w-full max-w-3xl h-[560px]'}`}>
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-cyan-500/30 select-none">
          <div className="flex items-center space-x-2">
            <TerminalIcon className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">ToolForge catalog terminal</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">Local preview</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <button onClick={handleCopyLogs} className="p-1 hover:text-cyan-300 hover:bg-slate-800 rounded transition" title="Copy terminal text">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:text-cyan-300 hover:bg-slate-800 rounded transition" title={isExpanded ? 'Restore size' : 'Expand terminal'}>
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button onClick={onClose} className="p-1 hover:text-rose-400 hover:bg-slate-800 rounded transition" title="Close terminal">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5" aria-live="polite">
          {history.map((item, index) => (
            <div key={index} className={`whitespace-pre-wrap break-words ${item.type === 'cmd' ? 'text-cyan-300 font-bold mt-3' : item.type === 'error' ? 'text-amber-300' : 'text-slate-300'}`}>
              {item.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-center px-4 py-3 bg-slate-900 border-t border-slate-800">
          <span className="text-emerald-400 mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(event) => setInputVal(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type help..."
            className="flex-1 bg-transparent outline-none text-slate-200 placeholder:text-slate-600"
            aria-label="Terminal command"
          />
        </div>
      </div>
    </div>
  );
};
