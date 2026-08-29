"""
Merges the LoRA adapter trained by train_local.py into the base model,
converts to GGUF, and quantizes to Q4_K_M — producing the exact file
format the SpecDecode app expects in models/.

Usage:
    .venv\\Scripts\\python.exe merge_and_export_gguf.py

Requires llama.cpp's convert_hf_to_gguf.py, which this script downloads
automatically (it's not included in the prebuilt binary release already
installed at C:/tools/llama.cpp — that only has compiled .exe files).
"""
import os
import subprocess
import sys
import urllib.request

import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

BASE_MODEL = "unsloth/Llama-3.2-1B-Instruct"
HERE = os.path.dirname(__file__)
ADAPTER_DIR = os.path.join(HERE, "output", "customModel_5_1_adapter")
MERGED_DIR = os.path.join(HERE, "output", "customModel_5_1_merged")
GGUF_F16_PATH = os.path.join(HERE, "output", "CustomModel 5.1.f16.gguf")
GGUF_FINAL_PATH = os.path.join(HERE, "output", "CustomModel 5.1.gguf")

LLAMA_CPP_BIN = "C:/tools/llama.cpp"
LLAMA_QUANTIZE_EXE = os.path.join(LLAMA_CPP_BIN, "llama-quantize.exe")
# The standalone convert_hf_to_gguf.py imports from a sibling `conversion`
# package that isn't included when fetching the script alone — use a full
# (shallow) clone of the repo instead so all its dependencies are present.
LLAMA_CPP_SRC = "C:/tools/llama.cpp-src"
CONVERT_SCRIPT_PATH = os.path.join(LLAMA_CPP_SRC, "convert_hf_to_gguf.py")


def ensure_convert_script():
    if os.path.exists(CONVERT_SCRIPT_PATH):
        return
    raise FileNotFoundError(
        f"{CONVERT_SCRIPT_PATH} not found — clone llama.cpp there: "
        f"git clone --depth 1 https://github.com/ggml-org/llama.cpp.git {LLAMA_CPP_SRC}"
    )


def merge_adapter():
    if not os.path.exists(ADAPTER_DIR):
        raise FileNotFoundError(f"No adapter found at {ADAPTER_DIR} — run train_local.py first.")

    print(f"Loading base model {BASE_MODEL} (fp16, for clean merging)...")
    base_model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        torch_dtype=torch.float16,
        device_map="cpu",  # merging doesn't need GPU, and avoids competing with anything else on the 4GB card
    )
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)

    print(f"Loading LoRA adapter from {ADAPTER_DIR}...")
    model = PeftModel.from_pretrained(base_model, ADAPTER_DIR)

    print("Merging adapter into base weights...")
    merged = model.merge_and_unload()

    os.makedirs(MERGED_DIR, exist_ok=True)
    merged.save_pretrained(MERGED_DIR)
    tokenizer.save_pretrained(MERGED_DIR)
    print(f"Merged model saved to {MERGED_DIR}")


def convert_to_gguf():
    ensure_convert_script()
    print("Converting merged model to GGUF (f16)...")
    subprocess.run(
        [sys.executable, CONVERT_SCRIPT_PATH, MERGED_DIR, "--outfile", GGUF_F16_PATH, "--outtype", "f16"],
        check=True,
    )


def quantize():
    if not os.path.exists(LLAMA_QUANTIZE_EXE):
        raise FileNotFoundError(f"llama-quantize.exe not found at {LLAMA_QUANTIZE_EXE}")
    print("Quantizing to Q4_K_M...")
    subprocess.run([LLAMA_QUANTIZE_EXE, GGUF_F16_PATH, GGUF_FINAL_PATH, "Q4_K_M"], check=True)
    size_gb = os.path.getsize(GGUF_FINAL_PATH) / 1e9
    print(f"\nDone: {GGUF_FINAL_PATH} ({size_gb:.2f} GB)")
    print("Copy this file into the project's models/ folder — it'll appear in both dropdowns automatically.")


if __name__ == "__main__":
    os.makedirs(os.path.join(HERE, "output"), exist_ok=True)
    if os.path.exists(os.path.join(MERGED_DIR, "model.safetensors")):
        print(f"Merged model already exists at {MERGED_DIR}, skipping merge step.")
    else:
        merge_adapter()
    convert_to_gguf()
    quantize()
