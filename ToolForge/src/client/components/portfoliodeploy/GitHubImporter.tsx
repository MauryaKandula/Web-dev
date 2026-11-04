import React, { useState } from 'react';
import { GitHubUserProfile, GitHubRepo, sampleGitHubUser, sampleGitHubRepos, mapGitHubDataToPortfolio, PortfolioData } from '../../../shared/portfoliodeploy.ts';
import { RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { GithubIcon } from '../BrandIcons.tsx';

interface GitHubImporterProps {
  onPortfolioLoaded: (data: PortfolioData) => void;
  currentUsername: string;
}

export const GitHubImporter: React.FC<GitHubImporterProps> = ({
  onPortfolioLoaded,
  currentUsername
}) => {
  const [username, setUsername] = useState(currentUsername || 'arjunverma-dev');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFetchGitHub = async (targetUser: string) => {
    if (!targetUser.trim()) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Fetch public profile and repos from GitHub API
      const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(targetUser.trim())}`);
      if (!userRes.ok) {
        if (userRes.status === 404) {
          throw new Error(`GitHub user "${targetUser}" not found.`);
        }
        if (userRes.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please use the Curated Demo Profile or try later.');
        }
        throw new Error(`GitHub API error: ${userRes.statusText}`);
      }

      const userData: GitHubUserProfile = await userRes.json();

      const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(targetUser.trim())}/repos?sort=updated&per_page=12`);
      const reposData: GitHubRepo[] = reposRes.ok ? await reposRes.json() : [];

      const portfolio = mapGitHubDataToPortfolio(userData, reposData);
      onPortfolioLoaded(portfolio);
      setSuccessMsg(`Successfully imported @${userData.login} (${portfolio.projects.length} repositories)`);
    } catch (err: any) {
      console.warn('GitHub fetch failed, offering fallback:', err.message);
      setError(`${err.message} You can also load the verified Indian CSE demo profile.`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = () => {
    setError(null);
    const demo = mapGitHubDataToPortfolio(sampleGitHubUser, sampleGitHubRepos);
    setUsername(sampleGitHubUser.login);
    onPortfolioLoaded(demo);
    setSuccessMsg('Loaded Indian CSE Developer Demo (@arjunverma-dev)');
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs text-slate-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <GithubIcon className="w-4 h-4 text-white" />
          <h3 className="font-bold text-white text-sm">GitHub Profile Import</h3>
        </div>
        <button
          onClick={handleLoadDemo}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 font-semibold transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Indian CSE Demo Profile</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">github.com/</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            className="w-full pl-28 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => handleFetchGitHub(username)}
          disabled={loading || !username.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Fetching...</span>
            </>
          ) : (
            <span>Fetch Repos</span>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-[11px] flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={handleLoadDemo}
            className="ml-3 underline font-bold hover:text-white"
          >
            Use Demo Profile
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px] flex items-center space-x-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
};
