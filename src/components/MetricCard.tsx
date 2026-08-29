import React from 'react';
import { HelpCircle, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  delta?: string;
  isPositiveDelta?: boolean;
  icon?: React.ReactNode;
  variant?: 'cyan' | 'green' | 'purple' | 'amber' | 'neutral';
  badgeText?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  unit,
  description,
  delta,
  isPositiveDelta = true,
  icon,
  variant = 'cyan',
  badgeText
}) => {
  // Uniform card styling regardless of variant — a consistent grid of
  // stat cards reads as a dashboard, not a per-metric rainbow of glows.
  // `variant` is kept for prop compatibility with existing callers.
  void variant;

  return (
    <div
      id={id}
      className="relative rounded-lg border border-slate-800 bg-slate-900 p-5 hover:border-slate-700 transition-colors"
    >
      {/* Header with Title and Icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-400">
          {title}
        </span>
        {icon && (
          <div className="p-1.5 rounded-md bg-slate-800 text-slate-300">
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl sm:text-4xl font-semibold tracking-tight font-mono text-white">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-slate-400 font-mono">
            {unit}
          </span>
        )}
      </div>

      {/* Delta and Description */}
      <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
        {description && (
          <p className="text-slate-500 text-[11px] leading-snug line-clamp-1">
            {description}
          </p>
        )}

        {delta && (
          <div className={`inline-flex items-center gap-1 text-[11px] font-medium ${
            isPositiveDelta ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {isPositiveDelta ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{delta}</span>
          </div>
        )}
      </div>

      {/* Optional Badge */}
      {badgeText && (
        <div className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
          {badgeText}
        </div>
      )}
    </div>
  );
};
