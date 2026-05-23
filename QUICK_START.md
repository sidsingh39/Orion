# Quick Start Guide

Follow these steps to run the application locally on your machine.

## Prerequisites

1.  **Node.js** (v20+)
2.  **Python** (3.10+)
3.  **Supabase Account** (Project URL & Key)
4.  **Groq API Key**

## 1. Clone the Repository

```bash
git clone <repository-url>
cd Conversational-Ai-Education
```

## 2. Setup Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_anon_key
```

Run the server:

```bash
uvicorn src.main:app --reload --port 8000
```

> The server should be running at `https://conversational-ai-backend-production-7fb7.up.railway.app`.

## 3. Setup Frontend (Next.js)

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory (optional if you don't have frontend-specific env vars yet, but good practice):

```env
NEXT_PUBLIC_API_URL=https://conversational-ai-backend-production-7fb7.up.railway.app
```

Run the development server:

```bash
npm run dev
```

> The app should be running at `http://localhost:3000`.

## 4. Verification

1.  Open `http://localhost:3000`.
2.  Upload a PDF or Text file using the "+" button.
3.  Ask a question about the file in the chat.
