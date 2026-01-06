# Flashcards AI

An intelligent flashcard application that helps students study more effectively. It features AI-powered deck generation from PDFs, enabling users to instantly create study materials from their notes or textbooks.

## Features

- **AI-Powered Generation**: Upload PDF documents to automatically generate flashcards using Google Gemini Flash.
- **Study Mode**: Interactive study mode with flip animations and navigation.
- **Deck Management**: Create, organize, and manage multiple flashcard decks.
- **Deck Deletion**: Easily remove unwanted decks and associated cards with a single click.
- **Feedback Loop**: Rate and refine AI-generated cards to improve quality.
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS.

The app is deployed to Render and can be accessed at https://flashcard-ai-app.onrender.com

## Tech Stack

![App Screenshot](image.png)

AI Agent uses the MCP server to extract the pdf text. It is to avoid overloading the LLM with large pdfs. Also, later if another pdf extraction tool or documents of other formats have to be supported, it can be done easily by just changing the MCP server.

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (with Nginx fallback)
- **HTTP Client**: Axios
- **Testing**: Vitest, React Testing Library

### Backend
- **Framework**: FastAPI
- **Database**: SQLite with SQLModel (ORM)
- **AI**: Google Gemini API (via `google-generativeai`)
- **MCP Server**: FastMCP (for PDF text extraction)
- **PDF Processing**: pypdf
- **Testing**: Pytest, TestClient, pytest-asyncio

### Infrastructure & CI/CD
- **Containerization**: Docker (Multi-stage build)
- **Web Server**: Nginx (Reverse proxy)
- **Deployment**: [Render](https://render.com) (via Webservices)
- **CI/CD**: GitHub Actions (Automated testing & linting)

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

## Deployment & CI/CD

### 1. GitHub Actions (CI)
The project includes a CI pipeline that runs on every push and pull request to the `main` branch.
- **Location**: `.github/workflows/flashcards-ci.yml` (Repository Root)
- **Checks**: Backend tests, Frontend tests, and Linting.
- **Gated Deployment**: If all tests pass and the branch is `main`, GitHub automatically triggers a deployment to Render via a Deploy Hook.

**Important Note for Success-only Deployment:**
To ensure Render ONLY deploys when tests pass:
1.  **On Render**: Go to your Web Service Settings and set **Auto-Deploy** to "No".
2.  **On GitHub**: 
    - Go to your repository **Settings** > **Secrets and variables** > **Actions**.
    - Add a new secret: `RENDER_DEPLOY_HOOK_URL`.
    - Paste the **Deploy Hook** URL found in your Render service settings.

### 2. Docker Deployment (Single Container)
The application is containerized using a multi-stage Dockerfile that bundles both the React frontend and FastAPI backend into a single image.
- **Dockerfile**: `Dockerfile` (Project Root)
- **Orchestration**: Nginx acts as a reverse proxy, serving the frontend static files and forwarding API requests to the Python server.
- **Local Build**:
  ```bash
  cd 01-PROJECT-FLASHCARDS
  docker build -t flashcards-app .
  docker run -p 10000:10000 -e GOOGLE_API_KEY=your_key flashcards-app
  ```

### 3. Render Deployment (CD)
The application is deployed to [Render](https://render.com) as a **Web Service**.
- **Build Strategy**: Docker
- **Docker Context**: `01-PROJECT-FLASHCARDS`
- **Dockerfile Path**: `Dockerfile` (relative to the context)
- **Environment Variables**: Ensure `GOOGLE_API_KEY` is configured in the Render dashboard.

Any github commit triggers CI using Github actions and also trigger the deployment to Render.

*Note: While a manual Web Service is used, the repository still includes a `render.yaml` for optional Blueprint-based deployment.*

## Verified Test Suites

Both the backend and frontend have comprehensive test suites ensuring reliability:
- **Backend**: 13 tests (Unit & Integration) covering AI generation, refinement, and CRUD operations.
- **Frontend**: 11 tests covering Study Mode, Deck View, and AI UI flows.
