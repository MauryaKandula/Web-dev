import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Shield, Zap } from 'lucide-react';

interface TouchControlsProps {
  onMoveLeftStart: () => void;
  onMoveLeftEnd: () => void;
  onMoveRightStart: () => void;
  onMoveRightEnd: () => void;
  onJump: () => void;
  onCrouchStart: () => void;
  onCrouchEnd: () => void;
  onBlockStart: () => void;
  onBlockEnd: () => void;
  onPunch: () => void;
  onKick: () => void;
  onSpecial: () => void;
  onSuper: () => void;
  isSuperReady: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeftStart,
  onMoveLeftEnd,
  onMoveRightStart,
  onMoveRightEnd,
  onJump,
  onCrouchStart,
  onCrouchEnd,
  onBlockStart,
  onBlockEnd,
  onPunch,
  onKick,
  onSpecial,
  onSuper,
  isSuperReady
}) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 z-30 flex items-end justify-between px-6 pointer-events-none sm:hidden">
      {/* Left Virtual D-Pad */}
      <div className="flex flex-col items-center space-y-2 pointer-events-auto">
        <button
          onTouchStart={(e) => { e.preventDefault(); onJump(); }}
          className="w-14 h-14 rounded-2xl bg-slate-900/80 active:bg-cyan-600 border border-slate-700 active:scale-95 text-white flex items-center justify-center shadow-lg"
        >
          <ArrowUp className="w-6 h-6" />
        </button>

        <div className="flex space-x-2">
          <button
            onTouchStart={(e) => { e.preventDefault(); onMoveLeftStart(); }}
            onTouchEnd={(e) => { e.preventDefault(); onMoveLeftEnd(); }}
            className="w-14 h-14 rounded-2xl bg-slate-900/80 active:bg-cyan-600 border border-slate-700 active:scale-95 text-white flex items-center justify-center shadow-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); onCrouchStart(); }}
            onTouchEnd={(e) => { e.preventDefault(); onCrouchEnd(); }}
            className="w-14 h-14 rounded-2xl bg-slate-900/80 active:bg-cyan-600 border border-slate-700 active:scale-95 text-white flex items-center justify-center shadow-lg"
          >
            <ArrowDown className="w-6 h-6" />
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); onMoveRightStart(); }}
            onTouchEnd={(e) => { e.preventDefault(); onMoveRightEnd(); }}
            className="w-14 h-14 rounded-2xl bg-slate-900/80 active:bg-cyan-600 border border-slate-700 active:scale-95 text-white flex items-center justify-center shadow-lg"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex flex-col items-end space-y-2 pointer-events-auto">
        <div className="flex space-x-2">
          <button
            onTouchStart={(e) => { e.preventDefault(); onBlockStart(); }}
            onTouchEnd={(e) => { e.preventDefault(); onBlockEnd(); }}
            className="w-12 h-12 rounded-2xl bg-slate-900/80 active:bg-sky-600 border border-sky-500/40 text-sky-400 font-bold text-xs flex items-center justify-center"
          >
            <Shield className="w-5 h-5" />
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); onSuper(); }}
            className={`w-14 h-12 rounded-2xl border font-black text-xs flex items-center justify-center ${
              isSuperReady
                ? 'bg-pink-600 active:bg-pink-500 border-pink-400 text-white animate-pulse'
                : 'bg-slate-950/60 border-slate-800 text-slate-600'
            }`}
          >
            <Zap className="w-4 h-4 mr-0.5" />
            <span>SUP</span>
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onTouchStart={(e) => { e.preventDefault(); onPunch(); }}
            className="w-14 h-14 rounded-2xl bg-cyan-700/80 active:bg-cyan-500 border border-cyan-400 text-white font-black text-sm flex items-center justify-center shadow-lg"
          >
            P
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); onKick(); }}
            className="w-14 h-14 rounded-2xl bg-purple-700/80 active:bg-purple-500 border border-purple-400 text-white font-black text-sm flex items-center justify-center shadow-lg"
          >
            K
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); onSpecial(); }}
            className="w-14 h-14 rounded-2xl bg-amber-600/80 active:bg-amber-500 border border-amber-400 text-white font-black text-sm flex items-center justify-center shadow-lg"
          >
            SP
          </button>
        </div>
      </div>
    </div>
  );
};
