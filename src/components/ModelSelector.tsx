import React from 'react';
import { DecodingConfig, ModelOption } from '../types';
import { Cpu, Zap, Sliders, Play, RotateCcw, Pause, Sparkles, Gauge } from 'lucide-react';

interface ModelSelectorProps {
  config: DecodingConfig;
  targetModels: ModelOption[];
  draftModels: ModelOption[];
  onConfigChange: (newConfig: Partial<DecodingConfig>) => void;
  onRunSpeculative: () => void;
  onRunStandard: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  phase: string;
  isPaused: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  config,
  targetModels,
  draftModels,
  onConfigChange,
  onRunSpeculative,
  onRunStandard,
  onPause,
  onResume,
  onReset,
  phase,
  isPaused
}) => {
  const isRunning = phase !== 'idle' && phase !== 'completed' && phase !== 'paused';
  const isCompleted = phase === 'completed';

  const selectedTarget = targetModels.find(m => m.id === config.targetModelId) || targetModels[0];
  const selectedDraft = draftModels.find(m => m.id === config.draftModelId) || draftModels[0];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Decoding Configuration
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
          Target + Draft System
        </span>
      </div>

      {/* Grid for Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Target Model Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Target Verifier Model (Large)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {selectedTarget.paramSize}
            </span>
          </label>
          <select
            id="target-model-select"
            value={config.targetModelId}
            disabled={isRunning}
            onChange={(e) => onConfigChange({ targetModelId: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-60 cursor-pointer"
          >
            {targetModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.paramSize})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 leading-snug">
            {selectedTarget.description}
          </p>
        </div>

        {/* Draft Model Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              Draft Speculative Model (Small)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {selectedDraft.paramSize}
            </span>
          </label>
          <select
            id="draft-model-select"
            value={config.draftModelId}
            disabled={isRunning}
            onChange={(e) => onConfigChange({ draftModelId: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-60 cursor-pointer"
          >
            {draftModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.paramSize})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 leading-snug">
            {selectedDraft.description}
          </p>
        </div>

      </div>

      {/* Hyperparameter Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">

        {/* Draft Tokens (Gamma) */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Draft Tokens (γ):</span>
            <span className="text-slate-200 font-semibold font-mono">{config.gammaDraftTokens}</span>
          </div>
          <input
            id="gamma-slider"
            type="range"
            min={3}
            max={8}
            step={1}
            disabled={isRunning}
            value={config.gammaDraftTokens}
            onChange={(e) => onConfigChange({ gammaDraftTokens: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-60"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>3 tokens</span>
            <span>Default: 5</span>
            <span>8 tokens</span>
          </div>
        </div>

        {/* Temperature */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Temperature (T):</span>
            <span className="text-slate-200 font-semibold font-mono">{config.temperature.toFixed(2)}</span>
          </div>
          <input
            id="temperature-slider"
            type="range"
            min={0.0}
            max={1.0}
            step={0.05}
            disabled={isRunning}
            value={config.temperature}
            onChange={(e) => onConfigChange({ temperature: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-60"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>0.0 (Greedy)</span>
            <span>0.7</span>
            <span>1.0 (Creative)</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Max Tokens:</span>
            <span className="text-slate-200 font-semibold font-mono">{config.maxTokens}</span>
          </div>
          <input
            id="max-tokens-slider"
            type="range"
            min={50}
            max={300}
            step={10}
            disabled={isRunning}
            value={config.maxTokens}
            onChange={(e) => onConfigChange({ maxTokens: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-60"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>50</span>
            <span>100</span>
            <span>300</span>
          </div>
        </div>

      </div>

      {/* Speed Multiplier & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">

        {/* Speed Multiplier */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Gauge className="w-3.5 h-3.5 text-slate-500" />
          <span>Animation Speed:</span>
          {[1, 2, 4].map((mult) => (
            <button
              key={mult}
              type="button"
              onClick={() => onConfigChange({ speedMultiplier: mult })}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                config.speedMultiplier === mult
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {mult}×
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Pause / Resume Controls during active run */}
          {isRunning && (
            <button
              type="button"
              onClick={onPause}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800 text-amber-300 text-xs font-medium"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          )}

          {isPaused && (
            <button
              type="button"
              onClick={onResume}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800 text-emerald-300 text-xs font-medium"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
          )}

          {/* Reset button */}
          {(isRunning || isPaused || isCompleted) && (
            <button
              type="button"
              id="reset-simulation-btn"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Run Standard Decoding */}
          <button
            type="button"
            id="run-standard-btn"
            disabled={isRunning}
            onClick={onRunStandard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-slate-400" />
            <span>Run Standard Decoding</span>
          </button>

          {/* Run Speculative Decoding Primary CTA */}
          <button
            type="button"
            id="run-speculative-btn"
            disabled={isRunning}
            onClick={onRunSpeculative}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Run Speculative Decoding</span>
          </button>

        </div>

      </div>

    </div>
  );
};
