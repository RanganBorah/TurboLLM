import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Terminal, 
  Sparkles, 
  Layers, 
  RotateCcw,
  Zap
} from 'lucide-react';

interface LiveOutputProps {
  outputText: string;
  totalTokensGenerated: number;
  maxTokens: number;
  progressPercent: number;
  isRunning: boolean;
  isCompleted: boolean;
  mode: 'speculative' | 'standard' | 'demo';
}

export const LiveOutput: React.FC<LiveOutputProps> = ({
  outputText,
  totalTokensGenerated,
  maxTokens,
  progressPercent,
  isRunning,
  isCompleted,
  mode
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-5 space-y-3.5 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Generated Response (Live Stream)
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
            Local Inference
          </span>
        </div>

        {/* Copy & Status Controls */}
        <div className="flex items-center gap-2">
          {outputText && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
            {isRunning && <span className="animate-spin text-cyan-400">&bull;</span>}
            {isCompleted ? 'Generation Complete' : isRunning ? 'Streaming tokens...' : 'Idle'}
          </span>
          <span className="text-cyan-400 font-bold text-[11px]">
            {totalTokensGenerated} / {maxTokens} tokens ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-300 ${
              mode === 'speculative' 
                ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500' 
                : 'bg-gradient-to-r from-blue-600 to-slate-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      </div>

      {/* Main Text Output Box */}
      <div className="relative rounded-lg border border-slate-900 bg-slate-950 p-4 min-h-[160px] max-h-[280px] overflow-y-auto">
        {outputText ? (
          <div className="font-mono text-xs sm:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
            {outputText}
            {isRunning && (
              <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 space-y-2">
            <Terminal className="w-8 h-8 text-slate-400" />
            <p className="text-xs font-mono">
              Awaiting prompt execution. Click "Run Speculative Decoding" above.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer Note */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Verified by Target Model: <strong className="text-slate-300">100% Quality Equivalence</strong></span>
        <span>Mode: <strong className="text-cyan-400">{mode.toUpperCase()}</strong></span>
      </div>

    </div>
  );
};
