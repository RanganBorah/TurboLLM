import { CentralBenchmarkData, DecodingRequest, GenerationMetrics, ModelOption, PresetPrompt } from '../types';
import { PLACEHOLDER_BENCHMARK_DATA, PRESET_PROMPTS } from '../simulation/mockData';
import { RemoteDecodingSession, SimulationCallback, CompletionCallback } from './remoteDecodingSession';

export interface SystemStatus {
  mode: 'simulation' | 'backend';
  status: 'ready' | 'busy' | 'error';
  backendUrl?: string;
  hardware: {
    gpu: string;
    vramAvailableGb: number;
    kvCacheStatus: string;
  };
  supportedFeatures: string[];
  configured?: boolean;
}

/**
 * SpecDecode API Service
 *
 * Talks to the local Node/Express backend (`server/index.ts`), which in turn
 * orchestrates local llama.cpp `llama-server` processes doing real
 * speculative decoding on your GPU. There is no simulation left here — if
 * the backend or llama-server isn't running, requests fail with a real error
 * instead of falling back to fake data.
 */
class SpecDecodeApiService {
  private activeSession: RemoteDecodingSession | null = null;

  public async getSystemStatus(): Promise<SystemStatus> {
    const res = await fetch('/api/system-status');
    if (!res.ok) throw new Error(`Failed to reach backend: ${res.status}`);
    return res.json();
  }

  public async getModels(): Promise<{ targetModels: ModelOption[]; draftModels: ModelOption[] }> {
    const res = await fetch('/api/models');
    if (!res.ok) throw new Error(`Failed to load models: ${res.status}`);
    return res.json();
  }

  public async getTargetModels(): Promise<ModelOption[]> {
    return (await this.getModels()).targetModels;
  }

  public async getDraftModels(): Promise<ModelOption[]> {
    return (await this.getModels()).draftModels;
  }

  /**
   * Loads benchmark data measured on the user's own hardware
   * (see scripts/run-benchmarks.ts). Falls back to an all-zero placeholder
   * (clearly not real data) if the benchmark script hasn't been run yet.
   */
  public async getBenchmarkData(): Promise<CentralBenchmarkData> {
    const res = await fetch('/api/benchmarks');
    if (res.status === 404) return PLACEHOLDER_BENCHMARK_DATA;
    if (!res.ok) throw new Error(`Failed to load benchmarks: ${res.status}`);
    return res.json();
  }

  public async getPresetPrompts(): Promise<PresetPrompt[]> {
    return PRESET_PROMPTS;
  }

  /**
   * Start a real speculative/standard decoding session with streaming updates.
   */
  public createDecodingSession(
    request: DecodingRequest,
    onUpdate: SimulationCallback,
    onComplete?: CompletionCallback
  ): RemoteDecodingSession {
    if (this.activeSession) {
      this.activeSession.stop();
    }
    const session = new RemoteDecodingSession(request, onUpdate, onComplete);
    this.activeSession = session;
    return session;
  }

  public async runSpeculativeDecoding(request: DecodingRequest): Promise<GenerationMetrics> {
    return new Promise((resolve, reject) => {
      const session = new RemoteDecodingSession(
        { ...request, mode: 'speculative' },
        () => {},
        (finalMetrics) => resolve(finalMetrics)
      );
      session.start();
      setTimeout(() => reject(new Error('Decoding timed out')), 5 * 60 * 1000);
    });
  }

  public async runStandardDecoding(request: DecodingRequest): Promise<GenerationMetrics> {
    return new Promise((resolve, reject) => {
      const session = new RemoteDecodingSession(
        { ...request, mode: 'standard' },
        () => {},
        (finalMetrics) => resolve(finalMetrics)
      );
      session.start();
      setTimeout(() => reject(new Error('Decoding timed out')), 5 * 60 * 1000);
    });
  }
}

export const apiService = new SpecDecodeApiService();
export default apiService;
