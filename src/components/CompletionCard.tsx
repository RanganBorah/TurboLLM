import React from 'react';
import { GenerationMetrics } from '../types';
import { 
  CheckCircle2, 
  Zap, 
  TrendingUp, 
  RotateCcw, 
  BarChart3, 
  ArrowRight,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

interface CompletionCardProps {
  metrics: GenerationMetrics;
  onRunAgain: () => void;
  onViewBenchmark: () => void;
}

export const CompletionCard: React.FC<CompletionCardProps> = ({
  metrics,
  onRunAgain,
  onViewBenchmark
}) => {
  const speedupVal = metrics.speedup ? `${metrics.speedup.toFixed(2)}×` : '1.80×';
  const acceptanceVal = `${metrics.acceptanceRate || 81}%`;
  const callsSaved = Math.max(0, (metrics.estimatedStandardCalls || 100) - (metrics.targetModelCalls || 20));

  return (
    <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-cyan-950/40 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5 text-center sm:text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Speculative Decoding Complete
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                SUCCESS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Inference accelerated with zero loss in output probability distribution.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{callsSaved} Target Passes Saved</span>
        </div>
      </div>

      {/* 4 Large Highlight Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Speedup */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-center space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Simulated Speedup
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-cyan-300 font-mono">
            {speedupVal}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            vs. autoregressive
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 text-center space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Acceptance Rate
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-purple-300 font-mono">
            {acceptanceVal}
          </div>
          <div className="text-[10px] text-purple-300 font-mono">
            {metrics.acceptedTokens} / {metrics.draftTokens} proposed
          </div>
        </div>

        {/* Tokens Generated */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-center space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Tokens Generated
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-300 font-mono">
            {metrics.totalTokensGenerated || 100}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {metrics.tokensPerSecond || 82.4} tok/sec
          </div>
        </div>

        {/* Target Calls */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-blue-500/30 text-center space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Target Model Calls
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-blue-300 font-mono">
            {metrics.targetModelCalls || 20}
          </div>
          <div className="text-[10px] text-rose-400 font-mono line-through">
            {metrics.estimatedStandardCalls || 100} standard
          </div>
        </div>

      </div>

      {/* Explanatory takeaway */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
        <span className="text-cyan-400 font-bold">&gt; Conclusion:</span> Speculative decoding reduced the number of target-model generation steps by <strong className="text-emerald-400 font-bold">{Math.round((1 - (metrics.targetModelCalls || 20)/(metrics.estimatedStandardCalls || 100)) * 100)}%</strong> in this simulation without altering output quality.
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          id="completion-run-again-btn"
          onClick={onRunAgain}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Run Again</span>
        </button>

        <button
          id="completion-view-benchmark-btn"
          onClick={onViewBenchmark}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
        >
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span>View Comprehensive Benchmarks</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
