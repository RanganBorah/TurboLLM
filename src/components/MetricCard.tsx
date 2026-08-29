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
  const variantStyles = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      bg: 'bg-gradient-to-b from-cyan-950/20 to-slate-900/50',
      valueColor: 'text-cyan-300',
      glow: 'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    },
    green: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      bg: 'bg-gradient-to-b from-emerald-950/20 to-slate-900/50',
      valueColor: 'text-emerald-300',
      glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      bg: 'bg-gradient-to-b from-purple-950/20 to-slate-900/50',
      valueColor: 'text-purple-300',
      glow: 'group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      bg: 'bg-gradient-to-b from-amber-950/20 to-slate-900/50',
      valueColor: 'text-amber-300',
      glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    neutral: {
      border: 'border-slate-800 hover:border-slate-700',
      bg: 'bg-slate-900/60',
      valueColor: 'text-slate-100',
      glow: 'group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]',
      iconBg: 'bg-slate-800 text-slate-400 border-slate-700'
    }
  }[variant];

  return (
    <div
      id={id}
      className={`group relative rounded-xl border p-5 transition-all duration-300 ${variantStyles.border} ${variantStyles.bg} ${variantStyles.glow}`}
    >
      {/* Header with Title and Icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {icon && (
          <div className={`p-1.5 rounded-lg border text-xs ${variantStyles.iconBg}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono ${variantStyles.valueColor}`}>
          {value}
        </span>
        {unit && (
          <span className="text-sm font-semibold text-slate-400 font-mono">
            {unit}
          </span>
        )}
      </div>

      {/* Delta and Description */}
      <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
        {description && (
          <p className="text-slate-400 text-[11px] leading-snug line-clamp-1">
            {description}
          </p>
        )}
        
        {delta && (
          <div className={`inline-flex items-center gap-1 font-mono text-[11px] font-medium ${
            isPositiveDelta ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {isPositiveDelta ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{delta}</span>
          </div>
        )}
      </div>

      {/* Optional Badge */}
      {badgeText && (
        <div className="absolute top-2 right-2 text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300">
          {badgeText}
        </div>
      )}
    </div>
  );
};
