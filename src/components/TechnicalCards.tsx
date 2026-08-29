import React from 'react';
import { 
  Zap, 
  Cpu, 
  Percent, 
  TrendingUp, 
  CheckCircle2, 
  Database,
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const TechnicalCards: React.FC = () => {
  const concepts = [
    {
      title: 'Draft Model',
      tag: 'Candidate Proposer',
      icon: <Zap className="w-5 h-5 text-purple-400" />,
      color: 'purple',
      description: 'Small and fast language model (e.g., 1.5B–8B parameters) used to autoregressively propose candidate token sequences with minimal memory bandwidth consumption.'
    },
    {
      title: 'Target Model',
      tag: 'Parallel Verifier',
      icon: <Cpu className="w-5 h-5 text-blue-400" />,
      color: 'blue',
      description: 'Larger and more capable model (e.g., 70B parameters) responsible for verifying predictions in a single batch forward pass on GPU tensor cores.'
    },
    {
      title: 'Acceptance Rate (α)',
      tag: 'Draft Quality Metric',
      icon: <Percent className="w-5 h-5 text-emerald-400" />,
      color: 'green',
      description: 'The percentage of draft tokens accepted by the target model. Higher draft alignment yields higher acceptance rates, directly driving overall throughput gains.'
    },
    {
      title: 'Speedup Multiplier',
      tag: 'Throughput Gain',
      icon: <TrendingUp className="w-5 h-5 text-cyan-400" />,
      color: 'cyan',
      description: 'Improvement in generation throughput (tokens/second) compared with standard sequential autoregressive decoding, typically reaching 1.8× to 2.2× on modern GPUs.'
    },
    {
      title: 'Verification Step',
      tag: 'Mathematical Equivalence',
      icon: <CheckCircle2 className="w-5 h-5 text-amber-400" />,
      color: 'amber',
      description: 'The process through which the target model evaluates draft-model predictions against its exact probability distribution, guaranteeing zero degradation in output quality.'
    },
    {
      title: 'KV Cache Tree Pruning',
      tag: 'Memory Management',
      icon: <Database className="w-5 h-5 text-slate-300" />,
      color: 'slate',
      description: 'Efficient key-value cache handling is vital for speculative decoding. Speculative candidate branches are cached temporarily and pruned upon token rejection.'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Core Technical Concepts &amp; Terminology
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fundamental building blocks of speculative inference acceleration.
          </p>
        </div>
      </div>

      {/* 6 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {concepts.map((c, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                {c.icon}
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-850">
                {c.tag}
              </span>
            </div>

            <h4 className="text-sm font-bold text-white">
              {c.title}
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              {c.description}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};
