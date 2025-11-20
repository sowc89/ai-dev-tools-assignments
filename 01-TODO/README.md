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

It ran the commands, verified the versions and shared the below information: 

> Results (important outputs):
> 
> 
> 
> Python version: Python 3.14.0
> 
> pip upgraded to 25.3
> 
> Django installed: Django 5.2.8
> 
> Verification: both django-admin --version and python -m django --version returned 5.2.8
> 
> Notes and next steps: To work in the venv later, activate it in PowerShell with:
>   .\venv\Scripts\Activate.ps1

### Initializing the TODO App

Prompt: 

Now, lets create a Django app which has a TODO app functionality with the ability to add Tasks, group them under a category, set up reminders, snooze them to a later date. We can discuss the functionality and technical aspects to arrive at a conclusion first and then create the files.

GPT: Questions for you (pick answers or add preferences)

Project and app names: I propose todo_site (project) and tasks (app). OK?
Multi-user? Do you want per-user tasks (login) now, or start single-user?
Notifications: console-only for now, or set up email sending (you’ll need SMTP credentials)?
REST API: do you want DRF endpoints now or only server-rendered HTML views?
Scheduling: use Windows Task Scheduler to run the management command (I’ll provide instructions), or include apscheduler to run inside Django?
UI: simple Bootstrap templates are fine, or do you want a SPA front-end later?

ME: 
1. ok 2. lets start as single user 3. lets start with console and add other integrations later on 4. DRF endpoints 5. lets use Django scheduler 6. SPA front end

After few back & forths, summary of the steps to get the app up and running. 

**Setup Steps We Followed**
Below are the concrete steps and commands used to create and run this project locally. Use these to reproduce the environment or to continue development.

- **Python & venv:** Created and activated a virtual environment in the workspace root and used it for all Python commands.
	- `python -m venv venv`
	- `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force` (PowerShell, if activation is blocked)
	- `.\venv\Scripts\Activate.ps1`

- **Install Python deps:** Installed Django, DRF and scheduler support in the venv.
	- `python -m pip install --upgrade pip`
	- `python -m pip install -r todo_site/requirements.txt`

- **Project scaffold & files added:** I scaffolded a Django project `todo_site/` and an app `tasks/` and added the following important files:
	- `todo_site/manage.py`, `todo_site/todo_site/settings.py`, `todo_site/todo_site/urls.py`, `todo_site/todo_site/wsgi.py`
	- `todo_site/tasks/models.py`, `todo_site/tasks/admin.py`, `todo_site/tasks/views.py`, `todo_site/tasks/serializers.py`, `todo_site/tasks/urls.py`
	- `todo_site/tasks/management/commands/process_reminders.py` (management command to print reminders)
	- `todo_site/tasks/scheduler.py` (apscheduler registration; guarded in dev)
	- `todo_site/requirements.txt`

- **Database migrations & superuser:** Created migrations, applied them, and created an interactive superuser for the admin site.
	- `cd todo_site`
	- `python manage.py makemigrations tasks`
	- `python manage.py migrate`
	- `python manage.py createsuperuser` (interactive)

- **Run Django dev server:** Start the development server (scheduler starts only when `runserver` is active):
	- `python manage.py runserver`

- **Scheduler safety & SQLite tuning:** To avoid "database is locked" during development we:
	- Added a guard in `tasks/apps.py` so the scheduler only starts when running the dev server (not during `migrate`/`createsuperuser`).
	- Configured SQLite to use WAL mode and increased the connection `timeout` in `todo_site/todo_site/settings.py`.
	- For development the scheduler uses an in-memory jobstore to avoid frequent DB writes (see `tasks/scheduler.py`). In production use a persistent DB (Postgres) and a dedicated scheduler process.

- **API & Admin URLs:**
	- Admin: `http://127.0.0.1:8000/admin/` (use the superuser)
	- API root: `http://127.0.0.1:8000/api/`
	- Tasks endpoint: `http://127.0.0.1:8000/api/tasks/`

- **Minimal static SPA (served by Django):** A tiny static SPA exists at `todo_site/frontend/index.html` and is served by Django at:
	- `http://127.0.0.1:8000/frontend/`

- **Interactive React + Vite SPA (recommended):** I added a full SPA under `todo_site/frontend-spa/` (React + Vite) that proxies `/api` to Django for development. To run it:
	- `cd todo_site/frontend-spa`
	- `npm install`
	- `npm run dev` (opens at `http://127.0.0.1:5173` by default and proxies `/api` → Django on port 8000)

**Troubleshooting & Notes**

- **Database locked errors:** If you see `sqlite3.OperationalError: database is locked`, ensure the scheduler is running in-memory (DEBUG) or stop the scheduler while running heavy DB operations. WAL + increased timeout reduces contention but for multi-process or production use PostgreSQL.
- **Scheduler behavior:** The reminder processor exists as both a management command (`process_reminders`) and an AP scheduler job. The management command prints due reminders to console and can be scheduled with OS tools. The in-process scheduler in development logs reminders every minute.
- **Security:** Do not use the development server or `DEBUG=True` in production. Use strong passwords and store secrets securely.




