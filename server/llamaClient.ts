const LLAMA3_STOP = ['<|eot_id|>'];

export function formatLlama3Prompt(userPrompt: string): string {
  return (
    '<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n' +
    'You are a helpful, concise assistant.<|eot_id|>' +
    '<|start_header_id|>user<|end_header_id|>\n\n' +
    `${userPrompt}<|eot_id|>` +
    '<|start_header_id|>assistant<|end_header_id|>\n\n'
  );
}

export interface CompletionTimings {
  predicted_n?: number;
  predicted_ms?: number;
  predicted_per_second?: number;
  prompt_n?: number;
  prompt_ms?: number;
}

export interface StreamedPiece {
  content: string;
  ts: number;
  stop: boolean;
  timings?: CompletionTimings;
}

/**
 * Streams a completion from a running llama-server /completion endpoint.
 * Yields one piece per server-sent chunk (llama.cpp emits ~one detokenized
 * piece per generated token), each timestamped on arrival for real timing.
 */
export async function* streamCompletion(
  port: number,
  prompt: string,
  opts: { nPredict: number; temperature: number; signal?: AbortSignal }
): AsyncGenerator<StreamedPiece> {
  const res = await fetch(`http://127.0.0.1:${port}/completion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      n_predict: opts.nPredict,
      temperature: opts.temperature,
      stream: true,
      stop: LLAMA3_STOP,
      cache_prompt: true,
    }),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`llama-server completion failed: ${res.status} ${res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() ?? '';

    for (const chunk of chunks) {
      const line = chunk.trim();
      if (!line.startsWith('data:')) continue;
      const jsonStr = line.slice('data:'.length).trim();
      if (!jsonStr) continue;
      try {
        const parsed = JSON.parse(jsonStr);
        yield {
          content: parsed.content ?? '',
          ts: Date.now(),
          stop: !!parsed.stop,
          timings: parsed.timings,
        };
      } catch {
        // ignore malformed keep-alive lines
      }
    }
  }
}

/**
 * Non-streaming single-shot completion. Used for the draft-only model's
 * "what would you have proposed here" reconstruction queries.
 */
export async function completeOnce(
  port: number,
  prompt: string,
  opts: { nPredict: number; temperature: number }
): Promise<{ content: string; timings?: CompletionTimings }> {
  const res = await fetch(`http://127.0.0.1:${port}/completion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      n_predict: opts.nPredict,
      temperature: opts.temperature,
      stream: false,
      cache_prompt: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`llama-server completion failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return { content: data.content ?? '', timings: data.timings };
}

export async function checkHealth(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
