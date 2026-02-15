# Workflow Builder - Python FastAPI Backend

Modern Python backend using **FastAPI** and the **latest Google Gen AI SDK (2025)**.

## 🚀 Tech Stack

- **FastAPI** - Modern, fast web framework
- **Python 3.11+** - Latest Python
- **PostgreSQL** - Relational database
- **Google Gen AI SDK 1.0.0** - Latest Gemini SDK (2025)
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## 📦 Installation

### Prerequisites
- Python 3.11 or higher
- PostgreSQL installed
- Google Gemini API key ([Get free](https://aistudio.google.com/app/apikey))

### Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Create `.env` file:**
```bash
cp .env.example .env
```

3. **Edit `.env` and add your credentials:**
```env
# Use gemini_api (default) or local_gemma
LLM_PROVIDER=gemini_api
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://localhost:5432/workflows
PORT=5000
ENVIRONMENT=development
```

4. **Create database:**
```bash
# macOS/Linux
createdb workflows

# Or using psql
psql -U postgres -c "CREATE DATABASE workflows;"
```

5. **Run the server:**
```bash
python main.py
```

Server will run on `http://localhost:5000`

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:5000/docs
- **ReDoc**: http://localhost:5000/redoc

## 🔌 API Endpoints

### Health Check
- `GET /api/health` - Check backend, database, and LLM health

### Workflows
- `GET /api/workflows` - List all workflows
- `GET /api/workflows/{id}` - Get single workflow
- `POST /api/workflows` - Create new workflow
- `DELETE /api/workflows/{id}` - Delete workflow

### Run Workflows
- `POST /api/workflows/{id}/run` - Run workflow with input text
- `GET /api/workflows/{id}/runs` - Get run history for workflow
- `GET /api/runs` - Get all recent runs (last 5)

## 🎯 Key Features

### Latest Gemini SDK (2025)
Uses the **new Google Gen AI SDK** (`google-genai`), not the deprecated `google-generativeai`:

```python
from google import genai

# Initialize client - automatically picks up GEMINI_API_KEY
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

# Generate content with latest API
response = client.models.generate_content(
    model='gemma-3-1b',
    contents=prompt
)
```

### 6 Step Types
1. **clean_text** - Remove noise, fix typos
2. **summarize** - Condense to 2-3 sentences
3. **extract_key_points** - Bullet point highlights
4. **tag_category** - Auto-categorize content
5. **sentiment_analysis** - Detect sentiment
6. **translate_to_simple** - Simplify language

### Async/Await Support
All workflow processing is async for better performance:

```python
async def process_step(step_type: str, input_text: str) -> str:
    processor = STEP_PROCESSORS[step_type]
    return await processor(input_text)
```

## 🐳 Docker Support

### Build and run:
```bash
docker build -t workflow-builder-api .
docker run -p 5000:5000 --env-file .env workflow-builder-api
```