import React, { useState, useEffect } from 'react';
import { Radio, Zap, Sparkles, CheckCircle2, Clock, X, Film } from 'lucide-react';

interface OverdriveModalProps {
  onClose: () => void;
  onClaimOverdriveBoost: () => void;
  onInstantWarp: (hours: number) => void;
}

export const OverdriveModal: React.FC<OverdriveModalProps> = ({
  onClose,
  onClaimOverdriveBoost,
  onInstantWarp
}) => {
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [adCompleted, setAdCompleted] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingAd && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (isPlayingAd && countdown === 0) {
      setIsPlayingAd(false);
      setAdCompleted(true);
      onClaimOverdriveBoost();
    }
    return () => clearTimeout(timer);
  }, [isPlayingAd, countdown]);

  const handleStartAd = () => {
    setIsPlayingAd(true);
    setCountdown(5);
    setAdCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-950 border border-purple-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Radio className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white font-orbitron">Orbital Comms & Energy Warp</h2>
            <p className="text-xs text-slate-400">Free Overdrive boost and accelerated hyper-space warps.</p>
          </div>
        </div>

        {/* Rewarded Mock Ad Section */}
        <div className="bg-gradient-to-r from-purple-950/40 to-slate-900/60 border border-purple-800/40 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Film className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white font-orbitron">Deep Space Transmission</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              100% Free
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Broadcast encrypted planetary comms for 5 seconds to overcharge all industrial generators by <strong className="text-amber-400">2x speed for 4 hours</strong>.
          </p>

          {isPlayingAd ? (
            <div className="bg-black/80 border border-purple-500/40 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono font-bold text-purple-300">
                Receiving Interstellar Stream... ({countdown}s)
              </p>
              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-1000"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
            </div>
          ) : adCompleted ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Overdrive Engaged! 2x Production Active for 4 Hours.</span>
            </div>
          ) : (
            <button
              onClick={handleStartAd}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider font-orbitron shadow-lg shadow-amber-600/20 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Watch Transmission (5s) for 2x Boost</span>
            </button>
          )}
        </div>

        {/* Warp Time Accelerators (Mock Microtransactions) */}
        <div className="bg-slate-950/60 border border-purple-950/80 rounded-2xl p-5">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-orbitron">Chrono-Warp Capsules (Simulated)</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Instantaneously compress temporal physics to collect future earnings immediately.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onInstantWarp(6)}
              className="p-3 bg-purple-950/30 hover:bg-purple-900/40 border border-purple-800/40 rounded-xl text-left transition"
            >
              <span className="text-xs font-bold text-white font-orbitron block">+6 Hours Warp</span>
              <span className="text-[11px] text-cyan-300 font-mono">Instant Payout</span>
              <span className="text-[10px] text-slate-500 block mt-1">Simulated Free Tier</span>
            </button>

            <button
              onClick={() => onInstantWarp(24)}
              className="p-3 bg-purple-950/30 hover:bg-purple-900/40 border border-purple-800/40 rounded-xl text-left transition"
            >
              <span className="text-xs font-bold text-white font-orbitron block">+24 Hours Warp</span>
              <span className="text-[11px] text-cyan-300 font-mono">Full Day Payout</span>
              <span className="text-[10px] text-slate-500 block mt-1">Simulated Free Tier</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
