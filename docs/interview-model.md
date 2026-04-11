# Interview Model — Study Guide

> This document explains the interview domain models the way you actually learned them.
> Every concept has a WHY, HOW, and WHY THIS WAY section.

---

## The Big Picture

The interview domain has **3 models** that work together:

```
User (1) ──────────────────── (many) Interview
                                        │
                        ┌───────────────┤
                        │               │
                   (many) Turn     (one) Feedback
```

Think of it like a **school exam system**:
- `Interview` = The exam session (who is taking it, what subject)
- `Turn` = Each individual question and answer on the exam
- `Feedback` = The final report card after the exam

---

## What is a Model?

A model is a **blueprint** — it tells the database exactly what an Interview looks like,
what fields it has, what types they are, and how it connects to other things.

**Without models (chaos):**
```python
interview1 = {"id": "123", "status": "done"}
interview2 = {"interview_id": "456", "state": "pending"}  # Different keys!
```

**With models (order):**
```python
# Every interview has the SAME structure — guaranteed!
interview = Interview(id=uuid4(), status=InterviewStatus.PENDING)
```

Models act as a **contract**: every interview MUST have these exact fields
with these exact types. No exceptions.

---

## Enums — The "Multiple Choice" System

### WHY do Enums exist?

Without enums, developers write whatever they want:
```python
interview.status = "pending"   # Developer 1
interview.status = "Pending"   # Developer 2 (capital P — bug!)
interview.status = "waiting"   # Developer 3 (different word — bug!)
interview.status = "pneding"   # Developer 4 (typo — bug!)
```

Enums are a **pre-made agreement**: you MUST pick from these options only.
Think of it like a multiple choice question — you can't write "banana" as an answer.

### HOW they work:

```python
class InterviewStatus(str, Enum):
    PENDING = "pending"
    READY   = "ready"

interview.status = InterviewStatus.PENDING  # ✅ Valid
interview.status = "banana"                 # ❌ Error — out of the agreement!
```

---

### `InterviewStatus` — Where is the interview in its lifecycle?

```
PENDING → PROCESSING_CV → READY → IN_PROGRESS → COMPLETED
                                        ↓
                                      FAILED (can happen from any state)
```

| Value | Plain English |
|---|---|
| `pending` | Just created, nothing has happened yet |
| `processing_cv` | AI is reading and analyzing the CV and JD |
| `ready` | Analysis done, candidate can start the interview |
| `in_progress` | Interview is live right now (WebSocket active) |
| `completed` | Interview is finished |
| `failed` | Something went wrong |

---

### `InterviewPhase` — What part of the interview are we in?

```
INTRO → BEHAVIORAL → TECHNICAL → DEEP_DIVE → CLOSING
```

| Value | Plain English |
|---|---|
| `intro` | Opening — "Tell me about yourself" type questions |
| `behavioral` | STAR-format — "Tell me about a time when..." |
| `technical` | Domain knowledge — "Explain async/await in Python" |
| `deep_dive` | Follow-up probes on strengths and weaknesses |
| `closing` | Wrap-up — candidate asks questions |

---

## Models

---

### `Interview`

Table: `interviews`

The **main session record**. Stores everything needed to run, pause, resume,
and review an interview. Think of it as the folder that holds the entire interview.

---

#### Fields

**Why UUID instead of 1, 2, 3?**
Integers are easy to guess (`user_id=1`, `user_id=2`...). A UUID like
`550e8400-e29b-41d4-a716-446655440000` is impossible to guess — much more secure.

| Column | Type | Required | Plain English |
|---|---|---|---|
| `id` | UUID | Yes | Unique ID for this interview — impossible to guess |
| `user_id` | UUID (FK → users) | Yes | Who owns this interview |
| `status` | String(20) | Yes | Where is this interview in its lifecycle? |
| `cv_raw_text` | Text | No | The full CV text exactly as uploaded |
| `cv_analysis` | JSON | No | AI's structured breakdown of the CV |
| `jd_raw_text` | Text | No | The full job description text |
| `jd_analysis` | JSON | No | AI's structured breakdown of the JD |
| `interview_config` | JSON | No | Settings: phases, question counts, difficulty |
| `target_role` | String(255) | No | Job title extracted from the JD |
| `target_company` | String(255) | No | Company name if mentioned in JD |
| `session_state` | JSON | No | Snapshot saved for crash recovery |
| `current_phase` | String(20) | No | Which phase is active right now |
| `current_turn` | Integer | Yes | How many turns have happened (0 = not started) |
| `completed_at` | DateTime | No | When did the interview finish? (None if not done yet) |
| `total_duration_seconds` | Float | No | Total time of the session in seconds |
| `created_at` | DateTime | Yes | Auto-set when record is created |
| `updated_at` | DateTime | Yes | Auto-updated every time record changes |

