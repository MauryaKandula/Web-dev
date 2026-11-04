import React, { useState } from 'react';
import { ResumeData, analyzeJobDescription, JDAnalysisResult } from '../../../shared/placementforge.ts';
import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb, FileText, ArrowRight } from 'lucide-react';

interface JDAnalyzerProps {
  resume: ResumeData;
}

const SAMPLE_CSE_JD = `Role: Software Development Engineer - I (Backend & Distributed Systems)
We are looking for a high-potential engineering graduate to join our core backend infrastructure team.

Key Requirements:
- Strong problem-solving skills in Data Structures and Algorithms (DSA), System Design, and OOPs.
- Proficiency in at least one modern backend language: Go, Python, Java, or C++.
- Hands-on experience developing REST API or GraphQL microservices using Docker and Linux.
- Solid understanding of relational and NoSQL databases: PostgreSQL, MySQL, Redis.
- Knowledge of cloud architecture (AWS or GCP) and CI/CD pipelines is a strong plus.
- Good academic track record in Computer Science & Engineering.`;

export const JDAnalyzer: React.FC<JDAnalyzerProps> = ({ resume }) => {
  const [jdText, setJdText] = useState(SAMPLE_CSE_JD);
  const [result, setResult] = useState<JDAnalysisResult | null>(() => analyzeJobDescription(resume, SAMPLE_CSE_JD));

  const handleAnalyze = () => {
    const res = analyzeJobDescription(resume, jdText);
    setResult(res);
  };

  const loadSample = () => {
    setJdText(SAMPLE_CSE_JD);
    setResult(analyzeJobDescription(resume, SAMPLE_CSE_JD));
  };

  return (
    <div className="space-y-6 text-xs text-slate-300">
      {/* Input Form */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-white text-sm">Target Job Description (JD) Input</h3>
          </div>
          <button
            onClick={loadSample}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-medium underline"
          >
            Load Sample SDE-1 JD
          </button>
        </div>

        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          rows={6}
          placeholder="Paste the recruiter's Job Description or requirements here..."
          className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
        />

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze ATS Match & Suggestions</span>
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6">
          {/* Match Score Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                ATS Compatibility Score
              </span>
              <h2 className="text-2xl font-black text-white">
                {result.score >= 80 ? 'Exceptional Match' : result.score >= 60 ? 'Strong Candidate Fit' : 'Moderate Match — Optimization Recommended'}
              </h2>
              <p className="text-slate-400 max-w-md text-xs">
                Matched {result.matchedKeywords.length} of {result.extractedJDKeywords.length} core recruiter skills detected in the job posting.
              </p>
            </div>

            <div className="flex items-center justify-center">
              <div className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 ${
                result.score >= 80 ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' :
                result.score >= 60 ? 'border-blue-500 bg-blue-500/10 text-blue-400' :
                'border-amber-500 bg-amber-500/10 text-amber-400'
              }`}>
                <span className="text-2xl font-black font-mono">{result.score}%</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Match</span>
              </div>
            </div>
          </div>

          {/* Keywords Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Matched Keywords */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Matched Skills ({result.matchedKeywords.length})
                </h4>
              </div>
              <p className="text-[11px] text-slate-400">
                These keywords are verified present in your resume skills and projects:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {result.matchedKeywords.length === 0 ? (
                  <span className="text-slate-500 italic">No direct keyword overlap found yet.</span>
                ) : (
                  result.matchedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-medium"
                    >
                      ✓ {kw}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Missing Recruiter Keywords ({result.missingKeywords.length})
                </h4>
              </div>
              <p className="text-[11px] text-slate-400">
                Keywords requested by the recruiter that are not yet detected:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {result.missingKeywords.length === 0 ? (
                  <span className="text-emerald-400 font-medium">100% of detected skills matched!</span>
                ) : (
                  result.missingKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-medium"
                    >
                      + {kw}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Truthful Enhancement Suggestions */}
          {result.suggestedEnhancements.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 text-blue-400">
                <Lightbulb className="w-4 h-4 shrink-0" />
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Truthful Keyword Enhancement Suggestions
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                We believe in 100% truthful resume building — never fabricate skills or technologies you haven't worked with. Use these recommendations to naturally highlight real competencies:
              </p>

              <div className="space-y-3">
                {result.suggestedEnhancements.map((enh, i) => (
                  <div key={i} className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-400 text-xs">
                        Target: {enh.keyword}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{enh.context}</p>
                    <div className="flex items-start space-x-2 mt-2 pt-2 border-t border-slate-900 text-[11px] text-emerald-300 bg-emerald-950/20 p-2 rounded-lg">
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                      <span>{enh.suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
