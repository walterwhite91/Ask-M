#this will use the locally hosted llama 4b model (4bit quantized) to expand the previously built dataset of 100 samples to 500 samples.
import os
import json
from tqdm import tqdm
from ollama import generate

#Configurations
MODEL_NAME = "llama3.1:8b-instruct-q4_0"
INPUT_FILE = 'refactored_dataset.json'
OUTPUT_FILE = 'expanded_dataset.json'
CHECKPOINT_FILE = 'checkpoint.txt'


def get_progressive_prompt(item):
    return f"""
    ### ROLE: Curriculum Engineer & Socratic Tutor
    ### TASK: Expand this entry into a 5-part training cluster (1 Original + 4 Neighbors).

    ### INPUT DATA:
    Subject: {item['subject']}
    Question: {item['question']}
    Exam Answer: {item['exam_mode_answer']}

    ### OUTPUT REQUIREMENTS:
    1. Exam Mode: Full solution in LaTeX ($...$). Add conceptual follow-up in 'exam_f_question'.
    2. Guided Mode: Socratic hint (No answer). 'guided_f_question' must have 3 progressive questions:
       - Q1: Concept recall.
       - Q2: Variable identification.
       - Q3: The mathematical "next step".
    3. 1-2-1 Expansion: 1 rephrase, 2 related, 1 complex.

    ### JSON STRUCTURE:
    {{
        "subject": "{item['subject']}",
        "question": "...",
        "exam_mode_answer": "...",
        "exam_f_question": "...",
        "guided_mode_answer": "...",
        "guided_f_question": "1. [Recall]?\\n2. [Identify]?\\n3. [Next Step]?"
    }}

    Rules: Use $...$ for LaTeX. Return ONLY a JSON array of 5 objects.
    """

def run_expansion():
    if not os.path.exists(INPUT_FILE):
        print(f"Error: {INPUT_FILE} not found.")
        return

    with open(INPUT_FILE, 'r') as f:
        seeds = json.load(f)        # Load the initial dataset as a list of dicts

    start_idx = 0
    if os.path.exists(CHECKPOINT_FILE):
        with open(CHECKPOINT_FILE, 'r') as f:
            start_idx = int(f.read())

    print(f"continuing from index {start_idx}/{len(seeds)}...")

    for i in tqdm(range(start_idx, len(seeds))):
        item = seeds[i]
        
        try:
            response = generate(
                model=MODEL_NAME,
                prompt=get_progressive_prompt(item),
                format="json",
                options={
                    "temperature": 0.4,
                    "num_gpu": 35,       # Maximizes RTX 4050 VRAM usage
                    "num_thread": 8,     # Parallel processing for NPU/CPU
                    "num_ctx": 4096      
                }
            )
            
            expanded_items = json.loads(response['response'])
            
            with open(OUTPUT_FILE, 'a', encoding='utf-8') as f:
                for obj in expanded_items:
                    f.write(json.dumps(obj) + "\n")
            
            with open(CHECKPOINT_FILE, 'w') as f_check:
                f_check.write(str(i + 1))
                
        except Exception as e:
            print(f"\n[Error at index {i}]: {e}")
            time.sleep(2)
            continue

    print(f"\nGeneration complete. File: {OUTPUT_FILE}")

if __name__ == "__main__":
    run_expansion()