import os
from dotenv import load_dotenv
load_dotenv()
from google import genai
from google.genai import types

# Initialize Gemini client with the NEW SDK (2025)
# The client automatically picks up GEMINI_API_KEY from environment
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

# Step processors using the latest SDK
async def clean_text(text: str) -> str:
    """Clean and normalize text"""
    prompt = f"""Clean and normalize this text. Remove extra whitespace, fix common typos, and make it more readable. Return only the cleaned text without explanations:

{text}"""
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    return response.text

async def summarize(text: str) -> str:
    """Summarize text to 2-3 sentences"""
    prompt = f"""Summarize the following text in 2-3 sentences. Be concise and capture the main points:

{text}"""
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    return response.text

async def extract_key_points(text: str) -> str:
    """Extract key points as bullet list"""
    prompt = f"""Extract the key points from this text as a bullet list. Return only the bullet points:

{text}"""
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    return response.text

async def tag_category(text: str) -> str:
    """Categorize text into one category"""
    prompt = f"""Analyze this text and assign it to ONE category from: Technology, Business, Health, Education, Entertainment, Sports, Politics, Science, or Other. Return only the category name:

{text}"""
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    return response.text.strip()

async def sentiment_analysis(text: str) -> str:
    """Analyze sentiment of text"""
    prompt = f"""Analyze the sentiment of this text. Respond with only one word: Positive, Negative, or Neutral:

{text}"""
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    return response.text.strip()

async def translate_to_simple(text: str) -> str:
    """Translate to simple language"""
    prompt = f"""Rewrite this text in simple, easy-to-understand language suitable for a 10-year-old:

{text}"""
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    return response.text

# Map step types to functions
STEP_PROCESSORS = {
    'clean_text': clean_text,
    'summarize': summarize,
    'extract_key_points': extract_key_points,
    'tag_category': tag_category,
    'sentiment_analysis': sentiment_analysis,
    'translate_to_simple': translate_to_simple
}

async def process_step(step_type: str, input_text: str) -> str:
    """Process a single workflow step"""
    if step_type not in STEP_PROCESSORS:
        raise ValueError(f"Unknown step type: {step_type}")
    
    processor = STEP_PROCESSORS[step_type]
    return await processor(input_text)

async def check_health() -> bool:
    """Check if Gemini API is working"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents='Say "OK" if you can read this.'
        )
        return bool(response.text)
    except Exception as e:
        print(f"Gemini health check failed: {e}")
        return False
