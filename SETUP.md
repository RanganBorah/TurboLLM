# Local Real Speculative Decoding — Setup

This app now runs real speculative decoding locally via [llama.cpp](https://github.com/ggml-org/llama.cpp),
using a small **draft** model and a larger **target** model, both on your GPU.
Sized for a 4GB VRAM card (e.g. RTX 3050 Ti Laptop):

- Target: Llama 3.2 3B Instruct (Q4_K_M, ~2.0GB)
- Draft: Llama 3.2 1B Instruct (Q4_K_M, ~0.8GB)

## 1. Install llama.cpp (Windows, CUDA build)

1. Download the latest `llama-<version>-bin-win-cuda-x64.zip` from the
   [llama.cpp releases page](https://github.com/ggml-org/llama.cpp/releases).
2. You'll also need the matching CUDA runtime DLLs zip from the same release
   (`cudart-llama-bin-win-cuda-x64.zip`) — unzip both into the same folder.
3. Unzip everything into e.g. `C:\tools\llama.cpp`.
4. Verify it works:
   ```bash
   C:\tools\llama.cpp\llama-server.exe --version
   ```

## 2. Download the GGUF models

Create a `models/` folder in this project and download (Q4_K_M quantization,
from a reputable GGUF repo such as bartowski's on Hugging Face):

- `Llama-3.2-3B-Instruct-Q4_K_M.gguf` → `models/`
- `Llama-3.2-1B-Instruct-Q4_K_M.gguf` → `models/`

## 3. Configure `.env`

```bash
cp .env.example .env
```

Edit `.env` and set `LLAMA_SERVER_BIN`, `TARGET_MODEL_PATH`, `DRAFT_MODEL_PATH`
to the actual paths from steps 1–2.

## 4. Install dependencies and run

```bash
npm install
npm run dev:full
```

This starts the Vite frontend (port 3000) and the Node backend (port 8090,
proxied at `/api`). The backend lazily starts the two `llama-server`
processes (spec: target+draft, draft-only: draft alone) on first request —
the first prompt you run will be slower while models load into VRAM.

Open http://localhost:3000, go to **Live Demo**, and run a prompt. The
"Backend Offline" badge turns green once the backend responds.

## 5. (Optional) Generate real benchmark numbers

```bash
npm run benchmarks
```

Runs a fixed prompt set through both modes on your own hardware and writes
`server/data/benchmarkResults.json`, which powers the Benchmark tab. Until
you run this, that tab shows an all-zero placeholder — it will never show
fabricated numbers.

## Notes / limitations

- **Accept/reject visualization is reconstructed, not captured live** from
  llama.cpp's internal sampler: after real generation completes for each
  gamma-sized window, a second draft-only server is asked what it would have
  greedily proposed from the same prefix, and that's diffed against the real
  output. Exact for greedy/temperature=0 decoding; an approximation at
  higher temperatures. See `server/specDecode.ts` for details.
- **Pause/resume** on a live model stream is a client-side simplification:
  the server keeps generating regardless; pausing just stops forwarding
  buffered events to the UI.
- If you see CUDA out-of-memory errors, lower `LLAMA_CTX_SIZE` in `.env`
  (e.g. to 1024) to reduce KV cache VRAM usage.
- On a 4GB card, running Standard mode after Speculative mode keeps all
  three `llama-server` instances (spec, draft-only, standard-only) loaded
  concurrently, leaving only ~150MB of VRAM headroom (confirmed working,
  but tight). If you hit OOM here, lower `LLAMA_CTX_SIZE` further or restart
  the backend between switching modes to release the unused server.
