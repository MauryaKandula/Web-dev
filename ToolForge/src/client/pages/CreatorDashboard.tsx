import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Product } from '../types.ts';
import { LayoutDashboard, PlusCircle, DollarSign, Package, TrendingUp, X } from 'lucide-react';

export const CreatorDashboard: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('cli_tools');
  const [priceInr, setPriceInr] = useState(49);
  const [submitting, setSubmitting] = useState(false);

  const fetchCreatorData = async () => {
    try {
      const res = await api.getCreatorStats();
      setStats(res.stats);
      setProducts(res.products);
    } catch (err) {
      console.error('Failed to fetch creator stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatorData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createProduct({
        title,
        tagline,
        description,
        category,
        priceInr
      });
      setShowModal(false);
      setTitle('');
      setTagline('');
      setDescription('');
      fetchCreatorData();
    } catch (err: any) {
      alert(err.message || 'Failed to list product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-3">
            <LayoutDashboard className="w-7 h-7 text-purple-400" />
            <span>Creator Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish software tools, track simulated revenue, and manage customer licenses.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Tool</span>
        </button>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Gross Volume</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">₹{stats.totalGrossInr}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Net Creator Earnings</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400 font-mono">₹{stats.totalNetEarningsInr}</div>
            <span className="text-[10px] text-slate-500 block mt-1">After 10% platform fee</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Orders</span>
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{stats.totalSales}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Live Products</span>
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{stats.totalProducts}</div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6">
        <h2 className="text-base font-bold text-white mb-4">Your Published Packages</h2>
        {products.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No products published yet.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {products.map((p) => (
              <div key={p.id} className="py-4 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm">{p.title}</h4>
                  <p className="text-slate-400 mt-0.5">{p.tagline}</p>
                  <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-500">
                    <span>Category: <strong className="text-slate-300">{p.category}</strong></span>
                    <span>•</span>
                    <span>Version: <strong className="text-slate-300">{p.version}</strong></span>
                    <span>•</span>
                    <span>Sales: <strong className="text-slate-300">{p.sales_count}</strong></span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-white font-mono block">₹{p.price_inr}</span>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publish Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">List New Tool or Script</h2>
            <p className="text-xs text-slate-400 mb-5">
              Set transparent pricing and distribute your software to developers worldwide.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. TurboRegex CLI Tool"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">One-line Tagline</label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Fast, memory-safe regex benchmark and parser."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="cli_tools">CLI Tool</option>
                    <option value="dev_utilities">Dev Utility</option>
                    <option value="ai_prompts">AI Prompts</option>
                    <option value="ui_templates">UI Template</option>
                    <option value="web_scripts">Web Script</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={priceInr}
                    onChange={(e) => setPriceInr(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe key features, supported platforms, setup guide, and dependencies..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition shadow-lg shadow-purple-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
