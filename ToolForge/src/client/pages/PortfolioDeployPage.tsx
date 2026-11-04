import React, { useState } from 'react';
import { sampleGitHubUser, sampleGitHubRepos, mapGitHubDataToPortfolio, PortfolioData, generateStaticPortfolioBundle, generateStaticPortfolioZipBundle } from '../../shared/portfoliodeploy.ts';
import { GitHubImporter } from '../components/portfoliodeploy/GitHubImporter.tsx';
import { InteractivePortfolio } from '../components/portfoliodeploy/InteractivePortfolio.tsx';
import { OpenGraphPreview } from '../components/portfoliodeploy/OpenGraphPreview.tsx';
import { ArrowLeft, Download, Eye, Share2, Sparkles, Terminal, CheckCircle2, Lock, FileArchive } from 'lucide-react';
import { Product } from '../types.ts';

interface PortfolioDeployPageProps {
  isOwned: boolean;
  onBack: () => void;
  onBuy: (product: Product) => void;
  product?: Product;
}

export const PortfolioDeployPage: React.FC<PortfolioDeployPageProps> = ({
  isOwned,
  onBack,
  onBuy,
  product
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'og' | 'deploy'>('preview');
  const [theme, setTheme] = useState<'cyberpunk' | 'editorial'>('cyberpunk');
  const [portfolio, setPortfolio] = useState<PortfolioData>(() =>
    mapGitHubDataToPortfolio(sampleGitHubUser, sampleGitHubRepos)
  );
  const [exportedHtml, setExportedHtml] = useState(false);
  const [exportedZip, setExportedZip] = useState(false);

  const handleExportHtml = () => {
    const htmlBundle = generateStaticPortfolioBundle(portfolio, theme, isOwned);
    const blob = new Blob([htmlBundle], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${portfolio.username}-portfolio-${theme}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setExportedHtml(true);
    setTimeout(() => setExportedHtml(false), 3000);
  };

  const handleExportZip = () => {
    const zipBytes = generateStaticPortfolioZipBundle(portfolio, theme, isOwned);
    const blob = new Blob([zipBytes as Uint8Array<ArrayBuffer>], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${portfolio.username}-portfolio-bundle-${theme}.zip`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setExportedZip(true);
    setTimeout(() => setExportedZip(false), 3000);
  };

  const handleUnlockPro = () => {
    if (product) onBuy(product);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header / Back Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
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
                Product 06 • Wave A
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                PortfolioDeploy
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              GitHub-Powered Developer Showcase, OpenGraph Social Card & One-Click Publisher
            </p>
          </div>
        </div>

        {/* Action Controls & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {!isOwned && (
            <button
              onClick={handleUnlockPro}
              disabled={!product}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              title={!product ? 'Paid upgrades are not configured in this preview.' : 'Continue to checkout'}
            >
              {product ? 'Unlock White-Label Bundle (₹' + product.price_inr + ')' : 'Paid upgrade unavailable in preview'}
            </button>
          )}

          <button
            onClick={handleExportHtml}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition active:scale-[0.98]"
            title="Download single self-contained HTML document"
          >
            {exportedHtml ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>HTML Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-400" />
                <span>Export .html</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportZip}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
            title="Download standalone HTML/CSS/JSON/README project zip bundle"
          >
            {exportedZip ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Zip Bundle Downloaded!</span>
              </>
            ) : (
              <>
                <FileArchive className="w-4 h-4" />
                <span>Export Zip Bundle (.zip)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* GitHub Profile Import Panel */}
      <GitHubImporter
        currentUsername={portfolio.username}
        onPortfolioLoaded={setPortfolio}
      />

      {/* View Mode Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Interactive Portfolio</span>
          </button>

          <button
            onClick={() => setActiveTab('og')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'og'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>OpenGraph Social Card</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'deploy'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Zero-Config Hosting Guide</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs">
          {isOwned ? (
            <span className="flex items-center space-x-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>White-label Pro Active</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Free Demo Mode</span>
            </span>
          )}
        </div>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'preview' && (
        <InteractivePortfolio
          portfolio={portfolio}
          theme={theme}
          onThemeChange={setTheme}
        />
      )}

      {activeTab === 'og' && (
        <OpenGraphPreview portfolio={portfolio} />
      )}

      {activeTab === 'deploy' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 text-xs text-slate-300">
          <div className="flex items-center space-x-2 text-blue-400">
            <Terminal className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">One-Click Zero-Cost Hosting Instructions</h3>
          </div>

          <p className="text-slate-400 leading-relaxed">
            Because PortfolioDeploy generates a 100% self-contained standalone HTML bundle with zero external npm dependencies, you can host your portfolio for free in under 60 seconds on any platform:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="font-bold text-white text-sm block">1. GitHub Pages</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Create a repo named <code className="text-blue-400">&lt;username&gt;.github.io</code>, upload the exported file as <code className="text-white">index.html</code>, and commit. Your portfolio is instantly live!
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="font-bold text-white text-sm block">2. Vercel Drag & Drop</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Go to <span className="text-white font-semibold">vercel.com/new</span>, drag and drop the folder containing your <code className="text-white">index.html</code>. Deploys with automatic HTTPS and edge CDN caching.
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="font-bold text-white text-sm block">3. Local Offline Preview</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Double click the downloaded <code className="text-white">.html</code> file on Windows/macOS. It opens immediately in Chrome, Edge, or Firefox without needing any local server or internet connection.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
