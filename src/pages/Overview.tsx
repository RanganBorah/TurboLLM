import React from 'react';
import { PageTab, CentralBenchmarkData } from '../types';
import { Hero } from '../components/Hero';
import { MetricCard } from '../components/MetricCard';
import { ModelComparison } from '../components/ModelComparison';
import { TechnicalCards } from '../components/TechnicalCards';
import { 
  Zap, 
  Activity, 
  Percent, 
  Cpu, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  Play,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface OverviewProps {
  benchmarkData: CentralBenchmarkData;
  onTabChange: (tab: PageTab) => void;
  onTriggerGuidedDemo: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  benchmarkData,
  onTabChange,
  onTriggerGuidedDemo
}) => {
  const { overviewMetrics } = benchmarkData;

  return (
    <div className="space-y-16">
      
      {/* 1. Hero Section */}
      <Hero
        onGoToDemo={() => onTabChange('demo')}
        onGoToHowItWorks={() => onTabChange('how-it-works')}
        onTriggerGuidedDemo={onTriggerGuidedDemo}
      />

      {/* 2. Key Performance Metrics (from centralized data) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span>Benchmark Highlights</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Key Performance Metrics
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Empirical measurements comparing Speculative Decoding (3B+1B) against standard autoregressive inference.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Card 1: Speed Improvement */}
          <MetricCard
            id="metric-card-speedup"
            title="Speed Improvement"
            value={overviewMetrics.speedImprovement}
            description="Compared with standard autoregressive decoding"
            icon={<TrendingUp className="w-4 h-4 text-red-400" />}
          />

          {/* Card 2: Tokens / Second */}
          <MetricCard
            id="metric-card-tps"
            title="Tokens / Second"
            value={overviewMetrics.tokensPerSecond}
            unit="tok/s"
            description="Standard decoding comparison"
            icon={<Zap className="w-4 h-4 text-red-400" />}
          />

          {/* Card 3: Acceptance Rate */}
          <MetricCard
            id="metric-card-acceptance"
            title="Acceptance Rate"
            value={`${overviewMetrics.acceptanceRate}%`}
            description="Percentage of draft tokens accepted by target"
            icon={<Percent className="w-4 h-4 text-red-400" />}
          />

          {/* Card 4: Target Model Calls */}
          <MetricCard
            id="metric-card-calls"
            title="Target Model Calls"
            value={overviewMetrics.targetModelCalls}
            description="For 100 generated tokens (vs 100 standard calls)"
            icon={<Cpu className="w-4 h-4 text-red-400" />}
          />

        </div>
      </section>

      {/* 3. Before vs After Architectural Comparison Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ModelComparison />
      </section>

      {/* 4. Core Technical Concept Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TechnicalCards />
      </section>

      {/* 5. Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Ready to experience speculative decoding in real time?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Launch the interactive playground to test prompts, inspect candidate token proposals, and witness parallel batched target verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onTabChange('demo')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              <span>Launch Live Playground</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onTriggerGuidedDemo}
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-slate-400" />
              <span>Watch 20s Demo</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
