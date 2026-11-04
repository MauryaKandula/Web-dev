import React, { useState } from 'react';
import { Sparkles, Terminal, Copy, Check, Download, Palette, ArrowLeft } from 'lucide-react';
import { generateStarshipToml, generateWindowsTerminalScheme, PALETTES, RicePreset, RiceConfig } from '../../shared/shell_rice.ts';
import { sound } from '../services/sound.ts';

interface ShellRicePageProps {
  onBack: () => void;
}

export const ShellRicePage: React.FC<ShellRicePageProps> = ({ onBack }) => {
  const [preset, setPreset] = useState<RicePreset>('cyberpunk_neon');
  const [showGitStatus, setShowGitStatus] = useState(true);
  const [showNodeVersion, setShowNodeVersion] = useState(true);
  const [showPythonVenv, setShowPythonVenv] = useState(true);
  const [showExecutionTime, setShowExecutionTime] = useState(true);
  const [enableNerdFonts, setEnableNerdFonts] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const config: RiceConfig = {
    preset,
    promptChar: '❯',
    showGitStatus,
    showNodeVersion,
    showPythonVenv,
    showExecutionTime,
    enableNerdFonts
  };

  const tomlCode = generateStarshipToml(config);
  const terminalJson = JSON.stringify(generateWindowsTerminalScheme(preset), null, 2);

  const handleCopy = (text: string, id: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    sound.playTerminalSuccess();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const palette = PALETTES[preset];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300">
          Aesthetic Studio v2.0
        </span>
      </div>

      <div className="relative rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-6 sm:p-8 mb-8 cyber-cut">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Shell Ricing & Terminal Aesthetics Engine</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Starship & Terminal Theme Studio
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Design, customize, and export pixel-perfect cyberpunk cross-shell prompts and terminal themes for PowerShell, Zsh, and Bash.
            </p>
          </div>

          {/* Preset Selector Chips */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PALETTES) as RicePreset[]).map((pKey) => (
              <button
                key={pKey}
                onClick={() => {
                  sound.playClick();
                  setPreset(pKey);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition border ${
                  preset === pKey
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {PALETTES[pKey].name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Terminal Preview */}
      <div className="mb-8 rounded-2xl bg-[#060913] border border-cyan-500/30 p-6 font-mono text-sm shadow-2xl overflow-hidden cyber-cut">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-slate-400">~/work/antigravity (starship-preview)</span>
          </div>
          <span style={{ color: palette.cyan }}>{palette.name}</span>
        </div>

        {/* Prompt Simulated Line */}
        <div className="space-y-2 leading-relaxed">
          <div className="flex flex-wrap items-center gap-2">
            <span style={{ color: palette.yellow }} className="font-bold">~/work/antigravity</span>
            {showGitStatus && (
              <span style={{ color: palette.magenta }}>
                {enableNerdFonts ? '' : ''} main <span style={{ color: palette.red }}>[!1 +2]</span>
              </span>
            )}
            {showNodeVersion && (
              <span style={{ color: palette.green }}>
                via {enableNerdFonts ? '' : ''} v25.3.3
              </span>
            )}
            {showPythonVenv && (
              <span style={{ color: palette.blue }}>
                via {enableNerdFonts ? '' : ''} (.venv)
              </span>
            )}
            {showExecutionTime && (
              <span style={{ color: palette.cyan }} className="italic text-xs">
                took 24ms
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span style={{ color: palette.cyan }} className="font-extrabold text-base">
              {config.promptChar}
            </span>
            <span className="text-white animate-pulse">git status</span>
          </div>
        </div>
      </div>

      {/* Controls & Code Exporters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Starship TOML Output */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>starship.toml</span>
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(tomlCode, 'toml')}
                  className="px-2.5 py-1 rounded bg-slate-800 text-xs font-mono text-cyan-300 hover:bg-slate-700 transition"
                >
                  {copied === 'toml' ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => handleDownload('starship.toml', tomlCode)}
                  className="px-2.5 py-1 rounded bg-cyan-600 text-xs font-mono font-bold text-black hover:bg-cyan-500 transition"
                >
                  Download .toml
                </button>
              </div>
            </div>
            <pre className="p-4 bg-[#050811] border border-slate-800 rounded-xl text-xs font-mono text-cyan-200 overflow-x-auto max-h-72">
              {tomlCode}
            </pre>
          </div>
        </div>

        {/* Windows Terminal JSON Output */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <Palette className="w-4 h-4 text-magenta-400" />
                <span>Windows Terminal schemes.json</span>
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(terminalJson, 'json')}
                  className="px-2.5 py-1 rounded bg-slate-800 text-xs font-mono text-cyan-300 hover:bg-slate-700 transition"
                >
                  {copied === 'json' ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => handleDownload('terminal_scheme.json', terminalJson)}
                  className="px-2.5 py-1 rounded bg-purple-600 text-xs font-mono font-bold text-white hover:bg-purple-500 transition"
                >
                  Download .json
                </button>
              </div>
            </div>
            <pre className="p-4 bg-[#050811] border border-slate-800 rounded-xl text-xs font-mono text-purple-200 overflow-x-auto max-h-72">
              {terminalJson}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
