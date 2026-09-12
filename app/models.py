from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel, JSON, Column


class Category(str, Enum):
    WIFI = "wifi"
    VPN = "vpn"
    ACCESS_CONTROL = "access_control"
    PERSONAL_CABINET = "personal_cabinet"
    PASSWORD_RESET = "password_reset"
    HR = "hr"
    OTHER = "other"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class ActionType(str, Enum):
    AUTO_REPLY = "auto_reply"
    CREATE_TICKET = "create_ticket"
    REQUEST_CLARIFICATION = "request_clarification"
    ESCALATE = "escalate"


class TicketStatus(str, Enum):
    NEW = "new"
    CLARIFY = "clarify"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"


class SubTicket(SQLModel):
    original_fragment: str
    summary: str
    category: Category
    priority: Priority
    action_type: ActionType
    requires_clarification: bool = False
    missing_info: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    kb_template_id: Optional[str] = None
    draft_reply: Optional[str] = None
    reasoning: Optional[str] = None


class DecompositionResult(SQLModel):
    source_text: str
    tickets: list[SubTicket]


class Ticket(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    parent_message_id: str = Field(index=True)
    original_fragment: str
    summary: str
    category: str
    priority: str
    action_type: str
    requires_clarification: bool = False
    missing_info: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    kb_template_id: Optional[str] = None
    draft_reply: Optional[str] = None
    reasoning: Optional[str] = None
    status: str = Field(default=TicketStatus.NEW.value, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    sent_at: Optional[datetime] = None


class IngestRequest(SQLModel):
    raw_text: str
    allow_ai_reply: bool = True


class TicketPatch(SQLModel):
    status: Optional[str] = None
    draft_reply: Optional[str] = None
    priority: Optional[str] = None
    summary: Optional[str] = None
    action_type: Optional[str] = None
    requires_clarification: Optional[bool] = None


class TicketRead(SQLModel):
    id: int
    parent_message_id: str
    original_fragment: str
    summary: str
    category: str
    priority: str
    action_type: str
    requires_clarification: bool
    missing_info: list[str]
    kb_template_id: Optional[str] = None
    draft_reply: Optional[str] = None
    reasoning: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    sent_at: Optional[datetime] = None
    title: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
    aiDraft: Optional[str] = None
