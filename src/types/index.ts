export type PageTab = 'overview' | 'demo' | 'benchmark' | 'how-it-works' | 'architecture' | 'about';

export type TokenStatus = 
  | 'pending' 
  | 'drafted' 
  | 'verifying' 
  | 'accepted' 
  | 'rejected' 
  | 'corrected';

export interface TokenItem {
  id: string;
  token: string;
  status: TokenStatus;
  draftIndex?: number;
  batchId?: number;
  confidence?: number;
  model?: 'draft' | 'target' | 'corrected';
  correctedFrom?: string;
  verificationLatencyMs?: number;
}

export interface GenerationMetrics {
  latencyMs: number;
  tokensPerSecond: number;
  acceptanceRate: number; // 0 to 100
  draftTokens: number;
  acceptedTokens: number;
  rejectedTokens: number;
  targetModelCalls: number;
  speedup: number;
  totalTokensGenerated: number;
  estimatedStandardCalls: number;
  timeElapsedMs: number;
  kvCacheHitRate: number;
  speculativeBatchCount: number;
}

export interface ModelOption {
  id: string;
  name: string;
  type: 'target' | 'draft';
  paramSize: string;
  latencyPerStepMs: number;
  memoryFootprintGb: number;
  description: string;
}

export interface DecodingConfig {
  targetModelId: string;
  draftModelId: string;
  gammaDraftTokens: number; // e.g. 3 to 8
  temperature: number; // 0.0 to 1.0
  maxTokens: number; // 50 to 300
  speedMultiplier: number; // 1, 2, 4, 8
}

export interface DecodingRequest {
  prompt: string;
  config: DecodingConfig;
  mode: 'speculative' | 'standard' | 'demo';
  seed?: number;
}

export interface SimulationStep {
  stepIndex: number;
  phase: 'idle' | 'initializing' | 'drafting' | 'verifying' | 'accepting' | 'correcting' | 'completed' | 'paused';
  currentBatch: TokenItem[];
  allTokens: TokenItem[];
  outputText: string;
  metrics: GenerationMetrics;
  logMessage: string;
  activeBatchIndex: number;
  progressPercent: number;
  standardStepSequence?: { token: string; targetCall: number }[];
}

export interface BenchmarkRecord {
  promptCategory: string;
  promptText: string;
  targetModel: string;
  draftModel: string;
  gamma: number;
  speculativeTps: number;
  standardTps: number;
  speedup: number;
  acceptanceRate: number;
  targetCallsSpec: number;
  targetCallsStd: number;
  latencySpecMs: number;
  latencyStdMs: number;
  memoryOverheadMb: number;
}

export interface CentralBenchmarkData {
  overviewMetrics: {
    speedImprovement: string;
    tokensPerSecond: number;
    standardTokensPerSecond: number;
    acceptanceRate: number;
    targetModelCalls: number;
    standardTargetModelCalls: number;
    averageLatencyMs: number;
    memoryEfficiencyPct: number;
  };
  comparisonSeries: {
    category: string;
    standardSpeed: number;
    speculativeSpeed: number;
    acceptanceRate: number;
    speedup: number;
  }[];
  timeSeriesSpeed: {
    tokenCount: number;
    standardTimeMs: number;
    speculativeTimeMs: number;
    tokensPerSecStd: number;
    tokensPerSecSpec: number;
  }[];
  gammaAblation: {
    gamma: number;
    speedup: number;
    acceptanceRate: number;
    overheadMs: number;
    effectiveTps: number;
  }[];
  modelPairs: {
    pairName: string;
    target: string;
    draft: string;
    speedup: string;
    acceptanceRate: string;
    vramMb: string;
  }[];
}

export interface PresetPrompt {
  id: string;
  title: string;
  category: 'Coding' | 'Reasoning' | 'Science' | 'Creative' | 'Math';
  prompt: string;
  estimatedSpeedup: number;
}
