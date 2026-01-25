# export DEEPSEEK_API_KEY="sk-..." before running

import os
import json
import time
import re
import requests
from tqdm import tqdm

# ---------------- CONFIG ----------------

MODEL_NAME = "deepseek-chat" # currently using DeepSeek v3.2 chat model (non-thinking), not using reasoning as its note required. Also explicitly using deepseek as its trained on STEM datasets and its cheap
API_URL = "https://api.deepseek.com/chat/completions"

INPUT_FILE = "merged_dataset.json"
OUTPUT_FILE = "expanded_dataset.jsonl"
FAILED_FILE = "failed_seeds.json"
CHECKPOINT_FILE = "checkpoint.txt"

MAX_TOKENS_EXAM = 1200
MAX_TOKENS_GUIDED = 1000
TEMPERATURE = 0.2
REQUEST_DELAY = 1.5

API_KEY = os.environ.get("DEEPSEEK_API_KEY")
if not API_KEY:
    raise RuntimeError("DEEPSEEK_API_KEY not found in environment")

# ---------------- PROMPT PLACEHOLDERS ----------------

def get_prompt_math_phys_exam(item):
    effective_marks = max(item["mark"], 4)

    return f"""
You are answering a Kathmandu University engineering exam question.

SUBJECT: {item['subject']}
SEMESTER: {item['semester']}
MARKS: {item['mark']}

QUESTION:
{item['question']}

INSTRUCTIONS:
- Write ONLY the exam answer.
- Do NOT include headings, tags, metadata, or explanations.
- Do NOT mention assumptions unless required for marks.
- Optimize strictly for {item['mark']} marks.
- Typical length: ~{effective_marks * 35} words (±20%).
- Use derivation-style flow where applicable:
  Here, its given that,
  We know,
  Now, by the definition of,
  Substituting,
  Similarly / Then,
  We get,
  Hence,

IMPORTANT:
- Output ONLY the answer text.
- Do NOT add anything before or after.
"""

def get_prompt_math_phys_guided(item, exam_answer):
    return f"""
You are generating guided study material based on an exam answer.

SUBJECT: {item['subject']}
SEMESTER: {item['semester']}
QUESTION:
{item['question']}

EXAM ANSWER (for reference):
{exam_answer}

CRITICAL:
- Every tag below MUST appear exactly once.
- Do NOT output anything outside the tags.
- If something is not applicable, write "N/A".

TASKS:
1. Explain the concept at Beginner → Intermediate level.
2. Generate ONE exam follow-up question.
3. Generate THREE guided follow-up questions.
4. Extract 4–6 syllabus-level technical keywords.

----------OUTPUT FORMAT----------
<RESULT>

<EXAM_FOLLOWUP>
...
</EXAM_FOLLOWUP>

<GUIDED_MODE>
...
</GUIDED_MODE>

<GUIDED_FOLLOWUP>
1. ...
2. ...
3. ...
</GUIDED_FOLLOWUP>

<KEYWORDS>
term1, term2, term3, term4
</KEYWORDS>

</RESULT>
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
- Output ONLY valid JSON object.
- Keywords must match syllabus language.
- Newlines inside strings are allowed.
- Do NOT include markdown.
- Do NOT include text outside JSON.
"""


# ---------------- MODEL CALL ----------------

def call_model(prompt, max_tokens):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": TEMPERATURE,
        "max_tokens": max_tokens
    }

    resp = requests.post(API_URL, headers=headers, json=payload, timeout=120)
    if resp.status_code != 200:
        raise RuntimeError(resp.text)

    return resp.json()["choices"][0]["message"]["content"]

# ---------------- TAG PARSERS (MATH) ----------------

def extract_tag(text, tag):
    m = re.search(fr"<{tag}>(.*?)</{tag}>", text, re.S)
    return m.group(1).strip() if m else None

def parse_math_exam(text):
    # First try strict tag
    exam = extract_tag(text, "EXAM_MODE")
    if exam:
        return exam.strip()

    # Fallback: treat entire output as exam answer
    cleaned = text.strip()
    if len(cleaned) > 50:
        return cleaned

    return None

