## Run Locally

### Prerequisites
- Node.js 18+
- Python 3.13

### 1. Install frontend dependencies
```bash
npm install
```

### 2. Configure environment variables
Create a local environment file:
```bash
cp .env.example .env.local
```

Then configure the OpenAI API in [.env.local](.env.local):
```env
OPENAI_API_KEY="your_openai_api_key"
OPENAI_MODEL="gpt-5.4-nano"
OPENAI_TIMEOUT_MS="45000"
```

- `OPENAI_API_KEY` is required and must come from the OpenAI Platform.
- `OPENAI_MODEL` is optional. The default is `gpt-5.4-nano`.
- `OPENAI_TIMEOUT_MS` is optional.
- Do not commit `.env.local`; it is ignored by Git and should contain your private key only on your machine.

### 3. Install backend dependencies
```bash
py -3.13 -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
```

### 4. Start the backend API
```bash
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

### 5. Start the frontend app
In a second terminal:
```bash
npm run dev
```

### 6. Login
Define admin credentials in your shell before starting the backend:
```bash
set KARDIA_ADMIN_EMAIL=admin@kardia.local
set KARDIA_ADMIN_PASSWORD=change-me-now
```

You can also register new users through the `/auth/register` endpoint exposed by the FastAPI backend.

### 7. Notes
- The frontend expects the backend to be available at `http://127.0.0.1:8000`.
- Local persistence for the backend is stored under `backend/data/` and should stay out of version control.
- The change log is available in [CHANGES.md](CHANGES.md).
- If multiple Python versions are installed, use `py -3.13` explicitly for this project.
