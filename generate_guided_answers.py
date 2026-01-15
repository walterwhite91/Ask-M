import google.generativeai as genai
import json
import os
from tqdm import tqdm
import time

# --- CONFIGURATION ---
# IMPORTANT: Set your Gemini API key as an environment variable before running the script.
# For example, in your terminal: export GEMINI_API_KEY="YOUR_API_KEY_HERE"
API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("Gemini API key not found. Please set the GEMINI_API_KEY environment variable.")
# You can swap this with other compatible models, e.g., "gemini-1.5-flash"
MODEL_NAME = "gemini-1.0-pro"
INPUT_FILENAME = 'structured_dataset.json'
OUTPUT_FILENAME = 'guided_dataset.json' # Save to a new file to preserve the original
SAVE_INTERVAL = 10  # Save progress every 10 items

# --- Initialize Model ---
genai.configure(api_key=API_KEY)

generation_config = {"temperature": 0.8, "top_p": 1, "top_k": 1, "max_output_tokens": 2048}
safety_settings = [
  {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
  {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
  {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
  {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]
model = genai.GenerativeModel(model_name=MODEL_NAME, generation_config=generation_config, safety_settings=safety_settings)

def generate_guided_answer(question, exam_answer, subject):
    """Generates a conversational 'Guided Mode' answer using the specified model."""
    prompt = f"""
    **Task:** Transform a direct, exam-focused answer into a conversational, peer-like "Guided Mode" explanation.

    **Instructions:**
    1.  Read the exam question and the provided "Exam Mode" answer.
    2.  Rewrite the answer in a friendly, encouraging, and conversational tone, as if you were a classmate explaining it.
    3.  Focus on building conceptual understanding. Break down complex ideas into simpler parts.
    4.  Instead of just giving the answer, try to guide the user towards it. Use questions to prompt thinking (Socratic method).
    5.  Start with a friendly opening, like "Hey, let's break this down!" or "That's a great question."

    **Subject:** {subject}
    **Original Question:** "{question}"
    **Exam Mode Answer:** "{exam_answer}"

    **Generated "Guided Mode" Answer:**
    """
    try:
        for attempt in range(3): # Retry logic
            try:
                response = model.generate_content(prompt)
                return response.text.strip()
            except Exception as e:
                print(f"API call failed on attempt {attempt + 1}: {e}")
                time.sleep(5 * (attempt + 1))
        return "Error: Could not generate guided answer after multiple retries."
    except Exception as e:
        return f"Error: An unexpected error occurred: {e}"

def main():
    """Main function to generate guided answers and save them to a new file."""
    try:
        with open(INPUT_FILENAME, 'r', encoding='utf-8') as f:
            dataset = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        print(f"Error: `{INPUT_FILENAME}` not found or is invalid. Please run the parsing script first.")
        return

    items_to_process = [item for item in dataset if not item.get("guided_mode_answer")]

    if not items_to_process:
        print("All questions already have guided answers. If you want to regenerate, clear the 'guided_mode_answer' field in the JSON.")
        return

    print(f"Found {len(items_to_process)} questions needing guided answers.")

    for i, item in enumerate(tqdm(items_to_process, desc="Generating Guided Answers")):
        guided_answer = generate_guided_answer(item['question'], item['exam_mode_answer'], item['subject'])
        item['guided_mode_answer'] = guided_answer
        time.sleep(1)

        if (i + 1) % SAVE_INTERVAL == 0:
            with open(OUTPUT_FILENAME, 'w', encoding='utf-8') as f:
                json.dump(dataset, f, indent=2, ensure_ascii=False)

    # Final save
    with open(OUTPUT_FILENAME, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)

    print(f"\\nProcessing complete. The updated dataset has been saved to `{OUTPUT_FILENAME}`.")

if __name__ == "__main__":
    main()
