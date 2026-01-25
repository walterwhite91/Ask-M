#export DEEPSEEK_API_KEY="sk-..." in your environment before running
import os
import json
import time
import requests
from tqdm import tqdm

# conf
MODEL_NAME = "deepseek-chat"  # currently using DeepSeek v3.2 chat model, not using reasoning as its note required. Also explicitly using deepseek as its trained on STEM datasets and its cheap

INPUT_FILE = "test_merged_dataset.json"
OUTPUT_FILE = "test_expanded_dataset.jsonl"
CHECKPOINT_FILE = "test_checkpoint.txt"

MAX_TOKENS = 1400
TEMPERATURE = 0.2
REQUEST_DELAY = 1.5  # seconds (saans ferna deko)

API_URL = "https://api.deepseek.com/chat/completions"

#export DEEPSEEK_API_KEY="sk-..." in your environment before running
API_KEY = os.environ.get("DEEPSEEK_API_KEY")
if not API_KEY:
    raise RuntimeError('DEEPSEEK_API_KEY not found in environment. Bruh why did you forget to set it?')

# prompt based on family
def get_prompt_math_phys(item):
    return "REPLACE_WITH_MATH_PHYS_PROMPT"

def get_prompt_programming(item):
    return "REPLACE_WITH_PROGRAMMING_PROMPT"

def get_prompt_design(item):
    return "REPLACE_WITH_DESIGN_PROMPT"

def route_prompt(item):
    family = item.get("family")

    if family == "math_phys":
        return get_prompt_math_phys(item)
    elif family == "programming":
        return get_prompt_programming(item)
    elif family == "design":
        return get_prompt_design(item)
    else:
        return None

# calling the model
def call_model(prompt, retries=4):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": TEMPERATURE,
        "max_tokens": MAX_TOKENS
    }

    delay = 2

    for attempt in range(retries):
        try:
            resp = requests.post(API_URL, headers=headers, json=payload, timeout=120)

            if resp.status_code != 200:
                raise RuntimeError(resp.text)

            # OpenAI-compatible (API contract type) response shape 
            text = resp.json()["choices"][0]["message"]["content"]

            # Extract JSON object from model output (in case of extra text)
            start = text.find("{")
            end = text.rfind("}") + 1
            if start == -1 or end == 0:
                return None

            clean = text[start:end]
            return json.loads(clean)

        except Exception as e:
            if attempt == retries - 1:
                print("Call failed:", e)
                return None

            time.sleep(delay)
            delay *= 2

# main
def main():
    if not os.path.exists(INPUT_FILE):
        raise FileNotFoundError(f"Input file not found: {INPUT_FILE}")

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        seeds = json.load(f)

    start_idx = 0
    if os.path.exists(CHECKPOINT_FILE):
        try:
            start_idx = int(open(CHECKPOINT_FILE).read().strip())
        except:
            start_idx = 0

    print(f"Starting dataset generation using {MODEL_NAME}")
    print(f"Resuming from index: {start_idx}")

    for i in tqdm(range(start_idx, len(seeds))):
        item = seeds[i]

        prompt = route_prompt(item)
        if prompt is None:
            print(f"Skipping index {i}: unknown family")
            continue

        data = call_model(prompt)

        if data and "results" in data:
            with open(OUTPUT_FILE, "a", encoding="utf-8") as out:
                for obj in data["results"]:
                    out.write(json.dumps(obj, ensure_ascii=False) + "\n")
                    out.flush()

            with open(CHECKPOINT_FILE, "w") as ck:
                ck.write(str(i + 1))

        time.sleep(REQUEST_DELAY)

    print("Bhayo finally!! Hurray!!!")

if __name__ == "__main__":
    main()