import React, { useState } from 'react';
import { starterKitsData, StarterKit, generateStarterKitZip } from '../../shared/projectlaunch.ts';
import { Product } from '../types.ts';
import { ArrowLeft, Rocket, Terminal, BookOpen, Layers, Download, CheckCircle2, FileCode, HelpCircle, Sparkles, ChevronRight, Check } from 'lucide-react';

interface ProjectLaunchPageProps {
  isOwned: boolean;
  onBack: () => void;
  onBuy: (product: Product) => void;
  product?: Product;
}

export const ProjectLaunchPage: React.FC<ProjectLaunchPageProps> = ({
  isOwned,
  onBack,
  onBuy,
  product
}) => {
  const [selectedKitId, setSelectedKitId] = useState<string>('kit_saas_marketplace');
  const [activeTab, setActiveTab] = useState<'architecture' | 'files' | 'viva' | 'tests'>('architecture');
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [expandedVivaId, setExpandedVivaId] = useState<string | null>('tf_viva_1');

  const activeKit: StarterKit = starterKitsData.find(k => k.id === selectedKitId) || starterKitsData[0];

  const handleDownloadZip = () => {
    try {
      setDownloading(true);
      const zipBytes = generateStarterKitZip(activeKit.id, isOwned);
      const blob = new Blob([zipBytes as any], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeKit.id}_starter_kit.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate starter kit zip:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleUnlockPro = () => {
    const targetProduct: Product = product || {
      id: 'prod_projectlaunch',
      creator_id: 'usr_creator_1',
      title: 'ProjectLaunch: Guided Starter Kits for Indian CSE Builders',
      slug: 'projectlaunch-guided-kits',
      tagline: 'Complete production-grade starter kits with architecture diagrams and viva guides.',
      description: '3 complete starter kits for Indian CSE engineering builders.',
      category: 'dev_utilities',
      price_inr: 249,
      is_subscription: 0,
      version: '1.0.0',
      download_filename: 'projectlaunch_v1.0.0.zip',
      file_size_kb: 5600,
      sales_count: 0,
      rating_avg: 0,
      rating_count: 0,
      creator_name: 'ToolForge Systems',
      status: 'approved',
      created_at: '2026-11-01T00:00:00.000Z'
    };
    onBuy(targetProduct);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Return to Marketplace"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Product 05 • Wave B
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                ProjectLaunch
                <Rocket className="w-5 h-5 text-amber-400" />
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Production-Grade Starter Kits, Architecture Blueprints, Test Walkthroughs & Placement Viva Guides
            </p>
          </div>
        </div>

        {/* Pro Status & Download Action */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadZip}
            disabled={downloading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition active:scale-95"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Downloaded Zip!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Packing Zip...' : `Download ${activeKit.title.split(' ')[0]} Zip`}</span>
              </>
            )}
          </button>

          {!isOwned && (
            <button
              onClick={handleUnlockPro}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unlock All 3 Kits (₹249)</span>
            </button>
          )}
        </div>
      </div>

      {/* Starter Kit Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {starterKitsData.map((kit) => {
          const isSelected = kit.id === selectedKitId;
          return (
            <div
              key={kit.id}
              onClick={() => {
                setSelectedKitId(kit.id);
                setSelectedFileIndex(0);
                if (kit.vivaQuestions.length > 0) {
                  setExpandedVivaId(kit.vivaQuestions[0].id);
                }
              }}
              className={`cursor-pointer rounded-2xl p-5 border transition-all text-left relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/50 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/20'
                  : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {kit.category.replace('_', ' ')}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  kit.difficulty === 'Beginner' ? 'text-emerald-400 bg-emerald-500/10' :
                  kit.difficulty === 'Intermediate' ? 'text-blue-400 bg-blue-500/10' :
                  'text-purple-400 bg-purple-500/10'
                }`}>
                  {kit.difficulty} • ~{kit.estimatedHours}h
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{kit.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {kit.subtitle}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {kit.techStack.slice(0, 3).map((tech, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800/70 text-slate-300 font-mono">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Kit Viewer Tabs */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/40 gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'architecture'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Architecture & Flow</span>
            </button>

            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'files'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Code Previews ({activeKit.files.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('viva')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'viva'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Viva Voce Prep ({activeKit.vivaQuestions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tests')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'tests'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Test Walkthrough</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {activeKit.techStack.join(' • ')}
          </span>
        </div>

        {/* Tab 1: Architecture View */}
        {activeTab === 'architecture' && (
          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <h2 className="text-lg font-bold text-white mb-2">System Architecture Blueprint</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                {activeKit.overview}
              </p>
            </div>

            {/* ASCII Architecture Diagram */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 overflow-x-auto shadow-inner">
              <pre className="text-xs font-mono text-cyan-300 leading-tight">
                {activeKit.architectureDiagram.trim()}
              </pre>
            </div>

            {/* Key Mechanisms Grid */}
            <div>
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Key Architectural Mechanisms
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeKit.keyMechanisms.map((mech, idx) => (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-amber-300 mb-1.5">{mech.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{mech.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Setup Quickstart */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-3">Quickstart Commands</h3>
              <div className="space-y-3 font-mono text-xs">
                {activeKit.setupInstructions.steps.map((st, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-amber-400 font-semibold">{st.command}</span>
                    <span className="text-slate-400 text-[11px] font-sans mt-1 sm:mt-0">{st.explanation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Code File Previews */}
        {activeTab === 'files' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[500px]">
            {/* Left File List */}
            <div className="border-r border-slate-800 p-4 space-y-1.5 bg-slate-950/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-2 mb-2">
                Starter Code Files
              </span>
              {activeKit.files.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono transition flex items-center justify-between ${
                    selectedFileIndex === idx
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span className="truncate">{file.path}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </button>
              ))}
            </div>

            {/* Right Code Content */}
            <div className="lg:col-span-3 p-6 bg-slate-950/70 overflow-x-auto flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div>
                    <span className="text-xs font-bold text-white font-mono">
                      {activeKit.files[selectedFileIndex]?.path}
                    </span>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      {activeKit.files[selectedFileIndex]?.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                    {activeKit.files[selectedFileIndex]?.language}
                  </span>
                </div>

                <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {activeKit.files[selectedFileIndex]?.content}
                </pre>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>Included in downloadable bundle</span>
                <button
                  onClick={handleDownloadZip}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Complete Package</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Viva Voce Prep */}
        {activeTab === 'viva' && (
          <div className="p-6 sm:p-8 space-y-4">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white mb-1">Campus Placement & Technical Viva Questions</h2>
              <p className="text-xs text-slate-400">
                Study exact questions examiners and technical interviewers ask about this architecture. Includes concept definitions and examiner trap follow-ups.
              </p>
            </div>

            <div className="space-y-4">
              {activeKit.vivaQuestions.map((vq, idx) => {
                const isExpanded = expandedVivaId === vq.id;
                return (
                  <div
                    key={vq.id}
                    className="border border-slate-800 rounded-2xl bg-slate-950/50 overflow-hidden transition"
                  >
                    <button
                      onClick={() => setExpandedVivaId(isExpanded ? null : vq.id)}
                      className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-900/50 transition"
                    >
                      <div>
                        <div className="flex items-center space-x-2 mb-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Q{idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            {vq.concept}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white leading-snug">{vq.question}</h3>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform mt-1 shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="p-5 pt-0 border-t border-slate-800/80 bg-slate-950/80 space-y-4 text-xs">
                        <div className="pt-4">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                            Model Technical Answer
                          </span>
                          <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                            {vq.modelAnswer}
                          </p>
                        </div>

                        <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-200">
                          <span className="font-bold text-[11px] uppercase tracking-wider block mb-1">
                            Examiner Follow-Up Question:
                          </span>
                          <p className="italic">{vq.followUp}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Test Walkthrough */}
        {activeTab === 'tests' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Automated Test Suites & Assertions</h2>
              <p className="text-xs text-slate-400">
                All starter kits include fully functional automated Vitest suites proving that the code passes quality gates before submission.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeKit.testWalkthrough.map((tw, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400 font-mono">{tw.testSuite}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {tw.assertionCount} Assertions Passing
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{tw.description}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-slate-300">Run <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded">npm test</code> in extracted folder to execute complete suite.</span>
              </div>
              <button
                onClick={handleDownloadZip}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition"
              >
                Download Kit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
