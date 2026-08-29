import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Play, 
  RotateCcw,
  Cpu,
  Layers,
  FastForward
} from 'lucide-react';

interface HeroProps {
  onGoToDemo: () => void;
  onGoToHowItWorks: () => void;
  onTriggerGuidedDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onGoToDemo,
  onGoToHowItWorks,
  onTriggerGuidedDemo
}) => {
  const [animStep, setAnimStep] = useState<number>(0);

  // Cycle the interactive hero token flow animation
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimStep((prev) => (prev + 1) % 5);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const sampleDraftTokens = [
    { token: 'Quantum', status: 'accepted', confidence: '94%' },
    { token: ' computing', status: 'accepted', confidence: '91%' },
    { token: ' enables', status: 'accepted', confidence: '88%' },
    { token: ' ultra', status: 'rejected', confidence: '62%' },
    { token: ' fast', status: 'pending', confidence: '-' }
  ];

  return (
    <section className="relative overflow-hidden pt-8 pb-14 border-b border-slate-800/60 bg-radial-glow">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Gen LLM Inference Acceleration</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-500/20 text-purple-300 text-xs font-mono">
            <Cpu className="w-3 h-3 text-purple-400" />
            <span>Target: 70B &bull; Draft: 8B (γ=5)</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Supercharge <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">LLM Inference</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Speculative Decoding uses a fast draft model to predict multiple tokens while a powerful target model verifies them in parallel — reducing expensive inference steps and delivering up to <strong>2× faster generation</strong> with mathematical equivalence.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              id="hero-try-demo-btn"
              onClick={onGoToDemo}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
            >
              <span>Try Live Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-see-how-btn"
              onClick={onGoToHowItWorks}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-all"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>See How It Works</span>
            </button>

            <button
              id="hero-guided-tour-btn"
              onClick={onTriggerGuidedDemo}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 font-medium text-xs sm:text-sm transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-purple-300" />
              <span>Watch 20s Hackathon Demo</span>
            </button>
          </div>
        </div>

        {/* Interactive Speculative Decoding Animation Flow Banner */}
        <div className="mt-12 max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-slate-950/80 p-5 sm:p-7 shadow-2xl backdrop-blur-sm">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Speculative Inference Pipeline (Step-by-Step Flow)
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">
                Phase {animStep + 1}/5: {
                  animStep === 0 ? 'User Prompt Input' :
                  animStep === 1 ? 'Fast Draft Model Proposing Tokens' :
                  animStep === 2 ? 'Target Model Parallel Verification' :
                  animStep === 3 ? 'Acceptance / Rejection Resolution' : 'Accelerated Output Emitted'
                }
              </span>
              <button
                onClick={() => setAnimStep((s) => (s + 1) % 5)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs"
                title="Next step"
              >
                <FastForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Visual Step Container */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center">
            
            {/* Step 1: User Prompt */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              animStep >= 0 ? 'bg-slate-900 border-cyan-500/40 text-slate-200' : 'bg-slate-900/30 border-slate-800 text-slate-500'
            }`}>
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-1">
                1. Input Prompt
              </div>
              <div className="text-xs font-mono bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-slate-300">
                "Explain..."
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5">Context Token</div>
            </div>

            {/* Step 2: Draft Model */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              animStep >= 1 ? 'bg-purple-950/30 border-purple-500/50 shadow-sm shadow-purple-500/10' : 'bg-slate-900/30 border-slate-800 opacity-60'
            }`}>
              <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-semibold mb-1">
                2. Draft (8B)
              </div>
              <div className="text-[11px] font-medium text-slate-200">
                Proposes γ=5 tokens
              </div>
              <div className="text-[10px] text-purple-300 font-mono mt-1">~3ms / token</div>
            </div>

            {/* Step 3: Candidate Tokens */}
            <div className={`p-3 rounded-xl border transition-all md:col-span-1 ${
              animStep >= 1 ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/30 border-slate-800 opacity-60'
            }`}>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
                3. Proposed Batch
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {sampleDraftTokens.map((t, idx) => (
                  <span
                    key={idx}
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      animStep >= 3 
                        ? (t.status === 'accepted' ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/80 border-rose-500/40 text-rose-300')
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {t.token}
                  </span>
                ))}
              </div>
            </div>

            {/* Step 4: Target Model Verification */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              animStep >= 2 ? 'bg-blue-950/30 border-blue-500/50 shadow-sm shadow-blue-500/10' : 'bg-slate-900/30 border-slate-800 opacity-60'
            }`}>
              <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold mb-1">
                4. Target (70B)
              </div>
              <div className="text-[11px] font-medium text-slate-200">
                1 Single Forward Pass
              </div>
              <div className="text-[10px] text-blue-300 font-mono mt-1">Parallel Verification</div>
            </div>

            {/* Step 5: Speedup Outcome */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              animStep >= 4 ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-slate-900/30 border-slate-800 opacity-60'
            }`}>
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1">
                5. Outcome
              </div>
              <div className="text-sm font-extrabold text-emerald-300 font-mono">
                1.8× Faster
              </div>
              <div className="text-[10px] text-slate-300 mt-1">4 accepted + 1 corrected</div>
            </div>

          </div>

          {/* Bottom Visual Acceptance Legend */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> 3 Accepted Tokens
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-mono">
                <XCircle className="w-3.5 h-3.5" /> 1 Rejected & Replaced
              </span>
            </div>
            <div className="font-mono text-cyan-400 text-[11px]">
              &bull; 1 Target Call instead of 5 Sequential Calls
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
