# Quick Start Guide - Trudy Backend

## How to Start the Backend Server

**Step 1:** Open PowerShell or Command Prompt in the `z-backend` folder

**Step 2:** Activate the virtual environment:
```powershell
venv\Scripts\activate
```

**Step 3:** Start the server:
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Or without reload (if you get caching errors):
```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## Server URLs

Once started, the server will be available at:

- **API Base URL:** http://127.0.0.1:8000
- **Health Check:** http://127.0.0.1:8000/health
- **API Documentation:** http://127.0.0.1:8000/docs
- **Alternative Docs:** http://127.0.0.1:8000/redoc

## Stopping the Server

Press `Ctrl + C` in the terminal to stop the server.

## Troubleshooting

### If you get httpcore errors:
1. Clear Python cache:
   ```powershell
   Get-ChildItem -Path "venv\Lib\site-packages\httpcore" -Filter "__pycache__" -Recurse -Directory | Remove-Item -Recurse -Force
   ```

2. Restart the server

### If you get import errors:
Make sure you're in the `z-backend` directory and the virtual environment is activated (you should see `(venv)` in your prompt).

## Next Steps

1. Set up `.env` file with your credentials (Supabase, Auth0, AWS)
2. Run database migration in Supabase SQL Editor
3. Test the API at http://127.0.0.1:8000/docs

