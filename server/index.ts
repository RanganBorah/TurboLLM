import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DecodingRequest } from '../src/types';
import { assertConfigured, config } from './config';
import { statusSnapshot } from './llamaServerManager';
import { runSpeculative, runStandard, warmupModels } from './specDecode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/system-status', (_req, res) => {
  let configured = true;
  try {
    assertConfigured();
  } catch {
    configured = false;
  }
  res.json({
    mode: 'backend',
    status: configured ? 'ready' : 'error',
    backendUrl: `http://127.0.0.1:${config.backendPort}`,
    hardware: {
      gpu: 'Local GPU (see nvidia-smi on the host)',
      vramAvailableGb: 0,
      kvCacheStatus: configured
        ? 'llama.cpp local speculative decoding'
        : 'Not configured — copy .env.example to .env and set model paths',
    },
    supportedFeatures: ['speculative_decoding', 'local_inference', 'reconstructed_batch_visualization'],
    servers: statusSnapshot(),
    configured,
  });
});

app.get('/api/models', (_req, res) => {
  res.json({
    targetModels: [
      {
        id: 'local-target',
        name: 'Llama 3.2 3B Instruct (local)',
        type: 'target',
        paramSize: '3B',
        latencyPerStepMs: 0,
        memoryFootprintGb: 2.0,
        description: 'Local target model served via llama.cpp on your GPU.',
      },
    ],
    draftModels: [
      {
        id: 'local-draft',
        name: 'Llama 3.2 1B Instruct (local)',
        type: 'draft',
        paramSize: '1B',
        latencyPerStepMs: 0,
        memoryFootprintGb: 0.8,
        description: 'Local draft model served via llama.cpp on your GPU.',
      },
    ],
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
  req.on('close', () => controller.abort());

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
