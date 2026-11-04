import React, { useState } from 'react';
import { PortfolioData } from '../../../shared/portfoliodeploy.ts';
import { Copy, Check, Share2, Sparkles } from 'lucide-react';

interface OpenGraphPreviewProps {
  portfolio: PortfolioData;
}

export const OpenGraphPreview: React.FC<OpenGraphPreviewProps> = ({ portfolio }) => {
  const [copied, setCopied] = useState(false);

  const ogTags = `<meta property="og:title" content="${portfolio.name} — Software Engineer Portfolio" />
<meta property="og:description" content="${portfolio.bio}" />
<meta property="og:image" content="${portfolio.avatarUrl}" />
<meta property="og:url" content="${portfolio.websiteUrl || portfolio.githubUrl}" />
<meta property="og:type" content="profile" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${portfolio.name} | Developer Portfolio" />
<meta name="twitter:description" content="${portfolio.bio}" />
<meta name="twitter:image" content="${portfolio.avatarUrl}" />`;

  const handleCopyTags = () => {
    navigator.clipboard.writeText(ogTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-xs text-slate-300">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Share2 className="w-4 h-4 text-blue-400" />
          <h3 className="font-bold text-white text-sm">OpenGraph & Twitter Social Share Card</h3>
        </div>
        <button
          onClick={handleCopyTags}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied HTML Meta Tags' : 'Copy Meta Tags'}</span>
        </button>
      </div>

      {/* Visual 1200x630 Aspect Card Simulation */}
      <div className="w-full aspect-[1200/630] rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border-2 border-blue-500/30 p-6 sm:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden select-none">
        {/* Top bar */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <img
              src={portfolio.avatarUrl}
              alt={portfolio.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-blue-400 shadow-lg object-cover"
            />
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-white">{portfolio.name}</h2>
              <span className="text-blue-400 font-mono text-xs sm:text-sm">@{portfolio.username}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-mono text-[10px] sm:text-xs">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Developer Portfolio</span>
          </div>
        </div>

        {/* Center Bio */}
        <div className="relative z-10 my-auto py-2">
          <p className="text-slate-300 text-xs sm:text-base font-medium line-clamp-3 leading-relaxed max-w-xl">
            {portfolio.bio}
          </p>
        </div>

        {/* Bottom Metrics & Tech Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 relative z-10">
          <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
            <span>📦 <strong className="text-white">{portfolio.totalRepos}</strong> Repos</span>
            <span>⭐ <strong className="text-white">{portfolio.totalStars}</strong> Stars</span>
            <span>📍 <strong className="text-white">{portfolio.location}</strong></span>
          </div>

          <div className="flex items-center space-x-1.5">
            {portfolio.topLanguages.slice(0, 4).map((l, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 font-mono text-[10px] font-bold"
              >
                {l.language} ({l.percentage}%)
              </span>
            ))}
          </div>
        </div>

        {/* Glow */}
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Code Snippet Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 font-mono">
          Ready-to-Paste HTML Meta Tags (&lt;head&gt;)
        </span>
        <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
          {ogTags}
        </pre>
      </div>
    </div>
  );
};
