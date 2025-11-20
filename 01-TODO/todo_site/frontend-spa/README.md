# Frontend SPA

This folder contains a minimal React + Vite single-page app that talks to the Django API at `/api`.

Run locally:

```powershell
cd 01-TODO/todo_site/frontend-spa
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://127.0.0.1:8000` (see `vite.config.js`). Make sure the Django dev server is running on port 8000.
