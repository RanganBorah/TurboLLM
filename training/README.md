# Training "CustomModel 5.1"

This trains a custom draft model for the SpecDecode app on Google Colab's
free GPU, entirely separate from the local Node/llama.cpp serving stack —
training happens in the cloud, and only the finished `.gguf` file comes
back to this machine.

## Usage

1. Upload `CustomModel_5_1_Colab_Training.ipynb` to [Google Colab](https://colab.research.google.com).
2. `Runtime > Change runtime type` → select a **T4 GPU**.
3. Run the cells top to bottom. Total time for the full 50k-example run is
   roughly 30–60 minutes on a T4 (a few minutes if you flip `SMOKE_TEST = True`
   first to sanity-check everything before committing to the full run).
4. The last cell downloads `CustomModel 5.1.gguf` to your machine. Move it
   into this project's `models/` folder:
   ```bash
   mv "~/Downloads/CustomModel 5.1.gguf" ../models/
   ```
5. Refresh the Live Demo page — it appears in both the Target and Draft
   dropdowns automatically (see `server/modelRegistry.ts`), right alongside
   the pre-trained `Llama-3.2-3B-Instruct` and `Llama-3.2-1B-Instruct`.

## For the hackathon demo

Run the same prompt set through the Live Demo (or `npm run benchmarks`)
twice, changing only the draft model:

- **Pre-trained large vs. pre-trained small**: target = `Llama-3.2-3B-Instruct`, draft = `Llama-3.2-1B-Instruct`
- **Pre-trained large vs. self-trained small**: target = `Llama-3.2-3B-Instruct`, draft = `CustomModel 5.1`

Compare the **Acceptance Rate** metric between the two runs — that's the
real, measured effect of the fine-tuning, not a marketing number.

## Round 2

The notebook's last section (commented out) resumes training the same
adapter with a second ~50k dataset and re-exports, **overwriting**
`CustomModel 5.1.gguf` — it stays one model, just further trained. Requires
having saved the round-1 adapter to Google Drive (the notebook does this
by default in section 7).
