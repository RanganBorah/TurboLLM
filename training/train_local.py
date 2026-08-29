"""
Local QLoRA fine-tuning of Llama-3.2-1B-Instruct into "CustomModel 5.1",
sized for a 4GB VRAM laptop GPU. Loads the base model in 4-bit (QLoRA),
trains a small LoRA adapter, and checkpoints frequently so a run can be
paused and resumed across sessions.

Usage:
    .venv\\Scripts\\python.exe train_local.py
    .venv\\Scripts\\python.exe train_local.py --resume   # continue from last checkpoint
    .venv\\Scripts\\python.exe train_local.py --smoke-test  # 200 examples, sanity check first

After this finishes, run merge_and_export_gguf.py to produce the .gguf
file for the SpecDecode app's models/ folder.
"""
import argparse
import os

import torch
from datasets import load_dataset
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from trl import SFTConfig, SFTTrainer

BASE_MODEL = "unsloth/Llama-3.2-1B-Instruct"  # ungated mirror of the same weights served locally as GGUF
DATASET_NAME = "tatsu-lab/alpaca"
MAX_EXAMPLES = 10_000  # reduced from 50k for hackathon time pressure on a 4GB laptop GPU
MAX_SEQ_LENGTH = 512    # shorter than the Colab run (1024) to fit comfortably in 4GB VRAM

ADAPTER_DIR = os.path.join(os.path.dirname(__file__), "output", "customModel_5_1_adapter")
CHECKPOINT_DIR = os.path.join(os.path.dirname(__file__), "output", "checkpoints")

SYSTEM_PROMPT = "You are a helpful, concise assistant."


def format_example(example):
    """Same Llama-3 chat template server/llamaClient.ts uses at inference time —
    matching train/serve format is what actually drives acceptance rate."""
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
    parser.add_argument("--resume", action="store_true", help="Resume from the last saved checkpoint")
    parser.add_argument("--smoke-test", action="store_true", help="Train on 200 examples only, to sanity-check the setup")
    args = parser.parse_args()

    if not torch.cuda.is_available():
        raise RuntimeError("No CUDA GPU detected. Check `nvidia-smi` and that torch was installed with a CUDA build.")
    print(f"GPU: {torch.cuda.get_device_name(0)} ({torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB)")

    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16,
        bnb_4bit_use_double_quant=True,
    )

    print(f"Loading {BASE_MODEL} in 4-bit (QLoRA)...")
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        quantization_config=bnb_config,
        device_map={"": 0},  # force fully onto GPU 0 — "auto" can silently
        # split the model across CPU+GPU when VRAM looks tight (e.g. other
        # processes already using some), which doesn't crash but makes
        # training 10-50x slower with no visible error. Fail loudly instead.
    )
    model = prepare_model_for_kbit_training(model, use_gradient_checkpointing=True)

    lora_config = LoraConfig(
        r=16,
        lora_alpha=16,
        lora_dropout=0.0,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    )
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    print(f"Loading dataset {DATASET_NAME}...")
    dataset = load_dataset(DATASET_NAME, split="train")
    n = 200 if args.smoke_test else MAX_EXAMPLES
    if len(dataset) > n:
        dataset = dataset.shuffle(seed=3407).select(range(n))
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
            per_device_train_batch_size=1,   # conservative for 4GB VRAM
            gradient_accumulation_steps=16,  # effective batch size 16
            gradient_checkpointing=True,
            num_train_epochs=1,
            learning_rate=2e-4,
            bf16=torch.cuda.is_bf16_supported(),
            fp16=not torch.cuda.is_bf16_supported(),
            logging_steps=10,
            save_steps=100,       # frequent checkpoints — a laptop run may get interrupted
            save_total_limit=3,
            output_dir=CHECKPOINT_DIR,
            optim="paged_adamw_8bit",  # memory-efficient optimizer, standard for QLoRA
            lr_scheduler_type="cosine",
            warmup_steps=20,  # warmup_ratio was removed in this trl version
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
        else:
            print("No checkpoint found to resume from — starting fresh.")

    trainer.train(resume_from_checkpoint=resume_from)

    os.makedirs(ADAPTER_DIR, exist_ok=True)
    model.save_pretrained(ADAPTER_DIR)
    tokenizer.save_pretrained(ADAPTER_DIR)
    print(f"\nDone. Adapter saved to {ADAPTER_DIR}")
    print("Next: run merge_and_export_gguf.py to produce the .gguf file for the SpecDecode app.")


if __name__ == "__main__":
    main()
