import React from 'react';
import { Product } from '../types.ts';
import { Star, Download, Heart, ArrowUpRight, CheckCircle2, Play, GitBranch, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isOwned: boolean;
  isWishlisted: boolean;
  onBuy: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onSelect: (product: Product) => void;
  onLaunchApp?: (productId: string) => void;
}

const GitHubIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isOwned,
  isWishlisted,
  onBuy,
  onToggleWishlist,
  onSelect,
  onLaunchApp
}) => {
  const categoryLabels: Record<string, string> = {
    cli_tools: 'CLI Tool',
    web_scripts: 'Web Script',
    ai_prompts: 'AI Prompts',
    ui_templates: 'UI Template',
    dev_utilities: 'Dev Utility',
    games: 'Interactive Game',
    aesthetics: 'Aesthetics & Rice',
    utility: 'System Utility',
    development: 'Dev Tool'
  };

  const isInteractiveApp = product.id === 'prod_placementforge' ||
    product.id === 'prod_portfoliodeploy' ||
    product.id === 'prod_projectlaunch' ||
    product.id === 'prod_repolens' ||
    product.id === 'prod_interviewlab' ||
    product.id === 'prod_studysignal' ||
    product.id === 'prod_campusops' ||
    product.id === 'prod_creatorpipe' ||
    product.id === 'prod_workflowvault' ||
    product.id === 'prod_freelanceos' ||
    product.id === 'prod_infinite_empire' ||
    product.id === 'prod_anime_clash';

  const configuredGithubUrl = (product as Product & { github_url?: string }).github_url;
  const githubUrl = configuredGithubUrl && /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?\/?$/.test(configuredGithubUrl)
    ? configuredGithubUrl
    : undefined;

  return (
    <div className="group relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-blue-500/40 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-md bg-slate-800/80 text-blue-400 border border-slate-700/50">
              {categoryLabels[product.category] || product.category}
            </span>
            {isInteractiveApp && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Live App
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1.5">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg border border-slate-700/40 bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 hover:text-white transition flex items-center"
                title="View the listed GitHub source repository"
              >
                <GitHubIcon className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product.id);
              }}
              className={`p-1.5 rounded-lg border transition ${
                isWishlisted
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                  : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-white'
              }`}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Tagline */}
        <h3
          onClick={() => onSelect(product)}
          className="text-base font-bold text-white group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-1 flex items-center"
        >
          {product.title}
          <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
          {product.tagline}
        </p>

        {/* Creator & Rating */}
        <div className="flex items-center space-x-3 mt-4 text-xs text-slate-400">
          {product.rating_count > 0 ? (
            <span className="flex items-center space-x-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating_avg.toFixed(1)}</span>
              <span className="text-slate-500 font-normal">({product.rating_count})</span>
            </span>
          ) : (
            <span className="text-slate-500">No reviews yet</span>
          )}
          {product.sales_count > 0 && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{product.sales_count} verified purchases</span>
            </>
          )}
        </div>
      </div>

      {/* Price & Action */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/60 gap-2">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Digital software
            </span>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
              ₹{product.price_inr}
            </span>
            <span className="text-[11px] text-slate-500 line-through">
              ₹{product.price_inr * 5 + 49}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isInteractiveApp && onLaunchApp && (
            <button
              onClick={() => onLaunchApp(product.id)}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 transition shadow-sm"
              title="Launch interactive in-browser tool"
            >
              <Play className="w-3 h-3 fill-cyan-400" />
              <span>{isOwned ? 'Open Tool' : 'Launch Demo'}</span>
            </button>
          )}

          {isOwned ? (
            <button
              onClick={() => onSelect(product)}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>In Library</span>
            </button>
          ) : (
            <button
              onClick={() => onBuy(product)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Buy Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
