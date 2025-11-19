# Module 1 Assignment

## Using AI Tools and building a TODO application in DJango

1. Installing DJango, with AI's assistance (Using Github Copilot with GPT-5 mini)

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




