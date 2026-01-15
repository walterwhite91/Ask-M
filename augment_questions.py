import google.generativeai as genai
import json
import os
from tqdm import tqdm
import time
import copy

# --- CONFIGURATION ---
# IMPORTANT: Set your Gemini API key as an environment variable before running the script.
# For example, in your terminal: export GEMINI_API_KEY="YOUR_API_KEY_HERE"
API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("Gemini API key not found. Please set the GEMINI_API_KEY environment variable.")
# You can swap this with other compatible models, e.g., "gemini-1.5-flash"
MODEL_NAME = "gemini-1.0-pro"
# Use the output from the previous step as input here.
INPUT_FILENAME = 'guided_dataset.json'
OUTPUT_FILENAME = 'augmented_dataset.json' # Final augmented dataset
NUM_VARIATIONS = 2 # Number of new questions to generate for each original question

# --- Initialize Model ---
genai.configure(api_key=API_KEY)

generation_config = {"temperature": 0.9, "top_p": 1, "top_k": 1, "max_output_tokens": 2048}
safety_settings = [
  {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
  {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
  {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
  {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]
model = genai.GenerativeModel(model_name=MODEL_NAME, generation_config=generation_config, safety_settings=safety_settings)

def generate_question_variations(question, subject, num_variations):
    """Generates alternative phrasings for a given question."""
    prompt = f"""
    **Task:** Generate {num_variations} distinct variations of an exam question.

    **Instructions:**
    1.  Rewrite the original question in different ways a student might ask it.
    2.  Maintain the core meaning and intent of the original question.
    3.  Vary the sentence structure and vocabulary.
    4.  Output each new question on a new line, and *only* output the questions. Do not add prefixes like "1." or "Q:".

    **Subject:** {subject}
    **Original Question:** "{question}"

    **Generated Variations:**
    """
    try:
        for attempt in range(3): # Retry logic
            try:
                response = model.generate_content(prompt)
                variations = [v.strip() for v in response.text.strip().split('\\n') if v.strip()]
                return variations[:num_variations] # Ensure we only return the requested number
            except Exception as e:
                print(f"API call failed on attempt {attempt + 1}: {e}")
                time.sleep(5 * (attempt + 1))
        return [] # Return empty list on failure
    except Exception as e:
        print(f"Error: An unexpected error occurred: {e}")
        return []

def main():
    """Main function to augment questions and create the final dataset."""
    try:
        with open(INPUT_FILENAME, 'r', encoding='utf-8') as f:
            original_dataset = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        print(f"Error: `{INPUT_FILENAME}` not found or is invalid. Make sure you have run the previous scripts.")
        return

    augmented_dataset = []

    print(f"Augmenting {len(original_dataset)} questions...")

    for item in tqdm(original_dataset, desc="Augmenting Questions"):
        # Add the original question to the new dataset
        original_item = copy.deepcopy(item)
        augmented_dataset.append(original_item)

        # Generate and add variations
        variations = generate_question_variations(item['question'], item['subject'], NUM_VARIATIONS)
        for variation in variations:
            new_item = copy.deepcopy(item)
            new_item['question'] = variation
            augmented_dataset.append(new_item)
        time.sleep(1)

    with open(OUTPUT_FILENAME, 'w', encoding='utf-8') as f:
        json.dump(augmented_dataset, f, indent=2, ensure_ascii=False)

    print(f"\\nAugmentation complete. The new dataset has {len(augmented_dataset)} entries.")
    print(f"The final dataset has been saved to `{OUTPUT_FILENAME}`.")

if __name__ == "__main__":
    main()
