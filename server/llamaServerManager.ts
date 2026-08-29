import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { config } from './config';

export type ServerName = 'spec' | 'draftOnly' | 'standard';

interface ServerHandle {
  name: ServerName;
  port: number;
  proc: ChildProcessWithoutNullStreams;
  ready: boolean;
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

/**
 * Starts a named llama-server instance if not already running, and waits until healthy.
 * 'spec' loads target+draft together (real speculative decoding).
 * 'draftOnly' loads only the draft model (used to reconstruct accept/reject visualization).
 * 'standard' loads only the target model (non-speculative comparison baseline).
 */
export async function ensureServer(name: ServerName): Promise<number> {
  const existing = servers.get(name);
  if (existing?.ready) return existing.port;
  if (existing && !existing.ready) {
    // A start is already in-flight elsewhere; just wait on health.
    await waitForHealth(existing.port);
    existing.ready = true;
    return existing.port;
  }

  const port = portFor(name);
  const args = name === 'spec'
    ? [...baseArgs(port, config.targetModelPath), '--model-draft', config.draftModelPath]
    : name === 'draftOnly'
      ? baseArgs(port, config.draftModelPath)
      : baseArgs(port, config.targetModelPath);

  const proc = spawn(config.llamaServerBin, args, { stdio: 'pipe' });
  const handle: ServerHandle = { name, port, proc, ready: false };
  servers.set(name, handle);

  proc.stderr.on('data', (chunk) => process.stderr.write(`[llama-server:${name}] ${chunk}`));
  proc.stdout.on('data', (chunk) => process.stdout.write(`[llama-server:${name}] ${chunk}`));
  proc.on('exit', (code) => {
    console.warn(`[llama-server:${name}] exited with code ${code}`);
    servers.delete(name);
  });

  await waitForHealth(port);
  handle.ready = true;
  return port;
}

export function stopServer(name: ServerName) {
  const handle = servers.get(name);
  if (handle) {
    handle.proc.kill();
    servers.delete(name);
  }
}

export function stopAllServers() {
  for (const name of [...servers.keys()]) stopServer(name);
}

export function statusSnapshot() {
  return {
    spec: isRunning('spec'),
    draftOnly: isRunning('draftOnly'),
    standard: isRunning('standard'),
  };
}
