from __future__ import annotations

import json
import os
import re
from typing import Any

from pydantic import ValidationError

from .kb import get_kb_template_for_text, load_kb
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
      "draft_reply": "string or null",
      "reasoning": "1-2 sentences in Russian, for the operator, not the end user"
    }
  ]
}
Rules:
- Split the input into atomic support issues.
- A request may create multiple tickets from one message.
- If a request can be answered with a known KB template, use auto_reply.
- When the message is vague, use request_clarification.
- Use urgent only for physical access, door locks, urgent outage, safety, or immediate blockers.
- Every ticket goes to a human operator for review before anything is sent to the user — write
  draft_reply as a recommended answer for that operator to check and edit, not as a message you
  are sending yourself. draft_reply must be an actual answer to the problem (instructions, a fix,
  next steps) — never a restatement or paraphrase of original_fragment. If you don't have a real
  answer, set draft_reply to null instead of repeating the user's own text back at them.
- reasoning must explain, for the operator, WHY you picked this category/priority/action_type —
  e.g. which keyword or fact drove it, or why the topic doesn't clearly fit any known category.
  Never leave reasoning null.
- Return valid JSON only, without markdown fences.
"""


def _build_system_prompt() -> str:
    # Модель не обязана знать наши внутренние системы и жаргон — даём ей
    # реальную базу знаний как контекст для поиска, а не только имена категорий.
    # Если термин в обращении не встречается в этом контексте, модель не должна
    # его выдумывать: это явно прописано в инструкции ниже.
    kb_entries = load_kb()
    if not kb_entries:
        return SYSTEM_PROMPT

    lines = ["", "Knowledge base you can search against (use verbatim ids/wording, don't invent your own):"]
    for entry in kb_entries:
        keywords = ", ".join(entry.get("keywords", []))
        lines.append(f'- id={entry.get("id")} category={entry.get("category")} title="{entry.get("title")}" keywords=[{keywords}]')
        lines.append(f'  template_body: {entry.get("template_body")}')
    lines.append(
        "If the message uses a term, system name, or acronym not covered above, do not guess what "
        "it means — set category=other (or the closest generic category) and action_type=create_ticket "
        "or request_clarification, leave kb_template_id/draft_reply null, and let the human operator "
        "handle the unfamiliar term."
    )
    return SYSTEM_PROMPT + "\n".join(lines)


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


def _smart_truncate(text: str, limit: int = 140) -> str:
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0]
    return (cut or text[:limit]).rstrip(",.;: ") + "…"


def _build_fallback_ticket(raw_text: str, fragment: str) -> SubTicket:
    category = _detect_category(fragment)
    lowered = _lower_text(fragment)
    action_type = ActionType.AUTO_REPLY
    if "отпуск" in lowered or "соглас" in lowered:
        action_type = ActionType.REQUEST_CLARIFICATION
    if category in {Category.ACCESS_CONTROL, Category.HR} and "срочно" in lowered:
        action_type = ActionType.ESCALATE
    kb_template_id = get_kb_template_for_text(fragment, category) if category != Category.OTHER else None
    draft_reply = None
    if kb_template_id:
        draft_reply = _kb_template_body(kb_template_id)
    missing_info: list[str] = []
    if action_type == ActionType.REQUEST_CLARIFICATION:
        missing_info = ["даты отпуска", "ФИО/табельный номер сотрудника"]

    if category == Category.OTHER:
        reasoning = (
            "Эвристика по ключевым словам (LLM недоступен) не нашла совпадений ни с одной "
            "известной категорией — возможно, обращение не относится к ИТ-поддержке."
        )
    elif kb_template_id:
        reasoning = f"Эвристика по ключевым словам определила категорию «{category.value}» и нашла подходящий шаблон в базе знаний."
    else:
        reasoning = f"Эвристика по ключевым словам определила категорию «{category.value}», но готового шаблона ответа в базе знаний нет."

    return SubTicket(
        original_fragment=fragment,
        summary=_smart_truncate(fragment),
        category=category,
        priority=_detect_priority(fragment),
        action_type=action_type,
        requires_clarification=action_type == ActionType.REQUEST_CLARIFICATION,
        missing_info=missing_info,
        kb_template_id=kb_template_id,
        draft_reply=draft_reply,
        reasoning=reasoning,
    )


def _fallback_decompose(raw_text: str) -> DecompositionResult:
    fragments = _extract_fragments(raw_text)
    tickets = [_build_fallback_ticket(raw_text, fragment) for fragment in fragments]
    if not tickets:
        tickets = [_build_fallback_ticket(raw_text, raw_text)]
    return DecompositionResult(source_text=raw_text, tickets=tickets)


def _parse_decomposition_json(text: str) -> DecompositionResult:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```[a-zA-Z]*\n?", "", cleaned)
        cleaned = re.sub(r"```\s*$", "", cleaned).strip()
    payload = json.loads(cleaned)
    return DecompositionResult.model_validate(payload)


def _yandex_client_and_model() -> tuple:
    from openai import OpenAI

    folder = os.getenv("YANDEX_CLOUD_FOLDER", "b1gcckd2llp6t0dj6j6e")
    model = os.getenv("YANDEX_CLOUD_MODEL", "deepseek-v4-flash/latest")
    client = OpenAI(
        api_key=os.environ["YANDEX_API_KEY"],
        base_url="https://ai.api.cloud.yandex.net/v1",
        project=folder,
    )
    return client, f"gpt://{folder}/{model}"


def _yandex_decompose(raw_text: str) -> DecompositionResult:
    # Используем chat.completions, а не responses: последний — часть более
    # новых "AI Assistants" API OpenAI, и Yandex требует под него отдельную
    # повышенную роль (ai.assistants.editor). Для обычного "текст на входе —
    # текст на выходе" chat.completions — стандартный путь с более базовой
    # ролью (ai.languageModels.user), которая обычно уже выдана.
    client, model_uri = _yandex_client_and_model()
    response = client.chat.completions.create(
        model=model_uri,
        temperature=0,
        messages=[
            {"role": "system", "content": _build_system_prompt()},
            {"role": "user", "content": raw_text},
        ],
        max_tokens=1500,
    )
    return _parse_decomposition_json(response.choices[0].message.content)


def _anthropic_decompose(raw_text: str) -> DecompositionResult:
    from anthropic import Anthropic

    client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        temperature=0,
        system=_build_system_prompt(),
        messages=[{"role": "user", "content": raw_text}],
    )
    return _parse_decomposition_json(response.content[0].text)


def _kb_template_body(kb_template_id: str | None) -> str | None:
    if not kb_template_id:
        return None
    for entry in load_kb():
        if entry.get("id") == kb_template_id:
            return entry.get("template_body")
    return None


def _normalize_for_comparison(text: str) -> str:
    return re.sub(r"[^\w\s]", "", text.lower()).strip()


def _looks_like_echo(original_fragment: str, draft_reply: str) -> bool:
    # Модели послабее иногда "отвечают" пользователю его же жалобой, лишь бы
    # выполнить требование "всегда заполняй draft_reply". Это не ответ —
    # ловим и обрабатываем как отсутствие черновика.
    a = _normalize_for_comparison(original_fragment)
    b = _normalize_for_comparison(draft_reply)
    if not a or not b:
        return False
    if a == b:
        return True
    shorter, longer = (a, b) if len(a) <= len(b) else (b, a)
    return len(shorter) > 15 and shorter in longer


def _apply_kb_safety_net(result: DecompositionResult) -> DecompositionResult:
    # Два случая, когда "ответу" от LLM нельзя доверять: он пустой, или он
    # просто повторяет обращение пользователя. В обоих случаях подставляем
    # шаблон KB, если подходит, иначе понижаем auto_reply до обычной заявки
    # оператору вместо пустого/бессмысленного "авто-ответа".
    for ticket in result.tickets:
        has_real_draft = bool(ticket.draft_reply) and not _looks_like_echo(ticket.original_fragment, ticket.draft_reply)
        if has_real_draft:
            continue
        ticket.draft_reply = None
        if not ticket.kb_template_id:
            ticket.kb_template_id = get_kb_template_for_text(ticket.original_fragment, ticket.category)
        template_body = _kb_template_body(ticket.kb_template_id)
        if template_body:
            ticket.draft_reply = template_body
        elif ticket.action_type == ActionType.AUTO_REPLY:
            ticket.action_type = ActionType.CREATE_TICKET
    return result


def check_llm_status() -> dict:
    # Диагностика "жив ли ключ": decompose() нарочно проглатывает любую ошибку
    # провайдера и тихо уходит в эвристику — это правильно для демо, но
    # оставляет разработчика гадать, реально ли ключ работает. Здесь наоборот:
    # делаем минимальный настоящий запрос и возвращаем точную причину сбоя.
    if os.getenv("YANDEX_API_KEY"):
        provider = "yandex"
        try:
            client, model_uri = _yandex_client_and_model()
            client.chat.completions.create(model=model_uri, messages=[{"role": "user", "content": "ping"}], max_tokens=16)
            return {"provider": provider, "configured": True, "reachable": True, "error": None}
        except Exception as e:
            return {"provider": provider, "configured": True, "reachable": False, "error": str(e)}

    if os.getenv("ANTHROPIC_API_KEY"):
        provider = "anthropic"
        try:
            from anthropic import Anthropic

            client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
            client.messages.create(model="claude-sonnet-4-20250514", max_tokens=16, messages=[{"role": "user", "content": "ping"}])
            return {"provider": provider, "configured": True, "reachable": True, "error": None}
        except Exception as e:
            return {"provider": provider, "configured": True, "reachable": False, "error": str(e)}

    return {"provider": "fallback", "configured": False, "reachable": True, "error": None}


def decompose(raw_text: str) -> DecompositionResult:
    if not raw_text or not raw_text.strip():
        raise ValueError("raw_text is required")

    # Провайдер выбирается по наличию ключа: Yandex Cloud -> Anthropic -> эвристика.
    # Любой сбой вызова LLM (сеть, квота, невалидный JSON) не должен ронять демо —
    # всегда есть детерминированный фолбэк на ключевые слова (см. _fallback_decompose).
    result: DecompositionResult | None = None

    if os.getenv("YANDEX_API_KEY"):
        try:
            result = _yandex_decompose(raw_text)
        except Exception:
            result = None

    if result is None and os.getenv("ANTHROPIC_API_KEY"):
        try:
            result = _anthropic_decompose(raw_text)
        except Exception:
            result = None

    if result is None:
        result = _fallback_decompose(raw_text)

    return _apply_kb_safety_net(result)
