/**
 * Runs a fixed prompt set through both the speculative and standard local
 * pipelines and writes real, measured results to server/data/benchmarkResults.json,
 * which server/index.ts serves from GET /api/benchmarks.
 *
 * Usage: npm run benchmarks   (requires .env configured, see .env.example)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DecodingConfig, DecodingRequest, GenerationMetrics } from '../src/types';
import { runSpeculative, runStandard } from '../server/specDecode';
import { stopAllServers } from '../server/llamaServerManager';
import { listModels } from '../server/modelRegistry';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROMPTS: { category: string; prompt: string }[] = [
  { category: 'Coding', prompt: 'Write an optimized binary search function in Python.' },
  { category: 'Reasoning', prompt: 'Explain the fundamental principle of quantum superposition in computing.' },
  { category: 'Science', prompt: 'Explain how neural networks learn from data.' },
  { category: 'Summarization', prompt: 'Summarize the key benefits of renewable energy in three sentences.' },
  { category: 'Creative', prompt: 'Write a short poem about the ocean at night.' },
];

// Picks the largest available model as target and smallest as draft —
// works automatically with whatever .gguf files are in models/, including
// a custom model you've added, without hardcoding IDs.
const models = listModels();
if (models.length < 2) {
  console.error(`Need at least 2 .gguf files in models/ to benchmark (found ${models.length}).`);
  process.exit(1);
}
const targetModelId = models[models.length - 1].id;
const draftModelId = models[0].id;
console.log(`Target: ${targetModelId}\nDraft: ${draftModelId}`);

const BASE_CONFIG: DecodingConfig = {
  targetModelId,
  draftModelId,
  gammaDraftTokens: 5,
  temperature: 0,
  maxTokens: 100,
  speedMultiplier: 1,
};

async function runOnce(prompt: string, mode: 'speculative' | 'standard'): Promise<GenerationMetrics> {
  const request: DecodingRequest = { prompt, config: BASE_CONFIG, mode };
  const controller = new AbortController();
  const gen = mode === 'speculative' ? runSpeculative(request, controller.signal) : runStandard(request, controller.signal);
  let last: GenerationMetrics | undefined;
  for await (const step of gen) last = step.metrics;
  if (!last) throw new Error('No metrics produced');
  return last;
}

async function main() {
  const comparisonSeries: any[] = [];
  const modelPairs: any[] = [];

  let totalSpecTps = 0, totalStdTps = 0, totalAcceptance = 0, totalSpecCalls = 0, totalStdCalls = 0, totalLatency = 0;

  for (const { category, prompt } of PROMPTS) {
    console.log(`Benchmarking [${category}]: "${prompt}"`);
    const spec = await runOnce(prompt, 'speculative');
    const std = await runOnce(prompt, 'standard');

    comparisonSeries.push({
      category,
      standardSpeed: std.tokensPerSecond,
      speculativeSpeed: spec.tokensPerSecond,
      acceptanceRate: spec.acceptanceRate,
      speedup: Number((spec.tokensPerSecond / Math.max(0.1, std.tokensPerSecond)).toFixed(2)),
    });

    totalSpecTps += spec.tokensPerSecond;
    totalStdTps += std.tokensPerSecond;
    totalAcceptance += spec.acceptanceRate;
    totalSpecCalls += spec.targetModelCalls;
    totalStdCalls += std.targetModelCalls;
    totalLatency += spec.latencyMs;
  }

  const n = PROMPTS.length;
  const avgSpecTps = Number((totalSpecTps / n).toFixed(1));
  const avgStdTps = Number((totalStdTps / n).toFixed(1));

  const result = {
    overviewMetrics: {
      speedImprovement: `${(avgSpecTps / Math.max(0.1, avgStdTps)).toFixed(2)}×`,
      tokensPerSecond: avgSpecTps,
      standardTokensPerSecond: avgStdTps,
      acceptanceRate: Number((totalAcceptance / n).toFixed(1)),
      targetModelCalls: Math.round(totalSpecCalls / n),
      standardTargetModelCalls: Math.round(totalStdCalls / n),
      averageLatencyMs: Math.round(totalLatency / n),
      memoryEfficiencyPct: 0,
    },
    comparisonSeries,
    timeSeriesSpeed: [],
    gammaAblation: [],
    modelPairs,
  };

  const outDir = path.join(__dirname, '..', 'server', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'benchmarkResults.json'), JSON.stringify(result, null, 2));
  console.log(`Wrote ${path.join(outDir, 'benchmarkResults.json')}`);

  stopAllServers();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  stopAllServers();
  process.exit(1);
});
