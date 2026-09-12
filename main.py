from __future__ import annotations

import uuid
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()  # must run before app modules read os.environ at import time

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from app.database import (
    apply_reanalysis,
    bulk_create_tickets,
    get_ticket_by_id,
    get_tickets,
    init_db,
    patch_ticket,
    reset_engine,
    send_ticket,
)
from app.llm_client import decompose
from app.models import ActionType, IngestRequest, TicketPatch, TicketStatus


def _serialize_ticket(ticket):
    data = ticket.model_dump()
    data["title"] = ticket.summary
    data["createdAt"] = ticket.created_at.isoformat() if ticket.created_at else None
    data["updatedAt"] = ticket.updated_at.isoformat() if ticket.updated_at else None
    data["original"] = ticket.original_fragment
    data["aiDraft"] = ticket.draft_reply
    return data


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


def create_app(database_url: str | None = None) -> FastAPI:
    if database_url:
        reset_engine(database_url)
    init_db(database_url)
    app = FastAPI(title="Smart Support Gateway", version="0.1.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/api/tickets/ingest", status_code=status.HTTP_201_CREATED)
    def ingest(payload: IngestRequest):
        result = decompose(payload.raw_text)
        parent_message_id = str(uuid.uuid4())
        records: list[dict] = []
        for sub in result.tickets:
            action_type = sub.action_type
            if action_type == ActionType.AUTO_REPLY and not payload.allow_ai_reply:
                action_type = ActionType.CREATE_TICKET

            if action_type == ActionType.AUTO_REPLY and payload.allow_ai_reply:
                status_value = TicketStatus.RESOLVED.value
            elif sub.requires_clarification or action_type == ActionType.REQUEST_CLARIFICATION:
                status_value = TicketStatus.CLARIFY.value
            else:
                status_value = TicketStatus.NEW.value

            record = {
                "parent_message_id": parent_message_id,
                "original_fragment": sub.original_fragment,
                "summary": sub.summary,
                "category": sub.category.value,
                "priority": sub.priority.value,
                "action_type": action_type.value,
                "requires_clarification": bool(sub.requires_clarification),
                "missing_info": list(sub.missing_info or []),
                "kb_template_id": sub.kb_template_id,
                "draft_reply": sub.draft_reply,
                "reasoning": sub.reasoning,
                "status": status_value,
            }
            records.append(record)

        created_items = bulk_create_tickets(records)
        return {
            "parent_message_id": parent_message_id,
            "created_tickets": [{"id": ticket.id} for ticket in created_items],
        }

    @app.get("/api/tickets")
    def list_tickets(
        status: str | None = Query(default=None),
        priority: str | None = Query(default=None),
        category: str | None = Query(default=None),
    ):
        tickets = get_tickets(status=status, priority=priority, category=category)
        return [_serialize_ticket(ticket) for ticket in tickets]

    @app.patch("/api/tickets/{ticket_id}")
    def patch_ticket_endpoint(ticket_id: int, payload: TicketPatch):
        patch_data = payload.model_dump(exclude_unset=True)
        ticket = patch_ticket(ticket_id, patch_data)
        if ticket is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
        return _serialize_ticket(ticket)

    @app.post("/api/tickets/{ticket_id}/send")
    def send_ticket_endpoint(ticket_id: int):
        ticket = send_ticket(ticket_id)
        if ticket is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
        return _serialize_ticket(ticket)

    @app.post("/api/tickets/{ticket_id}/reanalyze")
    def reanalyze_ticket_endpoint(ticket_id: int):
        ticket = get_ticket_by_id(ticket_id)
        if ticket is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

        result = decompose(ticket.original_fragment)
        if not result.tickets:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Analysis produced no result")

        updated = apply_reanalysis(ticket_id, result.tickets[0])
        return _serialize_ticket(updated)

    @app.get("/api/tickets/{ticket_id}")
    def get_ticket_endpoint(ticket_id: int):
        ticket = get_ticket_by_id(ticket_id)
        if ticket is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
        return _serialize_ticket(ticket)

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
