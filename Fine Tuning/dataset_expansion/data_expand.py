#export DEEPSEEK_API_KEY="sk-..." in your environment before running
import os
import json
import time
import requests
from tqdm import tqdm

# conf
MODEL_NAME = "deepseek-chat"  # currently using DeepSeek v3.2 chat model (non-thinking), not using reasoning as its note required. Also explicitly using deepseek as its trained on STEM datasets and its cheap

INPUT_FILE = "test_merged_dataset.json"
OUTPUT_FILE = "test_expanded_dataset.jsonl"
FAILED_FILE = "failed_seeds.json"
CHECKPOINT_FILE = "test_checkpoint.txt"

MAX_TOKENS = 1400
TEMPERATURE = 0.2
REQUEST_DELAY = 1.5

API_URL = "https://api.deepseek.com/chat/completions"

API_KEY = os.environ.get("DEEPSEEK_API_KEY")
if not API_KEY:
    raise RuntimeError("DEEPSEEK_API_KEY not found in environment")

# prompt based on family
def get_prompt_math_phys(item):
    return f"""
You are generating a Kathmandu University exam answer AND a guided tutoring answer.

Subject: {item['subject']}
Semester: {item['semester']}
Marks: {item['mark']}

Question:
{item['question']}

----------IMPORTANT OUTPUT RULES----------
- Output MUST be valid JSON only.
- All new lines inside strings MUST be written as \\n (do not use raw line breaks).
- Do NOT include unescaped double quotes inside any string value.
- Do NOT add any text outside the JSON object.

----------EXAM MODE INSTRUCTIONS----------
- STRICTLY optimize for {item['mark']} marks.
- Write exactly how a KU student would write in exams.
- Avoid unnecessary theory or beautification.
- Mention assumptions ONLY if they earn marks.
- Diagrams cannot be drawn; describe only if unavoidable.

For numericals / derivations:
- Step-by-step solution is mandatory.
- Use the following keywords ONLY when natural:
  "Here, its given that,"
  "We know,"
  "Now, by the definition of,"
  "Substituting,"
  "Similarly,"
  "Then,"
  "We get,"
  "Hence,"
- Skip any keyword if it feels forced.

----------GUIDED MODE INSTRUCTIONS----------
- Level: Beginner → Intermediate.
- Explain physical intuition FIRST, math later.
- Break the explanation into small logical steps.
- It is okay to repeat ideas in simpler words.
- Guided mode may be longer than exam mode.

----------FOLLOW-UP QUESTIONS----------
Exam follow-up:
- Generate EXACTLY ONE question.
- It must be more complex OR from the next syllabus topic.

----------Guided follow-up:----------
- Generate EXACTLY THREE questions:
  1. Check understanding of the core principle.
  2. Identify key variables / assumptions.
  3. Bridge intuition to mathematics.

----------OUTPUT FORMAT (STRICT JSON ONLY)----------
{{
  "results": [{{
    "subject": "{item['subject']}",
    "question": "{item['question']}",
    "keywords": ["..."],
    "marks": {item['mark']},

    "exam_mode_answer": "...",

    "exam_f_question": "...",

    "guided_mode_answer": "...",

    "guided_f_question": "1. ...\\n2. ...\\n3. ..."
  }}]
}}

Rules:
- Output ONLY valid JSON.
- No markdown outside JSON.
- Keywords must match syllabus wording.
"""


def get_prompt_programming(item):
    return f"""
You are generating a Kathmandu University programming exam answer AND a guided tutoring answer.

Subject: {item['subject']}
Semester: {item['semester']}
Marks: {item['mark']}

Question:
{item['question']}

----------EXAM MODE INSTRUCTIONS----------

- STRICTLY optimize for {item['mark']} marks.
- Write as a KU student would in exams.
- Correctness > verbosity.
- Avoid unnecessary theory.
- Use C/C++ syntax where applicable.
- Include examples ONLY if marks justify it.

----------GUIDED MODE INSTRUCTIONS----------

- Level: Beginner → Intermediate.
- Explain the idea first, then syntax.
- Break logic into small steps.
- Avoid assuming deep prior knowledge.
- Guided mode may be longer than exam mode.

----------FOLLOW-UP QUESTIONS----------

Exam follow-up:
- Generate EXACTLY ONE question.
- More complex OR next syllabus topic.

Guided follow-up:
- Generate EXACTLY THREE questions:
  1. What problem does this concept solve?
  2. What are the main components / flow?
  3. How does it work in an actual program?

----------OUTPUT FORMAT (STRICT JSON ONLY)----------
{{
  "results": [{{
    "subject": "{item['subject']}",
    "question": "{item['question']}",
    "keywords": ["..."],
    "marks": {item['mark']},

    "exam_mode_answer": "...",

    "exam_f_question": "...",

    "guided_mode_answer": "...",

    "guided_f_question": "1. ...\\n2. ...\\n3. ..."
  }}]
}}

Rules:
- Output ONLY valid JSON.
- No markdown outside JSON.
- Keywords must align with syllabus terminology.
"""

