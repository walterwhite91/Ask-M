import json
import re

def parse_from_raw_text(filepath):
    """
    A robust, line-by-line parser for the raw questions text file.
    This version avoids complex regex splitting and uses a simple state machine.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    dataset = []
    current_subject = None
    current_entry = {}

    def save_entry(entry):
        """Cleans and saves a completed Q&A entry."""
        if entry and entry.get('question') and entry.get('exam_mode_answer'):
            # Extract marks
            question_text = entry['question']
            marks = 0
            marks_match = re.search(r'\[\s*([\d\+]+)\s*mark[s]?\s*\]', question_text, re.IGNORECASE)
            if marks_match:
                marks_str = marks_match.group(1)
                marks = sum(map(int, marks_str.split('+'))) if '+' in marks_str else int(marks_str)
                question_text = question_text.replace(marks_match.group(0), '').strip()

            entry['question'] = question_text.strip()
            entry['marks'] = marks
            entry['exam_mode_answer'] = entry['exam_mode_answer'].strip()
            dataset.append(entry)

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Check for a new subject
        subject_match = re.match(r'^\*?\*?([A-Z][A-Z\s]+\d{3})\*?\*?$', line)
        if subject_match:
            current_subject = subject_match.group(1).strip()
            continue

        # Check for a new question
        if line.lower().startswith('**q:**') or line.lower().startswith('q:') or re.match(r'^q\d*\.', line.lower()):
            save_entry(current_entry) # Save the previous entry
            current_entry = {
                "subject": current_subject,
                "question": line.replace('**Q:**', '').strip(),
                "exam_mode_answer": "",
                "guided_mode_answer": "",
                "context": ""
            }
        # Check for a new answer
        elif line.lower().startswith('**a:**') or line.lower().startswith('a:') or line.lower().startswith('answer:') or line.lower().startswith('solution:'):
            # Remove prefix
            answer_text = re.sub(r'^(\*\*a:|a:|answer:|solution:)\s*', '', line, flags=re.IGNORECASE)
            if 'exam_mode_answer' in current_entry:
                current_entry['exam_mode_answer'] = answer_text
        # Append to the existing answer (for multi-line answers)
        elif current_entry and 'exam_mode_answer' in current_entry and current_entry['exam_mode_answer']:
             current_entry['exam_mode_answer'] += '\\n' + line
        # Append to a multi-line question
        elif current_entry and 'question' in current_entry:
            current_entry['question'] += '\\n' + line


    save_entry(current_entry) # Save the last entry in the file

    return dataset

if __name__ == '__main__':
    data = parse_from_raw_text('raw_questions.txt')
    with open('structured_dataset.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Successfully parsed {len(data)} questions.")
    if data:
        subjects_found = sorted(list(set(d['subject'] for d in data)))
        print(f"Found subjects: {subjects_found}")

        print("\\n--- Sample entry with preserved formatting ---")
        # Find an example with a multi-line answer to verify
        sample = next((d for d in data if '\\n' in d.get('exam_mode_answer', '')), data[0])
        print(json.dumps(sample, indent=2, ensure_ascii=False))
