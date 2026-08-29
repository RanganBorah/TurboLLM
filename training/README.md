# Training "CustomModel 5.1"

Two training paths exist here:

- **`CustomModel_5_1_Colab_Training.ipynb`** — trains on Google Colab's free
  T4 GPU. Fast (~30-60 min), but subject to Colab's usage quota.
- **`train_local.py` / `train_local_round2.py`** — trains locally via QLoRA,
  sized for a 4GB laptop GPU. This is what actually produced the
  `CustomModel 5.1.gguf` shipped in this project, after Colab's quota ran
  out mid-run. Slower (~1-2 hours per round on a 4GB card), but has no
  external quota and can be resumed if interrupted.

Both produce the same thing: a LoRA fine-tune of Llama-3.2-1B-Instruct,
merged and quantized to `CustomModel 5.1.gguf`, dropped into `models/`.

## Local training (what was actually used)

```bash
cd training
python -m venv .venv
.venv\Scripts\python.exe -m pip install torch --index-url https://download.pytorch.org/whl/cu124
.venv\Scripts\python.exe -m pip install -r requirements.txt

# Round 1: 10k examples from tatsu-lab/alpaca (~50-60 min on a 4GB GPU)
.venv\Scripts\python.exe train_local.py --smoke-test   # optional: 200-example sanity check first
.venv\Scripts\python.exe train_local.py

# Round 2: continues the round-1 adapter with 15k examples from a
# different dataset (yahma/alpaca-cleaned), ~1.5-2 hours
.venv\Scripts\python.exe train_local_round2.py

# Merge the adapter into base weights, convert to GGUF, quantize to Q4_K_M
git clone --depth 1 https://github.com/ggml-org/llama.cpp.git C:/tools/llama.cpp-src
.venv\Scripts\python.exe merge_and_export_gguf.py
```

**Notes from actually running this:**
- Use `device_map={"": 0}` when loading the base model (already set in
  both training scripts) — `device_map="auto"` silently splits the model
  across CPU+GPU when VRAM looks tight instead of erroring, which doesn't
  crash but makes training 30-50x slower with no visible warning.
- `merge_and_export_gguf.py` needs a **full clone** of llama.cpp, not just
  `convert_hf_to_gguf.py` fetched standalone — that script imports from a
  sibling `conversion` package that isn't included if you grab the file on
  its own.
- Don't run the SpecDecode app's backend (`npm run dev:full`) at the same
  time as training — both compete for the same 4GB of VRAM and one or both
  will crash or slow to a crawl. Train first, then start the app.
- `trl`/`transformers` move fast: `SFTConfig`'s parameter names
  (`max_length` not `max_seq_length`, `warmup_steps` not `warmup_ratio`)
  and `SFTTrainer`'s `processing_class=` (not `tokenizer=`) may have
  changed again by the time you read this — if training throws a
  `TypeError: unexpected keyword argument`, run
  `python -c "from trl import SFTConfig; import inspect; print(list(inspect.signature(SFTConfig.__init__).parameters))"`
  to see the actual current parameter names rather than guessing.

## For the hackathon demo

Run the same prompt set through the Live Demo (or `npm run benchmarks`)
twice, changing only the draft model:

- **Pre-trained large vs. pre-trained small**: target = `Llama-3.2-3B-Instruct`, draft = `Llama-3.2-1B-Instruct`
- **Pre-trained large vs. self-trained small**: target = `Llama-3.2-3B-Instruct`, draft = `CustomModel 5.1`

Compare the **Acceptance Rate** metric between the two runs — that's the
real, measured effect of the fine-tuning, not a marketing number.

## Colab path (if you have quota available)

1. Upload `CustomModel_5_1_Colab_Training.ipynb` to [Google Colab](https://colab.research.google.com).
2. `Runtime > Change runtime type` → select a **T4 GPU**.
3. Run the cells top to bottom (flip `SMOKE_TEST = True` first to sanity-check).
4. The last cell downloads `CustomModel 5.1.gguf` — move it into `models/`.
5. Refresh the Live Demo page — it appears in both dropdowns automatically
   (see `server/modelRegistry.ts`).

The notebook's commented-out "round 2" section resumes the adapter with a
second dataset and overwrites the same file — one continuously-improving
model, not separate versions.
