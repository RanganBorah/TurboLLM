import { DecodingRequest, GenerationMetrics, SimulationStep, TokenItem } from '../types';

export type SimulationCallback = (step: SimulationStep) => void;
export type CompletionCallback = (finalMetrics: GenerationMetrics, allTokens: TokenItem[], outputText: string) => void;

/**
 * Streams a real decoding session from the local backend (`/api/decode/stream`)
 * over Server-Sent Events. `fetch` + manual SSE parsing is used instead of
 * `EventSource` because EventSource can't send a POST body (we need to send
 * the prompt/config).
 *
 * Exposes the same start/pause/resume/stop shape the UI already used with the
 * old fake SimulationController, so LiveDemo.tsx needs no behavioral changes.
 * Pause/resume is a client-side simplification: generation keeps running on
 * the server (a live model stream can't be cheaply paused mid-flight), and
 * pausing just stops forwarding buffered events to the UI until resumed.
 */
export class RemoteDecodingSession {
  private request: DecodingRequest;
  private onUpdate: SimulationCallback;
  private onComplete?: CompletionCallback;
  private abortController: AbortController | null = null;
  private isPaused = false;
  private isStopped = false;
  private queue: SimulationStep[] = [];
  private lastStep: SimulationStep | null = null;

  constructor(request: DecodingRequest, onUpdate: SimulationCallback, onComplete?: CompletionCallback) {
    this.request = request;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
  }

  public start() {
    this.isStopped = false;
    this.isPaused = false;
    this.abortController = new AbortController();
    this.run(this.abortController.signal).catch((err) => {
      if (this.isStopped) return;
      console.error('Decoding session failed', err);
    });
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    if (this.isStopped) return;
    this.isPaused = false;
    this.flushQueue();
  }

  public stop() {
    this.isStopped = true;
    this.abortController?.abort();
  }

  public getStatus() {
    return { isPaused: this.isPaused, isStopped: this.isStopped };
  }

  private flushQueue() {
    while (!this.isPaused && this.queue.length > 0) {
      const step = this.queue.shift()!;
      this.lastStep = step;
      this.onUpdate(step);
    }
  }

  private deliver(step: SimulationStep) {
    this.queue.push(step);
    if (!this.isPaused) this.flushQueue();
  }

  private async run(signal: AbortSignal) {
    const res = await fetch('/api/decode/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.request),
      signal,
    });

    if (!res.ok || !res.body) {
      throw new Error(`Backend request failed: ${res.status} ${res.statusText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const messages = buffer.split('\n\n');
      buffer = messages.pop() ?? '';

      for (const raw of messages) {
        const lines = raw.split('\n');
        let event = 'message';
        let data = '';
        for (const line of lines) {
          if (line.startsWith('event:')) event = line.slice('event:'.length).trim();
          else if (line.startsWith('data:')) data = line.slice('data:'.length).trim();
        }
        if (!data) continue;

        if (event === 'error') {
          const parsed = JSON.parse(data);
          throw new Error(parsed.message || 'Backend streaming error');
        }
        if (event === 'complete') {
          const finalMetrics = JSON.parse(data) as GenerationMetrics;
          const finalTokens = this.lastStep?.allTokens ?? [];
          const finalText = this.lastStep?.outputText ?? '';
          if (this.onComplete) this.onComplete(finalMetrics, finalTokens, finalText);
          continue;
        }
        const step = JSON.parse(data) as SimulationStep;
        this.deliver(step);
      }
    }
  }
}
