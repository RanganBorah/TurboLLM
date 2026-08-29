import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { config } from './config';

export type ServerName = 'spec' | 'draftOnly' | 'standard';

interface ServerHandle {
  name: ServerName;
  port: number;
  proc: ChildProcessWithoutNullStreams;
  ready: boolean;
  signature: string;
}

const servers = new Map<ServerName, ServerHandle>();

function baseArgs(port: number, modelPath: string): string[] {
  return [
    '--model', modelPath,
    '--port', String(port),
    '--host', '127.0.0.1',
    '--ctx-size', String(config.ctxSize),
    '--n-gpu-layers', String(config.gpuLayers),
    '--flash-attn', 'auto',
  ];
}

async function waitForHealth(port: number, timeoutMs = 60_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/health`);
      if (res.ok) return;
    } catch {
      // server not up yet
    }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`llama-server on port ${port} did not become healthy within ${timeoutMs}ms`);
}

export function isRunning(name: ServerName): boolean {
  return servers.get(name)?.ready === true;
}

export function portFor(name: ServerName): number {
  switch (name) {
    case 'spec': return config.specServerPort;
    case 'draftOnly': return config.draftOnlyServerPort;
    case 'standard': return config.standardServerPort;
  }
}

/** Stops a role's server and waits for the process to actually exit, so its
 * VRAM is freed before a replacement model gets loaded into the same slot
 * (important on small GPUs where two models briefly overlapping can OOM). */
export function stopServer(name: ServerName): Promise<void> {
  const handle = servers.get(name);
  if (!handle) return Promise.resolve();
  servers.delete(name);
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, 5000);
    handle.proc.once('exit', () => { clearTimeout(timer); resolve(); });
    handle.proc.kill();
  });
}

export function stopAllServers() {
  for (const name of [...servers.keys()]) stopServer(name);
}

/**
 * Ensures a named llama-server role is running the requested model(s), and
 * waits until healthy. If that role is already running a *different* model
 * than requested, the old process is stopped first and a new one spawned —
 * this is what makes picking a different model in the UI dropdown actually
 * take effect instead of silently keeping the previous one loaded.
 *
 * 'spec' loads target+draft together (real speculative decoding).
 * 'draftOnly' loads only the draft model (accept/reject reconstruction).
 * 'standard' loads only the target model (non-speculative baseline).
 */
export async function ensureServer(name: ServerName, modelPath: string, draftModelPath?: string): Promise<number> {
  const signature = draftModelPath ? `${modelPath}|${draftModelPath}` : modelPath;
  const existing = servers.get(name);

  if (existing?.signature === signature) {
    if (existing.ready) return existing.port;
    await waitForHealth(existing.port);
    existing.ready = true;
    return existing.port;
  }

  if (existing) {
    await stopServer(name);
  }

  const port = portFor(name);
  const args = draftModelPath
    ? [...baseArgs(port, modelPath), '--model-draft', draftModelPath]
    : baseArgs(port, modelPath);

  const proc = spawn(config.llamaServerBin, args, { stdio: 'pipe' });
  const handle: ServerHandle = { name, port, proc, ready: false, signature };
  servers.set(name, handle);

  proc.stderr.on('data', (chunk) => process.stderr.write(`[llama-server:${name}] ${chunk}`));
  proc.stdout.on('data', (chunk) => process.stdout.write(`[llama-server:${name}] ${chunk}`));
  proc.on('exit', (code) => {
    console.warn(`[llama-server:${name}] exited with code ${code}`);
    if (servers.get(name) === handle) servers.delete(name);
  });

  await waitForHealth(port);
  handle.ready = true;
  return port;
}

export function statusSnapshot() {
  return {
    spec: isRunning('spec'),
    draftOnly: isRunning('draftOnly'),
    standard: isRunning('standard'),
  };
}
