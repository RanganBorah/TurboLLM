import React from 'react';
import { PageTab } from '../types';
import { Zap, Github, BookOpen, ExternalLink, Layers, Sparkles, Cpu } from 'lucide-react';

interface FooterProps {
  onTabChange: (tab: PageTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#020617] text-slate-400 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                SpecDecode
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Accelerating Large Language Model inference through Speculative Decoding. Utilizing lightweight draft models for rapid candidate generation and powerful target models for parallel batched verification.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400">
              <Sparkles className="w-3 h-3" />
              <span>Built for Hackathon 2026</span>
            </div>
          </div>

          {/* Nav: Technology */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider font-mono">
              Technology
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onTabChange('demo')} 
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Live Playground
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onTabChange('how-it-works')} 
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Speculative Mechanics
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onTabChange('about')} 
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  KV Cache &amp; Tree Pruning
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onTabChange('benchmark')} 
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Gamma (γ) Ablation
                </button>
              </li>
            </ul>
          </div>

          {/* Nav: Architecture & References */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider font-mono">
              Architecture
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onTabChange('architecture')} 
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  System Flow Diagram
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onTabChange('benchmark')} 
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Empirical Benchmarks
                </button>
              </li>
              <li>
                <span className="text-slate-400 text-[11px] block">
                  Leviathan et al. (Fast Inference)
                </span>
              </li>
              <li>
                <span className="text-slate-400 text-[11px] block">
                  Chen et al. (Speculative Sampling)
                </span>
              </li>
            </ul>
          </div>

          {/* Nav: Project & Demo Details */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider font-mono">
              Demo Mode &amp; API
            </h4>
            <ul className="space-y-2 font-mono text-[11px]">
              <li className="text-emerald-400 flex items-center gap-1">
                ● Local Backend
              </li>
              <li className="text-slate-400">
                Target: Llama-3.2-3B
              </li>
              <li className="text-slate-400">
                Draft: Llama-3.2-1B
              </li>
              <li className="text-cyan-400">
                /api (server/index.ts)
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            &copy; 2026 SpecDecode Research Team &bull; Research frontend demo for speculative inference acceleration.
          </div>
          <div className="font-mono text-slate-400">
            TypeScript &bull; React &bull; Tailwind CSS &bull; Recharts
          </div>
        </div>
      </div>
    </footer>
  );
};
