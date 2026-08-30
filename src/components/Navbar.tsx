import React, { useState } from 'react';
import { PageTab } from '../types';
import { 
  Zap, 
  Activity, 
  BarChart3, 
  BookOpen, 
  Cpu, 
  Play, 
  Info, 
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: PageTab;
  onTabChange: (tab: PageTab) => void;
  onTriggerDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onTriggerDemo
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);

  const navItems: { id: PageTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'demo', label: 'Live Demo', icon: <Activity className="w-4 h-4" /> },
    { id: 'benchmark', label: 'Benchmark', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'how-it-works', label: 'How It Works', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'architecture', label: 'Architecture', icon: <Cpu className="w-4 h-4" /> },
    { id: 'about', label: 'Tech Details', icon: <Info className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Left: Brand / Logo */}
        <div
          onClick={() => onTabChange('overview')}
          className="flex items-center gap-3 cursor-pointer group"
          id="nav-brand-logo"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-blue-700 flex items-center justify-center group-hover:from-red-500 group-hover:to-blue-600 transition-colors">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[15px] tracking-tight text-white">
                SpecDecode
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                v1.2
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Speculative Decoding Engine
            </p>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-950/60 text-red-300 border border-red-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Side: Status Indicator & Demo CTA */}
        <div className="flex items-center gap-2.5">
          {/* Status Indicator */}
          <button
            id="status-indicator-btn"
            onClick={() => setShowStatusModal(!showStatusModal)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors"
            title="Click to view inference backend status"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300">Local Backend</span>
          </button>

          {/* Run Guided Demo CTA */}
          <button
            id="nav-run-demo-btn"
            onClick={onTriggerDemo}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run Demo</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-t border-slate-800 bg-slate-950 px-3 py-2 flex items-center justify-between overflow-x-auto space-x-2 text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === item.id
                ? 'bg-red-950/60 text-red-300 border border-red-800/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Status Modal Info */}
      {showStatusModal && (
        <div className="absolute right-6 top-18 z-50 w-80 p-4 rounded-lg bg-slate-900 comic-panel text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-red-400" />
              Runtime Architecture
            </span>
            <button
              onClick={() => setShowStatusModal(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 text-slate-300">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              This dashboard is powered by a local <strong className="text-slate-200">llama.cpp speculative decoding backend</strong> running on your own GPU.
            </p>
            <div className="p-2 rounded-md bg-slate-950 border border-slate-800 font-mono text-[10px] space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Inference Mode:</span>
                <span className="text-emerald-400">Local (real generation)</span>
              </div>
              <div className="flex justify-between">
                <span>API Gateway:</span>
                <span className="text-blue-300">/api (server/index.ts)</span>
              </div>
              <div className="flex justify-between">
                <span>Target Model:</span>
                <span>Llama-3.2-3B-Instruct</span>
              </div>
              <div className="flex justify-between">
                <span>Draft Model:</span>
                <span>Llama-3.2-1B-Instruct (γ=5)</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Backend engineers can connect real vLLM / HuggingFace speculative decoding endpoints by implementing the exported handlers in <code className="text-blue-300">src/services/api.ts</code>.
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
