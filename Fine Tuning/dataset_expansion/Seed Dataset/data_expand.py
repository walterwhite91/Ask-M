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
    effective_marks = max(item["mark"], 4)

    return f"""
You are generating study material for Kathmandu University programming students.

SUBJECT: {item['subject']}
SEMESTER: {item['semester']}
MARKS: {item['mark']} (treat as {effective_marks} for structure)

QUESTION:
{item['question']}

CRITICAL:
- Every tag listed below MUST appear exactly once.
- If something is not applicable, write "N/A".
- Do NOT output anything outside the tags.
- Do NOT use JSON.

SPECIAL RULE — COMPARISON QUESTIONS:
- If the question asks to compare, differentiate, distinguish, or find differences,
  THEN the EXAM_MODE answer MUST be in a TABLE.
- The table must have clear column headers.
- Use plain text table format (rows and columns using | or tabs).
- Do NOT write comparison answers in paragraph form.

----------EXAM MODE----------
Write the answer exactly as a KU student would write in exams.

Rules:
- Optimize strictly for {item['mark']} marks.
- Correctness > verbosity.
- Use C / C++ syntax where applicable/asked, else other languages like python is allowed
- Include code ONLY if marks justify it.
- If comparison-type question → TABLE FORMAT MANDATORY.

----------GUIDED MODE----------
Explain the same concept at Beginner → Intermediate level.

Rules:
- Explain the idea first, then syntax.
- Break logic into clear steps.
- Assume the student is learning this for the first time.

----------FOLLOW-UP QUESTIONS----------
Exam follow-up:
- ONE question only.
- More complex OR next syllabus topic.

Guided follow-up:
- THREE questions:
  1. What problem does this concept solve?
  2. What are the main components / flow?
  3. How does it work in an actual program?

----------OUTPUT FORMAT (STRICT TAGS)----------
<RESULT>

<EXAM_MODE>
... exam-style answer (TABLE if comparison) ...
</EXAM_MODE>

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
Exactly 4–6 syllabus-level technical terms, comma-separated.
</KEYWORDS>

</RESULT>
"""

