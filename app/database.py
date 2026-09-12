from __future__ import annotations

import os
from datetime import datetime
from typing import Iterator

from sqlmodel import Session, SQLModel, create_engine, select

from .models import SubTicket, Ticket, TicketStatus

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def reset_engine(database_url: str | None = None) -> None:
    global engine
    resolved_url = database_url or os.getenv("DATABASE_URL", "sqlite:///./app.db")
    engine = create_engine(resolved_url, connect_args={"check_same_thread": False})


def init_db(database_url: str | None = None) -> None:
    if database_url:
        reset_engine(database_url)
    SQLModel.metadata.create_all(engine)


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session


def create_ticket_record(ticket_data: dict) -> Ticket:
    created = Ticket(**ticket_data)
    with Session(engine) as session:
        session.add(created)
        session.commit()
        session.refresh(created)
    return created


def get_tickets(status: str | None = None, priority: str | None = None, category: str | None = None) -> list[Ticket]:
    with Session(engine) as session:
        statement = select(Ticket)
        if status:
            statement = statement.where(Ticket.status == status)
        if priority:
            statement = statement.where(Ticket.priority == priority)
        if category:
            statement = statement.where(Ticket.category == category)
        statement = statement.order_by(
            (Ticket.priority == "urgent").desc(),
            Ticket.created_at.desc(),
        )
        return list(session.exec(statement).all())


def get_ticket_by_id(ticket_id: int) -> Ticket | None:
    with Session(engine) as session:
        return session.get(Ticket, ticket_id)


def patch_ticket(ticket_id: int, patch: dict) -> Ticket | None:
    with Session(engine) as session:
        ticket = session.get(Ticket, ticket_id)
        if ticket is None:
            return None
        for field, value in patch.items():
            if value is not None:
                setattr(ticket, field, value)
        ticket.updated_at = datetime.utcnow()
        session.add(ticket)
        session.commit()
        session.refresh(ticket)
        return ticket


def send_ticket(ticket_id: int) -> Ticket | None:
    with Session(engine) as session:
        ticket = session.get(Ticket, ticket_id)
        if ticket is None:
            return None
        ticket.status = TicketStatus.RESOLVED.value
        ticket.sent_at = datetime.utcnow()
        ticket.updated_at = datetime.utcnow()
        session.add(ticket)
        session.commit()
        session.refresh(ticket)
        return ticket


def apply_reanalysis(ticket_id: int, sub: SubTicket) -> Ticket | None:
    # В отличие от patch_ticket, здесь поле кладётся как есть (включая None) —
    # свежий анализ должен полностью заменить старый, а не только дополнить его.
    with Session(engine) as session:
        ticket = session.get(Ticket, ticket_id)
        if ticket is None:
            return None
        ticket.summary = sub.summary
        ticket.category = sub.category.value
        ticket.priority = sub.priority.value
        ticket.action_type = sub.action_type.value
        ticket.requires_clarification = bool(sub.requires_clarification)
        ticket.missing_info = list(sub.missing_info or [])
        ticket.kb_template_id = sub.kb_template_id
        ticket.draft_reply = sub.draft_reply
        ticket.updated_at = datetime.utcnow()
        session.add(ticket)
        session.commit()
        session.refresh(ticket)
        return ticket


def bulk_create_tickets(records: list[dict]) -> list[Ticket]:
    with Session(engine) as session:
        created: list[Ticket] = []
        for record in records:
            ticket = Ticket(**record)
            session.add(ticket)
            created.append(ticket)
        session.commit()
        for ticket in created:
            session.refresh(ticket)
        return created
