import React from 'react';
import { PageTab } from '../types';
import { Zap, Github, BookOpen, ExternalLink, Layers, Sparkles, Cpu } from 'lucide-react';

interface FooterProps {
  onTabChange: (tab: PageTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange }) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-blue-700 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-base text-white tracking-tight">
                SpecDecode
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Accelerating Large Language Model inference through Speculative Decoding. Utilizing lightweight draft models for rapid candidate generation and powerful target models for parallel batched verification.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <Sparkles className="w-3 h-3 text-red-400" />
              <span>Built for Hackathon 2026</span>
            </div>
          </div>

          {/* Nav: Technology */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-200 text-xs">
              Technology
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onTabChange('demo')}
                  className="hover:text-red-400 transition-colors text-left"
                >
                  Live Playground
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('how-it-works')}
                  className="hover:text-red-400 transition-colors text-left"
                >
                  Speculative Mechanics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('about')}
                  className="hover:text-red-400 transition-colors text-left"
                >
                  KV Cache &amp; Tree Pruning
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('benchmark')}
                  className="hover:text-red-400 transition-colors text-left"
                >
                  Gamma (γ) Ablation
                </button>
              </li>
            </ul>
          </div>

          {/* Nav: Architecture & References */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-200 text-xs">
              Architecture
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onTabChange('architecture')}
                  className="hover:text-red-400 transition-colors text-left"
                >
                  System Flow Diagram
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('benchmark')}
                  className="hover:text-red-400 transition-colors text-left"
                >
                  Empirical Benchmarks
                </button>
              </li>
              <li>
                <span className="text-slate-500 text-[11px] block">
                  Leviathan et al. (Fast Inference)
                </span>
              </li>
              <li>
                <span className="text-slate-500 text-[11px] block">
                  Chen et al. (Speculative Sampling)
                </span>
              </li>
            </ul>
          </div>

          {/* Nav: Project & Demo Details */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-200 text-xs">
              Demo Mode &amp; API
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Local Backend
              </li>
              <li className="text-slate-400">
                Target: Llama-3.2-3B
              </li>
              <li className="text-slate-400">
                Draft: Llama-3.2-1B
              </li>
              <li className="text-blue-400">
                /api (server/index.ts)
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            &copy; 2026 SpecDecode Research Team &bull; Research frontend demo for speculative inference acceleration.
          </div>
          <div className="text-slate-500">
            TypeScript &bull; React &bull; Tailwind CSS &bull; Recharts
          </div>
        </div>
      </div>
    </footer>
  );
};
