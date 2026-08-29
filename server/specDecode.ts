import { DecodingRequest, GenerationMetrics, SimulationStep, TokenItem } from '../src/types';
import { ensureServer, portFor } from './llamaServerManager';
import { completeOnce, formatLlama3Prompt, streamCompletion } from './llamaClient';
import { resolveModelPath } from './modelRegistry';
import { config } from './config';

/**
 * Real speculative decoding generator.
 *
 * Generation itself is 100% real: the prompt is sent to a llama-server
 * instance running with --model-draft, which performs genuine speculative
 * decoding on the GPU and streams back the final accepted text.
 *
 * The per-token "accepted / rejected / corrected" visualization is
 * RECONSTRUCTED after the fact per gamma-sized window: we ask a second,
 * draft-only llama-server instance what it would have greedily proposed
 * from the same prefix, and diff that against what the real pipeline
 * actually emitted. For greedy/temperature=0 decoding this reconstruction
 * is exact (draft's greedy guess matches iff the real speculative sampler
 * would have accepted it); at higher temperatures it's a close
 * approximation, since acceptance also involves probabilistic resampling
 * we don't have visibility into via the HTTP API.
 */
export async function* runSpeculative(
  request: DecodingRequest,
  signal: AbortSignal
): AsyncGenerator<SimulationStep> {
  const targetPath = resolveModelPath(request.config.targetModelId);
  const draftPath = resolveModelPath(request.config.draftModelId);
  await Promise.all([
    ensureServer('spec', targetPath, draftPath),
    ensureServer('draftOnly', draftPath),
  ]);
  const specPort = portFor('spec');
  const draftPort = portFor('draftOnly');

  const formattedPrompt = formatLlama3Prompt(request.prompt);
  const gamma = Math.max(1, request.config.gammaDraftTokens || 5);
  const maxTokens = request.config.maxTokens;
  const temperature = request.config.temperature;

  const tokens: string[] = [];
  let outputText = '';
  let pos = 0;
  let batchIndex = 0;
  let allTokens: TokenItem[] = [];
  let currentBatch: TokenItem[] = [];
  let acceptedTotal = 0;
  let rejectedTotal = 0;
  let draftProposed = 0;
  let targetCalls = 0;
  const startTime = Date.now();
  let finalPredictedMs: number | undefined;

  const emit = (phase: SimulationStep['phase'], logMessage: string): SimulationStep => ({
    stepIndex: batchIndex,
    phase,
    currentBatch: [...currentBatch],
    allTokens: [...allTokens],
    outputText,
    metrics: computeMetrics(),
    logMessage,
    activeBatchIndex: batchIndex,
    progressPercent: Math.min(100, Math.round((pos / Math.max(1, maxTokens)) * 100)),
  });

  function computeMetrics(): GenerationMetrics {
    const elapsedMs = finalPredictedMs ?? (Date.now() - startTime);
    const elapsedSeconds = Math.max(0.05, elapsedMs / 1000);
    const totalTokensGenerated = pos;
    const acceptanceRate = draftProposed > 0
      ? Math.round((acceptedTotal / draftProposed) * 100)
      : 0;
    const tokensPerSecond = Number((totalTokensGenerated / elapsedSeconds).toFixed(1));
    const avgTokensPerTargetCall = targetCalls > 0 ? totalTokensGenerated / targetCalls : 1;

    return {
      latencyMs: Math.round(elapsedMs),
      tokensPerSecond,
      acceptanceRate,
      draftTokens: draftProposed,
      acceptedTokens: acceptedTotal,
      rejectedTokens: rejectedTotal,
      targetModelCalls: targetCalls,
      speedup: Number(Math.max(1, avgTokensPerTargetCall).toFixed(2)),
      totalTokensGenerated,
      estimatedStandardCalls: totalTokensGenerated,
      timeElapsedMs: Date.now() - startTime,
      kvCacheHitRate: 0,
      speculativeBatchCount: batchIndex,
    };
  }

  async function proposeDraftWindow(prefix: string, windowSize: number): Promise<string[]> {
    const pieces: string[] = [];
    for await (const p of streamCompletion(draftPort, prefix, { nPredict: windowSize, temperature: 0, signal })) {
      if (p.content) pieces.push(p.content);
      if (p.stop) break;
    }
    return pieces;
  }

  yield emit('initializing', 'Connecting to local llama-server (target+draft, speculative decoding)...');

  let stopped = false;
  for await (const piece of streamCompletion(specPort, formattedPrompt, { nPredict: maxTokens, temperature, signal })) {
    if (piece.content) tokens.push(piece.content);
    if (piece.stop) finalPredictedMs = piece.timings?.predicted_ms;

    while ((tokens.length - pos >= gamma) || (piece.stop && tokens.length > pos)) {
      const windowSize = Math.min(gamma, tokens.length - pos);
      if (windowSize <= 0) break;

      currentBatch = [];
      yield emit('drafting', `Draft model: proposing up to ${windowSize} candidate tokens from position ${pos}...`);

      const prefix = formattedPrompt + tokens.slice(0, pos).join('');
      const draftPieces = await proposeDraftWindow(prefix, windowSize);
      const realWindow = tokens.slice(pos, pos + windowSize);

      yield emit('verifying', `Target model: verifying batch against real generation output...`);

      let acceptedCount = 0;
      while (acceptedCount < windowSize && draftPieces[acceptedCount] === realWindow[acceptedCount]) {
        acceptedCount++;
      }
      const hasRejection = acceptedCount < windowSize;
      draftProposed += windowSize;
      targetCalls += 1;

      const batchTokens: TokenItem[] = [];
      for (let i = 0; i < acceptedCount; i++) {
        batchTokens.push({
          id: `tok-${batchIndex}-${i}-${Date.now()}`,
          token: realWindow[i],
          status: 'accepted',
          model: 'draft',
          draftIndex: i + 1,
          batchId: batchIndex + 1,
        });
        acceptedTotal++;
      }
      if (hasRejection) {
        batchTokens.push({
          id: `tok-rej-${batchIndex}-${Date.now()}`,
          token: draftPieces[acceptedCount] ?? '',
          status: 'rejected',
          model: 'draft',
          draftIndex: acceptedCount + 1,
          batchId: batchIndex + 1,
        });
        rejectedTotal++;
        batchTokens.push({
          id: `tok-corr-${batchIndex}-${Date.now()}`,
          token: realWindow[acceptedCount],
          status: 'corrected',
          model: 'corrected',
          correctedFrom: draftPieces[acceptedCount],
          batchId: batchIndex + 1,
        });
        acceptedTotal++;
      }

      const consumed = acceptedCount + (hasRejection ? 1 : 0);
      outputText += realWindow.slice(0, consumed).join('');
      allTokens = [...allTokens, ...batchTokens];
      currentBatch = batchTokens;
      pos += consumed;
      batchIndex++;

      const logMsg = hasRejection
        ? `Batch ${batchIndex}: accepted ${acceptedCount}/${windowSize} draft tokens, target corrected 1.`
        : `Batch ${batchIndex}: 100% accepted (${acceptedCount}/${windowSize}). High draft alignment.`;
      yield emit('accepting', logMsg);

      if (signal.aborted) { stopped = true; break; }
    }
    if (stopped) break;
  }

  yield emit('completed', 'Generation completed on local hardware.');
}

