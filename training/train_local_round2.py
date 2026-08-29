"""
Round 2: continues training "CustomModel 5.1" from the round-1 LoRA
adapter with a second, distinct dataset — sized to run for roughly
2 hours on this machine's GPU (~15,000 examples at the pace observed
in round 1: ~7.4s/step, effective batch size 16).

Loads the round-1 adapter (training/output/customModel_5_1_adapter),
keeps training it (does not start fresh), and overwrites it in place
when done — one continuously-improving model, not separate versions.

Usage:
    .venv\\Scripts\\python.exe train_local_round2.py
    .venv\\Scripts\\python.exe train_local_round2.py --resume   # continue from a round-2 checkpoint
"""
import argparse
import os

import torch
from datasets import load_dataset
from peft import PeftModel
from transformers import AutoTokenizer, BitsAndBytesConfig
from trl import SFTConfig, SFTTrainer

BASE_MODEL = "unsloth/Llama-3.2-1B-Instruct"
DATASET_NAME = "yahma/alpaca-cleaned"  # distinct from round 1's tatsu-lab/alpaca
MAX_EXAMPLES = 15_000  # sized for ~2 hours at round 1's observed pace (~7.4s/step, batch 16)
MAX_SEQ_LENGTH = 512

HERE = os.path.dirname(__file__)
ADAPTER_DIR = os.path.join(HERE, "output", "customModel_5_1_adapter")
CHECKPOINT_DIR = os.path.join(HERE, "output", "checkpoints_round2")

SYSTEM_PROMPT = "You are a helpful, concise assistant."


def format_example(example):
    instruction = example["instruction"]
    input_text = example.get("input", "") or ""
    user_content = f"{instruction}\n\n{input_text}" if input_text else instruction
    text = (
        "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n"
        f"{SYSTEM_PROMPT}<|eot_id|>"
        "<|start_header_id|>user<|end_header_id|>\n\n"
        f"{user_content}<|eot_id|>"
        "<|start_header_id|>assistant<|end_header_id|>\n\n"
        f"{example['output']}<|eot_id|>"
    )
    return {"text": text}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--resume", action="store_true")
    args = parser.parse_args()

    if not os.path.exists(ADAPTER_DIR):
        raise FileNotFoundError(f"No round-1 adapter found at {ADAPTER_DIR} — run train_local.py first.")
    if not torch.cuda.is_available():
        raise RuntimeError("No CUDA GPU detected.")

    print(f"GPU: {torch.cuda.get_device_name(0)} ({torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB)")

    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16,
        bnb_4bit_use_double_quant=True,
    )

    print(f"Loading round-1 adapter from {ADAPTER_DIR} (base: {BASE_MODEL})...")
    tokenizer = AutoTokenizer.from_pretrained(ADAPTER_DIR)
    model = PeftModel.from_pretrained(
        __import__("transformers").AutoModelForCausalLM.from_pretrained(
            BASE_MODEL, quantization_config=bnb_config, device_map={"": 0},
        ),
        ADAPTER_DIR,
        is_trainable=True,
    )
    model.print_trainable_parameters()

    print(f"Loading dataset {DATASET_NAME}...")
    dataset = load_dataset(DATASET_NAME, split="train")
    if len(dataset) > MAX_EXAMPLES:
        dataset = dataset.shuffle(seed=1337).select(range(MAX_EXAMPLES))
    dataset = dataset.map(format_example, remove_columns=dataset.column_names)
    print(f"{len(dataset)} training examples")

    os.makedirs(CHECKPOINT_DIR, exist_ok=True)

    trainer = SFTTrainer(
        model=model,
        processing_class=tokenizer,
        train_dataset=dataset,
        args=SFTConfig(
            dataset_text_field="text",
            max_length=MAX_SEQ_LENGTH,
            packing=False,
            per_device_train_batch_size=1,
            gradient_accumulation_steps=16,
            gradient_checkpointing=True,
            num_train_epochs=1,
            learning_rate=1e-4,  # lower than round 1 — continuing an already-tuned adapter
            bf16=torch.cuda.is_bf16_supported(),
            fp16=not torch.cuda.is_bf16_supported(),
            logging_steps=10,
            save_steps=100,
            save_total_limit=3,
            output_dir=CHECKPOINT_DIR,
            optim="paged_adamw_8bit",
            lr_scheduler_type="cosine",
            warmup_steps=20,
            report_to="none",
        ),
    )

    resume_from = None
    if args.resume:
        checkpoints = [d for d in os.listdir(CHECKPOINT_DIR) if d.startswith("checkpoint-")] if os.path.exists(CHECKPOINT_DIR) else []
        if checkpoints:
            latest = max(checkpoints, key=lambda d: int(d.split("-")[1]))
            resume_from = os.path.join(CHECKPOINT_DIR, latest)
            print(f"Resuming from {resume_from}")

    trainer.train(resume_from_checkpoint=resume_from)

    model.save_pretrained(ADAPTER_DIR)
    tokenizer.save_pretrained(ADAPTER_DIR)
    print(f"\nDone. Round-2-trained adapter overwritten at {ADAPTER_DIR}")
    print("Next: run merge_and_export_gguf.py to produce the updated .gguf file.")


if __name__ == "__main__":
    main()
