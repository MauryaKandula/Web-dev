import React from 'react';
import { User } from '../types.ts';
import { Package, Heart, LayoutDashboard, Shield, ShoppingBag, Terminal, Sparkles, Rocket, Compass, Code2, BookOpen, Gamepad2, Crown, ShieldAlert, Palette } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchRole: (role: 'customer' | 'creator' | 'admin') => void;
  wishlistCount: number;
  libraryCount: number;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onSwitchRole,
  wishlistCount,
  libraryCount,
  onOpenCommandPalette
}) => {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('marketplace')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                ToolForge
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                Affordable Dev Marketplace
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'marketplace'
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Explore</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'library'
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>My Library</span>
                {libraryCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-xs font-bold bg-blue-600 text-white rounded-full">
                    {libraryCount}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'wishlist'
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-xs font-bold bg-rose-600 text-white rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </div>
            </button>

            {/* Direct Web Tool Launches */}
            <div className="h-4 w-px bg-slate-800 mx-1" />

            <button
              onClick={() => setActiveTab('placementforge')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'placementforge'
                  ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
              }`}
              title="PlacementForge: ATS Resume & Portfolio Builder"
            >
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>PlacementForge</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('portfoliodeploy')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'portfoliodeploy'
                  ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
              }`}
              title="PortfolioDeploy: GitHub Portfolio Publisher"
            >
              <div className="flex items-center space-x-1">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>PortfolioDeploy</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('projectlaunch')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'projectlaunch'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
              }`}
              title="ProjectLaunch: Guided CSE Starter Kits"
            >
              <div className="flex items-center space-x-1">
                <Rocket className="w-3.5 h-3.5 text-amber-400" />
                <span>ProjectLaunch</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('repolens')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'repolens'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-blue-300 hover:bg-slate-900'
              }`}
              title="RepoLens: Codebase Architecture Explainer"
            >
              <div className="flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                <span>RepoLens</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('interviewlab')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'interviewlab'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900'
              }`}
              title="InterviewLab: Curated Placement DSA Lab"
            >
              <div className="flex items-center space-x-1">
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>InterviewLab</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('studysignal')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'studysignal'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-purple-300 hover:bg-slate-900'
              }`}
              title="StudySignal: Notes, Revision & Viva Practice"
            >
              <div className="flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>StudySignal</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('promptmatrix')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'promptmatrix'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-violet-300 hover:bg-slate-900'
              }`}
              title="PromptMatrix: LLM Prompt Engineering & Evals"
            >
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>PromptMatrix</span>
              </div>
            </button>

            {/* Playable Games Direct Links */}
            <button
              onClick={() => setActiveTab('animeclash')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'animeclash'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-rose-300 hover:bg-slate-900'
              }`}
              title="FightKro // Anime Clash Arena (60fps Canvas Fighter)"
            >
              <div className="flex items-center space-x-1">
                <Gamepad2 className="w-3.5 h-3.5 text-rose-400" />
                <span>FightKro</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('idlegame')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'idlegame'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
              }`}
              title="Infinite Empire (Sci-Fi Idle Clicker)"
            >
              <div className="flex items-center space-x-1">
                <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Idle Game</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('debloatstudio')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'debloatstudio'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
              }`}
              title="Win11Debloat & Rig Optimizer Studio"
            >
              <div className="flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Debloat</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('shellrice')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'shellrice'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
              }`}
              title="Shell Rice & Terminal Theme Studio"
            >
              <div className="flex items-center space-x-1">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                <span>Shell Rice</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('reastudio')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'reastudio'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900'
              }`}
              title="REA Binary & Script Reverse-Engineering Sandbox"
            >
              <div className="flex items-center space-x-1">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>REA Decompile</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('sponsor')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'sponsor'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/30'
              }`}
              title="Patreon & Supporter Club"
            >
              <div className="flex items-center space-x-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Patreon / Sponsors</span>
              </div>
            </button>

            {currentUser?.role === 'creator' && (
              <button
                onClick={() => setActiveTab('creator')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'creator'
                    ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                    : 'text-slate-400 hover:text-purple-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Creator Studio</span>
                </div>
              </button>
            )}

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Admin Console</span>
                </div>
              </button>
            )}
          </div>

          {/* Role Switcher & User Profile */}
          <div className="flex items-center space-x-3">
            {onOpenCommandPalette && (
              <button
                onClick={onOpenCommandPalette}
                className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-300 transition cursor-pointer"
                title="Global Command Palette (Ctrl + K)"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Search / Exec</span>
                <kbd className="text-[10px] bg-slate-800 px-1 py-0.5 rounded text-cyan-400 border border-slate-700">⌘K</kbd>
              </button>
            )}

            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <span className="text-slate-500 px-2 font-medium">Role:</span>
              <button
                onClick={() => onSwitchRole('customer')}
                className={`px-2 py-1 rounded font-semibold transition ${
                  currentUser?.role === 'customer'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Customer (MK)
              </button>
              <button
                onClick={() => onSwitchRole('creator')}
                className={`px-2 py-1 rounded font-semibold transition ${
                  currentUser?.role === 'creator'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Creator (Arjun)
              </button>
              <button
                onClick={() => onSwitchRole('admin')}
                className={`px-2 py-1 rounded font-semibold transition ${
                  currentUser?.role === 'admin'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
