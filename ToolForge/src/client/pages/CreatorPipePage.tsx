import React, { useState } from 'react';
import {
  cseScriptPresets,
  generateKaraokeTimings,
  formatSRT,
  exportProductionBriefMarkdown,
  type ThreeZoneScript,
  type ScriptBeat
} from '../../shared/creatorpipe.ts';
import {
  ArrowLeft,
  Video,
  FileText,
  Copy,
  Check,
  Download,
  Sparkles,
  Zap,
  Code2,
  Share2,
  ShieldCheck,
  PlayCircle
} from 'lucide-react';
import { Product } from '../types.ts';

interface CreatorPipePageProps {
  isOwned: boolean;
  onBack: () => void;
  onBuy: (product: Product) => void;
  product?: Product;
}

export const CreatorPipePage: React.FC<CreatorPipePageProps> = ({
  isOwned,
  onBack,
  onBuy,
  product
}) => {
  const [scripts, setScripts] = useState<ThreeZoneScript[]>(cseScriptPresets);
  const [selectedScript, setSelectedScript] = useState<ThreeZoneScript>(cseScriptPresets[0]);
  const [activeTab, setActiveTab] = useState<'script' | 'karaoke' | 'assets' | 'brief'>('script');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleUnlockPro = () => {
    const targetProduct: Product = product || {
      id: 'prod_creatorpipe',
      creator_id: 'usr_creator_2',
      title: 'CreatorPipe: Technical Shorts Scripting & Staging Studio',
      slug: 'creatorpipe-tech-content-studio',
      tagline: '3-zone scripts, screen capture plans, and word-synced karaoke subtitles for dev creators.',
      description: 'End-to-end technical content pipeline for CS educators and student creators building short-form reels.',
      category: 'web_scripts',
      price_inr: 149,
      is_subscription: 0,
      version: '1.0.0',
      download_filename: 'creatorpipe_v1.0.0.zip',
      file_size_kb: 4100,
      sales_count: 0,
      rating_avg: 0,
      rating_count: 0,
      creator_name: 'BuildCraft Studio',
      status: 'approved',
      created_at: new Date().toISOString()
    };
    onBuy(targetProduct);
  };

  const handleDownloadSRT = () => {
    const srtContent = formatSRT(selectedScript);
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedScript.id}_captions.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadBrief = () => {
    const briefContent = exportProductionBriefMarkdown(selectedScript);
    const blob = new Blob([briefContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedScript.id}_brief.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allScriptWords = generateKaraokeTimings(
    `${selectedScript.hook.speechHook} ${selectedScript.mechanismBeats.map((b) => b.speechText).join(' ')} ${selectedScript.payoff.ctaSpeech}`,
    0,
    165
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">CreatorPipe</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30">
                DEV CONTENT STUDIO
              </span>
              {isOwned && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>UNLOCKED</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              InsideMayu-style technical content engine: 3-Zone Scripts, Code Demo Staging & Dynamic Captions.
            </p>
          </div>
        </div>

        {/* Script Switcher */}
        <div className="flex items-center space-x-2">
          {scripts.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedScript(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                selectedScript.id === s.id
                  ? 'bg-fuchsia-600 text-white border-fuchsia-500 shadow-lg shadow-fuchsia-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {s.title.slice(0, 24)}...
            </button>
          ))}
        </div>
      </div>

      {/* Pro Watermark Guard */}
      {!isOwned && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-fuchsia-950/40 via-purple-950/40 to-slate-900/60 border border-fuchsia-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-fuchsia-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white block">Evaluating CreatorPipe Creator Edition</span>
              <span className="text-slate-400">
                Unlock full license to export SubRip subtitle sync, customize terminal commands, and save unlimited video scripts.
              </span>
            </div>
          </div>
          <button
            onClick={handleUnlockPro}
            className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-fuchsia-500/20 transition whitespace-nowrap"
          >
            Unlock Creator License — ₹149
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('script')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'script'
              ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>3-Zone Script Staging</span>
        </button>
        <button
          onClick={() => setActiveTab('karaoke')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'karaoke'
              ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Karaoke Subtitle Sync</span>
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'assets'
              ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Thumbnail & Packaging</span>
        </button>
        <button
          onClick={() => setActiveTab('brief')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'brief'
              ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Production Markdown Brief</span>
        </button>
      </div>

      {/* TAB 1: 3-Zone Script */}
      {activeTab === 'script' && (
        <div className="space-y-6">
          {/* ZONE 1: HOOK */}
          <div className="bg-slate-900/60 border border-rose-500/30 rounded-3xl p-6 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/40 uppercase">
                ⚡ ZONE 1: THE 3-SECOND HOOK (0 - {selectedScript.hook.durationSec}s)
              </span>
              <span className="text-xs font-mono text-slate-500">Target Retention: &gt; 85%</span>
            </div>
            <div className="text-base font-extrabold text-white">
              "{selectedScript.hook.speechHook}"
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">On-Screen Headline</span>
                <span className="font-extrabold text-rose-400">{selectedScript.hook.bannerHeadline}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Visual Staging Cue</span>
                <span className="text-slate-300">{selectedScript.hook.visualHook}</span>
              </div>
            </div>
          </div>

          {/* ZONE 2: MECHANISM BEATS */}
          <div className="bg-slate-900/60 border border-cyan-500/30 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 uppercase">
                🔬 ZONE 2: TECHNICAL MECHANISM & DEMO BEATS
              </span>
              <span className="text-xs font-mono text-slate-500">
                {selectedScript.mechanismBeats.length} Story Beats
              </span>
            </div>

            <div className="space-y-4">
              {selectedScript.mechanismBeats.map((beat, idx) => (
                <div key={beat.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold">Beat #{idx + 1}</span>
                    <span className="text-slate-500">{beat.timestamp}</span>
                  </div>
                  <p className="text-xs text-white font-medium">"{beat.speechText}"</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                      Visual: {beat.visualCue}
                    </span>
                    {beat.onScreenText && (
                      <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/20">
                        Overlay: {beat.onScreenText}
                      </span>
                    )}
                    {beat.sfxCue && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/20">
                        SFX: {beat.sfxCue}
                      </span>
                    )}
                  </div>
                  {beat.codeOrCommandSnippet && (
                    <div className="mt-2 p-3 bg-slate-900 rounded-xl font-mono text-xs text-emerald-300 flex items-center justify-between">
                      <code>{beat.codeOrCommandSnippet}</code>
                      <button
                        onClick={() => handleCopy(beat.codeOrCommandSnippet!, `beat_${beat.id}`)}
                        className="p-1 text-slate-500 hover:text-white"
                      >
                        {copiedText === `beat_${beat.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ZONE 3: PAYOFF & CTA */}
          <div className="bg-slate-900/60 border border-emerald-500/30 rounded-3xl p-6 space-y-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
              🎯 ZONE 3: THE PAYOFF & REPO CALL-TO-ACTION
            </span>
            <div className="text-sm font-bold text-white">
              "{selectedScript.payoff.ctaSpeech}"
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Core CSE Takeaway</span>
                <span className="text-slate-300 font-medium">{selectedScript.payoff.keyTakeaway}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Tool / GitHub Repo Link</span>
                <span className="text-cyan-400 font-mono break-all">{selectedScript.payoff.githubOrToolLink}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Karaoke Subtitles */}
      {activeTab === 'karaoke' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-white">Dynamic Word-Level Timings (60fps)</h2>
              <p className="text-xs text-slate-400 mt-1">
                Word-by-word timestamps tuned for short-form video editors (CapCut, Premiere, FFmpeg karaoke).
              </p>
            </div>
            <button
              onClick={handleDownloadSRT}
              className="flex items-center space-x-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-fuchsia-500/20 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download .SRT Captions</span>
            </button>
          </div>

          {/* Karaoke Word Cloud */}
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800/80 flex flex-wrap gap-2 text-xs font-mono leading-relaxed max-h-[360px] overflow-y-auto">
            {allScriptWords.map((chunk, idx) => (
              <span
                key={idx}
                className={`px-2 py-1 rounded-lg transition ${
                  chunk.isKeyTerm
                    ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 font-bold'
                    : 'bg-slate-900 text-slate-400'
                }`}
                title={`[${chunk.startMs}ms - ${chunk.endMs}ms]`}
              >
                {chunk.word}
              </span>
            ))}
          </div>

          <div className="text-xs text-slate-500 flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400" />
              <span>Key Technical Terms (Highlighted on screen)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span>Standard Speech Rhythm (165 WPM)</span>
            </span>
          </div>
        </div>
      )}

      {/* TAB 3: Thumbnail & Packaging */}
      {activeTab === 'assets' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-extrabold text-white">Thumbnail A/B Testing Headlines</h3>
            <div className="space-y-3">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest block">Variant A (High CTR)</span>
                <span className="text-sm font-black text-white mt-1 block">{selectedScript.thumbnailBrief.titleA}</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Variant B (Controversial)</span>
                <span className="text-sm font-black text-white mt-1 block">{selectedScript.thumbnailBrief.titleB}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Neon Badge Overlay</span>
              <span className="px-3 py-1.5 rounded-xl bg-purple-950 border border-purple-500 text-purple-300 font-mono font-black text-xs">
                {selectedScript.thumbnailBrief.neonPillBadge}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-extrabold text-white">Visual Art Direction</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Staging Style</span>
                <span className="text-slate-300">{selectedScript.thumbnailBrief.backgroundStyle}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Avatar Expression</span>
                <span className="text-fuchsia-400 font-mono uppercase font-bold">
                  {selectedScript.thumbnailBrief.avatarExpression}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Instagram / YouTube Tags</span>
                <span className="text-slate-400">{selectedScript.tags.join(' ')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Production Brief */}
      {activeTab === 'brief' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white">Full Filming & Recording Brief</h2>
            <button
              onClick={handleDownloadBrief}
              className="flex items-center space-x-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-fuchsia-500/20 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Markdown</span>
            </button>
          </div>
          <pre className="p-6 bg-slate-950 rounded-2xl border border-slate-800/80 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
            {exportProductionBriefMarkdown(selectedScript)}
          </pre>
        </div>
      )}
    </div>
  );
};
