import json
from tqdm import tqdm

# --- CONFIGURATION ---
INPUT_FILENAME = 'structured_dataset.json'
OUTPUT_FILENAME = 'finetuning_dataset.jsonl'

def create_finetuning_prompt(subject, question, marks, answer, mode):
    """Creates a structured prompt for a given Q&A pair and mode."""
    if mode == "exam":
        instruction = "You are an expert AI tutor for Kathmandu University. Your task is to provide a concise, exam-focused answer to the following question, paying close attention to the allocated marks."
    else: # mode == "guided"
        instruction = "You are a friendly AI peer tutor for Kathmandu University. Your task is to provide a conversational, Socratic-style explanation to help a student understand the following concept."

    prompt = f"<s>[INST] {instruction}\\n\\n**Subject:** {subject}\\n**Question:** {question}\\n**Marks:** {marks} [/INST]\\n{answer} </s>"
    return {"text": prompt}

def main():
    """Main function to transform the dataset into a fine-tuning format."""
    try:
        with open(INPUT_FILENAME, 'r', encoding='utf-8') as f:
            dataset = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        print(f"Error: `{INPUT_FILENAME}` not found or is invalid. Please run the parsing script first.")
        return

    # Start with a clean file
    with open(OUTPUT_FILENAME, 'w', encoding='utf-8') as f:
        pass

    finetuning_entry_count = 0
    with open(OUTPUT_FILENAME, 'a', encoding='utf-8') as f:
        for item in tqdm(dataset, desc="Preparing Data for Fine-tuning"):
            # Process exam-mode answer
            if item.get("exam_mode_answer"):
                prompt_obj = create_finetuning_prompt(
                    item['subject'], item['question'], item['marks'], item['exam_mode_answer'], "exam"
                )
                f.write(json.dumps(prompt_obj) + '\\n')
                finetuning_entry_count += 1

            # Process guided-mode answer
            if item.get("guided_mode_answer") and "Error" not in item.get("guided_mode_answer"):
                prompt_obj = create_finetuning_prompt(
                    item['subject'], item['question'], item['marks'], item['guided_mode_answer'], "guided"
                )
                f.write(json.dumps(prompt_obj) + '\\n')
                finetuning_entry_count += 1

    print(f"\\nSuccessfully prepared {finetuning_entry_count} entries for fine-tuning.")
    print(f"Dataset saved to `{OUTPUT_FILENAME}`.")

    # Verify by reading the first line
    with open(OUTPUT_FILENAME, 'r', encoding='utf-8') as f:
        first_line = f.readline()
        try:
            sample_entry = json.loads(first_line)
            print("\\n--- Sample entry from the fine-tuning dataset ---")
            print(sample_entry.get('text', 'Sample text not found.'))
        except (json.JSONDecodeError, IndexError):
            print("Could not read or decode the first line of the output file.")

if __name__ == "__main__":
    main()
