import React from 'react';
import { CentralBenchmarkData, PageTab } from '../types';
import { BenchmarkChart } from '../components/BenchmarkChart';
import { BarChart3, Zap, ArrowRight, Activity, Layers } from 'lucide-react';

interface BenchmarkProps {
  benchmarkData: CentralBenchmarkData;
  onTabChange: (tab: PageTab) => void;
}

export const Benchmark: React.FC<BenchmarkProps> = ({
  benchmarkData,
  onTabChange
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Performance Comparison &amp; Benchmark Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Compare standard autoregressive decoding with speculative decoding across throughput, latency, and model sizes.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onTabChange('demo')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>Launch Live Playground</span>
        </button>
      </div>

      {/* Benchmark Visualizer Components */}
      <BenchmarkChart data={benchmarkData} />

    </div>
  );
};
