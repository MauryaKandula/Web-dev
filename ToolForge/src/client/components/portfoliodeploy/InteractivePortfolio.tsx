import React, { useState } from 'react';
import { PortfolioData } from '../../../shared/portfoliodeploy.ts';
import { ExternalLink, Star, GitFork, Search, Sparkles, Moon, Sun } from 'lucide-react';
import { GithubIcon } from '../BrandIcons.tsx';

interface InteractivePortfolioProps {
  portfolio: PortfolioData;
  theme: 'cyberpunk' | 'editorial';
  onThemeChange: (theme: 'cyberpunk' | 'editorial') => void;
}

export const InteractivePortfolio: React.FC<InteractivePortfolioProps> = ({
  portfolio,
  theme,
  onThemeChange
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isCyberpunk = theme === 'cyberpunk';

  const allLanguages: string[] = Array.from(
    new Set(portfolio.projects.map(p => p.language).filter(Boolean))
  );

  const filteredProjects = portfolio.projects.filter(p => {
    if (selectedLanguage !== 'all' && p.language.toLowerCase() !== selectedLanguage.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = p.title.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.tags.some(t => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className={`rounded-3xl p-6 sm:p-10 transition-colors duration-300 border ${
      isCyberpunk
        ? 'bg-[#070b14] border-cyan-500/20 text-slate-100'
        : 'bg-white border-slate-200 text-slate-900 shadow-xl'
    }`}>
      {/* Top Header & Theme Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-inherit">
        <div className="flex items-center space-x-4">
          <img
            src={portfolio.avatarUrl}
            alt={portfolio.name}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 shadow-lg ${
              isCyberpunk
                ? 'border-cyan-400 shadow-cyan-500/20'
                : 'border-blue-600 shadow-blue-500/10'
            }`}
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black">{portfolio.name}</h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                isCyberpunk
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                Engineer
              </span>
            </div>
            <p className={`text-xs mt-1 max-w-xl leading-relaxed ${
              isCyberpunk ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {portfolio.bio}
            </p>
            <div className={`flex items-center space-x-4 mt-2 text-[11px] font-mono ${
              isCyberpunk ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <span>📍 {portfolio.location}</span>
              <span>•</span>
              <span>⭐ {portfolio.totalStars} Stars</span>
              <span>•</span>
              <span>📦 {portfolio.totalRepos} Repositories</span>
            </div>
          </div>
        </div>

        {/* Theme Selector Toggle */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${
            isCyberpunk
              ? 'bg-slate-900 border-slate-800'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <button
              onClick={() => onThemeChange('cyberpunk')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition ${
                isCyberpunk
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Cyberpunk Dark</span>
            </button>
            <button
              onClick={() => onThemeChange('editorial')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition ${
                !isCyberpunk
                  ? 'bg-white text-blue-700 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Editorial Clean</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Languages Matrix */}
      <div className="py-6 flex flex-wrap gap-2">
        {portfolio.topLanguages.map((l, i) => (
          <div
            key={i}
            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold border ${
              isCyberpunk
                ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <span>{l.language}</span>
            <span className={`text-[11px] font-mono ${
              isCyberpunk ? 'text-cyan-400' : 'text-blue-600'
            }`}>
              {l.percentage}%
            </span>
          </div>
        ))}
      </div>

      {/* Search and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${
            isCyberpunk ? 'text-slate-500' : 'text-slate-400'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or tags..."
            className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs focus:outline-none border ${
              isCyberpunk
                ? 'bg-slate-950 border-slate-800 text-white focus:border-cyan-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setSelectedLanguage('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              selectedLanguage === 'all'
                ? isCyberpunk
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'bg-blue-600 text-white font-bold'
                : isCyberpunk
                  ? 'bg-slate-900 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({portfolio.projects.length})
          </button>
          {allLanguages.map((lang, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                selectedLanguage.toLowerCase() === lang.toLowerCase()
                  ? isCyberpunk
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-blue-600 text-white font-bold'
                  : isCyberpunk
                    ? 'bg-slate-900 text-slate-400 hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${
          isCyberpunk
            ? 'bg-slate-950/60 border-slate-800 text-slate-400'
            : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <p className="text-sm font-semibold">No engineering projects found</p>
          <p className="text-xs mt-1 opacity-70">
            {searchQuery || selectedLanguage !== 'all'
              ? 'Try resetting your search query or language filter.'
              : 'Import a GitHub profile with public repositories to showcase your projects.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                isCyberpunk
                  ? 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5'
                  : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm sm:text-base capitalize">{p.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                    isCyberpunk
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {p.language}
                  </span>
                </div>

                <p className={`text-xs line-clamp-3 mb-4 leading-relaxed ${
                  isCyberpunk ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {p.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.tags.map((tag, i) => (
                    <span
                      key={i}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        isCyberpunk
                          ? 'bg-slate-950 text-slate-400 border border-slate-800'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className={`flex items-center justify-between pt-3 border-t text-xs ${
                isCyberpunk ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <div className={`flex items-center space-x-3 text-xs font-mono ${
                  isCyberpunk ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <span className="flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{p.stars}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <GitFork className="w-3.5 h-3.5" />
                    <span>{p.forks}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {p.demoUrl && (
                    <a
                      href={p.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        isCyberpunk
                          ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                          : 'bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      <span>Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <a
                    href={p.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      isCyberpunk
                        ? 'border-slate-700 hover:border-slate-500 text-slate-300'
                        : 'border-slate-300 hover:border-slate-400 text-slate-700 bg-white'
                    }`}
                  >
                    <GithubIcon className="w-3 h-3" />
                    <span>Code</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
