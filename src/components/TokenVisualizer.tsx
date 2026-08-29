import React, { useState } from 'react';
import { TokenItem, TokenStatus } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  CircleDot, 
  Sparkles, 
  Info,
  Layers,
  ArrowRight,
  Zap,
  Cpu
} from 'lucide-react';

interface TokenVisualizerProps {
  currentBatch: TokenItem[];
  allTokens: TokenItem[];
  phase: string;
  logMessage: string;
  activeBatchIndex: number;
  gamma: number;
}

export const TokenVisualizer: React.FC<TokenVisualizerProps> = ({
  currentBatch,
  allTokens,
  phase,
  logMessage,
  activeBatchIndex,
  gamma
}) => {
  const [selectedToken, setSelectedToken] = useState<TokenItem | null>(null);

  const getStatusBadge = (status: TokenStatus) => {
    switch (status) {
      case 'accepted':
        return {
          bg: 'bg-emerald-950/60 border-emerald-700 text-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Accepted'
        };
      case 'rejected':
        return {
          bg: 'bg-rose-950/60 border-rose-700 text-rose-200 line-through opacity-80',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
          label: 'Rejected'
        };
      case 'corrected':
        return {
          bg: 'bg-indigo-950/60 border-indigo-600 text-indigo-200 font-semibold',
          icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />,
          label: 'Target Corrected'
        };
      case 'verifying':
        return {
          bg: 'bg-slate-800 border-slate-600 text-slate-200 animate-pulse',
          icon: <Loader2 className="w-3.5 h-3.5 text-slate-300 animate-spin" />,
          label: 'Verifying'
        };
      case 'drafted':
      case 'pending':
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          icon: <CircleDot className="w-3.5 h-3.5 text-slate-400" />,
          label: 'Draft Candidate'
        };
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">

      {/* Header with Title and Phase status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Live Token Pipeline: Draft &rarr; Verify &rarr; Accept / Reject
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Watch candidate tokens proposed by the draft model verified in parallel by the target model.
          </p>
        </div>

        {/* Phase Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
            {phase === 'drafting' && <Zap className="w-3 h-3 text-indigo-400 animate-bounce" />}
            {phase === 'verifying' && <Cpu className="w-3 h-3 text-indigo-400 animate-spin" />}
            {phase === 'accepting' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            {phase === 'idle' && <CircleDot className="w-3 h-3 text-slate-400" />}
            <span>Phase: <strong className="text-slate-100">{phase.toUpperCase()}</strong></span>
          </span>
        </div>
      </div>

      {/* Real-time Step Log Message */}
      <div className="rounded-md bg-slate-950 border border-slate-800 px-3.5 py-2 font-mono text-xs text-slate-300 flex items-start gap-2">
        <span className="text-indigo-400 shrink-0 font-bold">&gt;</span>
        <span className="leading-relaxed">{logMessage || 'Ready to begin speculative decoding sequence.'}</span>
      </div>

      {/* Active Speculative Batch Window (Current Step) */}
      <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            Active Batch #{activeBatchIndex > 0 ? activeBatchIndex : 1} (Speculative Window γ={gamma})
          </span>
          <span className="text-[10px] text-slate-500">
            {currentBatch.length} tokens in current evaluation
          </span>
        </div>

        {/* Tokens in Active Batch */}
        <div className="flex flex-wrap gap-2 pt-2 min-h-[52px] items-center">
          {currentBatch.length === 0 ? (
            <div className="text-xs text-slate-400 font-mono italic">
              Awaiting next speculative proposal batch...
            </div>
          ) : (
            currentBatch.map((tok) => {
              const badge = getStatusBadge(tok.status);
              return (
                <button
                  key={tok.id}
                  onClick={() => setSelectedToken(tok)}
                  className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all transform hover:scale-105 cursor-pointer ${badge.bg}`}
                >
                  {badge.icon}
                  <span className="font-semibold">{tok.token}</span>
                  {tok.correctedFrom && (
                    <span className="text-[10px] text-slate-400 ml-1">
                      (replacing {tok.correctedFrom})
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Historical Generated Tokens Stream */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">
            Generated Token Stream ({allTokens.length} total tokens processed):
          </span>
          <span className="text-[10px] text-slate-500">
            Click any token to inspect verification telemetry
          </span>
        </div>

        <div className="max-h-48 overflow-y-auto rounded-md border border-slate-800 bg-slate-950 p-3 flex flex-wrap gap-1.5 content-start">
          {allTokens.length === 0 ? (
            <span className="text-xs text-slate-500 italic">
              No tokens emitted yet. Click "Run Speculative Decoding" to observe token-by-token verification.
            </span>
          ) : (
            allTokens.map((tok) => {
              const badge = getStatusBadge(tok.status);
              return (
                <button
                  key={tok.id}
                  onClick={() => setSelectedToken(tok)}
                  title={`${badge.label}: ${tok.token}`}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono border transition-colors cursor-pointer ${badge.bg}`}
                >
                  <span className="text-[10px] opacity-75">{badge.icon}</span>
                  <span>{tok.token}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Interactive Token Inspection Modal / Drawer */}
      {selectedToken && (
        <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400" /> Token Telemetry: '{selectedToken.token}'
            </span>
            <button
              onClick={() => setSelectedToken(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <div className="text-slate-500 text-[10px]">Status</div>
              <div className="font-semibold text-slate-200 capitalize">{selectedToken.status}</div>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <div className="text-slate-500 text-[10px]">Proposed By</div>
              <div className="font-semibold text-slate-200">{selectedToken.model === 'corrected' ? 'Target (Correction)' : 'Draft Model'}</div>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <div className="text-slate-500 text-[10px]">Confidence</div>
              <div className="font-semibold text-emerald-400">{selectedToken.confidence ? `${Math.round(selectedToken.confidence * 100)}%` : '92%'}</div>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <div className="text-slate-500 text-[10px]">Batch ID</div>
              <div className="font-semibold text-slate-200">#{selectedToken.batchId || 1}</div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted Token
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <XCircle className="w-3.5 h-3.5" /> Rejected Token
          </span>
          <span className="flex items-center gap-1 text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" /> Target Corrected
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <Loader2 className="w-3.5 h-3.5" /> Verifying
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <CircleDot className="w-3.5 h-3.5" /> Draft Proposed
          </span>
        </div>
      </div>

    </div>
  );
};
