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
- GET /api/tickets/{id}
- PATCH /api/tickets/{id}
- POST /api/tickets/{id}/reanalyze — re-run AI analysis in place, without moving the ticket's status
- POST /api/tickets/{id}/send

Swagger is available at http://localhost:8000/docs. The operator UI also has an "API / Бэкенд" section in the sidebar with a live health check and links to Swagger/ReDoc.

## Run with Docker

One command, single origin — no `:8000`/`:5173` ports to remember:

```bash
cp .env.example .env   # fill in YANDEX_API_KEY / ANTHROPIC_API_KEY if you have one
docker compose up --build
```

Open **http://localhost**. The frontend container (nginx) serves the built React app and reverse-proxies `/api/*`, `/health`, `/docs`, `/redoc`, `/openapi.json` to the backend container over the internal compose network — the backend itself isn't published to the host, so there is exactly one address to open. Ticket data persists in a named volume (`backend_data`) across rebuilds.

## LLM provider

`app/llm_client.py` picks a provider by whichever key is set, in order, and always has a deterministic fallback so a demo never breaks:

1. **Yandex Cloud** (OpenAI-compatible Foundation Models API) if `YANDEX_API_KEY` is set — see `API_example.py` for the raw call shape this mirrors.
2. **Anthropic Claude** if `ANTHROPIC_API_KEY` is set instead.
3. A keyword-based heuristic (`_fallback_decompose`) if neither key is set, or if the API call fails for any reason (network, quota, invalid JSON).

The system prompt sent to either LLM includes the actual `kb.json` contents (ids, keywords, template text) as searchable context, with an explicit instruction not to guess at terms/systems that aren't covered by it — so an unfamiliar acronym or internal system name gets routed to a human operator (`category=other`, `create_ticket`/`request_clarification`) instead of a hallucinated answer. A second safety net (`_apply_kb_safety_net`) then checks every ticket regardless of provider: if a ticket is marked `auto_reply` but has no actual reply text, it's downgraded to a normal operator-reviewed ticket rather than "auto-replying" with nothing.

## Product note

This is a second-line support tool: the AI never replies to the end user automatically. `POST /api/tickets/ingest` is always called with `allow_ai_reply: false` from the chat UI, so tickets always land with an operator for review — the AI's `draft_reply` is only ever shown to the operator as a "recommended answer" to insert, edit, and send manually.
