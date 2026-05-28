# 🧠 ORION — AI Academic Assistant

> A premium AI-powered academic platform featuring intelligent document analysis, OCR-powered notice extraction, RAG-based conversations, quiz generation, and smart educational workflows.

![Status](https://img.shields.io/badge/Status-Production-success)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2016-black)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)
![Database](https://img.shields.io/badge/Database-Supabase-3FCF8E)
![AI](https://img.shields.io/badge/AI-Groq%20Llama-orange)
![Deployment](https://img.shields.io/badge/Deploy-Vercel%20%7C%20Railway-blue)

---

# 🚀 Live Deployment

### 🌐 Frontend (Vercel)

Deployed on Vercel for fast global delivery and optimized Next.js performance.

### ⚡ Backend (Railway)

FastAPI backend deployed on Railway with production-ready API hosting.

### 🗄️ Database (Supabase)

Supabase PostgreSQL + pgvector used for:

* Authentication
* Vector embeddings
* Document storage
* Notice management
* Metadata handling

---

# 📖 Project Overview

ORION is an AI-powered academic assistant designed to modernize educational workflows using Retrieval-Augmented Generation (RAG), OCR, intelligent document parsing, and conversational AI.

Students can:

* Upload PDFs, notes, notices, and images
* Chat with their study materials
* Generate quizzes from uploaded content
* Extract institutional notices using OCR
* Search/filter notices intelligently
* Use AI-powered contextual learning tools

---

# ✨ Core Features

## 📄 Smart Document Upload System

* PDF uploads
* OCR extraction for scanned PDFs
* Image understanding support
* Automatic chunking + embeddings
* Metadata extraction

---

## 🧠 RAG-Based Conversational AI

* Context-aware AI chatbot
* Retrieves relevant document chunks
* User-specific document isolation
* Semantic vector search
* Trust-aware retrieval pipeline

---

## 🏛️ AI Notice Intelligence System

### Automatically:

* Detects academic notices
* Extracts structured metadata
* Generates readable notice summaries
* Calculates trust scores
* Supports full notice viewing

### Features:

* Search notices
* Department filters
* Category filters
* Dynamic notice pages
* Real-time notice cleanup on deletion

---

## 🧪 AI Quiz Generator

Generate intelligent quizzes from:

* Uploaded documents
* User topics
* Academic concepts

### Includes:

* MCQs
* Correct answers
* AI-generated explanations
* Instant scoring system
* Performance feedback

---

## 🔐 Authentication System

Powered by Supabase Auth:

* Secure login/signup
* JWT authentication
* Protected routes
* User-isolated document retrieval

---

## 🎨 Premium UI/UX

Custom ORION design system:

* Luxury dark/light themes
* Responsive layouts
* Smooth animations
* Glassmorphism-inspired cards
* Warm premium gold palette

---

# 🏗️ System Architecture

graph TD
    User((👤 User))

    User --> Frontend[Next.js Frontend]

    Frontend --> Backend[FastAPI Backend]

    Backend --> Supabase[(Supabase PostgreSQL + pgvector)]

    Backend --> Groq[Groq LLM APIs]

    Backend --> OCR[OCR + Vision Processing]
    Supabase --> Embeddings[Vector Search

---

# 🛠️ Tech Stack

## Frontend

* Next.js 16
* React
* Tailwind CSS v4
* TypeScript
* Axios
* Sonner Toasts
* Lucide Icons

---

## Backend

* FastAPI
* Python
* Uvicorn
* Pydantic
* Supabase Python SDK

---

## AI / ML

* Groq Llama Models
* BAAI/bge-small-en-v1.5 Embeddings
* OCR + Vision Pipelines
* RAG Architecture

---

## Database

* Supabase PostgreSQL
* pgvector extension
* JSONB metadata storage

---

# 📂 Project Structure

Orion/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   ├── public/
│   └── styles/
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   │
│   ├── requirements.txt
│   ├── Procfile
│   └── runtime.txt
│
├── README.m
└── .gitignor

---

# ⚙️ Local Development Setup

# 1️⃣ Clone Repository

git clne https://github.com/YOUR_USERNAME/Orion.git
cd Orio

---

# 2️⃣ Backend Setup

cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate

pip install -r requirements.txt
uvicorn src.main:app --reloa

Backend runs on:

http://127.0.0.1:8000


---

# 3️⃣ Frontend Setup

cd frontend

npm install
npm run de

Frontend runs on:
http://localhost:300

---

# 🔑 Environment Variables
## Frontend `.env.local`env
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

---
## Backend `.env`env
SUPABASE_URL
SUPABASE_KEY
SUPABASE_SERVICE_ROLE_KEY
GROQ_API_EY
JWT_SECRET_KEY

---

# 📌 Current Status

## ✅ Completed

* Authentication
* RAG pipeline
* OCR processing
* Notice system
* Dynamic notice pages
* Quiz generation
* Search/filtering
* File upload management
* Deployment setup
* Production frontend deployment

---

# 🚧 Future Improvements

* Multi-document quiz generation
* Chat history memory optimization
* Admin dashboard
* AI-generated summaries
* Real-time collaborative study rooms
* Mobile app support

---

# 👨‍💻 Developer

Built by Siddharth Singh

ORION represents the integration of:

* Artificial Intelligence
* Academic workflows
* Modern full-stack engineering
* Production-grade deployment
* Human-centered educational UX

---
