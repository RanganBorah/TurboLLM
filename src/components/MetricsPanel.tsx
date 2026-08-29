import React from 'react';
import { GenerationMetrics } from '../types';
import { 
  Zap, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  Clock, 
  TrendingUp, 
  Layers,
  Gauge,
  Percent
} from 'lucide-react';

interface MetricsPanelProps {
  metrics: GenerationMetrics;
  mode: 'speculative' | 'standard' | 'demo';
  isRunning: boolean;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  metrics,
  mode,
  isRunning
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Real-Time Inference Telemetry
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Streaming...
            </span>
          )}
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-850 text-slate-400">
            {mode} mode
          </span>
        </div>
      </div>

      {/* Primary Highlights 2x4 Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Metric 1: Speedup Ratio */}
        <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/30 to-slate-900/50">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Simulated Speedup</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">
              {metrics.speedup ? `${metrics.speedup.toFixed(2)}×` : '1.80×'}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400 font-mono">
            vs. autoregressive
          </p>
        </div>

        {/* Metric 2: Tokens / Second */}
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 to-slate-900/50">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Tokens / Sec (TPS)</span>
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">
              {metrics.tokensPerSecond ? metrics.tokensPerSecond.toFixed(1) : '82.4'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">tok/s</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400 font-mono">
            Standard: ~45.8 tok/s
          </p>
        </div>

        {/* Metric 3: Acceptance Rate */}
        <div className="p-3.5 rounded-xl border border-purple-500/30 bg-gradient-to-b from-purple-950/30 to-slate-900/50">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Acceptance Rate (α)</span>
            <Percent className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">
              {metrics.acceptanceRate ? `${metrics.acceptanceRate}%` : '81%'}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400 font-mono">
            Draft accuracy
          </p>
        </div>

        {/* Metric 4: Target Model Calls */}
        <div className="p-3.5 rounded-xl border border-blue-500/30 bg-gradient-to-b from-blue-950/30 to-slate-900/50">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Target Model Calls</span>
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-300 font-mono">
              {metrics.targetModelCalls || 0}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              / {metrics.totalTokensGenerated || metrics.estimatedStandardCalls || 0} std
            </span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400 font-mono">
            {metrics.estimatedStandardCalls ? `${Math.max(0, metrics.estimatedStandardCalls - metrics.targetModelCalls)} calls saved` : '75% reduction'}
          </p>
        </div>

      </div>

      {/* Secondary Detailed Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-900 font-mono text-xs">
        
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center">
          <span className="text-slate-400 text-[11px]">Draft Proposed:</span>
          <span className="text-purple-300 font-bold">{metrics.draftTokens || 0}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center">
          <span className="text-slate-400 text-[11px]">Tokens Accepted:</span>
          <span className="text-emerald-300 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {metrics.acceptedTokens || 0}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center">
          <span className="text-slate-400 text-[11px]">Tokens Rejected:</span>
          <span className="text-rose-300 font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-400" /> {metrics.rejectedTokens || 0}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center">
          <span className="text-slate-400 text-[11px]">Latency:</span>
          <span className="text-cyan-300 font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" /> {metrics.latencyMs || 0} ms
          </span>
        </div>

      </div>

    </div>
  );
};
