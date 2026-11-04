import React, { useState } from 'react';
import { ShieldAlert, Terminal, Copy, Download, ArrowLeft, Cpu, Gamepad2, Wrench, CheckCircle, Zap } from 'lucide-react';
import { sound } from '../services/sound.ts';
import { generateDebloatScript, DebloatProfile, DebloatScriptOptions } from '../../shared/win11debloat.ts';
import { generateUsbSelectiveSuspendScript, generateBluetoothRegistryFix } from '../../shared/bluetooth_tuner.ts';

interface DebloatStudioPageProps {
  onBack: () => void;
}

export const DebloatStudioPage: React.FC<DebloatStudioPageProps> = ({ onBack }) => {
  const [profile, setProfile] = useState<'minimal' | 'gaming' | 'ultimate_dev'>('gaming');
  const [removeCopilot, setRemoveCopilot] = useState(true);
  const [disableTelemetry, setDisableTelemetry] = useState(true);
  const [optimizeGamingServices, setOptimizeGamingServices] = useState(true);
  const [disableBingSearch, setDisableBingSearch] = useState(true);
  const [fixBluetoothSuspend, setFixBluetoothSuspend] = useState(true);
  const [fixMpoFlicker, setFixMpoFlicker] = useState(true);
  const [copied, setCopied] = useState(false);

  // Profile presets
  const handleSelectProfile = (p: 'minimal' | 'gaming' | 'ultimate_dev') => {
    sound.playClick();
    setProfile(p);
    if (p === 'minimal') {
      setRemoveCopilot(false);
      setDisableTelemetry(true);
      setOptimizeGamingServices(false);
      setDisableBingSearch(true);
      setFixBluetoothSuspend(false);
      setFixMpoFlicker(false);
    } else if (p === 'gaming') {
      setRemoveCopilot(true);
      setDisableTelemetry(true);
      setOptimizeGamingServices(true);
      setDisableBingSearch(true);
      setFixBluetoothSuspend(true);
      setFixMpoFlicker(true);
    } else {
      // ultimate_dev
      setRemoveCopilot(true);
      setDisableTelemetry(true);
      setOptimizeGamingServices(true);
      setDisableBingSearch(true);
      setFixBluetoothSuspend(true);
      setFixMpoFlicker(true);
    }
  };

  const generateScript = () => {
    let script = generateDebloatScript(profile as DebloatProfile, {
      removeCopilot,
      disableTelemetry,
      optimizeGamingServices,
      disableBingSearch,
    });

    if (fixBluetoothSuspend) {
      script += '\n\n' + generateUsbSelectiveSuspendScript();
      script += '\n\n' + generateBluetoothRegistryFix();
    }

    if (fixMpoFlicker) {
      script += '\n\n' + [
        '# =============================================================================',
        '# ToolForge Desktop Flicker Fix — Disable Hardware Multi-Plane Overlay (MPO)',
        '# Fixes display stuttering and window flickering on NVIDIA RTX GPUs',
        '# =============================================================================',
        'Write-Output "[ToolForge] Applying MPO flicker mitigation..."',
        'New-Item -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows\\Dwm" -Force | Out-Null',
        'Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows\\Dwm" -Name "OverlayTestMode" -Value 5 -Type DWord -Force',
        'Write-Output "[ToolForge] OverlayTestMode set to 5 (MPO Disabled)."'
      ].join('\n');
    }

    script += '\n\nWrite-Output "[ToolForge] All optimizations completed successfully. System restart recommended."\n';
    return script;
  };

  const scriptCode = generateScript();

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    sound.playTerminalSuccess();
    const blob = new Blob([scriptCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ToolForge_Optimize_${profile}.ps1`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300">
          Debloat Studio v2.4
        </span>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-6 sm:p-8 mb-8 cyber-cut">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Windows 11 Kernel Telemetry & Latency Tuner</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Win11Debloat & Rig Optimizer Studio
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Strip intrusive telemetry, remove background AI demons, fix Bluetooth audio cutouts, and generate production-grade PowerShell scripts customized for your machine.
            </p>
          </div>

          {/* Profile Switcher */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => handleSelectProfile('minimal')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
                profile === 'minimal' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Minimal</span>
            </button>
            <button
              onClick={() => handleSelectProfile('gaming')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
                profile === 'gaming' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Gaming Rig</span>
            </button>
            <button
              onClick={() => handleSelectProfile('ultimate_dev')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition ${
                profile === 'ultimate_dev' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Ultimate Dev</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Toggles */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white font-mono flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Wrench className="w-4 h-4 text-cyan-400" />
            <span>Tweak Checklist</span>
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={disableTelemetry}
                onChange={(e) => { sound.playClick(); setDisableTelemetry(e.target.checked); }}
                className="mt-0.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="font-bold text-slate-200 block">Purge DiagTrack & Error Reporting</span>
                <span className="text-slate-500">Stops Microsoft diagnostic telemetry services</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={removeCopilot}
                onChange={(e) => { sound.playClick(); setRemoveCopilot(e.target.checked); }}
                className="mt-0.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="font-bold text-slate-200 block">Disable Copilot & Windows Recall</span>
                <span className="text-slate-500">Removes AI search injection and telemetry hooks</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={disableBingSearch}
                onChange={(e) => { sound.playClick(); setDisableBingSearch(e.target.checked); }}
                className="mt-0.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="font-bold text-slate-200 block">Disable Bing Search in Start Menu</span>
                <span className="text-slate-500">Accelerates local file and app search indexing</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={optimizeGamingServices}
                onChange={(e) => { sound.playClick(); setOptimizeGamingServices(e.target.checked); }}
                className="mt-0.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="font-bold text-slate-200 block">Disable Xbox Game DVR Capture</span>
                <span className="text-slate-500">Prevents background screen capture drops in games</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={fixBluetoothSuspend}
                onChange={(e) => { sound.playClick(); setFixBluetoothSuspend(e.target.checked); }}
                className="mt-0.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="font-bold text-slate-200 block">Disable USB Selective Suspend</span>
                <span className="text-slate-500">Fixes Bluetooth audio cutouts and dongle sleep cycles</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={fixMpoFlicker}
                onChange={(e) => { sound.playClick(); setFixMpoFlicker(e.target.checked); }}
                className="mt-0.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="font-bold text-slate-200 block">Disable MPO (Multi-Plane Overlay)</span>
                <span className="text-slate-500">Resolves RTX desktop flickering and black flashes</span>
              </div>
            </label>
          </div>
        </div>

        {/* Right Column: Code Generator */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white font-mono">
                  Generated PowerShell Script ({scriptCode.split('\n').length} lines)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-mono text-cyan-300 hover:bg-slate-700 transition flex items-center space-x-1"
                >
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Script'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 text-xs font-mono font-bold text-black hover:bg-cyan-500 transition flex items-center space-x-1 shadow-lg shadow-cyan-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .ps1</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-[#050811] border border-slate-800 rounded-xl text-xs font-mono text-cyan-200 overflow-x-auto max-h-[420px] selection:bg-cyan-600 selection:text-white leading-relaxed">
              {scriptCode}
            </pre>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Run via PowerShell (Run as Administrator)</span>
            <span className="text-emerald-400">Preview only • Review every change before applying</span>
          </div>
        </div>
      </div>
    </div>
  );
};
