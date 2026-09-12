from __future__ import annotations

import json
import os
import re
from typing import Any

from pydantic import ValidationError

from .kb import get_kb_template_for_text
from .models import ActionType, Category, DecompositionResult, Priority, SubTicket


SYSTEM_PROMPT = """
You are a support-ticket decomposer for an internal helpdesk.
Return only valid JSON matching this schema:
{
  "source_text": "...",
  "tickets": [
    {
      "original_fragment": "...",
      "summary": "...",
      "category": "wifi|vpn|access_control|personal_cabinet|password_reset|hr|other",
      "priority": "low|medium|high|urgent",
      "action_type": "auto_reply|create_ticket|request_clarification|escalate",
      "requires_clarification": false,
      "missing_info": [],
      "kb_template_id": "string or null",
      "draft_reply": "string or null"
    }
  ]
}
Rules:
- Split the input into atomic support issues.
- A request may create multiple tickets from one message.
- If a request can be answered with a known KB template, use auto_reply.
- When the message is vague, use request_clarification.
- Use urgent only for physical access, door locks, urgent outage, safety, or immediate blockers.
- Return valid JSON only, without markdown fences.
"""


KEYWORD_RULES: dict[Category, list[str]] = {
    Category.WIFI: ["wifi", "wi-fi", "роутер", "сеть", "подключиться", "авторизац", "интернет"],
    Category.VPN: ["vpn", "впн", "туннель", "удаленный доступ"],
    Category.ACCESS_CONTROL: ["скуд", "пропуск", "турникет", "карта доступа", "дверь"],
    Category.PERSONAL_CABINET: ["личный кабинет", "лк", "не открывается", "не грузится", "вход"],
    Category.PASSWORD_RESET: ["пароль", "забыл пароль", "сбросить пароль", "заблокирован аккаунт"],
    Category.HR: ["отпуск", "согласуйте", "кадров", "hr", "отсутствие", "командиров"],
}


def _lower_text(value: str) -> str:
    return value.lower()


def _detect_category(text: str) -> Category:
    lowered = _lower_text(text)
    for category, keywords in KEYWORD_RULES.items():
        if any(keyword in lowered for keyword in keywords):
            return category
    return Category.OTHER


def _detect_priority(text: str) -> Priority:
    lowered = _lower_text(text)
    urgent_keywords = ["не могу войти", "заблокирован", "не работает", "турникет", "дверь", "пропуск", "срочно", "экстренно", "немедленно", "urgent"]
    high_keywords = ["не работает", "отсутствует", "сбой", "ошибка авторизац", "wifi", "впн"]
    if any(keyword in lowered for keyword in urgent_keywords):
        return Priority.URGENT
    if any(keyword in lowered for keyword in high_keywords):
        return Priority.HIGH
    if "отпуск" in lowered or "соглас" in lowered:
        return Priority.LOW
    return Priority.MEDIUM


def _extract_fragments(raw_text: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+|\n+", raw_text.strip())
    fragments = [fragment.strip() for fragment in sentences if fragment.strip()]
    if not fragments:
        return [raw_text.strip()]
    if len(fragments) == 1:
        return [fragments[0]]
    return fragments[:2]


def _build_fallback_ticket(raw_text: str, fragment: str) -> SubTicket:
    category = _detect_category(fragment)
    action_type = ActionType.AUTO_REPLY
    if "отпуск" in _lower_text(fragment) or "соглас" in _lower_text(fragment):
        action_type = ActionType.REQUEST_CLARIFICATION
    if category in {Category.ACCESS_CONTROL, Category.HR} and "срочно" in _lower_text(fragment):
        action_type = ActionType.ESCALATE
    kb_template_id = get_kb_template_for_text(fragment, category) if category != Category.OTHER else None
    draft_reply = None
    if kb_template_id:
        draft_reply = f"Здравствуйте! По вашему обращению о {category.value} подготовлен шаблон поддержки."
    missing_info: list[str] = []
    if action_type == ActionType.REQUEST_CLARIFICATION:
        missing_info = ["даты отпуска", "ФИО/табельный номер сотрудника"]
    return SubTicket(
        original_fragment=fragment,
        summary=fragment[:120] if len(fragment) > 120 else fragment,
        category=category,
        priority=_detect_priority(fragment),
        action_type=action_type,
        requires_clarification=action_type == ActionType.REQUEST_CLARIFICATION,
        missing_info=missing_info,
        kb_template_id=kb_template_id,
        draft_reply=draft_reply,
    )


def _fallback_decompose(raw_text: str) -> DecompositionResult:
    fragments = _extract_fragments(raw_text)
    tickets = [_build_fallback_ticket(raw_text, fragment) for fragment in fragments]
    if not tickets:
        tickets = [_build_fallback_ticket(raw_text, raw_text)]
    return DecompositionResult(source_text=raw_text, tickets=tickets)


def decompose(raw_text: str) -> DecompositionResult:
    if not raw_text or not raw_text.strip():
        raise ValueError("raw_text is required")

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if api_key:
        try:
            from anthropic import Anthropic

            client = Anthropic(api_key=api_key)
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                temperature=0,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": raw_text}],
            )
            text = response.content[0].text
            payload = json.loads(text)
            return DecompositionResult.model_validate(payload)
        except Exception:
            return _fallback_decompose(raw_text)

    return _fallback_decompose(raw_text)