/** Real non-speculative baseline: one target-model forward pass per token. */
export async function* runStandard(
  request: DecodingRequest,
  signal: AbortSignal
): AsyncGenerator<SimulationStep> {
  const targetPath = resolveModelPath(request.config.targetModelId);
  await ensureServer('standard', targetPath);
  const port = portFor('standard');
  const formattedPrompt = formatLlama3Prompt(request.prompt);
  const maxTokens = request.config.maxTokens;
  const temperature = request.config.temperature;

  let outputText = '';
  let allTokens: TokenItem[] = [];
  let targetCalls = 0;
  const startTime = Date.now();
  let finalPredictedMs: number | undefined;

  const emit = (phase: SimulationStep['phase'], logMessage: string): SimulationStep => ({
    stepIndex: targetCalls,
    phase,
    currentBatch: allTokens.slice(-1),
    allTokens: [...allTokens],
    outputText,
    metrics: computeMetrics(),
    logMessage,
    activeBatchIndex: targetCalls,
    progressPercent: Math.min(100, Math.round((targetCalls / Math.max(1, maxTokens)) * 100)),
  });

  function computeMetrics(): GenerationMetrics {
    const elapsedMs = finalPredictedMs ?? (Date.now() - startTime);
    const elapsedSeconds = Math.max(0.05, elapsedMs / 1000);
    const tokensPerSecond = Number((targetCalls / elapsedSeconds).toFixed(1));
    return {
      latencyMs: Math.round(elapsedMs),
      tokensPerSecond,
      acceptanceRate: 100,
      draftTokens: 0,
      acceptedTokens: targetCalls,
      rejectedTokens: 0,
      targetModelCalls: targetCalls,
      speedup: 1.0,
      totalTokensGenerated: targetCalls,
      estimatedStandardCalls: targetCalls,
      timeElapsedMs: Date.now() - startTime,
      kvCacheHitRate: 0,
      speculativeBatchCount: 0,
    };
  }

  yield emit('initializing', 'Connecting to local llama-server (target model only, standard decoding)...');

  for await (const piece of streamCompletion(port, formattedPrompt, { nPredict: maxTokens, temperature, signal })) {
    if (piece.stop) finalPredictedMs = piece.timings?.predicted_ms;
    if (!piece.content) continue;

    targetCalls += 1;
    outputText += piece.content;
    allTokens = [...allTokens, {
      id: `tok-std-${targetCalls}-${Date.now()}`,
      token: piece.content,
      status: 'accepted',
      model: 'target',
    }];

    yield emit('drafting', `Target model call #${targetCalls}: generated token '${piece.content.trim()}'.`);
    if (signal.aborted) break;
  }

  yield emit('completed', 'Generation completed on local hardware.');
}

/**
 * Optionally pre-loads the default target/draft pair (from .env) at
 * startup so the first request isn't slowed down by cold model loading.
 * Purely an optimization — skipped if no defaults are configured, and any
 * request can still load a completely different model pair on demand.
 */
export async function warmupModels() {
  if (!config.targetModelPath || !config.draftModelPath) return;
  await Promise.all([
    ensureServer('spec', config.targetModelPath, config.draftModelPath),
    ensureServer('draftOnly', config.draftModelPath),
  ]);
}

export { completeOnce };
