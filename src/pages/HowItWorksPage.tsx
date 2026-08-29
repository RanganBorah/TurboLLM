import React from 'react';
import { PageTab } from '../types';
import { HowItWorks } from '../components/HowItWorks';
import { BookOpen, Zap, Sparkles, CheckCircle2, ArrowRight, Layers, FileCode } from 'lucide-react';

interface HowItWorksPageProps {
  onTabChange: (tab: PageTab) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onTabChange }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-4">
      
      {/* 1. Main 4-Step Interactive Player */}
      <HowItWorks />

      {/* 2. Mathematical Foundation of Speculative Decoding */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-2.5 border-b border-slate-850 pb-4">
          <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              The Mathematics of Speculative Sampling &amp; Lossless Guarantee
            </h3>
            <p className="text-xs text-slate-400">
              Why speculative decoding guarantees zero deviation from target model probabilities.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 className="font-bold text-cyan-300 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Acceptance Criterion Formula
            </h4>
            <p className="leading-relaxed">
              Given draft token <code className="text-purple-300">x</code> with draft probability <code className="text-purple-300">q(x)</code> and target probability <code className="text-cyan-300">p(x)</code>:
            </p>
            <div className="p-3 rounded bg-slate-950 border border-slate-850 font-mono text-center text-xs text-emerald-400 font-bold">
              Acceptance Probability = min(1,  p(x) / q(x) )
            </div>
            <p className="text-[11px] text-slate-400">
              If the target model assigns equal or higher probability than the draft model (p(x) &ge; q(x)), the draft token is accepted with 100% certainty.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 className="font-bold text-emerald-300 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Target Resampling on Rejection
            </h4>
            <p className="leading-relaxed">
              If candidate token <code className="text-rose-300">x</code> is rejected, the target model draws a replacement token from modified residual distribution:
            </p>
            <div className="p-3 rounded bg-slate-950 border border-slate-850 font-mono text-center text-xs text-blue-400 font-bold">
              p'(x) = max(0, p(x) - q(x)) / &Sigma; max(0, p(y) - q(y))
            </div>
            <p className="text-[11px] text-slate-400">
              This exact resampling satisfies the marginal probability distribution: <strong className="text-slate-200">&Sigma; = p(x)</strong> identically.
            </p>
          </div>

        </div>

        {/* Reference Links & Key Takeaway */}
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-cyan-300">Key Scientific Result:</span>
            <p className="text-slate-300">
              Speculative decoding is strictly <strong>lossless</strong>. The output text is indistinguishable from running pure target-model autoregression.
            </p>
          </div>

          <button
            onClick={() => onTabChange('demo')}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>Test in Playground</span>
          </button>
        </div>

      </div>

    </div>
  );
};