**Field type cheat sheet:**
- `String(20)` → Short text, max 20 characters (status, phase names)
- `String(255)` → Short text, max 255 characters (role title, company name)
- `Text` → Long text, unlimited (entire CV, entire JD)
- `JSON` → Structured nested data (skills, experience, config)
- `Integer` → Whole numbers (turn count: 1, 2, 3...)
- `Float` → Decimal numbers (duration: 1847.5 seconds, score: 87.3)
- `DateTime` → Timestamps (when created, when completed)

---

#### Why `completed_at` is Optional (nullable=True)

When an interview is first created, it hasn't been completed yet.
So `completed_at = None`. Only when the interview finishes does it get a timestamp.

```python
# Interview just created
interview.completed_at = None  # Not done yet — totally fine!

# Interview finished
interview.completed_at = datetime.now()  # Now it has a value
```

---

#### Foreign Key — `user_id`

```python
user_id = ForeignKey("users.id", ondelete="CASCADE")
```

`ForeignKey` enforces: "This user_id MUST match an actual id in the users table."
You can't create an interview for a user that doesn't exist.

`ondelete="CASCADE"` = waterfall effect:
```
User deletes account
  → All their interviews are automatically deleted too
  → All turns inside those interviews are deleted too
  → All feedback is deleted too
```

Orphaned data (interviews with no owner) is impossible.

---

#### Indexes — Speed Boosts

Without an index, finding all interviews for a user means scanning every single row.
With an index, the database jumps directly to the right rows — like a book's index page.

| Index | Columns | Why it exists |
|---|---|---|
| `idx_interview_user_status` | `user_id`, `status` | Fast lookup: "Show me all COMPLETED interviews for user X" |
| `idx_interview_role` | `target_role` | Fast lookup: "Show me all interviews for Python Developer role" |
| `idx_interview_completed` | `completed_at` | Fast lookup: "Show me all interviews completed this week" |

---

#### Relationships

| Name | Type | Plain English | Cascade |
|---|---|---|---|
| `user` | Many-to-one | The user who owns this interview | — |
| `turns` | One-to-many | All Q&A exchanges in this interview | `all, delete-orphan` |
| `feedback` | One-to-one | The final evaluation after completion | `all, delete-orphan` |

**One-to-many** (Interview → Turns):
Like one album having many songs. One interview has many turns.
```python
interview.turns  # [turn1, turn2, turn3, turn4, turn5]
```

**One-to-one** (Interview → Feedback):
Like one exam having one report card. One interview has one final feedback.
```python
interview.feedback  # A single Feedback object
```

**back_populates = two-way street:**
```python
interview.turns        # From interview → get all its turns
turn.interview         # From turn → get the interview it belongs to
interview.feedback     # From interview → get its feedback
feedback.interview     # From feedback → get the interview it belongs to
```

**cascade="all, delete-orphan":**
- `all` → Delete interview → all turns/feedback deleted automatically
- `delete-orphan` → Remove a turn from `interview.turns` → it's deleted from DB too

---

#### Properties

Properties are **read-only computed values** — no parameters, used like fields, answer YES/NO questions.

| Property | Returns | Plain English |
|---|---|---|
| `is_ready_to_start` | bool | Is status == READY? |
| `is_in_progress` | bool | Is status == IN_PROGRESS? |
| `is_completed` | bool | Is status == COMPLETED? |
| `has_cv_analysis` | bool | Has the CV been analyzed yet? |
| `has_jd_analysis` | bool | Has the JD been analyzed yet? |

**Why properties instead of checking status directly everywhere?**

