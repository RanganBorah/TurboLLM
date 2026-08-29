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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Benchmark Highlights</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Key Performance Metrics
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Empirical measurements comparing Speculative Decoding (70B+8B) against standard autoregressive inference.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Speed Improvement */}
          <MetricCard
            id="metric-card-speedup"
            title="Speed Improvement"
            value={overviewMetrics.speedImprovement}
            description="Compared with standard autoregressive decoding"
            delta="+80% throughput"
            isPositiveDelta={true}
            icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
            variant="cyan"
            badgeText="Simulated"
          />

          {/* Card 2: Tokens / Second */}
          <MetricCard
            id="metric-card-tps"
            title="Tokens / Second"
            value={overviewMetrics.tokensPerSecond}
            unit="tok/s"
            description="Standard decoding generates ~45.8 tok/s"
            delta="82.4 vs 45.8"
            isPositiveDelta={true}
            icon={<Zap className="w-4 h-4 text-emerald-400" />}
            variant="green"
            badgeText="Throughput"
          />

          {/* Card 3: Acceptance Rate */}
          <MetricCard
            id="metric-card-acceptance"
            title="Acceptance Rate"
            value={`${overviewMetrics.acceptanceRate}%`}
            description="Percentage of draft tokens accepted by target"
            delta="α = 0.81"
            isPositiveDelta={true}
            icon={<Percent className="w-4 h-4 text-purple-400" />}
            variant="purple"
            badgeText="Draft Quality"
          />

          {/* Card 4: Target Model Calls */}
          <MetricCard
            id="metric-card-calls"
            title="Target Model Calls"
            value={overviewMetrics.targetModelCalls}
            description="For 100 generated tokens (vs 100 standard calls)"
            delta="80% reduction"
            isPositiveDelta={true}
            icon={<Cpu className="w-4 h-4 text-blue-400" />}
            variant="amber"
            badgeText="GPU Computation"
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
        <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-purple-950/40 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Ready to experience speculative decoding in real time?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Launch the interactive playground to test prompts, inspect candidate token proposals, and witness parallel batched target verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onTabChange('demo')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Launch Live Playground</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onTriggerGuidedDemo}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 text-sm font-semibold transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-purple-400" />
              <span>Watch 20s Demo</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
