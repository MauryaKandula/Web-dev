import React, { useState } from 'react';
import { samplePlacementResume, ResumeData } from '../../shared/placementforge.ts';
import { ResumeEditor } from '../components/placementforge/ResumeEditor.tsx';
import { ResumePreview } from '../components/placementforge/ResumePreview.tsx';
import { JDAnalyzer } from '../components/placementforge/JDAnalyzer.tsx';
import { PortfolioView } from '../components/placementforge/PortfolioView.tsx';
import { ArrowLeft, FileText, Sparkles, Globe, ShieldCheck } from 'lucide-react';
import { Product } from '../types.ts';

interface PlacementForgePageProps {
  isOwned: boolean;
  onBack: () => void;
  onBuy: (product: Product) => void;
  product?: Product;
}

export const PlacementForgePage: React.FC<PlacementForgePageProps> = ({
  isOwned,
  onBack,
  onBuy,
  product
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'jd' | 'portfolio'>('editor');
  const [resumeData, setResumeData] = useState<ResumeData>(samplePlacementResume);

  const handleUnlockPro = () => {
    if (product) onBuy(product);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header / Back Button (Hidden during print) */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
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
                Product 01 • Wave A
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                PlacementForge
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ATS-Optimized Resume Engine, JD Keyword Matcher & Personal Portfolio Generator
            </p>
          </div>
        </div>

        {/* Navigation Mode Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveSubTab('editor')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              activeSubTab === 'editor'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resume & ATS PDF</span>
          </button>

          <button
            onClick={() => setActiveSubTab('jd')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              activeSubTab === 'jd'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>JD Keyword Matcher</span>
          </button>

          <button
            onClick={() => setActiveSubTab('portfolio')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              activeSubTab === 'portfolio'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web Portfolio View</span>
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      {activeSubTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Editor (5 cols, hidden during print) */}
          <div className="no-print lg:col-span-5 max-h-[85vh] overflow-y-auto pr-1">
            <ResumeEditor
              resume={resumeData}
              onChange={setResumeData}
              onResetSample={() => setResumeData(samplePlacementResume)}
            />
          </div>

          {/* Right: Printable ATS Sheet Preview (7 cols) */}
          <div className="lg:col-span-7">
            <ResumePreview
              resume={resumeData}
              isPro={isOwned}
              upgradePriceInr={product?.price_inr}
              onUnlockPro={handleUnlockPro}
            />
          </div>
        </div>
      )}

      {activeSubTab === 'jd' && (
        <JDAnalyzer resume={resumeData} />
      )}

      {activeSubTab === 'portfolio' && (
        <PortfolioView resume={resumeData} />
      )}
    </div>
  );
};
