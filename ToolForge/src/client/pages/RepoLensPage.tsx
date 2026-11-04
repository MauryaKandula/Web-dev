import React, { useState } from 'react';
import {
  preloadedRepositories,
  analyzeCodebase,
  parseUploadedManifest,
  RepoLensAnalysis,
  TreeNode,
  FileItem
} from '../../shared/repolens.ts';
import { Product } from '../types.ts';
import {
  ArrowLeft,
  FolderTree,
  Cpu,
  BookOpen,
  AlertCircle,
  FileCode2,
  Folder,
  File,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Layers,
  ShieldCheck,
  Compass,
  Upload,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface RepoLensPageProps {
  isOwned: boolean;
  onBack: () => void;
  onBuy: (product: Product) => void;
  product?: Product;
}

export const RepoLensPage: React.FC<RepoLensPageProps> = ({
  isOwned,
  onBack,
  onBuy,
  product
}) => {
  const [selectedRepoId, setSelectedRepoId] = useState<string>('repo_toolforge');
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[] | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'architecture' | 'setup' | 'tree' | 'issues'>('architecture');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root', 'src', 'src/client', 'src/server', 'src/game']));

  const activePreloaded = preloadedRepositories.find(r => r.id === selectedRepoId) || preloadedRepositories[0];

  let targetFiles: FileItem[] = activePreloaded.files;
  let targetRepoName: string = activePreloaded.name;
  let targetRepoUrl: string | undefined;
  let targetPackageJson: string | undefined = activePreloaded.files.find(f => f.path === 'package.json')?.contentSnippet;

  if (uploadedFiles && uploadedFiles.length > 0) {
    targetFiles = uploadedFiles;
    targetRepoName = uploadedFileName ? uploadedFileName.replace(/\.[^/.]+$/, '') : 'Custom Project Manifest';
    targetRepoUrl = undefined;
    targetPackageJson = uploadedFiles.find(f => f.path === 'package.json')?.contentSnippet;
  }

  const analysis: RepoLensAnalysis = analyzeCodebase({
    repoName: targetRepoName,
    repoUrl: targetRepoUrl,
    files: targetFiles,
    packageJsonContent: targetPackageJson
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseUploadedManifest(text, file.name);
        setUploadedFiles(parsed);
        setUploadedFileName(file.name);
      }
    };
    reader.readAsText(file);
  };

  const toggleNode = (nodePath: string) => {
    const next = new Set(expandedNodes);
    if (next.has(nodePath)) {
      next.delete(nodePath);
    } else {
      next.add(nodePath);
    }
    setExpandedNodes(next);
  };

  const renderTree = (node: TreeNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.path || 'root');
    const isDirectory = node.type === 'directory';

    return (
      <div key={node.path || 'root'} style={{ paddingLeft: `${depth * 14}px` }} className="text-xs font-mono">
        <div
          onClick={() => isDirectory && toggleNode(node.path || 'root')}
          className={`flex items-center space-x-1.5 py-1 px-2 rounded-lg transition cursor-pointer select-none ${
            isDirectory ? 'hover:bg-slate-800/60 text-slate-300 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isDirectory ? (
            <>
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              <Folder className="w-3.5 h-3.5 text-amber-400" />
            </>
          ) : (
            <>
              <span className="w-3.5" />
              <File className="w-3.5 h-3.5 text-blue-400" />
            </>
          )}
          <span>{node.name}</span>
          {!isDirectory && node.sizeBytes && (
            <span className="text-[10px] text-slate-600 ml-auto">
              {(node.sizeBytes / 1024).toFixed(1)} KB
            </span>
          )}
        </div>

        {isDirectory && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleUnlockPro = () => {
    if (product) onBuy(product);
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
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Product 03 • Wave B
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                RepoLens
                <Compass className="w-5 h-5 text-blue-400" />
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Codebase Onboarding, Architecture Map, Setup Guide & Starter Issue Generator
            </p>
          </div>
        </div>

        {/* Pro Unlock Action */}
        {!isOwned && (
          <button
            onClick={handleUnlockPro}
            disabled={!product}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition disabled:cursor-not-allowed disabled:opacity-50"
            title={!product ? 'Paid upgrades are not configured in this preview.' : 'Continue to checkout'}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{product ? 'Unlock Pro Analysis (₹' + product.price_inr + ')' : 'Pro upgrade unavailable in preview'}</span>
          </button>
        )}
      </div>

      {/* Target Repo Selection Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Sample manifest:</span>
          <div className="flex flex-wrap gap-2">
            {preloadedRepositories.map((repo) => (
              <button
                key={repo.id}
                onClick={() => {
                  setSelectedRepoId(repo.id);
                  setUploadedFiles(null);
                  setUploadedFileName(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedRepoId === repo.id && !uploadedFiles
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {repo.name}
              </button>
            ))}
          </div>
        </div>

        {/* Upload a local manifest */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <label className="cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition shrink-0">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>{uploadedFileName ? `Manifest: ${uploadedFileName}` : 'Upload Manifest'}</span>
            <input
              type="file"
              accept=".json,.txt,.md,.yaml,.yml"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <p className="max-w-xs text-[11px] leading-relaxed text-slate-500">
            Remote GitHub import is not connected. Upload a small text or JSON manifest; analysis runs locally in this browser.
          </p>
        </div>
      </div>

      {/* Security Audit Badge / Warning Bar */}
      <div className="mb-6">
        {analysis.detectedRisks && analysis.detectedRisks.length > 0 ? (
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex flex-col space-y-1.5">
            <div className="flex items-center space-x-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Security Quarantine Alert: {analysis.detectedRisks.length} Risk(s) Detected & Redacted</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90 pl-1">
              {analysis.detectedRisks.map((risk, i) => (
                <li key={i}>{risk}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Quarantine & Security Audit Passed: Zero path traversal (Zip-Slip) attempts or exposed API secrets detected.</span>
          </div>
        )}
      </div>

      {/* Tech Stack Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs text-slate-400 font-semibold mr-1">Detected Tech:</span>
        {analysis.techStack.map((tech, idx) => (
          <span
            key={idx}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200"
            title={`${tech.category} • ${tech.description}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{tech.name}</span>
          </span>
        ))}
      </div>

      {/* Main Analysis Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/40 gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'architecture'
                  ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Architecture Map</span>
            </button>

            <button
              onClick={() => setActiveTab('setup')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'setup'
                  ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Setup Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('tree')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'tree'
                  ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>File Hierarchy ({analysis.totalFiles})</span>
            </button>

            <button
              onClick={() => setActiveTab('issues')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'issues'
                  ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Starter Issues ({analysis.starterIssues.length})</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            {analysis.repoName}
          </span>
        </div>

        {/* Tab 1: Architecture Map */}
        {activeTab === 'architecture' && (
          <div className="p-6 sm:p-8 space-y-8">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-2">High-Level Layer Architecture</h2>
              <pre className="text-xs font-mono text-cyan-300 leading-tight overflow-x-auto">
{`+-----------------------------------------------------------------+
|                      PRESENTATION LAYER                         |
|   React 19 Components, Tailwind Styling & Browser Routing        |
+--------------------------------+--------------------------------+
                                 | HTTPS / REST
+--------------------------------v--------------------------------+
|                     APPLICATION & ROUTE LAYER                   |
|   Express Controllers, Auth Guards & Cryptographic Verification  |
+--------------------------------+--------------------------------+
                                 |
+--------------------------------v--------------------------------+
|                        DATA ACCESS LAYER                        |
|   SQLite Engine with Write-Ahead Logging (WAL) & Foreign Keys   |
+-----------------------------------------------------------------+`}
              </pre>
            </div>

            {/* Entrypoints & Core Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Entrypoints */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4" />
                  Primary Entrypoints
                </h3>
                <div className="space-y-3">
                  {analysis.entrypoints.map((ep, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">{ep.name}</span>
                        <span className="font-mono text-[10px] text-cyan-400">{ep.lineReference}</span>
                      </div>
                      <code className="text-[11px] text-slate-400 block mb-1 font-mono">{ep.filePath}</code>
                      <p className="text-[11px] text-slate-500">{ep.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Services */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  Core Domain Services
                </h3>
                <div className="space-y-3">
                  {analysis.coreServices.slice(0, 4).map((cs, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">{cs.name}</span>
                        <span className="font-mono text-[10px] text-cyan-400">{cs.lineReference}</span>
                      </div>
                      <code className="text-[11px] text-slate-400 block mb-1 font-mono">{cs.filePath}</code>
                      <p className="text-[11px] text-slate-500">{cs.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security Audit Notes */}
            <div className="p-5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl">
              <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Security & Integrity Highlights
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {analysis.securityNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Setup Guide */}
        {activeTab === 'setup' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                {analysis.setupGuideMarkdown}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: File Tree */}
        {activeTab === 'tree' && (
          <div className="p-6 sm:p-8">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 max-h-[500px] overflow-y-auto">
              {renderTree(analysis.fileTree)}
            </div>
          </div>
        )}

        {/* Tab 4: Starter Issues */}
        {activeTab === 'issues' && (
          <div className="p-6 sm:p-8 space-y-4">
            <div className="mb-4">
              <h2 className="text-base font-bold text-white">Suggested Beginner-Friendly Starter Issues</h2>
              <p className="text-xs text-slate-400">
                Actionable development tasks designed to help new contributors get familiar with the codebase quickly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.starterIssues.map((issue) => (
                <div key={issue.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {issue.category} • {issue.difficulty}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{issue.fileReference}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{issue.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{issue.description}</p>

                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Recommended Steps:
                    </span>
                    {issue.suggestedSteps.map((st, i) => (
                      <p key={i} className="text-[11px] text-slate-400 flex items-start space-x-1.5">
                        <span className="text-amber-400 font-bold">{i + 1}.</span>
                        <span>{st}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