def parse_math_guided(text):
    keywords_raw = extract_tag(text, "KEYWORDS")

    return {
        "guided_mode_answer": extract_tag(text, "GUIDED_MODE"),
        "guided_f_question": extract_tag(text, "GUIDED_FOLLOWUP"),
        "exam_f_question": extract_tag(text, "EXAM_FOLLOWUP"),
        "keywords": (
            [k.strip() for k in keywords_raw.split(",")]
            if keywords_raw else []
        )
    }

def is_valid_math_exam(exam):
    return exam is not None and len(exam.strip()) > 30

def is_valid_math_guided(parsed, mark):
    required = ["guided_mode_answer", "guided_f_question"]

    # exam follow-up required only for >= 4 marks
    if mark >= 4:
        required.append("exam_f_question")

    return all(parsed.get(k) and parsed.get(k).strip() for k in required)

# ---------------- JSON PARSER (OTHERS) ----------------

def try_parse_json(raw_text):
    try:
        return json.loads(raw_text)
    except:
        pass

    start = raw_text.find("{")
    end = raw_text.rfind("}") + 1
    if start == -1 or end <= start:
        return None

    cleaned = raw_text[start:end]
    cleaned = cleaned.replace("“", "\"").replace("”", "\"")
    cleaned = cleaned.replace(",}", "}")

    try:
        return json.loads(cleaned)
    except:
        return None

# ---------------- PROMPT ROUTING ----------------

def route_other_prompt(item):
    family = item.get("family")
    if family == "programming":
        return get_prompt_programming(item)
    elif family == "design":
        return get_prompt_design(item)
    return None


# ---------------- MAIN ----------------

def main():
    seeds = json.load(open(INPUT_FILE))
    failed = []

    start_idx = int(open(CHECKPOINT_FILE).read()) if os.path.exists(CHECKPOINT_FILE) else 0

    print(f"Starting dataset generation using {MODEL_NAME}")
    print(f"Resuming from index: {start_idx}")

    for i in tqdm(range(start_idx, len(seeds))):
        item = seeds[i]

        try:
            family = item.get("family")

            # ========== TWO-PASS MATH ==========
            if family == "math_phys":
                # ---- Pass 1: Exam answer only ----
                exam_prompt = get_prompt_math_phys_exam(item)
                exam_raw = call_model(exam_prompt, MAX_TOKENS_EXAM)
                exam_answer = parse_math_exam(exam_raw)

                if not is_valid_math_exam(exam_answer):
                    raise ValueError("Math exam pass failed")

                # ---- Pass 2: Guided + followups + keywords ----
                guided_prompt = get_prompt_math_phys_guided(item, exam_answer)
                guided_raw = call_model(guided_prompt, MAX_TOKENS_GUIDED)
                guided = parse_math_guided(guided_raw)

                if not guided.get("keywords"):
                    guided["keywords"] = []

                if not is_valid_math_guided(guided, item["mark"]):
                    guided_raw = call_model(guided_prompt, MAX_TOKENS_GUIDED)
                    guided = parse_math_guided(guided_raw)

                    if not guided.get("keywords"):
                        guided["keywords"] = []

                if not is_valid_math_guided(guided, item["mark"]):
                    raise ValueError("Math guided pass failed")


                final = {
                    "subject": item["subject"],
                    "question": item["question"],
                    "marks": item["mark"],
                    "exam_mode_answer": exam_answer,
                    "exam_f_question": guided["exam_f_question"],
                    "guided_mode_answer": guided["guided_mode_answer"],
                    "guided_f_question": guided["guided_f_question"],
                    "keywords": guided["keywords"]
                }

            # ========== SINGLE-PASS OTHERS ==========
            else:
                prompt = route_other_prompt(item)
                if not prompt:
                    raise ValueError("Unknown family")

                raw = call_model(prompt, MAX_TOKENS_GUIDED)
                final = try_parse_json(raw)

                if not final:
                    raise ValueError("JSON parse failed")

            # ---- Write output ----
            with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(final, ensure_ascii=False) + "\n")

            # ---- Checkpoint only on success ----
            with open(CHECKPOINT_FILE, "w") as ck:
                ck.write(str(i + 1))

        except Exception as e:
            failed.append({
                "index": i,
                "seed": item,
                "error": str(e)
            })

        time.sleep(REQUEST_DELAY)

    if failed:
        json.dump(failed, open(FAILED_FILE, "w"), indent=2, ensure_ascii=False)

    print("Bhayo finally!! Hurray!!!")


if __name__ == "__main__":
    main()
