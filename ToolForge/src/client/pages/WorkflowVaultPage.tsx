import React, { useState } from 'react';
import {
  curatedWorkflowPacks,
  simulateWorkflowRun,
  exportToMermaid,
  exportToActivepiecesJSON,
  type WorkflowPack,
  type WorkflowSimulationResult
} from '../../shared/workflowvault.ts';
import {
  ArrowLeft,
  Workflow,
  Play,
  Download,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  FileCode,
  Sparkles,
  ShieldCheck,
  Terminal,
  Activity
} from 'lucide-react';
import { Product } from '../types.ts';

interface WorkflowVaultPageProps {
  isOwned: boolean;
  onBack: () => void;
  onBuy: (product: Product) => void;
  product?: Product;
}

export const WorkflowVaultPage: React.FC<WorkflowVaultPageProps> = ({
  isOwned,
  onBack,
  onBuy,
  product
}) => {
  const [workflows] = useState<WorkflowPack[]>(curatedWorkflowPacks);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowPack>(curatedWorkflowPacks[0]);
  const [activeTab, setActiveTab] = useState<'simulator' | 'diagram' | 'activepieces'>('simulator');
  const [payloadText, setPayloadText] = useState<string>(
    JSON.stringify(curatedWorkflowPacks[0].samplePayload, null, 2)
  );
  const [simulationResult, setSimulationResult] = useState<WorkflowSimulationResult | null>(null);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const handleSelectWorkflow = (wf: WorkflowPack) => {
    setSelectedWorkflow(wf);
    setPayloadText(JSON.stringify(wf.samplePayload, null, 2));
    setSimulationResult(null);
  };

  const handleRunSimulation = () => {
    try {
      const parsed = JSON.parse(payloadText);
      const res = simulateWorkflowRun(selectedWorkflow, parsed);
      setSimulationResult(res);
    } catch (err: any) {
      alert(`Invalid JSON payload: ${err.message}`);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const handleUnlockPro = () => {
    const targetProduct: Product = product || {
      id: 'prod_workflowvault',
      creator_id: 'usr_creator_1',
      title: 'WorkflowVault: Practical Automation Packs for Students & Creators',
      slug: 'workflowvault-automation-packs',
      tagline: 'MIT Activepieces recipes for event deduplication, expense tracking, and notifications.',
      description: 'Production automation engine with schema verification and dry-run execution.',
      category: 'web_scripts',
      price_inr: 199,
      is_subscription: 0,
      version: '1.0.0',
      download_filename: 'workflowvault_v1.0.0.zip',
      file_size_kb: 5200,
      sales_count: 0,
      rating_avg: 0,
      rating_count: 0,
      creator_name: 'ToolForge Systems',
      status: 'approved',
      created_at: new Date().toISOString()
    };
    onBuy(targetProduct);
  };

  const handleDownloadActivepieces = () => {
    const jsonStr = exportToActivepiecesJSON(selectedWorkflow);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedWorkflow.id}_activepieces.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">WorkflowVault</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                ACTIVEPIECES AUTOMATIONS
              </span>
              {isOwned && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>UNLOCKED</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Practical automation packs with schema validation, dry-run simulation, and Activepieces JSON exports.
            </p>
          </div>
        </div>

        {/* Workflow Pack Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {workflows.map((wf) => (
            <button
              key={wf.id}
              onClick={() => handleSelectWorkflow(wf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                selectedWorkflow.id === wf.id
                  ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {wf.title.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Pro Watermark Guard */}
      {!isOwned && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900/60 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white block">Evaluating WorkflowVault Community Edition</span>
              <span className="text-slate-400">
                Unlock full license to download production Activepieces workflow bundles, customize webhook endpoints, and run automated cron jobs.
              </span>
            </div>
          </div>
          <button
            onClick={handleUnlockPro}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition whitespace-nowrap"
          >
            Unlock Automation License — ₹199
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'simulator'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Interactive Runner & Simulation</span>
        </button>
        <button
          onClick={() => setActiveTab('diagram')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'diagram'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>Mermaid Flow Architecture</span>
        </button>
        <button
          onClick={() => setActiveTab('activepieces')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'activepieces'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Activepieces Export</span>
        </button>
      </div>

      {/* TAB 1: Runner & Simulation */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Workflow Steps & Input Payload (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Steps Overview */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-3">
              <h3 className="text-sm font-extrabold text-white">Pipeline Step Hierarchy</h3>
              <div className="space-y-2">
                {selectedWorkflow.steps.map((step, idx) => (
                  <div key={step.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">
                        {idx + 1}. {step.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-900 text-amber-400 border border-amber-500/20">
                        {step.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Payload Editor */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white">Test Ingest Payload (JSON)</label>
                <button
                  onClick={() => setPayloadText(JSON.stringify(selectedWorkflow.samplePayload, null, 2))}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  Reset Sample
                </button>
              </div>
              <textarea
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                rows={7}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs font-mono text-white outline-none resize-none"
              />
              <button
                onClick={handleRunSimulation}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Execute Dry-Run Simulation</span>
              </button>
            </div>
          </div>

          {/* Right Column: Execution Results & Step Logs (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Simulation Diagnostics & Output</span>
              </h2>
              {simulationResult && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 ${
                    simulationResult.success
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {simulationResult.success ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>{simulationResult.success ? '200 OK SUCCESS' : 'EXECUTION FAILED'}</span>
                  <span>({simulationResult.totalDurationMs}ms)</span>
                </span>
              )}
            </div>

            {simulationResult ? (
              <div className="space-y-4">
                {/* Step Results */}
                <div className="space-y-2">
                  {simulationResult.stepResults.map((sr) => (
                    <div
                      key={sr.stepId}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 transition ${
                        sr.status === 'success'
                          ? 'bg-slate-950/90 border-slate-800'
                          : sr.status === 'failed'
                          ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                          : 'bg-slate-950/40 border-slate-900 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {sr.status === 'success' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : sr.status === 'failed' ? (
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 inline-block" />
                          )}
                          <span className="font-bold text-white">{sr.stepName}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{sr.durationMs}ms</span>
                      </div>
                      {sr.error && <p className="text-rose-400 font-mono text-[11px]">{sr.error}</p>}
                      {sr.output && sr.status === 'success' && (
                        <pre className="p-2 bg-slate-900/80 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto max-h-24">
                          {JSON.stringify(sr.output, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>

                {/* Console Log Stream */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Execution Log Stream
                  </span>
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 max-h-48 overflow-y-auto">
                    {simulationResult.logs.map((log, idx) => (
                      <div key={idx} className={log.includes('FAILED') ? 'text-rose-400' : 'text-slate-300'}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-slate-500 text-xs">
                Click "Execute Dry-Run Simulation" to run test payloads against schema guards and step transformers.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Mermaid Flow Architecture */}
      {activeTab === 'diagram' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white">Mermaid Flowchart Architecture</h2>
            <button
              onClick={() => handleCopy(exportToMermaid(selectedWorkflow), 'mermaid')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
            >
              {copiedLabel === 'mermaid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Mermaid Code</span>
            </button>
          </div>
          <pre className="p-6 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-amber-300 whitespace-pre-wrap">
            {exportToMermaid(selectedWorkflow)}
          </pre>
        </div>
      )}

      {/* TAB 3: Activepieces JSON Export */}
      {activeTab === 'activepieces' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white">Activepieces Workflow Package</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Standard format ready for import into self-hosted Activepieces or n8n instances.
              </p>
            </div>
            <button
              onClick={handleDownloadActivepieces}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download activepieces.json</span>
            </button>
          </div>
          <pre className="p-6 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 max-h-[480px] overflow-y-auto">
            {exportToActivepiecesJSON(selectedWorkflow)}
          </pre>
        </div>
      )}
    </div>
  );
};
