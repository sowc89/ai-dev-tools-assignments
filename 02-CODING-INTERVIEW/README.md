# Online Collaborative Coding Interview App

A real-time collaborative coding platform designed for technical interviews. Features live code synchronization, multi-language execution support, and a sleek, developer-friendly interface.

## Features

-   **Real-time Collaboration**: Live code editing with multiple users synced via Socket.io.
-   **Code Execution**: 
    - **Python**: Runs securely in-browser using WASM (Pyodide) - no server needed!
    - **JavaScript, Java, C++**: Executed via Piston API.
-   **Instant Rooms**: Create or join rooms effortlessly with unique IDs.
-   **Presence**: See who is currently in the room.
-   **Dark Mode Editor**: Powered by Monaco Editor (VS Code).

## Tech Stack

-   **Frontend**: React, Vite, TailwindCSS v4, Monaco Editor, Socket.io Client, **Pyodide (WASM Python)**.
-   **Backend**: Node.js, Express, Socket.io, Axios.
-   **External APIs**: Piston (Code Execution for JS, Java, C++).

## Getting Started

### Prerequisites

-   Node.js (v16+)
-   npm

### Installation

1.  **Clone the repository** (if applicable) or navigate to project root.

2.  **Install all dependencies** (root, backend, and frontend):
    ```bash
    npm run install-all
    ```

### Running the Application

**Option 1: Run both frontend and backend concurrently (Recommended)**
```bash
npm run dev
```

**Option 2: Run separately**

Backend:
```bash
npm run server
# Or: cd backend && npm start
```

Frontend:
```bash
npm run client
# Or: cd frontend && npm run dev
```

3.  **Access the App**:
    Open `http://localhost:5173` in your browser.

## Docker Deployment

**Build and run with Docker Compose (Recommended):**
```bash
docker-compose up --build
```

**Or build and run manually:**
```bash
# Build the image
docker build -t coding-interview-app .

# Run the container
docker run -p 3001:3001 coding-interview-app
```

**Access the app:** Open `http://localhost:3001` in your browser.

**Note:** In Docker mode, both frontend and backend run in a single container. The backend serves the built frontend static files.

## Deploy to Render (Free)

1. **Push your code to GitHub**

2. **Sign up at [render.com](https://render.com)** (free, no credit card needed)

3. **Click "New +" → "Web Service"**

4. **Connect your GitHub repository**

5. **Render will auto-detect the Dockerfile**
   - Name: `coding-interview-app`
   - Environment: `Docker`
   - Plan: `Free`

6. **Click "Create Web Service"**

7. **Wait for deployment** (~2-3 minutes)

8. **Access your app** at `https://your-app-name.onrender.com`

**Note:** Free tier spins down after 15 minutes of inactivity. First request after sleep takes ~30 seconds.

## Integration Tests

To run the integration tests (Backend):

```bash
cd backend
npm test
```

(Note: Ensure you have installed test dependencies as described in `package.json` devDependencies).
