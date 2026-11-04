import React, { useState } from 'react';
import { Product, Review } from '../types.ts';
import { Star, CheckCircle, ArrowLeft, Download, ShieldCheck, Heart, UserCircle, MessageSquare, Play, ExternalLink } from 'lucide-react';
import { DevProductToolbox } from '../components/DevProductToolbox.tsx';

interface ProductDetailPageProps {
  product: Product;
  reviews: Review[];
  isOwned: boolean;
  isWishlisted: boolean;
  onBack: () => void;
  onBuy: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onAddReview: (productId: string, rating: number, comment: string) => Promise<void>;
  onDownload: (productId: string) => void;
  onLaunchApp?: (productId: string) => void;
}

const GitHubIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  reviews,
  isOwned,
  isWishlisted,
  onBack,
  onBuy,
  onToggleWishlist,
  onAddReview,
  onDownload,
  onLaunchApp
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const candidateGithubUrl = (product as any).github_url;
const githubUrl = typeof candidateGithubUrl === 'string' && /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(candidateGithubUrl)
  ? candidateGithubUrl
  : '';

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await onAddReview(product.id, rating, comment);
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
              <span>{product.category}</span>
              <span>•</span>
              <span>v{product.version}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {product.title}
            </h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              {product.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                {product.rating_count > 0 ? (
                  <>
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{product.rating_avg.toFixed(1)}</span>
                    <span className="text-slate-500 font-normal">({product.rating_count} reviews)</span>
                  </>
                ) : (
                  <span className="text-slate-500 font-normal">No reviews yet</span>
                )}
              </div>
              {product.sales_count > 0 && (
                <>
                  <span className="text-slate-700">•</span>
                  <span className="text-slate-400">{product.sales_count} verified purchases</span>
                </>
              )}
              <span className="text-slate-700">•</span>
              <span className="text-slate-400">{(product.file_size_kb / 1024).toFixed(1)} MB</span>
              <span className="text-slate-700">•</span>
              {githubUrl ? (
  <a
    href={githubUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition"
    title="Inspect the provided repository source"
  >
    <GitHubIcon className="w-3.5 h-3.5" />
    <span>View source on GitHub</span>
    <ExternalLink className="w-3 h-3 text-slate-400" />
  </a>
) : (
  <span className="text-xs text-slate-500">Source link unavailable</span>
)}
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <h2 className="text-base font-bold text-white mb-4">About this Software</h2>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>

            {product.release_notes && (
              <div className="mt-6 pt-6 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Release Notes (v{product.version})
                </h3>
                <p className="text-xs text-slate-400 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {product.release_notes}
                </p>
              </div>
            )}
          </div>

          {/* Developer Integration Toolbox (cURL, Dockerfile, .env, Sandbox) */}
          <DevProductToolbox product={product} />

          {/* Reviews Section */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Customer Reviews ({reviews.length})</span>
              </h2>
            </div>

            {/* Write Review Form */}
            <form onSubmit={handleSubmitReview} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6">
              <span className="text-xs font-semibold text-slate-300 block mb-2">Leave a Rating & Feedback</span>
              <div className="flex items-center space-x-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-500 hover:text-amber-400 transition"
                  >
                    <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                ))}
                <span className="text-xs text-slate-400 ml-2 font-medium">{rating} / 5 stars</span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience using this tool or script..."
                rows={2}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Submit Review'}
                </button>
              </div>
            </form>

            {/* Review List */}
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No reviews yet. Be the first to leave one!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">{rev.user_name}</span>
                      <div className="flex items-center space-x-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="text-xs font-bold">{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Purchase Action (1 Col) */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <span className="text-xs font-medium text-slate-400 block">Listed price</span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                  ₹{product.price_inr}
                </span>
              </div>
            </div>

            {(product.id === 'prod_placementforge' ||
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
              product.id === 'prod_anime_clash') && onLaunchApp && (
              <button
                onClick={() => onLaunchApp(product.id)}
                className="w-full mb-3 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-500/5 hover:border-cyan-400"
              >
                <Play className="w-4 h-4 fill-cyan-400" />
                <span>{product.category === 'games' ? 'Play Game Online' : isOwned ? 'Open Live Web Tool' : 'Launch Interactive Demo'}</span>
              </button>
            )}

            {isOwned ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Licensed to Your Account</span>
                </div>
                <button
                  onClick={() => onDownload(product.id)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Package</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => onBuy(product)}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition shadow-xl shadow-blue-500/25 active:scale-[0.98]"
              >
                Continue to checkout
              </button>
            )}

            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`w-full mt-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                isWishlisted
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>

            {githubUrl ? (
  <a
    href={githubUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition"
    title="Inspect the provided repository source"
  >
    <GitHubIcon className="w-3.5 h-3.5" />
    <span>View source on GitHub</span>
    <ExternalLink className="w-3 h-3 text-slate-400" />
  </a>
) : (
  <span className="text-xs text-slate-500">Source link unavailable</span>
)}

            <div className="mt-6 pt-6 border-t border-slate-800 space-y-3 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Review the source and package before installation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Release and update terms depend on the listing</span>
              </div>
              <div className="flex items-center space-x-2">
                <UserCircle className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Created by <strong className="text-white ml-1">{product.creator_name}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
