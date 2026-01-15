# finetune_gemma.py
# This script is designed to be run in a Google Colab environment with a GPU runtime.

import os
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig, PeftModel
from trl import SFTTrainer

# --- 1. Configuration ---

# The model that you want to train from the Hugging Face hub
MODEL_NAME = "google/gemma-2-9b-it"

# The instruction dataset to use
DATASET_NAME = "finetuning_dataset.jsonl"

# Fine-tuned model name
NEW_MODEL_NAME = "gemma-2-9b-it-ku-tutor"

# Hugging Face Hub username
# TODO: Add your Hugging Face username here if you want to push the model to the Hub
HUGGING_FACE_USERNAME = "YOUR_USERNAME_HERE"

# QLoRA parameters
LORA_R = 64
LORA_ALPHA = 16
LORA_DROPOUT = 0.1

# bitsandbytes parameters
USE_4BIT = True
BNB_4BIT_COMPUTE_DTYPE = "float16"
BNB_4BIT_QUANT_TYPE = "nf4"
USE_NESTED_QUANT = False

# TrainingArguments parameters
OUTPUT_DIR = "./results"
NUM_TRAIN_EPOCHS = 1
FP16 = False
BF16 = True # Use BF16 for better performance on modern GPUs
PER_DEVICE_TRAIN_BATCH_SIZE = 4
PER_DEVICE_EVAL_BATCH_SIZE = 4
GRADIENT_ACCUMULATION_STEPS = 1
GRADIENT_CHECKPOINTING = True
MAX_GRAD_NORM = 0.3
LEARNING_RATE = 2e-4
WEIGHT_DECAY = 0.001
OPTIM = "paged_adamw_32bit"
LR_SCHEDULER_TYPE = "cosine"
MAX_STEPS = -1
WARMUP_RATIO = 0.03
GROUP_BY_LENGTH = True
SAVE_STEPS = 25
LOGGING_STEPS = 25

# SFT parameters
MAX_SEQ_LENGTH = None
PACKING = False
DEVICE_MAP = {"": 0}


def main():
    """
    Main function to run the fine-tuning process.
    """
    print("--- 2. Setting up Hugging Face Authentication ---")
    # To save your model to the Hugging Face Hub, you need to authenticate.
    # In a Colab notebook, you would use: from google.colab import userdata; hf_token = userdata.get('HF_TOKEN')
    # from huggingface_hub import login; login(hf_token)
    print("NOTE: Please ensure you are logged into Hugging Face CLI if you intend to push the model.")
    print("Run `huggingface-cli login` in your terminal.")

    print("\\n--- 3. Loading Dataset ---")
    dataset = load_dataset('json', data_files=DATASET_NAME, split="train")
    print(f"Dataset loaded successfully with {len(dataset)} entries.")
    print("Sample entry:", dataset[0]['text'])

    print("\\n--- 4. Configuring Model Quantization (bitsandbytes) ---")
    compute_dtype = getattr(torch, BNB_4BIT_COMPUTE_DTYPE)

    bnb_config = BitsAndBytesConfig(
        load_in_4bit=USE_4BIT,
        bnb_4bit_quant_type=BNB_4BIT_QUANT_TYPE,
        bnb_4bit_compute_dtype=compute_dtype,
        bnb_4bit_use_double_quant=USE_NESTED_QUANT,
    )

    print("BitsAndBytesConfig created.")

    print(f"\\n--- 5. Loading Base Model: {MODEL_NAME} ---")
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        quantization_config=bnb_config,
        device_map=DEVICE_MAP
    )
    model.config.use_cache = False
    model.config.pretraining_tp = 1
    print("Base model loaded successfully.")

    print("\\n--- 6. Loading Tokenizer ---")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"
    print("Tokenizer loaded successfully.")

    print("\\n--- 7. Configuring PEFT (LoRA) ---")
    peft_config = LoraConfig(
        lora_alpha=LORA_ALPHA,
        lora_dropout=LORA_DROPOUT,
        r=LORA_R,
        bias="none",
        task_type="CAUSAL_LM",
    )
    print("PEFT config created.")

    print("\\n--- 8. Configuring Training Arguments ---")
    training_arguments = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=NUM_TRAIN_EPOCHS,
        per_device_train_batch_size=PER_DEVICE_TRAIN_BATCH_SIZE,
        gradient_accumulation_steps=GRADIENT_ACCUMULATION_STEPS,
        optim=OPTIM,
        save_steps=SAVE_STEPS,
        logging_steps=LOGGING_STEPS,
        learning_rate=LEARNING_RATE,
        weight_decay=WEIGHT_DECAY,
        fp16=FP16,
        bf16=BF16,
        max_grad_norm=MAX_GRAD_NORM,
        max_steps=MAX_STEPS,
        warmup_ratio=WARMUP_RATIO,
        group_by_length=GROUP_BY_LENGTH,
        lr_scheduler_type=LR_SCHEDULER_TYPE,
        report_to="tensorboard"
    )
    print("Training arguments created.")

    print("\\n--- 9. Initializing SFTTrainer ---")
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=peft_config,
        dataset_text_field="text",
        max_seq_length=MAX_SEQ_LENGTH,
        tokenizer=tokenizer,
        args=training_arguments,
        packing=PACKING,
    )
    print("SFTTrainer initialized.")

    print("\\n--- 10. Starting Model Training ---")
    print("This will take a while. Grab a coffee!")
    trainer.train()
    print("Training complete.")

    print("\\n--- 11. Saving the Fine-tuned Model ---")
    trainer.model.save_pretrained(NEW_MODEL_NAME)
    print(f"Model saved locally to '{NEW_MODEL_NAME}'.")

    print("\\n--- 12. (Optional) Merging and Pushing to Hugging Face Hub ---")
    print("To merge the LoRA adapter with the base model and push to the Hub, run the following code:")
    print(f"""
    # Merge and save the fully fine-tuned model
    from peft import AutoPeftModelForCausalLM

    model = AutoPeftModelForCausalLM.from_pretrained("{NEW_MODEL_NAME}", device_map="auto", torch_dtype=torch.bfloat16)
    model = model.merge_and_unload()

    # Push the model and tokenizer to the Hub
    model.push_to_hub("{HUGGING_FACE_USERNAME}/{NEW_MODEL_NAME}", use_temp_dir=False)
    tokenizer.push_to_hub("{HUGGING_FACE_USERNAME}/{NEW_MODEL_NAME}", use_temp_dir=False)
    """)

    print("\\n--- Fine-tuning process complete! ---")


if __name__ == "__main__":
    # Before running, ensure you have the required packages installed:
    # pip install torch datasets transformers peft trl bitsandbytes accelerate
    print("--- 1. Starting Fine-tuning Script ---")
    main()
