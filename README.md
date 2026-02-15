# 🚀 Workflow Builder - AI-Powered Text Processing

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A modern web application that lets you create custom AI-powered workflows to process text. Build multi-step pipelines, run them on your content, and track results - all through an intuitive interface.

![Workflow Builder Demo](https://via.placeholder.com/800x400/667eea/ffffff?text=Workflow+Builder)

## 🎯 What Does It Do?

Workflow Builder is like having a Swiss Army knife for text processing. Instead of manually cleaning, summarizing, or analyzing text, you create custom "workflows" (step-by-step processes) that do it automatically using AI.

### Real-World Example

**Before:**
```
You have a messy, 500-word article and need:
- Clean version (no typos, good formatting)
- 2-sentence summary
- Key points as bullets
- Know if it's positive or negative

This takes 15+ minutes manually.
```

**After (with Workflow Builder):**
```
1. Create workflow: Clean → Summarize → Extract Points → Sentiment
2. Paste your text
3. Click "Run"
4. Get all results in 10 seconds!
```

## ✨ Features

- 🎨 **6 AI-Powered Step Types**
  - Clean Text - Remove noise, fix typos
  - Summarize - Condense to 2-3 sentences
  - Extract Key Points - Bullet point highlights
  - Tag Category - Auto-categorize content (Tech, Business, Health, etc.)
  - Sentiment Analysis - Detect positive/negative/neutral tone
  - Translate to Simple - Simplify language for easier reading

- 🔧 **Workflow Management**
  - Create custom workflows with 2-4 steps
  - Save and reuse your workflows
  - Delete workflows you don't need

- ⚡ **Run & Track**
  - Process text through your workflows
  - See step-by-step transformation
  - View last 5 runs for each workflow

- 📊 **System Monitoring**
  - Health status dashboard
  - Backend, database, and AI connection status
  - Real-time system checks

- 🎨 **Modern UI**
  - Clean, responsive design
  - Mobile-friendly
  - Intuitive navigation
  - Real-time loading states

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **Python 3.11+** - Programming language
- **FastAPI** - Modern web framework
- **Google Gen AI SDK 1.0.0** - Latest Gemini integration (2025)
- **PostgreSQL** - Database
- **Pydantic** - Data validation

### Deployment
- **Vercel** - Frontend hosting 
- **Render** - Backend hosting 
- **Docker** - Containerization support

## 🚀 Quick Start

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- PostgreSQL
- Google Gemini API key ([Get free here](https://aistudio.google.com/app/apikey))

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/workflow-builder.git
cd workflow-builder
```

#### 2. Setup Backend (Python)

```bash
cd backend-python

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Create database
createdb workflows

# Run server
python main.py
```

Backend runs on: **http://localhost:5000**

API Documentation: **http://localhost:5000/docs** (Swagger UI)

#### 3. Setup Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:5000/api

# Run development server
npm run dev
```

Frontend runs on: **http://localhost:3000**

### 🐳 Docker (Alternative)

```bash
# Create .env file with GEMINI_API_KEY
echo "GEMINI_API_KEY=your_key_here" > .env

# Run with Docker Compose
docker-compose up

# Visit http://localhost:3000
```

## 📖 Usage

### 1. Check System Status
Visit the **Status** page to ensure all systems are operational:
- ✅ Database connected
- ✅ Backend API running
- ✅ AI (Gemini) connected

### 2. Create a Workflow

1. Go to **Create New** page
2. Enter workflow name (e.g., "Blog Post Processor")
3. Add description (optional)
4. Select 2-4 steps from available options
5. Arrange them in desired order
6. Click **Create Workflow**

### 3. Run a Workflow

1. Go to **Workflows** page
2. Click on a workflow
3. Enter your input text
4. Click **Run Workflow**
5. See step-by-step results!

### 4. View History

- Each workflow page shows the last 5 runs
- Review past inputs and outputs
- Compare different processing attempts

## 🎮 Example Workflows

### Academic Paper Summarizer
```
1. Clean Text
2. Summarize
3. Extract Key Points
```
**Use case:** Quickly understand research papers

### Social Media Monitor
```
1. Clean Text
2. Sentiment Analysis
3. Tag Category
```
**Use case:** Track customer sentiment on social posts

### Content Simplifier
```
1. Clean Text
2. Translate to Simple
3. Summarize
```
**Use case:** Make technical docs accessible to everyone

### Email Processor
```
1. Clean Text
2. Extract Key Points
3. Tag Category
4. Sentiment Analysis
```
**Use case:** Quickly process incoming emails

## 📡 API Endpoints

### Workflows
- `GET /api/workflows` - List all workflows
- `GET /api/workflows/{id}` - Get single workflow
- `POST /api/workflows` - Create new workflow
- `DELETE /api/workflows/{id}` - Delete workflow

### Execution
- `POST /api/workflows/{id}/run` - Run workflow with input text
- `GET /api/workflows/{id}/runs` - Get run history for workflow
- `GET /api/runs` - Get all recent runs (last 5)

### Health
- `GET /api/health` - System health check

Full interactive API docs available at `/docs` when backend is running.

## 🌐 Deployment

### Deploy Backend to Render

1. Push code to GitHub
2. Create new **Web Service** on [Render](https://render.com)
3. Connect your repository
4. Configure:
   ```
   Build Command: pip install -r requirements.txt
   Start Command: python main.py
   ```
5. Add environment variables:
   - `GEMINI_API_KEY` - Your API key
   - `DATABASE_URL` - Auto-provided by Render PostgreSQL
   - `PORT` - 5000

6. Create PostgreSQL database and link to service

### Deploy Frontend to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy from frontend directory:
   ```bash
   cd frontend
   vercel
   ```

3. Set environment variable in Vercel dashboard:
   - `VITE_API_URL` - Your Render backend URL + `/api`

4. Redeploy:
   ```bash
   vercel --prod
   ```

## 🧪 Development

### Run Tests
```bash
# Backend
cd backend-python
pytest

# Frontend
cd frontend
npm test
```

### Code Formatting
```bash
# Backend
black .
flake8 .

# Frontend
npm run lint
```

### Type Checking
```bash
# Backend
mypy .
```

## 🔑 Environment Variables

### Backend (.env)
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://localhost:5432/workflows
PORT=5000
ENVIRONMENT=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check if PostgreSQL is running
pg_isready

# Create database if missing
createdb workflows

# Test connection
psql -d workflows -c "SELECT 1"
```

### Gemini API Error
- Verify `GEMINI_API_KEY` is correct
- Check rate limits (15 requests/minute on free tier)
- Try regenerating your API key

### Port Already in Use
```bash
# Change port in .env
PORT=8000

# Or kill process using port
lsof -ti:5000 | xargs kill -9
```

### Module Not Found (Python)
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

## 📧 Contact

Anand Balaji - [@yourtwitter](https://twitter.com/yourtwitter) - your.email@example.com

Project Link: [https://github.com/anand-2/Workflow-builder]

Live Demo: [https://anandWorkFlowBuilder.vercel.app]

Made with ❤️ using Python, FastAPI, React, and Google Gemini