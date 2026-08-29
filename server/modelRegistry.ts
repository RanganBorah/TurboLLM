import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ModelOption } from '../src/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const MODELS_DIR = path.resolve(__dirname, '..', 'models');

export interface RegisteredModel extends ModelOption {
  path: string;
}

function guessParamSize(filename: string): string {
  const match = filename.match(/(\d+(?:\.\d+)?)\s*[bB](?![a-zA-Z])/);
  return match ? `${match[1]}B` : '?';
}

/**
 * Scans models/ for .gguf files. Any file dropped in there — including
 * your own fine-tuned/trained model — shows up automatically as a
 * selectable option in both the target and draft dropdowns. Nothing here
 * is hardcoded to the two models this project ships with.
 */
export function listModels(): RegisteredModel[] {
  if (!fs.existsSync(MODELS_DIR)) return [];
  return fs.readdirSync(MODELS_DIR)
    .filter((f) => f.toLowerCase().endsWith('.gguf'))
    .map((filename) => {
      const fullPath = path.join(MODELS_DIR, filename);
      const stat = fs.statSync(fullPath);
      const id = filename.replace(/\.gguf$/i, '');
      const sizeGb = Number((stat.size / 1e9).toFixed(2));
      return {
        id,
        name: id,
        type: 'target' as const,
        paramSize: guessParamSize(filename),
        latencyPerStepMs: 0,
        memoryFootprintGb: sizeGb,
        description: `Local GGUF model (${sizeGb.toFixed(2)}GB on disk).`,
        path: fullPath,
      };
    })
    .sort((a, b) => a.memoryFootprintGb - b.memoryFootprintGb);
}

export function resolveModelPath(id: string): string {
  const found = listModels().find((m) => m.id === id);
  if (!found) {
    const available = listModels().map((m) => m.id).join(', ') || '(none found in models/)';
    throw new Error(`Model '${id}' not found. Available: ${available}`);
  }
  return found.path;
}
