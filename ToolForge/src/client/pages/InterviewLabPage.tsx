import React, { useState, useEffect } from 'react';
import {
  dsaProblems,
  DSAProblem,
  runSandboxedCode,
  SandboxedRunResult,
  ProblemProgress,
  calculateReadinessScore
} from '../../shared/interviewlab.ts';
import { Product } from '../types.ts';
import {
  ArrowLeft,
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Clock,
  Sparkles,
  Trophy,
  RotateCcw,
  BookOpen,
  ChevronRight
} from 'lucide-react';

interface InterviewLabPageProps {
  isOwned: boolean;
  onBack: () => void;
  onBuy: (product: Product) => void;
  product?: Product;
}

export const InterviewLabPage: React.FC<InterviewLabPageProps> = ({
  isOwned,
  onBack,
  onBuy,
  product
}) => {
  const [selectedProblemId, setSelectedProblemId] = useState<string>('two-sum');
  const [userCode, setUserCode] = useState<string>('');
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [runResult, setRunResult] = useState<SandboxedRunResult | null>(null);
  const [progress, setProgress] = useState<Record<string, ProblemProgress>>({});
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const currentProblem: DSAProblem = dsaProblems.find(p => p.id === selectedProblemId) || dsaProblems[0];

  // Initialize or load progress
  useEffect(() => {
    try {
      const stored = localStorage.getItem('interviewlab_progress');
      if (stored) {
        setProgress(JSON.parse(stored));
      } else {
        const initial: Record<string, ProblemProgress> = {};
        dsaProblems.forEach(p => {
          initial[p.id] = {
            problemId: p.id,
            status: 'unattempted',
            reviewIntervalDays: 1,
            attemptsCount: 0
          };
        });
        setProgress(initial);
      }
    } catch {
      // Ignore local storage error
    }
  }, []);

  // Update user code when problem switches
  useEffect(() => {
    setUserCode(currentProblem.starterCode);
    setRevealedHints(0);
    setRunResult(null);
  }, [currentProblem.id]);

  const saveProgress = (newProg: Record<string, ProblemProgress>) => {
    setProgress(newProg);
    try {
      localStorage.setItem('interviewlab_progress', JSON.stringify(newProg));
    } catch {
      // Ignore storage error
    }
  };

  const handleRunCode = () => {
    const result = runSandboxedCode(userCode, currentProblem.functionName, currentProblem.testCases);
    setRunResult(result);

    const prev = progress[currentProblem.id] || {
      problemId: currentProblem.id,
      status: 'unattempted',
      reviewIntervalDays: 1,
      attemptsCount: 0
    };

    const nextStatus = result.allPassed ? 'mastered' : 'practicing';
    const nextInterval = result.allPassed
      ? (prev.reviewIntervalDays === 1 ? 3 : prev.reviewIntervalDays === 3 ? 7 : 14)
      : 1;

    const updated: ProblemProgress = {
      ...prev,
      status: nextStatus,
      lastPracticed: new Date().toISOString(),
      attemptsCount: prev.attemptsCount + 1,
      reviewIntervalDays: nextInterval,
      bestRuntimeMs: result.allPassed
        ? Math.min(prev.bestRuntimeMs || 9999, result.totalRuntimeMs)
        : prev.bestRuntimeMs
    };

    saveProgress({
      ...progress,
      [currentProblem.id]: updated
    });
  };

  const handleLoadSolution = () => {
    setUserCode(currentProblem.solutionCode);
  };

  const handleResetCode = () => {
    setUserCode(currentProblem.starterCode);
    setRunResult(null);
  };

  const readinessScore = calculateReadinessScore(Object.values(progress));

  const categories = ['All', 'Arrays', 'Two Pointers', 'Sliding Window', 'Binary Search', 'Dynamic Programming', 'Trees'];
  const filteredProblems = activeCategory === 'All'
    ? dsaProblems
    : dsaProblems.filter(p => p.category === activeCategory);

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
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Product 02 • Wave B
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                InterviewLab
                <Code2 className="w-5 h-5 text-emerald-400" />
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Curated Indian Campus Placement Problems, In-Browser Sandbox & Spaced Repetition Mastery
            </p>
          </div>
        </div>

        {/* Readiness Meter & Pro Action */}
        <div className="flex items-center space-x-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1.5 flex items-center space-x-2.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Placement Readiness</span>
              <span className="text-xs font-bold text-white font-mono">{readinessScore}%</span>
            </div>
          </div>

          {!isOwned && (
            <button
              onClick={handleUnlockPro}
              disabled={!product}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition disabled:cursor-not-allowed disabled:opacity-50"
              title={!product ? 'Paid upgrades are not configured in this preview.' : 'Continue to checkout'}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{product ? 'Unlock Pro Track (₹' + product.price_inr + ')' : 'Pro track upgrade unavailable in preview'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeCategory === cat
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2-Column Main Layout: Problem Directory & Sandbox Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem List (4 cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block px-1">
            Curated Problems ({filteredProblems.length})
          </span>
          {filteredProblems.map((p, idx) => {
            const isSelected = p.id === currentProblem.id;
            const prog = progress[p.id];
            const isMastered = prog?.status === 'mastered';

            return (
              <div
                key={p.id}
                onClick={() => setSelectedProblemId(p.id)}
                className={`cursor-pointer rounded-2xl p-4 border transition-all text-left ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {p.category}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      p.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10' :
                      p.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10' :
                      'text-rose-400 bg-rose-500/10'
                    }`}>
                      {p.difficulty}
                    </span>
                    {isMastered && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>

                <h3 className="text-xs font-bold text-white mb-1 leading-snug">
                  {idx + 1}. {p.title}
                </h3>

                <div className="flex flex-wrap gap-1 mt-2">
                  {p.companies.slice(0, 3).map((comp, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Problem Description & Sandbox (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Problem Statement Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Target: Time {currentProblem.targetTimeComplexity} • Space {currentProblem.targetSpaceComplexity}
                </span>
                <span className="text-xs text-slate-400">
                  Target Companies: <strong className="text-slate-200">{currentProblem.companies.join(', ')}</strong>
                </span>
              </div>

              <h2 className="text-lg font-bold text-white mb-3">{currentProblem.title}</h2>
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {currentProblem.description}
              </div>
            </div>

            {/* Examples */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Examples
              </span>
              {currentProblem.examples.map((ex, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 text-xs font-mono space-y-1">
                  <div><span className="text-slate-500">Input:</span> <span className="text-slate-300">{ex.input}</span></div>
                  <div><span className="text-slate-500">Output:</span> <span className="text-emerald-400 font-bold">{ex.output}</span></div>
                  {ex.explanation && (
                    <div className="text-[11px] text-slate-400 font-sans mt-1 pt-1 border-t border-slate-800/60">
                      {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Step-by-Step Hints */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Hints ({revealedHints} of {currentProblem.hints.length} revealed)
                </span>
                {revealedHints < currentProblem.hints.length && (
                  <button
                    onClick={() => setRevealedHints(h => h + 1)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    + Reveal Next Hint
                  </button>
                )}
              </div>

              {currentProblem.hints.slice(0, revealedHints).map((hint, idx) => (
                <div key={idx} className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                  <span className="font-bold mr-1">Hint {idx + 1}:</span>
                  {hint}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Code Editor & Sandbox */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-3.5 bg-slate-950/40">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2">solution.js</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLoadSolution}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
                  title="Load reference solution for testing"
                >
                  Load Solution
                </button>

                <button
                  onClick={handleResetCode}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Reset to starter code"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleRunCode}
                  className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run Sandbox Tests</span>
                </button>
              </div>
            </div>

            {/* Code Textarea */}
            <div className="p-4 bg-slate-950">
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                rows={12}
                className="w-full bg-transparent font-mono text-xs text-slate-200 focus:outline-none resize-y leading-relaxed selection:bg-emerald-600 selection:text-white"
                spellCheck={false}
              />
            </div>

            {/* Test Run Results Output */}
            {runResult && (
              <div className="border-t border-slate-800 p-6 bg-slate-950/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {runResult.allPassed ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">
                          All {runResult.passedCount} Test Cases Passed!
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-400" />
                        <span className="text-xs font-bold text-rose-400">
                          {runResult.passedCount} / {runResult.totalCount} Test Cases Passed
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {runResult.totalRuntimeMs} ms
                  </span>
                </div>

                {runResult.compilationError && (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-mono">
                    {runResult.compilationError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {runResult.results.map((r, i) => (
                    <div
                      key={r.testCaseId || i}
                      className={`p-3 rounded-xl border text-xs font-mono ${
                        r.passed
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{r.passed ? '✓' : '✗'} Test {i + 1}</span>
                        <span className="text-[10px] text-slate-400">{r.runtimeMs}ms</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans mb-1">{r.description}</p>
                      {!r.passed && (
                        <div className="text-[10px] space-y-0.5 mt-1 pt-1 border-t border-slate-800">
                          <div>Expected: <span className="text-emerald-400">{JSON.stringify(r.expected)}</span></div>
                          <div>Actual: <span className="text-rose-400">{r.error || JSON.stringify(r.actual)}</span></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
