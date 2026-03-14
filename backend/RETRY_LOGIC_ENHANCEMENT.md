# 🚀 Quick Production Enhancement: Add Retry Logic for AI API Calls

## What This Adds

Exponential backoff retry logic for Groq API calls to handle transient failures.

## Installation

```bash
pip install tenacity
```

## Implementation

Add to `requirements.txt`:
```
tenacity==8.2.3
```

## Code Changes

### 1. Update `app/modules/ai/cv_processor.py`

```python
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from groq import APIError, RateLimitError

# Add retry decorator to analyze_cv_with_ai
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((APIError, RateLimitError)),
    reraise=True
)
async def analyze_cv_with_ai(cv_text: str) -> Dict[str, Any]:
    # existing code...
```

### 2. Update `app/modules/ai/jd_processor.py`

```python
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from groq import APIError, RateLimitError

# Add retry decorator to analyze_jd_with_ai
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((APIError, RateLimitError)),
    reraise=True
)
async def analyze_jd_with_ai(jd_text: str) -> Dict[str, Any]:
    # existing code...
```

### 3. Update `app/modules/websocket/interview_conductor.py`

```python
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from groq import APIError, RateLimitError

# Add retry decorator to all AI methods
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((APIError, RateLimitError)),
    reraise=True
)
async def generate_opening_question(self, interview_data: Dict[str, Any]) -> Dict[str, Any]:
    # existing code...

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((APIError, RateLimitError)),
    reraise=True
)
async def generate_follow_up_question(...):
    # existing code...

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((APIError, RateLimitError)),
    reraise=True
)
async def evaluate_response(...):
    # existing code...

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((APIError, RateLimitError)),
    reraise=True
)
async def generate_probe_question(...):
    # existing code...

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((APIError, RateLimitError)),
    reraise=True
)
async def generate_interview_summary(...):
    # existing code...
```

## How It Works

1. **First Attempt**: Calls Groq API normally
2. **If Fails**: Waits 2 seconds, retries
3. **If Fails Again**: Waits 4 seconds, retries
4. **If Fails Third Time**: Waits 8 seconds, retries
5. **If Still Fails**: Raises exception to user

## Benefits

- ✅ Handles transient network issues
- ✅ Handles temporary API overload
- ✅ Handles rate limiting gracefully
- ✅ No code changes needed in calling functions
- ✅ Automatic exponential backoff
- ✅ Configurable retry attempts

## Testing

```python
# Test retry logic
import asyncio
from app.modules.ai.cv_processor import analyze_cv_with_ai

async def test_retry():
    cv_text = "Test CV content..."
    
    try:
        result = await analyze_cv_with_ai(cv_text)
        print("Success:", result)
    except Exception as e:
        print("Failed after retries:", e)

asyncio.run(test_retry())
```

## Monitoring

Add logging to track retries:

```python
import logging

logger = logging.getLogger(__name__)

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((APIError, RateLimitError)),
    before_sleep=lambda retry_state: logger.warning(
        f"Retry attempt {retry_state.attempt_number} after {retry_state.outcome.exception()}"
    ),
    reraise=True
)
async def analyze_cv_with_ai(cv_text: str) -> Dict[str, Any]:
    # existing code...
```

## Estimated Time to Implement

- **Installation**: 1 minute
- **Code changes**: 15 minutes
- **Testing**: 10 minutes
- **Total**: ~30 minutes

## Priority

**HIGH** - Should be done before production launch

## Status

⚠️ **NOT IMPLEMENTED YET** - Ready to implement when needed
