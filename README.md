# DocuScholar AI
> **Intelligent Document Q&A, Page Citations & Tiered Assessment System**

![DocuScholar AI Tech Stack](https://img.shields.io/badge/Frontend-Next.js%2014%2B%20%7C%20React%2018-blue)
![Styling](https://img.shields.io/badge/UI-Tailwind%20CSS%20v4%20%7C%20Framer%20Motion-purple)
![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.10%2B-emerald)
![AI Model](https://img.shields.io/badge/LLM-Google%20Gemini%202.5%20Pro-amber)

---

## 🌟 Overview

**DocuScholar AI** is an advanced Retrieval-Augmented Generation (RAG) platform designed for scholars, researchers, educators, and students. By combining FastAPI vector indexation with Google Gemini 2.5 Pro and Next.js 14, DocuScholar AI enables users to upload complex academic PDFs, query text instantly, extract verified page citations, and generate structured assessment test papers.

---

## ✨ Key Features

- 📑 **Instant PDF Ingestion & Vector Indexing:** Fast chunking and vector embedding of uploaded documents powered by PyPDF and vector search.
- 📌 **Automatic Verified Page Citations:** Every AI response includes exact `[Source: Page X]` citation pills grounded in document text.
- 📝 **Tiered Assessment Generation:** One-click generation of practice question papers categorized into Easy, Medium, and Hard difficulty levels.
- 💾 **Export to Markdown:** Instant export of AI generated summaries, study notes, and test papers to clean `.md` files.
- 🎭 **3D Glassmorphic UI & Seamless Dark/Light Mode:** Next-gen visual interface with 3D spatial perspective, Framer Motion tilt-fade card entrances, elevated prompt chips, and a project-wide theme switch.
- ⚡ **Interactive Message Action Toolbars:**
  - **AI Response Cards:** Thumbs Up / Thumbs Down feedback, Regenerate response, Copy raw content, Download `.md`, and More options.
  - **User Message Bubbles:** Hover action bar with Copy and Edit (pencil) to resend modified queries.
- ⏹️ **Streaming Generation & Abort Control:** Server-Sent Events (SSE) real-time response streaming with a Stop/Cancel button.
- 🗂️ **Local Chat History & Session Management:** Session persistence powered by `localStorage` with history drawer and new chat creation.

---

## 🏗️ Architecture & Project Structure

```
AI-Q&A System/
├── backend/
│   ├── main.py                  # FastAPI Application & SSE endpoints (/upload, /chat)
│   ├── requirements.txt          # Python dependencies
│   ├── .env                     # Environment configuration (GEMINI_API_KEY)
│   └── app/
│       ├── agent/
│       │   ├── react_agent.py   # Gemini ReAct Agent & prompt templates
│       │   └── vector_search.py # Vector embedding & document retrieval
│       └── rag/
│           ├── pdf_loader.py    # PyPDF text extraction
│           └── ingestion.py     # PDF chunking pipeline
│
└── frontend/
    ├── package.json             # Node dependencies
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx       # Root layout & theme provider
    │   │   ├── page.tsx         # Main application page
    │   │   └── globals.css      # Custom styles & Tailwind v4 dark mode configuration
    │   └── components/
    │       ├── SplitLayout.tsx  # Dual-pane layout & sidebar theme toggle
    │       ├── ChatInterface.tsx# Message history, 3D response cards & action toolbars
    │       ├── PDFUploader.tsx  # Dropzone upload & document indexing summary widget
    │       └── AIStatusIndicator.tsx # AI state status indicator (searching/thinking)
```

---

## 🚀 Local Setup & Installation

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & `npm`
- **Google Gemini API Key** (obtain from [Google AI Studio](https://aistudio.google.com/))

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your Gemini API Key
echo GEMINI_API_KEY=your_gemini_api_key_here > .env

# Run FastAPI backend server
uvicorn main:app --reload
```
> The backend server runs at `http://localhost:8000`.

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
> The frontend application runs at `http://localhost:3000`.

---

## 🛰️ API Reference

### `POST /upload`
Uploads and indexes a PDF document into the vector database.
- **Request:** `FormData` containing `file` (`.pdf`).
- **Response:**
  ```json
  {
    "status": "success",
    "filename": "document.pdf",
    "num_chunks": 42
  }
  ```

### `POST /chat`
Streams real-time response data using Server-Sent Events (SSE).
- **Request Body:**
  ```json
  {
    "message": "Summarize key concepts in Chapter 2"
  }
  ```
- **Response:** SSE Stream emitting events:
  - `data: {"type": "state", "state": "searching"}`
  - `data: {"type": "chunk", "content": "..."}`
  - `data: {"type": "done"}`

---

## 🎨 Design System

- **Primary Colors:** Deep Indigo (`#4f46e5`), Violet (`#7c3aed`), Slate Dark (`#0f172a`), Emerald Accent (`#10b981`).
- **Typography:** Geist Sans & Geist Mono.
- **Animations:** Framer Motion 3D perspective transforms & micro-interactions.

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).
