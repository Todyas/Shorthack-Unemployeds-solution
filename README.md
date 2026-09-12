# Smart Support Gateway

Backend + React frontend for the hackathon support dashboard. The frontend (`supportpilot-react/`) talks to this FastAPI backend over `/api/tickets/*` — no mock data.

## Setup

```bash
cd Backend
export LD_LIBRARY_PATH=/run/host/root/usr/lib64:${LD_LIBRARY_PATH:-}
/run/host/root/usr/bin/uv sync --extra dev
```

## Run

Two terminals, backend first:

```bash
# Terminal 1 — backend
cd Backend
export LD_LIBRARY_PATH=/run/host/root/usr/lib64:${LD_LIBRARY_PATH:-}
.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

```bash
# Terminal 2 — frontend
cd supportpilot-react
npm install
npm run dev
```

Open http://localhost:5173. CORS on the backend is open (`allow_origins=["*"]`), so the frontend can call `http://localhost:8000` directly — override this with `VITE_API_BASE_URL` (see `supportpilot-react/.env.example`) if the backend runs elsewhere.

## API

- GET /health
- POST /api/tickets/ingest
- GET /api/tickets
- PATCH /api/tickets/{id}
- POST /api/tickets/{id}/send

Swagger is available at http://localhost:8000/docs.

## Product note

This is a second-line support tool: the AI never replies to the end user automatically. `POST /api/tickets/ingest` is always called with `allow_ai_reply: false` from the chat UI, so tickets always land with an operator for review — the AI's `draft_reply` is only ever shown to the operator as a "recommended answer" to insert, edit, and send manually.
