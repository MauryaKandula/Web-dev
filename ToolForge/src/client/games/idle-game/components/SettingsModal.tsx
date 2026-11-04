import React, { useState } from 'react';
import { GameState } from '../types.ts';
import { exportSaveString, importSaveString, resetGameState } from '../game/storage.ts';
import { formatNumber, formatDuration } from '../game/formulas.ts';
import { Settings, Copy, Check, Upload, Trash2, Volume2, VolumeX, X, BarChart3 } from 'lucide-react';

interface SettingsModalProps {
  gameState: GameState;
  onClose: () => void;
  onRestoreState: (newState: GameState) => void;
  onToggleSound: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  gameState,
  onClose,
  onRestoreState,
  onToggleSound
}) => {
  const [copied, setCopied] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const handleCopySave = () => {
    const str = exportSaveString(gameState);
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleImportSave = () => {
    if (!importInput.trim()) return;
    const restored = importSaveString(importInput);
    if (restored) {
      onRestoreState(restored);
      onClose();
    } else {
      setImportError('Invalid or corrupted save string format.');
    }
  };

  const handleWipeData = () => {
    if (!confirmWipe) {
      setConfirmWipe(true);
      return;
    }
    const fresh = resetGameState();
    onRestoreState(fresh);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-950 border border-purple-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white font-orbitron">Settings & Fleet Diagnostics</h2>
            <p className="text-xs text-slate-400">Manage telemetry, audio feedback, and local save files.</p>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="bg-purple-950/20 border border-purple-900/40 rounded-2xl p-4 mb-6">
          <div className="flex items-center space-x-2 text-xs font-bold font-orbitron text-purple-300 mb-3">
            <BarChart3 className="w-4 h-4" />
            <span>Lifetime Telemetry Statistics</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-black/40 border border-purple-950">
              <span className="text-[10px] text-slate-500 block">Manual Cycles</span>
              <span className="font-bold text-white">{gameState.stats.manualClicks.toLocaleString()}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-purple-950">
              <span className="text-[10px] text-slate-500 block">Lifetime Credits</span>
              <span className="font-bold text-cyan-300">{formatNumber(gameState.totalLifetimeCredits)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-purple-950">
              <span className="text-[10px] text-slate-500 block">Times Prestiged</span>
              <span className="font-bold text-purple-300">{gameState.stats.timesPrestiged}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-purple-950">
              <span className="text-[10px] text-slate-500 block">Mission Duration</span>
              <span className="font-bold text-slate-300">{formatDuration(gameState.stats.timePlayedSeconds)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-purple-950">
              <span className="text-[10px] text-slate-500 block">Peak Recorded CPS</span>
              <span className="font-bold text-emerald-400">+{formatNumber(gameState.stats.peakCps)}/s</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-purple-950">
              <span className="text-[10px] text-slate-500 block">Comms Boosts</span>
              <span className="font-bold text-amber-300">{gameState.stats.adBoostsClaimed}</span>
            </div>
          </div>
        </div>

        {/* Audio Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl mb-4 text-xs">
          <div className="flex items-center space-x-3">
            {gameState.soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            <div>
              <span className="font-bold text-white block">Synthesizer Sound Effects</span>
              <span className="text-slate-400 text-[11px]">Real-time Web Audio API synthesized frequencies</span>
            </div>
          </div>
          <button
            onClick={onToggleSound}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
              gameState.soundEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {gameState.soundEnabled ? 'Enabled' : 'Muted'}
          </button>
        </div>

        {/* Save Cloud String Export */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl mb-4 text-xs">
          <span className="font-bold text-white block mb-1">Export Save String</span>
          <p className="text-slate-400 text-[11px] mb-3">Copy your base64 save string to transfer progress across machines.</p>
          <button
            onClick={handleCopySave}
            className="w-full py-2.5 bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-200 font-bold rounded-xl flex items-center justify-center space-x-2 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Save String'}</span>
          </button>
        </div>

        {/* Import Save String */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl mb-4 text-xs">
          <span className="font-bold text-white block mb-1">Import Save String</span>
          <textarea
            value={importInput}
            onChange={(e) => {
              setImportInput(e.target.value);
              setImportError(null);
            }}
            placeholder="Paste your base64 save string here..."
            rows={2}
            className="w-full p-2.5 bg-black/60 border border-slate-800 rounded-xl font-mono text-[11px] text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 mb-2"
          />
          {importError && (
            <p className="text-[11px] text-rose-400 mb-2">{importError}</p>
          )}
          <button
            onClick={handleImportSave}
            disabled={!importInput.trim()}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold rounded-xl flex items-center justify-center space-x-2 transition"
          >
            <Upload className="w-4 h-4" />
            <span>Load Save String</span>
          </button>
        </div>

        {/* Hard Reset Button */}
        <div className="pt-2">
          <button
            onClick={handleWipeData}
            className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition border ${
              confirmWipe
                ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                : 'bg-rose-950/20 text-rose-400 border-rose-900/40 hover:bg-rose-950/40'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{confirmWipe ? 'Are you sure? Click again to permanently wipe!' : 'Hard Reset All Progress'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
