# Testing Guide

## Manual Verification Suite

### 1. API Health Check
- **Action**: Open `https://conversational-ai-backend-production-7fb7.up.railway.app`
- **Expected**: JSON response `{"status": "Groq/Supabase RAG server running"}`

### 2. Document Upload Flow (RAG Ingestion)
- **Preparation**: Have a sample `test.txt` with content "The code word is BLUEBERRY."
- **Action**: Use the UI to upload this file.
- **Expected**: 
  - UI shows success notification.
  - Backend logs show "Chunking..." and "Embedding...".
  - Supabase dashboard (if checked) shows new row in `documents`.

### 3. Vision Analysis Flow
- **Preparation**: Have a sample image (e.g., a diagram or photo).
- **Action**: Upload the image via UI.
- **Expected**:
  - UI shows success.
  - Backend logs show "Sending vision prompt...".
  - System generates a description and embeds it.

### 4. Chat / Retrieval Flow
- **Action**: Ask "What is the code word?" (after step 2).
- **Expected**:
  - AI Output: "The code word is BLUEBERRY."
  - Shows that context was successfully retrieved and used.

## Troubleshooting Common Failures

### 🔴 Upload Fails
- **Check**: Is `GROQ_API_KEY` set? (Required for Vision uploads).
- **Check**: Is Supabase URL/Key correct?

### 🔴 Chat Returns Generic Answers (No Context)
- **Check**: Did the upload succeed?
- **Check**: Is the vector store populated?

### 🔴 Build Fails (Render/Vercel)
- **Error**: "Env var not found"
- **Fix**: Go to specific dashboard settings and manually add `GROQ_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, etc.