def get_prompt_design(item):
    effective_marks = max(item["mark"], 6)

    return f"""
You are generating study material for Kathmandu University engineering drawing / design students.

SUBJECT: {item['subject']}
SEMESTER: {item['semester']}
MARKS: {item['mark']} (treat as {effective_marks} for structure)
PAPER TYPE: {item.get('paper_type', 'N/A')}
SECTION: {item.get('section', 'N/A')}

QUESTION:
{item['question']}

CRITICAL:
- Every tag listed below MUST appear exactly once.
- If something is not applicable, write "N/A".
- Do NOT output anything outside the tags.
- Do NOT draw diagrams.

SPECIAL RULE — COMPARISON QUESTIONS:
- If the question asks to compare, differentiate, distinguish, or find differences,
  THEN the EXAM_MODE answer MUST be written in TABULAR FORM.
- Use clear column headings.
- Do NOT explain comparisons in paragraph form in exam mode.

----------EXAM MODE----------
Write exactly as a KU student would write in exams.

Rules:
- Optimize strictly for {item['mark']} marks.
- Structured, step-by-step or tabular format.
- Use proper engineering terminology.
- If comparison-type question → TABLE FORMAT MANDATORY.

----------GUIDED MODE----------
Explain the same task at Beginner → Intermediate level.

Rules:
- Explain the purpose first.
- Then explain steps, rules, or conventions.
- Guided mode may be longer than exam mode.

----------FOLLOW-UP QUESTIONS----------
Exam follow-up:
- ONE question only.
- More complex OR next syllabus task.

Guided follow-up:
- THREE questions:
  1. Why is this concept / rule important?
  2. What are the main conventions or standards?
  3. How is it applied in exams or practice?

----------OUTPUT FORMAT (STRICT TAGS)----------
<RESULT>

<EXAM_MODE>
... exam-style steps OR TABLE if comparison ...
</EXAM_MODE>

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
Exactly 4–6 syllabus-level technical terms, comma-separated.
</KEYWORDS>

</RESULT>
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

# ---------------- TAG UTIL ----------------

def extract_tag(text, tag):
    m = re.search(fr"<{tag}>(.*?)</{tag}>", text, re.S)
    return m.group(1).strip() if m else None

# ---------------- MATH PARSERS ----------------

def parse_math_exam(text):
    exam = extract_tag(text, "EXAM_MODE")
    if exam:
        return exam.strip()

    fallback = text.strip()
    return fallback if len(fallback) > 50 else None

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
    return exam and len(exam.strip()) > 30

def is_valid_math_guided(parsed, mark):
    required = ["guided_mode_answer", "guided_f_question"]
    if mark >= 4:
        required.append("exam_f_question")
    return all(parsed.get(k) and parsed[k].strip() for k in required)

# ---------------- GENERIC TAG PARSER (PROGRAMMING / DESIGN) ----------------

def parse_tagged_result(text):
    keywords_raw = extract_tag(text, "KEYWORDS")

    return {
        "exam_mode_answer": extract_tag(text, "EXAM_MODE"),
        "exam_f_question": extract_tag(text, "EXAM_FOLLOWUP"),
        "guided_mode_answer": extract_tag(text, "GUIDED_MODE"),
        "guided_f_question": extract_tag(text, "GUIDED_FOLLOWUP"),
        "keywords": (
            [k.strip() for k in keywords_raw.split(",")]
            if keywords_raw else []
        )
    }

def is_valid_tagged(parsed):
    required = [
        "exam_mode_answer",
        "guided_mode_answer",
        "guided_f_question"
    ]
    return all(parsed.get(k) and parsed[k].strip() for k in required)

# ---------------- PROMPT ROUTING ----------------

def route_other_prompt(item):
    family = item.get("family")
    if family == "programming":
        return get_prompt_programming(item)
    if family == "design":
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
                exam_prompt = get_prompt_math_phys_exam(item)
                exam_raw = call_model(exam_prompt, MAX_TOKENS_EXAM)
                exam_answer = parse_math_exam(exam_raw)

                if not is_valid_math_exam(exam_answer):
                    raise ValueError("Math exam pass failed")

                guided_prompt = get_prompt_math_phys_guided(item, exam_answer)
                guided_raw = call_model(guided_prompt, MAX_TOKENS_GUIDED)
                guided = parse_math_guided(guided_raw)

                guided["keywords"] = guided.get("keywords") or []

                # Retry ONCE if guided fails
                if not is_valid_math_guided(guided, item["mark"]):
                    guided_raw = call_model(guided_prompt, MAX_TOKENS_GUIDED)
                    guided = parse_math_guided(guided_raw)
                    guided["keywords"] = guided.get("keywords") or []

                if not is_valid_math_guided(guided, item["mark"]):
                    raise ValueError("Math guided pass failed")

                final = {
                    "subject": item["subject"],
                    "question": item["question"],
                    "marks": item["mark"],
                    "exam_mode_answer": exam_answer,
                    "exam_f_question": guided.get("exam_f_question"),
                    "guided_mode_answer": guided["guided_mode_answer"],
                    "guided_f_question": guided["guided_f_question"],
                    "keywords": guided["keywords"]
                }

            # ========== PROGRAMMING / DESIGN ==========
            else:
                prompt = route_other_prompt(item)
                if not prompt:
                    raise ValueError("Unknown family")

                raw = call_model(prompt, MAX_TOKENS_GUIDED)
                parsed = parse_tagged_result(raw)

                parsed["keywords"] = parsed.get("keywords") or []

                if not is_valid_tagged(parsed):
                    raise ValueError("Tagged output parse failed")

                final = {
                    "subject": item["subject"],
                    "question": item["question"],
                    "marks": item["mark"],
                    "exam_mode_answer": parsed["exam_mode_answer"],
                    "exam_f_question": parsed["exam_f_question"],
                    "guided_mode_answer": parsed["guided_mode_answer"],
                    "guided_f_question": parsed["guided_f_question"],
                    "keywords": parsed["keywords"]
                }

            # ---- WRITE OUTPUT ----
            with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(final, ensure_ascii=False) + "\n")

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