DRY principle — Don't Repeat Yourself. If the logic ever changes, you fix it in ONE place:
```python
# ❌ Without property — repeated everywhere, hard to change
if interview.status == InterviewStatus.READY:  # file1
if interview.status == InterviewStatus.READY:  # file2
if interview.status == InterviewStatus.READY:  # file3

# ✅ With property — defined once, used everywhere
if interview.is_ready_to_start:  # file1
if interview.is_ready_to_start:  # file2
if interview.is_ready_to_start:  # file3
```

---

#### Methods

Methods are **functions that do something** — take parameters, complex logic, return computed data.

| Method | Returns | Plain English |
|---|---|---|
| `get_cv_skills()` | `List[str]` | Extract technical skills list from cv_analysis JSON |
| `get_jd_requirements()` | `List[str]` | Extract required skills list from jd_analysis JSON |
| `get_skill_gap_analysis()` | `Dict` | Compare CV skills vs JD requirements |
| `to_dict(include_analysis)` | `Dict` | Serialize to dictionary for API response |

**`get_skill_gap_analysis()` explained:**

```python
# CV has: ["Python", "JavaScript", "Docker"]
# JD needs: ["Python", "React", "AWS"]

result = interview.get_skill_gap_analysis()
# {
#   "matching_skills":    ["python"],               # ✅ You have this!
#   "missing_skills":     ["react", "aws"],          # ❌ Learn these
#   "additional_skills":  ["javascript", "docker"]   # 💡 Bonus skills
# }
```

It uses Python set operations:
- `cv & jd` = intersection = skills you have that are required
- `jd - cv` = difference = skills required that you're missing
- `cv - jd` = difference = skills you have beyond what's required

---

### `Turn`

Table: `turns`

One **question-answer exchange** within an interview. Every time the AI asks a question
and the user answers, that's one Turn. Think of it like one row in an exam paper.

**Why a separate model?**
- Evaluate each answer individually
- Measure time per question
- Track difficulty per question
- Analyze performance across phases over time

---

#### Fields

| Column | Type | Required | Plain English |
|---|---|---|---|
| `id` | UUID | Yes | Unique ID for this turn |
| `interview_id` | UUID (FK → interviews) | Yes | Which interview does this turn belong to? |
| `turn_number` | Integer | Yes | Sequential number: 1, 2, 3... |
| `phase` | String(20) | Yes | Which phase was active when this turn happened? |
| `ai_question` | Text | Yes | The exact question the AI asked |
| `user_answer` | Text | No | The candidate's answer (None if not answered yet) |
| `evaluation` | JSON | No | AI's scoring of the answer |
| `duration_seconds` | Float | No | How long the candidate took to answer |
| `difficulty_level` | Float | No | Question difficulty: 0.0 (easy) → 1.0 (hard) |
| `created_at` | DateTime | Yes | Auto-set on creation |
| `updated_at` | DateTime | Yes | Auto-updated on change |

---

#### Indexes

| Index | Columns | Why it exists |
|---|---|---|
| `idx_turn_interview_number` | `interview_id`, `turn_number` | Fast lookup: "Get all turns for interview X in order" |
| `idx_turn_phase` | `phase` | Fast lookup: "Get all TECHNICAL phase turns" |
| `idx_turn_unique` | `interview_id`, `turn_number` | **Unique constraint** — no duplicate turn numbers per interview |

**Why the unique constraint?**
```python
# ❌ This must be impossible:
Turn(interview_id="123", turn_number=1)
Turn(interview_id="123", turn_number=1)  # Duplicate! Database rejects this.

# ✅ This is correct:
Turn(interview_id="123", turn_number=1)
Turn(interview_id="123", turn_number=2)
Turn(interview_id="123", turn_number=3)
```

---

#### Properties

| Property | Returns | Plain English |
|---|---|---|
| `has_answer` | bool | Did the user actually provide an answer? |
| `has_evaluation` | bool | Has the AI evaluated this answer yet? |

---

#### Methods

| Method | Returns | Plain English |
|---|---|---|
| `get_evaluation_score(metric)` | `float` | Get one specific score (e.g. "clarity") from evaluation JSON |
| `get_overall_score()` | `float` | Average of relevance + depth + clarity |
| `to_dict(include_evaluation)` | `Dict` | Serialize to dictionary for API response |

