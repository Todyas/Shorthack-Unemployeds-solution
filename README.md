# Smart Support Gateway

Backend for the hackathon support dashboard.

## Setup

```bash
cd Backend
export LD_LIBRARY_PATH=/run/host/root/usr/lib64:${LD_LIBRARY_PATH:-}
/run/host/root/usr/bin/uv sync --extra dev
```

## Run

```bash
cd Backend
export LD_LIBRARY_PATH=/run/host/root/usr/lib64:${LD_LIBRARY_PATH:-}
.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API

- GET /health
- POST /api/tickets/ingest
- GET /api/tickets
- PATCH /api/tickets/{id}
- POST /api/tickets/{id}/send

Swagger is available at http://localhost:8000/docs.