def get_prompt_design(item):
    return f"""
You are generating a Kathmandu University exam answer AND a guided tutoring answer.

Subject: {item['subject']}
Semester: {item['semester']}
Marks: {item['mark']}
Paper Type: {item.get('paper_type', 'unknown')}
Section: {item.get('section', 'unknown')}

Question:
{item['question']}

----------EXAM MODE INSTRUCTIONS----------
- STRICTLY optimize for {item['mark']} marks.
- Write exactly as a KU student would in exams.
- Be structured and concise.
- Do NOT attempt to draw diagrams.
- Explain steps, standards, or conventions instead.

----------GUIDED MODE INSTRUCTIONS----------
- Level: Beginner → Intermediate.
- Explain the purpose first, then the procedure.
- Break explanations into clear steps.
- Avoid unnecessary technical depth.

----------FOLLOW-UP QUESTIONS----------
Exam follow-up:
- Generate EXACTLY ONE question.
- More complex OR next syllabus task.

----------Guided follow-up:----------
- Generate EXACTLY THREE questions:
  1. Why is this concept / step important?
  2. What are the main rules or conventions?
  3. How is it applied in practice or exams?

----------OUTPUT FORMAT (STRICT JSON ONLY)----------
{{
  "results": [{{
    "subject": "{item['subject']}",
    "question": "{item['question']}",
    "keywords": ["..."],
    "marks": {item['mark']},

    "exam_mode_answer": "...",

    "exam_f_question": "...",

    "guided_mode_answer": "...",

    "guided_f_question": "1. ...\\n2. ...\\n3. ..."
  }}]
}}

Rules:
- Output ONLY valid JSON.
- No markdown outside JSON.
- Keywords must match syllabus language.
"""

def route_prompt(item):
    family = item.get("family")
    if family == "math_phys":
        return get_prompt_math_phys(item)
    elif family == "programming":
        return get_prompt_programming(item)
    elif family == "design":
        return get_prompt_design(item)
    return None

# ---------------- MINIMAL JSON REPAIR ----------------

def try_parse_json(raw_text):
    """
    Minimal, SAFE repair attempts only.
    Returns dict or None.
    """
    try:
        return json.loads(raw_text)
    except:
        pass

    # trim to outer JSON
    start = raw_text.find("{")
    end = raw_text.rfind("}") + 1
    if start == -1 or end <= start:
        return None

    cleaned = raw_text[start:end]

    # minimal sanitation
    cleaned = cleaned.replace("“", "\"").replace("”", "\"")
    cleaned = cleaned.replace(",\n}", "\n}")
    cleaned = cleaned.replace(",}", "}")

    try:
        return json.loads(cleaned)
    except:
        return None

# ---------------- MODEL CALL ----------------

def call_model(prompt, retries=3):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": TEMPERATURE,
        "max_tokens": MAX_TOKENS
    }

    delay = 2

    for attempt in range(retries):
        try:
            resp = requests.post(API_URL, headers=headers, json=payload, timeout=120)

            if resp.status_code != 200:
                raise RuntimeError(resp.text)

            text = resp.json()["choices"][0]["message"]["content"]
            parsed = try_parse_json(text)

            if parsed:
                return parsed

            raise ValueError("JSON parse failed")

        except Exception as e:
            if attempt == retries - 1:
                return {"__error__": str(e)}
            time.sleep(delay)
            delay *= 2

# ---------------- MAIN ----------------

def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        seeds = json.load(f)

    start_idx = 0
    if os.path.exists(CHECKPOINT_FILE):
        try:
            start_idx = int(open(CHECKPOINT_FILE).read().strip())
        except:
            pass

    print(f"Starting dataset generation using {MODEL_NAME}")
    print(f"Resuming from index: {start_idx}")

    failed = []

    for i in tqdm(range(start_idx, len(seeds))):
        item = seeds[i]
        prompt = route_prompt(item)

        if not prompt:
            failed.append({"index": i, "seed": item, "error": "Unknown family"})
            continue

        result = call_model(prompt)

        if "__error__" in result or "results" not in result:
            failed.append({
                "index": i,
                "seed": item,
                "error": result.get("__error__", "Invalid output")
            })
            continue

        # write output
        with open(OUTPUT_FILE, "a", encoding="utf-8") as out:
            for obj in result["results"]:
                out.write(json.dumps(obj, ensure_ascii=False) + "\n")

        # checkpoint only on success
        with open(CHECKPOINT_FILE, "w") as ck:
            ck.write(str(i + 1))

        time.sleep(REQUEST_DELAY)

    # save failed seeds
    if failed:
        with open(FAILED_FILE, "w", encoding="utf-8") as f:
            json.dump(failed, f, indent=2, ensure_ascii=False)

    print("Bhayo finally!! Hurray!!!")
    print(f"Failed items saved to {FAILED_FILE}")

if __name__ == "__main__":
    main()