import React, { useState } from 'react';
import { Product } from '../types.ts';
import { ShieldCheck, Check, Sparkles, X, CreditCard, Smartphone, Zap } from 'lucide-react';

interface CheckoutModalProps {
  product: Product | null;
  onClose: () => void;
  onComplete: (productId: string, paymentMethod: string) => Promise<any>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  onClose,
  onComplete
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi_simulated' | 'card_simulated'>('razorpay');
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await onComplete(product.id, paymentMethod);
      setSuccessResult(res);
    } catch (err: any) {
      setError(err.message || 'Payment simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {successResult ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Purchase Successful!</h2>
            <p className="text-xs text-slate-400 mt-1">
              Your software license has been registered to your account.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 my-5 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">License Key</span>
              <code className="text-sm font-mono font-bold text-blue-400 block select-all">
                {successResult.licenseKey}
              </code>
              <span className="text-[10px] text-slate-500 block mt-2">Transaction ID: {successResult.transactionId}</span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-600/20"
            >
              Go to My Library
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-2 text-xs text-blue-400 font-semibold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Checkout by Razorpay. Payment is verified on the server.</span>
            </div>

            <h2 className="text-lg font-bold text-white mb-1">{product.title}</h2>
            <p className="text-xs text-slate-400 line-clamp-1">{product.tagline}</p>

            {/* Payment Method Selector */}
            <div className="mt-5">
              <span className="text-xs font-semibold text-slate-300 block mb-2">Payment method</span>
              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                className={paymentMethod === 'razorpay'
                  ? 'w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold bg-blue-600/15 border-blue-500 text-blue-400'
                  : 'w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}
              >
                <span className="flex items-center space-x-2.5">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Razorpay Checkout (UPI, cards, net banking)</span>
                </span>
              </button>
              <p className="text-[11px] text-slate-500 mt-2">
                Payment is confirmed by the server. Live payments require verified merchant credentials.
              </p>

              {import.meta.env.DEV && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi_simulated')}
                    className={paymentMethod === 'upi_simulated'
                      ? 'flex items-center space-x-2 p-3 rounded-xl border text-xs font-bold bg-blue-600/10 border-blue-500 text-blue-400'
                      : 'flex items-center space-x-2 p-3 rounded-xl border text-xs font-bold bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI (development simulation)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card_simulated')}
                    className={paymentMethod === 'card_simulated'
                      ? 'flex items-center space-x-2 p-3 rounded-xl border text-xs font-bold bg-blue-600/10 border-blue-500 text-blue-400'
                      : 'flex items-center space-x-2 p-3 rounded-xl border text-xs font-bold bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card (development simulation)</span>
                  </button>
                </div>
              )}
            </div>
            {/* Breakdown */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 my-5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono">₹{product.price_inr}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white text-sm">
                <span>Checkout total</span>
                <span className="text-blue-400 font-mono">₹{product.price_inr}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Processing Payment...</span>
              ) : paymentMethod === 'razorpay' ? (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Pay ₹{product.price_inr} with Razorpay</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Simulate Payment of ₹{product.price_inr}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
