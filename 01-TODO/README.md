# Module 1 Assignment

## Using AI Tools and building a TODO application in DJango

### Installing DJango, with AI's assistance (Using Github Copilot with GPT-5 mini)

Prompt:  I would like to install Django in my windows 11 machine.

The AI suggested to check the Python's version, then create a virtual environment, activate it and install Django using the below commands

```python
python --version
python -m venv venv
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
. .\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install Django
django-admin --version
python -m django --version
deactivate
```

## Using AI tools to build a TODO application in Django

This repository contains a small Django TODO application (project: `todo_site`, app: `tasks`) scaffolded with guidance from an AI assistant. It includes a DRF API, a reminder processor (management command), an in-process scheduler for development, and a minimal React + Vite SPA for interacting with the API.

Prerequisites

- Python 3.10+ (this project was tested with Python 3.14)
- Node.js & npm (for the SPA)
- Git
- PowerShell on Windows: you may need to set the execution policy before activating a venv:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
```

Quick start (from repository root)

1. Create and activate a virtual environment (repo root):

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

2. Install Python dependencies and run migrations:

```powershell
cd 01-TODO/todo_site
python -m pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

3. Run the Django development server:

```powershell
python manage.py runserver 0.0.0.0:8000
```

4. (Optional) Run the React + Vite SPA (separate terminal):

```powershell
cd 01-TODO/todo_site/frontend-spa
npm install
npm run dev
```

Useful commands

- Manually process due reminders (prints notifications to the console):

```powershell
cd 01-TODO/todo_site
python manage.py process_reminders
```

Where to look

- Admin: `http://127.0.0.1:8000/admin/`
- API root: `http://127.0.0.1:8000/api/`
- Tasks endpoint: `http://127.0.0.1:8000/api/tasks/`
- Static minimal SPA (served by Django): `http://127.0.0.1:8000/frontend/`

Scheduler and database notes

- The project includes a small APScheduler integration for development. To avoid SQLite write contention during development the in-memory jobstore is used when `DEBUG=True`.
- `settings.py` configures SQLite to use WAL mode and increases the connection timeout to reduce `database is locked` occurrences. For production, use PostgreSQL and run a dedicated scheduler process or use a persistent jobstore.

Troubleshooting

- If you see `sqlite3.OperationalError: database is locked`:
  - Stop other processes that might be accessing `db.sqlite3`.
  - Ensure the scheduler guard is present (the scheduler won't start during `migrate` or `createsuperuser`).
  - Consider using Postgres for multi-process access.

Git & collaboration tips

- Commit migration files and the `.gitignore` changes. Work on a feature branch when making larger changes:

```powershell
git switch -c feature/todo-scheduler
git add -A
git commit -m "Add TODO app scaffold, scheduler, and SPA"
git push -u origin feature/todo-scheduler
```

Running Tests

Use the command

```python manage.py test ```

Security & production

- Do not run with `DEBUG=True` in production. Use proper secrets management for SMTP credentials and other environment variables. For real email delivery, configure Django's email backend and store credentials in environment variables or a secrets manager.

If you'd like, I can apply further changes (polish wording, add a short diagram of the architecture, or commit this README update). Tell me which option you prefer.




