import React, { useState } from 'react';
import { Shield, Terminal, ArrowLeft, Search, Code2, AlertTriangle, CheckCircle, FileText, Play } from 'lucide-react';
import { identifyBinaryHeader, extractStringsFromBytes, deobfuscateJavaScript, BinaryHeaderInfo, ExtractedString } from '../../shared/rea_inspector.ts';
import { sound } from '../services/sound.ts';

interface ReaStudioPageProps {
  onBack: () => void;
}

export const ReaStudioPage: React.FC<ReaStudioPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'binary' | 'js_deobf'>('binary');
  const [headerInfo, setHeaderInfo] = useState<BinaryHeaderInfo | null>(null);
  const [extractedStrings, setExtractedStrings] = useState<ExtractedString[]>([]);
  const [sampleType, setSampleType] = useState<'pe' | 'elf' | 'wasm' | 'zip'>('pe');
  const [jsInput, setJsInput] = useState<string>(
    'const _0x12a = "\\x68\\x74\\x74\\x70\\x73\\x3a\\x2f\\x2f\\x61\\x70\\x69\\x2e\\x65\\x78\\x61\\x6d\\x70\\x6c\\x65\\x2e\\x63\\x6f\\x6d";\nconst _token = atob("c2VjcmV0X3Rva2VuXzEyMzQ1Njc4");\nconsole.log(_0x12a, _token);'
  );
  const [deobfOutput, setDeobfOutput] = useState<string>('');
  const [deobfPatterns, setDeobfPatterns] = useState<string[]>([]);

  // Sample bytes generator
  const loadSample = (type: 'pe' | 'elf' | 'wasm' | 'zip') => {
    sound.playClick();
    setSampleType(type);
    let bytes: Uint8Array;
    const encoder = new TextEncoder();

    if (type === 'pe') {
      bytes = new Uint8Array([
        0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00,
        ...encoder.encode("This program cannot be run in DOS mode.\r\n$"),
        ...encoder.encode("https://github.com/morluto/rea\0C:\\Windows\\System32\\ntdll.dll\0")
      ]);
    } else if (type === 'elf') {
      bytes = new Uint8Array([
        0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00,
        ...encoder.encode("/lib64/ld-linux-x86-64.so.2\0libc.so.6\0printf\0exit\0")
      ]);
    } else if (type === 'wasm') {
      bytes = new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
        ...encoder.encode("memory\0table\0_start\0malloc\0free\0")
      ]);
    } else {
      bytes = new Uint8Array([
        0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00,
        ...encoder.encode("META-INF/MANIFEST.MF\0classes.dex\0AndroidManifest.xml\0")
      ]);
    }

    const header = identifyBinaryHeader(bytes);
    setHeaderInfo(header);
    const strings = extractStringsFromBytes(bytes, 4);
    setExtractedStrings(strings);
  };

  const runDeobfuscator = () => {
    sound.playTerminalSuccess();
    const result = deobfuscateJavaScript(jsInput);
    setDeobfOutput(result.cleanedCode);
    setDeobfPatterns(result.detectedPatterns);
  };

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
          REA Reverse Engine v6.8
        </span>
      </div>

      <div className="relative rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-6 sm:p-8 mb-8 cyber-cut">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-2">
              <Shield className="w-4 h-4" />
              <span>Binary Decompiler & Script Analysis Sandbox</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              REA Reverse Engineering Suite
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Inspect executable headers, calculate Shannon entropy to detect packing or encryption, extract suspicious strings, and de-obfuscate packed JavaScript payloads.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => { sound.playClick(); setActiveTab('binary'); }}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'binary' ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Binary & Header Analysis
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveTab('js_deobf'); }}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'js_deobf' ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              JS De-obfuscation
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'binary' && (
        <div className="space-y-6">
          {/* Sample Selectors */}
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 font-mono">Load Sample Binary Buffer:</span>
            <div className="flex gap-2">
              {(['pe', 'elf', 'wasm', 'zip'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => loadSample(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition border ${
                    sampleType === t && headerInfo
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t} binary
                </button>
              ))}
            </div>
          </div>

          {headerInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Header Box */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
                <span className="text-slate-500 block">FORMAT IDENTIFICATION</span>
                <div className="text-lg font-bold text-cyan-300">{headerInfo.format}</div>
                <div className="text-slate-300">{headerInfo.description}</div>
                <div className="pt-2 border-t border-slate-800 text-slate-400">
                  Magic Bytes: <span className="text-amber-300 font-bold">{headerInfo.magicHex}</span>
                </div>
              </div>

              {/* Entropy Box */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
                <span className="text-slate-500 block">SHANNON ENTROPY METER</span>
                <div className="text-lg font-bold text-emerald-400">{headerInfo.entropy} / 8.000</div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full"
                    style={{ width: `${(headerInfo.entropy / 8) * 100}%` }}
                  />
                </div>
                <div className="pt-2 border-t border-slate-800 text-slate-400 flex items-center space-x-1">
                  {headerInfo.isPackedOrEncrypted ? (
                    <span className="text-amber-400 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Likely Packed or Encrypted</span>
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Standard Code Density</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Extracted Strings Summary */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
                <span className="text-slate-500 block">EXTRACTED STRINGS</span>
                <div className="text-lg font-bold text-white">{extractedStrings.length} found</div>
                <div className="text-slate-400">
                  URLs: {extractedStrings.filter(s => s.kind === 'url').length} • Paths: {extractedStrings.filter(s => s.kind === 'path').length}
                </div>
                <div className="pt-2 border-t border-slate-800 text-cyan-300">
                  Minimum Length: 4 ASCII characters
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl text-xs font-mono text-slate-500">
              Click a sample binary button above to inspect headers and calculate entropy.
            </div>
          )}

          {/* Strings Table */}
          {extractedStrings.length > 0 && (
            <div className="bg-[#050811] border border-slate-800 rounded-2xl p-5 font-mono text-xs overflow-x-auto">
              <span className="text-slate-400 font-bold block mb-3">Extracted ASCII Signatures:</span>
              <div className="space-y-1.5">
                {extractedStrings.map((s, idx) => (
                  <div key={idx} className="flex items-center space-x-4 py-1 border-b border-slate-900">
                    <span className="text-slate-600 w-16">0x{s.offset.toString(16).padStart(4, '0')}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] text-cyan-400 uppercase w-28 text-center">
                      {s.kind}
                    </span>
                    <span className="text-slate-200 truncate flex-1">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'js_deobf' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Obfuscated JavaScript Payload:</span>
            <button
              onClick={runDeobfuscator}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 text-black text-xs font-mono font-bold hover:bg-cyan-500 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>De-obfuscate Script</span>
            </button>
          </div>

          <textarea
            value={jsInput}
            onChange={(e) => setJsInput(e.target.value)}
            rows={5}
            className="w-full p-4 bg-[#050811] border border-slate-800 rounded-xl font-mono text-xs text-cyan-200 focus:outline-none focus:border-cyan-500"
          />

          {deobfOutput && (
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold">Cleaned Output:</span>
                <span className="text-slate-500">Detected: {deobfPatterns.join(', ')}</span>
              </div>
              <pre className="p-4 bg-[#050811] border border-slate-800 rounded-xl text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                {deobfOutput}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
