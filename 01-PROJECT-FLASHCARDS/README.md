# Flashcards AI

An intelligent flashcard application that helps students study more effectively. It features AI-powered deck generation from PDFs, enabling users to instantly create study materials from their notes or textbooks.

## Features

### Core Functionality
- **Secure Authentication**: User registration and login powered by JWT (JSON Web Tokens) with extended 30-day sessions and automatic expiration handling.
- **User Data Isolation**: Multi-user support ensuring users only see and manage their own flashcard decks and data.
- **Smart Card Categorization**: Track your progress by categorizing cards into **New**, **Reviewing**, or **Mastered** with intuitive status badges.
- **Deck Tagging & Organization**: Add custom tags to your decks for better organization and management.
- **Real-Time Filtering**: Instantly find any deck by searching through names, descriptions, or tags using the intelligent search bar.
- **Interactive Study Mode**: Focus on learning with flip animations, navigation controls, and organized card grouping.

### AI-Powered Features
- **AI-Powered PDF Generation**: Upload PDF documents to automatically generate flashcards using Google Gemini Flash with intelligent text extraction.
- **MCP-Based Architecture**: Utilizes Model Context Protocol (MCP) for efficient PDF processing, preventing LLM overload and enabling easy extensibility to other document formats.
- **Smart Page Selection**: Extract flashcards from specific page ranges to focus on relevant content.
- **Feedback Loop**: Review, rate, and refine AI-generated cards to improve quality and personalize your learning experience.
- **File Size Guidance**: User-friendly warnings recommend keeping PDFs under 1MB for optimal performance.

![App Screenshot](image.png)

AGENT_WORKFLOW.md has the details of how the coding assistant and mcp tools assisted the project development workflow. 

The app is deployed to Render and can be accessed at https://flashcard-ai-app.onrender.com

## Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (with AuthGuard & Nginx fallback)
- **HTTP Client**: Axios
- **Testing**: Vitest, React Testing Library, @vitest/coverage-v8

### Backend
- **Framework**: FastAPI
- **Database**: SQLite with SQLModel (ORM)
- **Authentication**: JWT (python-jose), Password Hashing (passlib/bcrypt)
- **AI**: Google Gemini API (via `google-generativeai`)
- **MCP Server**: FastMCP (for PDF text extraction)
- **PDF Processing**: pypdf
- **Testing**: Pytest, TestClient, pytest-asyncio, pytest-cov

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
cd 01-PROJECT-FLASHCARDS
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
SECRET_KEY=your_jwt_secret_key_here # Optional for local development (has default fallback)
DATABASE_URL=sqlite:///database.db # Optional, defaults to this if not set
```
*Note: `SECRET_KEY` is optional for local development but **highly recommended** for production to ensure JWT token security.*

Start the Server:
```bash
uvicorn app.main:app --reload
```
*Tip: If `uvicorn` is not found, try running `python -m uvicorn app.main:app --reload` instead.*

The backend will run at `http://localhost:8000`. API specs available at `http://localhost:8000/docs`.

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
python -m pytest --cov=app --cov-report=term-missing
```

### Frontend Tests
```bash
cd frontend
npm test -- --coverage
```

## Deployment & CI/CD

### 1. GitHub Actions (CI)
The project includes a CI pipeline that runs on every push and pull request to the `main` branch.
- **Location**: `.github/workflows/flashcards-ci.yml` (Repository Root)
- **Checks**: Backend tests, Frontend tests, and Linting.
- **Code Coverage**: Automatically reports test coverage metrics in the CI logs (aiming for high quality and isolation).
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
- **Environment Variables**: 
  - `GOOGLE_API_KEY`: Required for AI features.
  - `ALLOWED_ORIGINS`: Set this to your production URL (e.g., `https://flashcards-app.onrender.com`) after the first deployment.
  - `SECRET_KEY`: Can be auto-generated by Render (using `generateValue: true` in `render.yaml`) or manually set.
- **Persistence**: SQLite data is lost on every deploy unless you set up a **Persistent Disk** and mount it to `/app/backend`.

Any github commit triggers CI using Github actions and also trigger the deployment to Render.

*Note: While a manual Web Service is used, the repository still includes a `render.yaml` for optional Blueprint-based deployment.*

Both the backend and frontend have comprehensive test suites ensuring reliability and security:
- **Backend**: 16 tests covering AI generation, refinement, CRUD operations, and **Strict Security Isolation**.
- **Frontend**: 18 tests covering Login flow, Auth Guards, Study Mode, and AI UI flows.
- **Overall Coverage**: Tracked automatically in CI via `pytest-cov` and `vitest`.


## Switching to PostgreSQL (Optional)

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

