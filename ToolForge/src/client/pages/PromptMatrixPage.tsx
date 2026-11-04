import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  Code,
  DollarSign,
  Copy,
  Check,
  Play,
  Layers,
  ArrowRight,
  ShieldCheck,
  Download,
} from 'lucide-react';
import {
  STARTER_PROMPT_TEMPLATES,
  SUPPORTED_MODELS,
  PromptTemplate,
  estimateTokens,
  renderPrompt,
  calculateInferenceCost,
  generateSdkCodeSnippet,
} from '../../shared/promptmatrix.ts';

export const PromptMatrixPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate>(STARTER_PROMPT_TEMPLATES[0]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    STARTER_PROMPT_TEMPLATES[0].variables.forEach((v) => {
      init[v.name] = v.defaultValue;
    });
    return init;
  });
  const [selectedModelId, setSelectedModelId] = useState<string>('gemini-2.0-flash');
  const [copiedSdk, setCopiedSdk] = useState<'google' | 'openai' | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'fewshot' | 'sdk'>('editor');

  const selectedModel = SUPPORTED_MODELS.find((m) => m.modelId === selectedModelId) || SUPPORTED_MODELS[0];

  const handleSelectTemplate = (tpl: PromptTemplate) => {
    setSelectedTemplate(tpl);
    const newVars: Record<string, string> = {};
    tpl.variables.forEach((v) => {
      newVars[v.name] = v.defaultValue;
    });
    setVariableValues(newVars);
  };

  const handleVariableChange = (name: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [name]: value }));
  };

  const renderedUserPrompt = renderPrompt(selectedTemplate.userPromptTemplate, variableValues);
  const totalInputText = `${selectedTemplate.systemPrompt}\n\n${renderedUserPrompt}`;
  const inputTokens = estimateTokens(totalInputText);
  const estimatedOutputTokens = 800;
  const costs = calculateInferenceCost(inputTokens, estimatedOutputTokens, selectedModel);

  const copyCode = (provider: 'google' | 'openai') => {
    const code = generateSdkCodeSnippet(selectedTemplate, variableValues, provider);
    navigator.clipboard.writeText(code);
    setCopiedSdk(provider);
    setTimeout(() => setCopiedSdk(null), 2000);
  };

  const downloadJsonPrompt = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            ...selectedTemplate,
            currentVariables: variableValues,
            renderedPreview: renderedUserPrompt,
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
              P-11 PRODUCT
            </span>
            <span className="text-xs text-slate-400">Developer AI Studio</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-violet-400" />
            PromptMatrix Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System Prompt Engineering, Multi-Model Evals, Few-Shot Matrix & SDK Generator.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadJsonPrompt}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-200 transition"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Main Grid: Template Selector + Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Template Library */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400" />
            Prompt Templates
          </h3>
          <div className="space-y-2">
            {STARTER_PROMPT_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className={`w-full text-left p-3.5 rounded-xl border transition text-xs ${
                  selectedTemplate.id === tpl.id
                    ? 'bg-violet-950/40 border-violet-500/50 text-white shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-slate-100">{tpl.title}</div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                  <span className="capitalize px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {tpl.category}
                  </span>
                  <span>{tpl.variables.length} vars</span>
                </div>
              </button>
            ))}
          </div>

          {/* Model Pricing & Cost Guard */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Inference Model
              </span>
            </div>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
            >
              {SUPPORTED_MODELS.map((m) => (
                <option key={m.modelId} value={m.modelId}>
                  {m.name} ({m.inputCostPerMillionUsd === 0 ? 'FREE' : `$${m.inputCostPerMillionUsd}/1M`})
                </option>
              ))}
            </select>

            <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Est. Input Tokens:</span>
                <span className="font-mono text-slate-200">{inputTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Est. Output Tokens:</span>
                <span className="font-mono text-slate-200">{estimatedOutputTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold text-xs pt-1">
                <span>Run Cost:</span>
                <span className="font-mono">
                  {costs.totalCostUsd === 0 ? '$0.00 (Local)' : `$${costs.totalCostUsd.toFixed(6)}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right Columns: Editor & SDK */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sub Navigation */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'editor'
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Prompt Editor & Variables
            </button>
            <button
              onClick={() => setActiveTab('fewshot')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'fewshot'
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Few-Shot Matrix ({selectedTemplate.fewShotExamples.length})
            </button>
            <button
              onClick={() => setActiveTab('sdk')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'sdk'
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SDK Code Export
            </button>
          </div>

          {activeTab === 'editor' && (
            <div className="space-y-6">
              {/* System Instruction Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  System Instructions (Guardrails & Persona)
                </label>
                <textarea
                  value={selectedTemplate.systemPrompt}
                  onChange={(e) =>
                    setSelectedTemplate((prev) => ({ ...prev, systemPrompt: e.target.value }))
                  }
                  rows={5}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Dynamic Variables Form */}
              {selectedTemplate.variables.length > 0 && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Template Variables
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTemplate.variables.map((v) => (
                      <div key={v.name} className="space-y-1">
                        <label className="text-[11px] font-mono text-violet-300 flex items-center justify-between">
                          <span>{`{{${v.name}}}`}</span>
                          <span className="text-[10px] text-slate-500">{v.description}</span>
                        </label>
                        <input
                          type="text"
                          value={variableValues[v.name] || ''}
                          onChange={(e) => handleVariableChange(v.name, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Rendered Output Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Play className="w-4 h-4 text-emerald-400" />
                    Rendered User Prompt Preview
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    ~{estimateTokens(renderedUserPrompt)} tokens
                  </span>
                </label>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap">
                  {renderedUserPrompt}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fewshot' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Few-shot examples guide the model's tone and output format without finetuning.
                </p>
              </div>

              {selectedTemplate.fewShotExamples.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  No few-shot examples yet. Add examples to anchor the LLM output structure.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTemplate.fewShotExamples.map((ex, idx) => (
                    <div key={ex.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                        <span>EXAMPLE #{idx + 1}</span>
                        {ex.explanation && (
                          <span className="text-[10px] text-violet-400 font-normal italic">
                            {ex.explanation}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">User Input</div>
                          <div className="text-slate-300 whitespace-pre-wrap">{ex.input}</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                          <div className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Assistant Output</div>
                          <div className="text-emerald-300 whitespace-pre-wrap">{ex.output}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sdk' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Google GenAI SDK Snippet */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-violet-400" />
                      Google GenAI SDK (Python)
                    </span>
                    <button
                      onClick={() => copyCode('google')}
                      className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold flex items-center gap-1 transition"
                    >
                      {copiedSdk === 'google' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedSdk === 'google' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-72">
                    {generateSdkCodeSnippet(selectedTemplate, variableValues, 'google')}
                  </pre>
                </div>

                {/* OpenAI SDK Snippet */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-emerald-400" />
                      OpenAI SDK (Python)
                    </span>
                    <button
                      onClick={() => copyCode('openai')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 transition"
                    >
                      {copiedSdk === 'openai' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedSdk === 'openai' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-72">
                    {generateSdkCodeSnippet(selectedTemplate, variableValues, 'openai')}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
