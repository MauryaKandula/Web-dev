import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Shield, TrendingUp, DollarSign, ShoppingCart, Users, Package, Sliders, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const AdminConsole: React.FC = () => {
  const [metrics, setMetrics] = useState<{
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalVolumeInr: number;
    totalCommissionRevenueInr: number;
    currentCommissionPercent: number;
  } | null>(null);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commissionInput, setCommissionInput] = useState<number>(10);
  const [savingCommission, setSavingCommission] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminStats();
      setMetrics(res.metrics);
      setOrders(res.orders || []);
      setCommissionInput(res.metrics.currentCommissionPercent || 10);
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to load admin stats', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateCommission = async () => {
    try {
      setSavingCommission(true);
      const res = await api.updateCommission(commissionInput);
      setMessage({ text: `Commission rate successfully updated to ${res.updatedCommissionRate}%!`, type: 'success' });
      await loadData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update commission', type: 'error' });
    } finally {
      setSavingCommission(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm">Loading ToolForge Executive Console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin & Platform Governance</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time platform metrics, take-rate commission adjustment, and financial settlement audit.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {message && (
        <div
          className={`mt-6 p-4 rounded-xl border flex items-center space-x-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Gross Volume (GMV)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ₹{metrics?.totalVolumeInr.toLocaleString('en-IN') || 0}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">Total gross software sales</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Platform Take (Revenue)</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            ₹{metrics?.totalCommissionRevenueInr.toLocaleString('en-IN') || 0}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Net fee earned ({metrics?.currentCommissionPercent}%)</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Orders</span>
            <ShoppingCart className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {metrics?.totalOrders || 0}
          </div>
          <span className="text-[11px] text-blue-400 font-medium mt-1 block">Completed transactions</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Ecosystem Size</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {metrics?.totalUsers || 0} Users / {metrics?.totalProducts || 0} Items
          </div>
          <span className="text-[11px] text-purple-400 font-medium mt-1 block">Active creators & customers</span>
        </div>
      </div>

      {/* Commission Configuration Slider */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-amber-500/20 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Sliders className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Dynamic Platform Commission Policy</h2>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          This setting records a proposed fee split in the order ledger. It does not transfer money to creators.
          Confirm the terms and payout integration before accepting real orders.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 w-full">
            <div className="flex justify-between text-xs font-medium text-slate-300 mb-2">
              <span>Platform Take-Rate: <span className="font-bold text-amber-400 font-mono text-sm">{commissionInput}%</span></span>
              <span>Creator Retains: <span className="font-bold text-emerald-400 font-mono text-sm">{100 - commissionInput}%</span></span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={commissionInput}
              onChange={(e) => setCommissionInput(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <button
            onClick={handleUpdateCommission}
            disabled={savingCommission || commissionInput === metrics?.currentCommissionPercent}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            {savingCommission ? 'Saving...' : 'Save Commission Policy'}
          </button>
        </div>
      </div>

      {/* Orders Audit Ledger */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <span>Financial Settlement & Orders Ledger</span>
          <span className="text-xs font-normal text-slate-500">({orders.length} events)</span>
        </h2>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Platform Fee</th>
                  <th className="py-3 px-4">Creator Net</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      No orders processed yet. Purchases will appear here in real-time.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-blue-400">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-4 font-medium text-white">
                        {order.buyer_name || order.buyer_id}
                      </td>
                      <td className="py-3 px-4 max-w-[200px] truncate">
                        {order.product_title}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        ₹{order.amount_inr}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-400">
                        ₹{order.platform_fee_inr}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-400">
                        ₹{order.creator_earnings_inr}
                      </td>
                      <td className="py-3 px-4 uppercase text-[10px] font-semibold text-slate-400">
                        {order.payment_method}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
