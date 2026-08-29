import { CentralBenchmarkData, PresetPrompt } from '../types';

/**
 * Placeholder shown only until `npm run benchmarks` has produced real,
 * measured results from the local backend (see scripts/run-benchmarks.ts
 * and server/data/benchmarkResults.json). All zeros/dashes so it can't be
 * mistaken for a real measurement.
 */
export const PLACEHOLDER_BENCHMARK_DATA: CentralBenchmarkData = {
  overviewMetrics: {
    speedImprovement: '—',
    tokensPerSecond: 0,
    standardTokensPerSecond: 0,
    acceptanceRate: 0,
    targetModelCalls: 0,
    standardTargetModelCalls: 0,
    averageLatencyMs: 0,
    memoryEfficiencyPct: 0,
  },
  comparisonSeries: [],
  timeSeriesSpeed: [],
  gammaAblation: [],
  modelPairs: [],
};

/**
 * Convenience prompt buttons for the playground. These are just prompt text
 * sent to the real local models now — no scripted token sequences here
 * anymore (that used to fake the entire generation).
 */
export const PRESET_PROMPTS: PresetPrompt[] = [
  {
    id: 'prompt-nn-learning',
    title: 'Neural Network Learning',
    category: 'Science',
    prompt: 'Explain how neural networks learn from data.',
    estimatedSpeedup: 0,
  },
  {
    id: 'prompt-python-binary-search',
    title: 'Python Binary Search',
    category: 'Coding',
    prompt: 'Write an optimized binary search function in Python.',
    estimatedSpeedup: 0,
  },
  {
    id: 'prompt-quantum-computing',
    title: 'Quantum Superposition',
    category: 'Reasoning',
    prompt: 'Explain the fundamental principle of quantum superposition in computing.',
    estimatedSpeedup: 0,
  },
];
