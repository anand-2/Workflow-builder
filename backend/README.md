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
    model='gemini-2.5-flash',
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

## 🌐 Deployment to Render

1. Push to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect your repo
4. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python main.py`
   - **Environment Variables**:
     - `GEMINI_API_KEY`
     - `DATABASE_URL` (auto-provided by Render PostgreSQL)
     - `PORT=5000`
     - `ENVIRONMENT=production`

## 📝 Project Structure

```
backend-python/
├── main.py              # FastAPI application
├── database.py          # PostgreSQL connection & initialization
├── gemini_service.py    # Gemini AI integration (latest SDK)
├── models.py            # Pydantic models
├── requirements.txt     # Python dependencies
├── .env.example         # Environment template
├── .gitignore          # Git ignore
├── Dockerfile          # Docker configuration
└── README.md           # This file
```

## 🔍 What's Different from Node.js Version?

### Advantages of Python + FastAPI:
1. ✅ **Type Safety** - Pydantic models with automatic validation
2. ✅ **Auto Documentation** - Swagger UI and ReDoc built-in
3. ✅ **Async Support** - Native async/await for better performance
4. ✅ **Modern Syntax** - Clean, readable Python code
5. ✅ **Latest SDK** - Using 2025 Google Gen AI SDK

### Key Differences:
```python
# Python FastAPI (2025 SDK)
from google import genai
client = genai.Client(api_key=key)
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=prompt
)

# vs Node.js (old SDK)
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const result = await model.generateContent(prompt);
```

## ✅ Testing

### Manual testing:
```bash
# Health check
curl http://localhost:5000/api/health

# Create workflow
curl -X POST http://localhost:5000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Workflow",
    "description": "Test",
    "steps": [
      {"type": "clean_text", "name": "Clean Text"},
      {"type": "summarize", "name": "Summarize"}
    ]
  }'

# Run workflow
curl -X POST http://localhost:5000/api/workflows/1/run \
  -H "Content-Type: application/json" \
  -d '{"inputText": "Your text here..."}'
```

## 🆘 Troubleshooting

### Database connection error
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL is correct
- Test connection: `psql $DATABASE_URL`

### Gemini API error
- Verify GEMINI_API_KEY is set correctly
- Check you haven't hit rate limits (15/min free tier)
- Try regenerating your API key

### Import errors
- Make sure you're using Python 3.11+
- Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`
- Check virtual environment is activated

## 📄 License

MIT

## 👤 Author

See ABOUTME.md in the project root