**`get_overall_score()` explained:**
```python
# evaluation = {relevance: 8.0, depth: 7.0, clarity: 9.0}
overall = (8.0 + 7.0 + 9.0) / 3 = 8.0
```

---

### `Feedback`

Table: `feedback`

The **final report card** generated by AI after the interview is completed.
One-to-one with Interview — one interview gets exactly one feedback.

---

#### Fields

| Column | Type | Required | Plain English |
|---|---|---|---|
| `id` | UUID | Yes | Unique ID for this feedback |
| `interview_id` | UUID (FK → interviews) | Yes | Which interview is this feedback for? |
| `overall_score` | Float | Yes | Final score from 0 to 100 |
| `summary` | Text | No | Short paragraph summarizing performance |
| `strengths` | JSON (list) | Yes | What the candidate did well |
| `weaknesses` | JSON (list) | Yes | What the candidate needs to improve |
| `suggestions` | JSON (list) | Yes | Actionable steps to get better |
| `phase_scores` | JSON (dict) | Yes | Score for each interview phase |
| `skill_assessment` | JSON | No | Per-skill scores based on JD requirements |
| `detailed_analysis` | Text | No | Full narrative feedback |
| `generation_metadata` | JSON | No | AI model used, tokens consumed, etc. |
| `created_at` | DateTime | Yes | Auto-set on creation |
| `updated_at` | DateTime | Yes | Auto-updated on change |

---

#### Performance Levels (derived from `overall_score`)

| Score | Level | Plain English |
|---|---|---|
| ≥ 90 | `excellent` | Outstanding performance |
| ≥ 80 | `good` | Strong candidate |
| ≥ 70 | `satisfactory` | Decent, room to grow |
| ≥ 60 | `needs_improvement` | Significant gaps |
| < 60 | `poor` | Major work needed |

---

#### Indexes

| Index | Columns | Why it exists |
|---|---|---|
| `idx_feedback_score` | `overall_score` | Fast lookup: "Show all interviews scored above 80" |
| `idx_feedback_created` | `created_at` | Fast lookup: "Show feedback from this week" |

---

#### Properties

| Property | Returns | Plain English |
|---|---|---|
| `performance_level` | string | Converts overall_score to a label (excellent, good, etc.) |
| `top_strengths` | list | Top 3 strengths sorted by score (highest first) |
| `top_weaknesses` | list | Top 3 weaknesses sorted by score (lowest first) |
| `high_priority_suggestions` | list | Only suggestions where priority == "high" |

---

#### Methods

| Method | Returns | Plain English |
|---|---|---|
| `get_phase_score(phase)` | float | Score for a specific phase (e.g. "technical") |
| `get_skill_score(skill)` | float | Score for a specific skill (e.g. "Python") |
| `to_dict(include_detailed)` | Dict | Serialize to dictionary for API response |
| `create_from_analysis(...)` | Feedback | Factory method — creates Feedback directly from AI output |

---

## JSON Column Structures

### `cv_analysis`
```json
{
  "candidate_name": "string",
  "years_of_experience": 5,
  "current_role": "string",
  "seniority_level": "junior | mid | senior",
  "skills": {
    "technical": ["Python", "FastAPI"],
    "soft": ["Communication", "Leadership"]
  },
  "experience": [
    {
      "role": "string",
      "company": "string",
      "duration": "string",
      "key_achievements": [],
      "technologies_used": []
    }
  ],
  "education": [],
  "projects": [],
  "certifications": [],
  "notable_points": [],
  "potential_gaps": [],
  "interview_focus_areas": []
}
```

### `jd_analysis`
```json
{
  "role_title": "string",
  "company": "string | null",
  "seniority_level": "string",
  "required_skills": [],
  "preferred_skills": [],
  "key_responsibilities": [],
  "technical_requirements": [],
  "interview_focus_areas": [],
  "required_experience": {},
  "company_culture": {}
}
```

### `evaluation` (per Turn)
```json
{
  "overall_score": 7.5,
  "relevance": 8.0,
  "depth": 7.0,
  "clarity": 7.5,
  "strengths": ["Good use of examples", "Clear communication"],
  "areas_for_improvement": ["Add more technical depth"],
  "criteria_scores": {
    "technical_knowledge": 7.0,
    "communication_skills": 8.0
  }
}
```

