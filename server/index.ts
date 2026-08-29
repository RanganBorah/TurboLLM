import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DecodingRequest } from '../src/types';
import { assertConfigured, config } from './config';
import { statusSnapshot } from './llamaServerManager';
import { listModels } from './modelRegistry';
import { runSpeculative, runStandard, warmupModels } from './specDecode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/system-status', (_req, res) => {
  let binConfigured = true;
  try {
    assertConfigured();
  } catch {
    binConfigured = false;
  }
  const modelCount = listModels().length;
  const configured = binConfigured && modelCount > 0;
  res.json({
    mode: 'backend',
    status: configured ? 'ready' : 'error',
    backendUrl: `http://127.0.0.1:${config.backendPort}`,
    hardware: {
      gpu: 'Local GPU (see nvidia-smi on the host)',
      vramAvailableGb: 0,
      kvCacheStatus: !binConfigured
        ? 'Not configured — copy .env.example to .env and set LLAMA_SERVER_BIN'
        : modelCount === 0
          ? 'No .gguf models found in models/ — add one to get started'
          : `llama.cpp local speculative decoding (${modelCount} model${modelCount === 1 ? '' : 's'} available)`,
    },
    supportedFeatures: ['speculative_decoding', 'local_inference', 'reconstructed_batch_visualization', 'custom_models'],
    servers: statusSnapshot(),
    configured,
  });
});

app.get('/api/models', (_req, res) => {
  // Any .gguf dropped into models/ shows up here automatically — including
  // your own fine-tuned/trained model — as an option for BOTH dropdowns.
  // Which one acts as "target" vs "draft" is just which slot you pick it
  // for; real speculative decoding still requires the pair to share a
  // tokenizer (e.g. both Llama-3-family, or both Qwen-family).
  const models = listModels().map(({ path: _path, ...rest }) => rest);
  res.json({
    targetModels: models.map((m) => ({ ...m, type: 'target' as const })),
    draftModels: models.map((m) => ({ ...m, type: 'draft' as const })),
  });
});

app.get('/api/benchmarks', (_req, res) => {
  const file = path.join(__dirname, 'data', 'benchmarkResults.json');
  if (fs.existsSync(file)) {
    res.json(JSON.parse(fs.readFileSync(file, 'utf-8')));
    return;
  }
  res.status(404).json({ error: 'No benchmark results yet. Run: npx tsx scripts/run-benchmarks.ts' });
});

app.post('/api/decode/stream', async (req, res) => {
  const request = req.body as DecodingRequest;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const controller = new AbortController();
  // res.on('close') fires when the underlying connection actually terminates
  // (client navigated away / dropped). req.on('close') is NOT equivalent —
  // it fires once the request body has been fully read, which happens
  // almost immediately for a small POST body, long before the response
  // (and the client's interest in it) is done.
  res.on('close', () => controller.abort());

  try {
    assertConfigured();
    const generator = request.mode === 'standard'
      ? runStandard(request, controller.signal)
      : runSpeculative(request, controller.signal);

    let finalMetrics: unknown = {};
    for await (const step of generator) {
      finalMetrics = step.metrics;
      res.write(`data: ${JSON.stringify(step)}\n\n`);
    }
    res.write(`event: complete\ndata: ${JSON.stringify(finalMetrics)}\n\n`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
  } finally {
    res.end();
  }
});

app.listen(config.backendPort, () => {
  console.log(`SpecDecode backend listening on http://127.0.0.1:${config.backendPort}`);
  try {
    assertConfigured();
    warmupModels().catch((err) => {
      console.warn('Model warmup failed (will retry lazily on first request):', (err as Error).message);
    });
  } catch (err) {
    console.warn((err as Error).message);
  }
});
