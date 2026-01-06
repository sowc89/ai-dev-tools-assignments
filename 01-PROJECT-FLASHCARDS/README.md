# Flashcards AI

An intelligent flashcard application that helps students study more effectively. It features AI-powered deck generation from PDFs, enabling users to instantly create study materials from their notes or textbooks.

![App Screenshot](image.png)

## Features

- **AI-Powered Generation**: Upload PDF documents (including handwritten notes) to automatically generate flashcards using Google Gemini 1.5 Flash.
- **Study Mode**: Interactive study mode with flip animations and navigation.
- **Deck Management**: Create, organize, and manage multiple flashcard decks.
- **Feedback Loop**: Rate and refine AI-generated cards to improve quality.
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS.

## Tech Stack


### Frontendp
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Testing**: Vitest, React Testing Library

### Backend
- **Framework**: FastAPI
- **Database**: SQLite with SQLModel (ORM)
- **AI**: Google Gemini API (via `google-generativeai`)
- **MCP Server**: FastMCP (for PDF text extraction)
- **PDF Processing**: pypdf
- **Testing**: Pytest, TestClient, pytest-asyncio

## Prerequisites

- Node.js (v18+)
- Python (3.12+)
- Google Cloud API Key (for Gemini)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd flashcards-app
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd backend
```

Create and activate a virtual environment (optional but recommended):
```bash
python -m venv venv
# Windows
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Configure Environment Variables:
Create a `.env` file in the `backend` directory:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
DATABASE_URL=sqlite:///database.db # Optional, defaults to this if not set
```

Start the Server:
```bash
uvicorn app.main:app --reload
```
*Tip: If `uvicorn` is not found, try running `python -m uvicorn app.main:app --reload` instead.*

The backend will run at `http://localhost:8000`. API specs available at `http://localhost:8000/docs`.

### Switching to PostgreSQL (Optional)

The application defaults to SQLite (`sqlite:///database.db`). To switch to PostgreSQL:

1. **Install the driver**:
   ```bash
   pip install psycopg2-binary
   ```
2. **Update `.env`**:
   Change `DATABASE_URL` to your PostgreSQL connection string:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/flashcards_db
   ```
3. **Restart the Backend**:
   The application will automatically connect to the new database.

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the Development Server:
```bash
npm run dev
```
The application will run at `http://localhost:5173`.

## Testing

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```




