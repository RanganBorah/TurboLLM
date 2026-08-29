import React from 'react';
import { PresetPrompt } from '../types';
import { Sparkles, Terminal, FileCode, Brain, HelpCircle } from 'lucide-react';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  presetPrompts: PresetPrompt[];
  selectedPresetId: string;
  onSelectPreset: (preset: PresetPrompt) => void;
  disabled?: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  onPromptChange,
  presetPrompts,
  selectedPresetId,
  onSelectPreset,
  disabled = false
}) => {
  // Approximate token count (~4 chars per token)
  const charCount = prompt.length;
  const estimatedTokens = Math.max(1, Math.round(charCount / 4));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Coding': return <FileCode className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Reasoning': return <Brain className="w-3.5 h-3.5 text-purple-400" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Preset Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Example Prompts:
        </span>
        {presetPrompts.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              id={`preset-btn-${preset.id}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPreset(preset)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:border-slate-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {getCategoryIcon(preset.category)}
              <span>{preset.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Textarea */}
      <div className="relative rounded-xl border border-slate-800 bg-slate-950/90 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all">
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-900 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px] text-slate-400">Prompt Context</span>
          </div>
          <span className="text-[11px] text-slate-400">
            LLM Input Stream
          </span>
        </div>

        <textarea
          id="prompt-input-textarea"
          rows={3}
          value={prompt}
          disabled={disabled}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Enter your prompt or select a preset above... (e.g. Explain how neural networks learn from data.)"
          className="w-full bg-transparent px-4 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none resize-none font-mono"
        />

        {/* Bottom Status Bar with Char & Token Counts */}
        <div className="flex items-center justify-between px-3.5 py-2 border-t border-slate-900/80 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>Length: <strong className="text-slate-300">{charCount}</strong> chars</span>
            <span>Est. Prompt Tokens: <strong className="text-cyan-400">{estimatedTokens}</strong></span>
          </div>
          <span className="text-[10px] text-slate-400">
            Speculative decoding will predict responses to this prompt
          </span>
        </div>
      </div>
    </div>
  );
};
