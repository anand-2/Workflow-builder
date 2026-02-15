import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# Initialize Gemini client
# The client automatically picks up GEMINI_API_KEY from environment
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
# Model constant for easy updates
MODEL_NAME = 'gemma-3-1b-it'

def _get_prompt(step_type: str, text: str) -> str:
    """Return the prompt for a step type and input text."""
    prompts = {
        'clean_text': f"""Clean and normalize this text. Remove extra whitespace, fix common typos, and make it more readable. Return only the cleaned text without explanations:

{text}""",
        'summarize': f"""Summarize the following text in 2-3 sentences. Be concise and capture the main points:

{text}""",
        'extract_key_points': f"""Extract the key points from this text as a bullet list. Return only the bullet points:

{text}""",
        'tag_category': f"""Analyze this text and assign it to ONE category from: Technology, Business, Health, Education, Entertainment, Sports, Politics, Science, or Other. Return only the category name:

{text}""",
        'sentiment_analysis': f"""Analyze the sentiment of this text. Respond with only one word: Positive, Negative, or Neutral:

{text}""",
        'translate_to_simple': f"""Rewrite this text in simple, easy-to-understand language suitable for a 10-year-old:

{text}""",
    }
    return prompts.get(step_type, text)


def process_step_stream_sync(step_type: str, input_text: str):
    """Sync generator that yields text chunks from Gemma for a single step."""
    valid = ('clean_text', 'summarize', 'extract_key_points', 'tag_category', 'sentiment_analysis', 'translate_to_simple')
    if step_type not in valid:
        raise ValueError(f"Unknown step type: {step_type}")
    
    prompt = _get_prompt(step_type, input_text)
    response = client.models.generate_content_stream(
        model=MODEL_NAME,
        contents=prompt
    )
    for chunk in response:
        text = getattr(chunk, 'text', None)
        if text is not None and text:
            yield text() if callable(text) else text


async def clean_text(text: str) -> str:
    prompt = _get_prompt('clean_text', text)
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
    )
    return response.text

async def summarize(text: str) -> str:
    prompt = _get_prompt('summarize', text)
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )
    return response.text

async def extract_key_points(text: str) -> str:
    prompt = _get_prompt('extract_key_points', text)
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )
    return response.text

async def tag_category(text: str) -> str:
    prompt = _get_prompt('tag_category', text)
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )
    return response.text.strip()

async def sentiment_analysis(text: str) -> str:
    prompt = _get_prompt('sentiment_analysis', text)
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )
    return response.text.strip()

async def translate_to_simple(text: str) -> str:
    prompt = _get_prompt('translate_to_simple', text)
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )
    return response.text

STEP_PROCESSORS = {
    'clean_text': clean_text,
    'summarize': summarize,
    'extract_key_points': extract_key_points,
    'tag_category': tag_category,
    'sentiment_analysis': sentiment_analysis,
    'translate_to_simple': translate_to_simple
}

async def process_step(step_type: str, input_text: str) -> str:
    if step_type not in STEP_PROCESSORS:
        raise ValueError(f"Unknown step type: {step_type}")
    
    processor = STEP_PROCESSORS[step_type]
    return await processor(input_text)

async def check_health() -> bool:
    """Check if Gemma API is working"""
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents='Say "OK" if you can read this.'
        )
        return bool(response.text)
    except Exception as e:
        print(f"Gemma health check failed: {e}")
        return False