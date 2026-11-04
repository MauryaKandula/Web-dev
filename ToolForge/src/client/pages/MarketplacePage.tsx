import React, { useState } from 'react';
import { Product } from '../types.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { Search, SlidersHorizontal, Sparkles, Terminal, Code2, Cpu, Layout, FileCode2, Gamepad2, Palette, Wrench } from 'lucide-react';

interface MarketplacePageProps {
  products: Product[];
  libraryIds: Set<string>;
  wishlistIds: Set<string>;
  onBuy: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onLaunchApp?: (productId: string) => void;
}

const featuredApps = [
  {
    id: 'prod_repolens',
    name: 'RepoLens',
    description: 'Explore a sample or upload a local manifest to map folders and infer a stack. Remote GitHub import is not connected.',
    icon: Code2
  },
  {
    id: 'prod_interviewlab',
    name: 'InterviewLab',
    description: 'Practice data structures and algorithms with topic-based exercises and structured review.',
    icon: Terminal
  },
  {
    id: 'prod_placementforge',
    name: 'PlacementForge',
    description: 'Tailor a developer resume to a job description, review keyword coverage, and prepare an application copy.',
    icon: FileCode2
  },
  {
    id: 'prod_portfoliodeploy',
    name: 'PortfolioDeploy',
    description: 'Build a GitHub-ready project portfolio and export it as a static site bundle.',
    icon: Layout
  },
  {
    id: 'prod_freelanceos',
    name: 'FreelanceOS',
    description: 'Draft client proposals, organize milestones, and prepare invoice details for freelance work.',
    icon: Cpu
  }
];

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  products,
  libraryIds,
  wishlistIds,
  onBuy,
  onToggleWishlist,
  onSelectProduct,
  onLaunchApp
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');

  const categories = [
    { id: 'all', label: 'All listings', icon: Sparkles },
    { id: 'aesthetics', label: 'Themes & configurations', icon: Palette },
    { id: 'utility', label: 'Utilities', icon: Wrench },
    { id: 'development', label: 'Developer tools', icon: Code2 },
    { id: 'games', label: 'Games & Engines', icon: Gamepad2 },
    { id: 'dev_utilities', label: 'Portfolio tools', icon: Cpu }
  ];

  const priceTiers = [
    { id: 'all', label: 'All Prices' },
    { id: 'under_19', label: '⚡ Under ₹19' },
    { id: 'under_29', label: '🔥 Under ₹29' },
    { id: 'under_39', label: '⭐ Under ₹39' },
    { id: 'under_49', label: '💎 Max ₹49' }
  ];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = p.title.toLowerCase().includes(q) ||
                    p.tagline.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedPriceFilter === 'under_19' && p.price_inr > 19) return false;
    if (selectedPriceFilter === 'under_29' && p.price_inr > 29) return false;
    if (selectedPriceFilter === 'under_39' && p.price_inr > 39) return false;
    if (selectedPriceFilter === 'under_49' && p.price_inr > 49) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price_inr - b.price_inr;
    if (sortBy === 'price_desc') return b.price_inr - a.price_inr;
    if (sortBy === 'rating') return b.rating_avg - a.rating_avg;
    return b.sales_count - a.sales_count;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-950 border border-slate-800 p-8 sm:p-12 mb-10 shadow-2xl">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Developer Tools & Scripts</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Micro-priced software. <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Built by engineers for engineers.
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
            Discover practical tools from independent developers, support the people who build them, and find utilities for your own workflow.
          </p>
        </div>

        {/* Decorative Grid Accent */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      </div>

      <section aria-labelledby="featured-tools-heading" className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
          <div>
            <h2 id="featured-tools-heading" className="text-xl font-bold text-white">Five tools built for developers</h2>
            <p className="text-sm text-slate-400 mt-1">Explore ToolForge’s own workflow tools, made to help with code, careers, and client work.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {featuredApps.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onLaunchApp?.(tool.id)}
                disabled={!onLaunchApp}
                aria-label={'Open ' + tool.name}
                className="text-left rounded-2xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:border-blue-500/50 p-4 transition disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono text-slate-500">0{index + 1}</span>
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-white">{tool.name}</h3>
                <p className="text-xs leading-relaxed text-slate-400 mt-2 min-h-12">{tool.description}</p>
                <span className="inline-block text-xs font-semibold text-blue-400 mt-4">Explore tool →</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools, CLIs, prompt packs, templates..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition shadow-inner"
          />
        </div>

        {/* Price & Sort Controls */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 md:pb-0">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {priceTiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedPriceFilter(tier.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                  selectedPriceFilter === tier.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="popular" className="bg-slate-900">Most Popular</option>
              <option value="rating" className="bg-slate-900">Highest Rated</option>
              <option value="price_asc" className="bg-slate-900">Price: Low to High</option>
              <option value="price_desc" className="bg-slate-900">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
          <Terminal className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No products found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {products.length === 0
              ? 'No reviewed creator listings are published yet. Explore the five ToolForge workflow tools above.'
              : 'Try tweaking your search or price filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isOwned={libraryIds.has(p.id)}
              isWishlisted={wishlistIds.has(p.id)}
              onBuy={onBuy}
              onToggleWishlist={onToggleWishlist}
              onSelect={onSelectProduct}
              onLaunchApp={onLaunchApp}
            />
          ))}
        </div>
      )}
    </div>
  );
};
