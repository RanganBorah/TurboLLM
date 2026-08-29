import React from 'react';
import { 
  ArrowDown, 
  ArrowRight, 
  Check, 
  X, 
  Cpu, 
  Zap, 
  Layers, 
  Clock, 
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface ModelComparisonProps {
  interactiveStep?: number;
  highlightDifference?: boolean;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({
  interactiveStep = 3,
  highlightDifference = true
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Architectural Comparison: Standard vs. Speculative Decoding
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Understanding why batched verification beats sequential autoregression.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
            Speedup Ratio: ~1.8× – 2.2×
          </span>
        </div>
      </div>

      {/* Side-by-side Dual Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT PANEL: Standard Autoregressive Decoding */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 font-mono">
                <Cpu className="w-4 h-4" /> Standard Autoregressive
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40">
                1 Token / Step
              </span>
            </div>
            <p className="text-xs text-slate-400">
              One expensive 70B parameter model evaluation required for every single token.
            </p>
          </div>

          {/* Sequential Step Diagram */}
          <div className="py-4 space-y-2 font-mono text-xs">
            
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Prompt Context</span>
              <span className="text-cyan-400 font-bold">"Explain..."</span>
            </div>

            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className="flex items-center justify-center text-slate-400">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="text-slate-300">Target Model (70B) Call #{step}</span>
                  </div>
                  <span className="text-rose-300 font-bold">Token {step} (~28ms)</span>
                </div>
              </React.Fragment>
            ))}

          </div>

          {/* Performance Summary Footnote */}
          <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Target Model Calls for 4 tokens:</span>
              <strong className="text-rose-400">4 Expensive Passes</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Execution Time:</span>
              <strong className="text-rose-400">~112 ms</strong>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 font-sans">
              Memory bandwidth bound: Loading 140GB weights per single token output.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Speculative Decoding */}
        <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 via-slate-900/70 to-slate-900/90 p-5 space-y-4 relative overflow-hidden flex flex-col justify-between shadow-lg shadow-cyan-500/5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 font-mono">
                <Zap className="w-4 h-4 text-cyan-400" /> Speculative Decoding
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
                Batch Verification (γ=5)
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Fast draft model proposes γ candidate tokens; target model verifies the entire sequence in 1 parallel forward pass.
            </p>
          </div>

          {/* Speculative Step Diagram */}
          <div className="py-2 space-y-2.5 font-mono text-xs">
            
            {/* Step 1: Draft Model proposes candidates */}
            <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-500/40">
              <div className="flex items-center justify-between text-purple-300 text-[11px] font-bold mb-1.5">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> 1. Draft Model (8B) Rapid Generation
                </span>
                <span className="text-purple-400">~15ms total</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Token 1', 'Token 2', 'Token 3', 'Token 4', 'Token 5'].map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-purple-900/60 border border-purple-500/30 text-purple-200 text-[11px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center text-cyan-400">
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </div>

            {/* Step 2: Target Model Parallel Verification */}
            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/40">
              <div className="flex items-center justify-between text-cyan-300 text-[11px] font-bold mb-1.5">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" /> 2. Target Model (70B) Single Forward Pass
                </span>
                <span className="text-cyan-400">~28ms parallel</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                <div className="p-1 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-0.5">
                  <Check className="w-3 h-3" /> T1
                </div>
                <div className="p-1 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-0.5">
                  <Check className="w-3 h-3" /> T2
                </div>
                <div className="p-1 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-0.5">
                  <Check className="w-3 h-3" /> T3
                </div>
                <div className="p-1 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-0.5">
                  <Check className="w-3 h-3" /> T4
                </div>
                <div className="p-1 rounded bg-rose-950 border border-rose-500 text-rose-300 text-[10px] font-bold flex items-center justify-center gap-0.5">
                  <X className="w-3 h-3" /> T5
                </div>
              </div>
            </div>

            {/* Step 3: Verified Tokens Emitted */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/30 flex items-center justify-between text-emerald-300">
              <span className="text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Emitted Tokens:
              </span>
              <span className="font-bold text-xs">4 Accepted + 1 Corrected = 5 Tokens</span>
            </div>

          </div>

          {/* Performance Summary Footnote */}
          <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-300">
              <span>Target Model Calls for 5 tokens:</span>
              <strong className="text-emerald-400 font-bold">1 Single Target Pass</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Total Execution Time:</span>
              <strong className="text-cyan-400 font-bold">~43 ms (vs 140 ms std)</strong>
            </div>
            <p className="text-[11px] text-cyan-300 pt-1 font-sans font-medium">
              &bull; Exact mathematical equivalence preserved — zero degradation in output quality!
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