### `strengths` / `weaknesses` (Feedback)
```json
[
  {
    "area": "Communication",
    "evidence": "Explained concepts clearly with examples",
    "score": 8.5
  }
]
```

### `suggestions` (Feedback)
```json
[
  {
    "action": "Study AWS core services (EC2, S3, Lambda)",
    "priority": "high | medium | low"
  }
]
```

---

## Pydantic Schemas

Pydantic schemas are the **API contract** — they validate data coming IN and going OUT of the API.
Different from SQLAlchemy models (which talk to the database), schemas talk to the outside world.

### Request Schemas (data coming IN)

| Schema | Purpose | Key Rule |
|---|---|---|
| `CreateInterviewRequest` | Create a new interview | `jd_text` required, 100–10,000 chars |
| `UpdateInterviewRequest` | Update interview metadata | `target_company` is optional |
| `InterviewActionRequest` | Trigger an action | `action` must be `start`, `complete`, or `pause` |

### Response Schemas (data going OUT)

| Schema | Purpose |
|---|---|
| `InterviewSummaryResponse` | Lightweight — used in list views |
| `InterviewDetailResponse` | Full detail — used in single interview view |
| `TurnResponse` | Single turn with optional evaluation |
| `InterviewListResponse` | Paginated list of interviews |
| `InterviewStatsResponse` | Aggregate stats for a user |
| `CVAnalysisResponse` | Structured CV analysis |
| `JDAnalysisResponse` | Structured JD analysis |
| `SkillGapAnalysisResponse` | Matching / missing / additional skills |
| `FileUploadResponse` | Result of a file upload |

### Utility Functions

| Function | What it does |
|---|---|
| `create_interview_summary_response(interview)` | Converts ORM Interview → lightweight summary dict |
| `create_interview_detail_response(interview, include_analysis)` | Converts ORM Interview → full detail dict, optionally with CV/JD/gap analysis |

---

## Complete Flow (The Full Journey)

```
1. User creates Interview
        status: PENDING

2. User uploads CV + JD
        cv_raw_text and jd_raw_text saved

3. AI analyzes both documents
        status: PENDING → PROCESSING_CV
        cv_analysis and jd_analysis saved as JSON
        status: PROCESSING_CV → READY

4. User clicks "Start Interview"
        status: READY → IN_PROGRESS
        current_phase: INTRO

5. Interview session (WebSocket)
        ┌─────────────────────────────────────┐
        │  Turn 1 (INTRO phase)               │
        │  AI asks → User answers → AI scores │
        │                                     │
        │  Turn 2 (BEHAVIORAL phase)          │
        │  AI asks → User answers → AI scores │
        │                                     │
        │  Turn 3 (TECHNICAL phase)           │
        │  AI asks → User answers → AI scores │
        │                                     │
        │  ... continues through all phases   │
        └─────────────────────────────────────┘

6. Interview ends
        status: IN_PROGRESS → COMPLETED
        completed_at = now()
        total_duration_seconds = calculated

7. AI generates Feedback
        overall_score, strengths, weaknesses,
        suggestions, phase_scores all saved

8. User views results
        interview.turns     → all Q&A history
        interview.feedback  → final report card
```

---

## Quick Reference Card

| Concept | One-liner |
|---|---|
| Model | Blueprint that defines what a database table looks like |
| Enum | Pre-made multiple choice — you MUST pick from the list |
| UUID | Unique ID that's impossible to guess (unlike 1, 2, 3) |
| ForeignKey | A pointer that links one table to another |
| CASCADE | Waterfall delete — parent deleted → children deleted |
| Index | Speed boost — like a book's index page |
| nullable=False | Field is required, cannot be empty |
| nullable=True | Field is optional, can be None |
| Property | Read-only computed value, no parameters, used like a field |
| Method | Function with parameters, complex logic, returns data |
| One-to-many | One interview has many turns (like one album, many songs) |
| One-to-one | One interview has one feedback (like one exam, one report card) |
| back_populates | Two-way access: interview.turns AND turn.interview |
| JSON field | Stores structured nested data (like a filing cabinet) |
| DRY principle | Don't Repeat Yourself — define logic once, use everywhere |
