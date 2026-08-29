import 'dotenv/config';

function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var ${name}. Copy .env.example to .env and fill it in.`);
  return val;
}

export const config = {
  llamaServerBin: process.env.LLAMA_SERVER_BIN || '',
  targetModelPath: process.env.TARGET_MODEL_PATH || '',
  draftModelPath: process.env.DRAFT_MODEL_PATH || '',
  specServerPort: Number(process.env.SPEC_SERVER_PORT || 8081),
  draftOnlyServerPort: Number(process.env.DRAFT_ONLY_SERVER_PORT || 8082),
  standardServerPort: Number(process.env.STANDARD_SERVER_PORT || 8083),
  backendPort: Number(process.env.BACKEND_PORT || 8090),
  ctxSize: Number(process.env.LLAMA_CTX_SIZE || 2048),
  gpuLayers: Number(process.env.LLAMA_GPU_LAYERS || 999),
};

export function assertConfigured() {
  required('LLAMA_SERVER_BIN');
  required('TARGET_MODEL_PATH');
  required('DRAFT_MODEL_PATH');
}
