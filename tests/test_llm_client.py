from app.llm_client import (
    _apply_kb_safety_net,
    _build_system_prompt,
    _fallback_decompose,
    _smart_truncate,
    check_llm_status,
)
from app.models import ActionType, Category, DecompositionResult, Priority, SubTicket


def test_fallback_decompose_does_not_split_a_single_sentence():
    # Регрессия: сценарные узлы чат-бота склеивали title и summary в rawText
    # ("Заголовок. Описание."), из-за чего декомпозитор резал одну проблему
    # на два похожих тикета. Одно связное предложение должно остаться одним тикетом.
    result = _fallback_decompose("Пользователь сообщает о неисправном оборудовании в аудитории.")
    assert len(result.tickets) == 1


def test_fallback_decompose_splits_two_distinct_issues():
    result = _fallback_decompose(
        "Не могу подключиться к корпоративному Wi-Fi, пишет ошибку авторизации. "
        "И еще согласуйте отпуск в системе!"
    )
    assert len(result.tickets) == 2


def test_kb_safety_net_fills_draft_reply_from_matching_template():
    sub = SubTicket(
        original_fragment="Не могу подключиться к корпоративному Wi-Fi, пишет ошибку авторизации.",
        summary="Ошибка авторизации Wi-Fi",
        category=Category.WIFI,
        priority=Priority.MEDIUM,
        action_type=ActionType.AUTO_REPLY,
        requires_clarification=False,
        kb_template_id=None,
        draft_reply=None,
    )
    result = _apply_kb_safety_net(DecompositionResult(source_text=sub.original_fragment, tickets=[sub]))

    ticket = result.tickets[0]
    assert ticket.kb_template_id == "kb_wifi_auth_error"
    assert ticket.draft_reply
    assert ticket.action_type == ActionType.AUTO_REPLY


def test_kb_safety_net_downgrades_contentless_auto_reply():
    # Если модель пометила тикет как auto_reply, но ни шаблона, ни текста ответа
    # нет — отвечать нечем, тикет должен уйти оператору как обычная заявка,
    # а не "авто-ответ" из пустоты.
    sub = SubTicket(
        original_fragment="Что-то сломалось, но непонятно что именно.",
        summary="Неясная проблема",
        category=Category.OTHER,
        priority=Priority.MEDIUM,
        action_type=ActionType.AUTO_REPLY,
        requires_clarification=False,
        kb_template_id=None,
        draft_reply=None,
    )
    result = _apply_kb_safety_net(DecompositionResult(source_text=sub.original_fragment, tickets=[sub]))

    ticket = result.tickets[0]
    assert ticket.draft_reply is None
    assert ticket.action_type == ActionType.CREATE_TICKET


def test_system_prompt_includes_kb_context():
    prompt = _build_system_prompt()
    assert "kb_wifi_auth_error" in prompt
    assert "Здравствуйте! Ошибка авторизации" in prompt


def test_kb_safety_net_discards_echoed_reply():
    # Регрессия: модель иногда "отвечает" пользователю его же текстом жалобы,
    # лишь бы формально заполнить draft_reply. Это не ответ и не должно
    # попадать к оператору как рекомендация.
    fragment = "Я уже несколько лет учусь в вузе, и у меня в автомате не выдалась шоколадка."
    sub = SubTicket(
        original_fragment=fragment,
        summary=fragment,
        category=Category.OTHER,
        priority=Priority.MEDIUM,
        action_type=ActionType.AUTO_REPLY,
        requires_clarification=False,
        kb_template_id=None,
        draft_reply=fragment,
    )
    result = _apply_kb_safety_net(DecompositionResult(source_text=fragment, tickets=[sub]))

    ticket = result.tickets[0]
    assert ticket.draft_reply is None
    assert ticket.action_type == ActionType.CREATE_TICKET


def test_smart_truncate_cuts_on_word_boundary():
    text = "слово " * 30
    truncated = _smart_truncate(text, limit=20)
    assert len(truncated) <= 22
    assert not truncated.rstrip("…").endswith("слов")


def test_smart_truncate_leaves_short_text_untouched():
    assert _smart_truncate("короткий текст", limit=100) == "короткий текст"


def test_check_llm_status_reports_fallback_when_no_key_set(monkeypatch):
    monkeypatch.delenv("YANDEX_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)

    status = check_llm_status()

    assert status == {"provider": "fallback", "configured": False, "reachable": True, "error": None}


def test_check_llm_status_reports_unreachable_yandex_key(monkeypatch):
    # Не бьём по настоящей сети — подменяем openai.OpenAI так, чтобы вызов
    # выглядел как реальный сбой авторизации/сети, и проверяем, что причина
    # доходит до вызывающего кода, а не проглатывается молча (как в decompose()).
    monkeypatch.setenv("YANDEX_API_KEY", "fake-key")
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)

    class FakeResponses:
        def create(self, **kwargs):
            raise RuntimeError("401 Unauthorized")

    class FakeClient:
        def __init__(self, *args, **kwargs):
            self.responses = FakeResponses()

    import openai

    monkeypatch.setattr(openai, "OpenAI", FakeClient)

    status = check_llm_status()

    assert status["provider"] == "yandex"
    assert status["configured"] is True
    assert status["reachable"] is False
    assert "401 Unauthorized" in status["error"]


def test_check_llm_status_reports_working_yandex_key(monkeypatch):
    monkeypatch.setenv("YANDEX_API_KEY", "fake-key")
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)

    class FakeResponses:
        def create(self, **kwargs):
            return object()

    class FakeClient:
        def __init__(self, *args, **kwargs):
            self.responses = FakeResponses()

    import openai

    monkeypatch.setattr(openai, "OpenAI", FakeClient)

    status = check_llm_status()

    assert status == {"provider": "yandex", "configured": True, "reachable": True, "error": None}


def test_check_llm_status_prefers_yandex_over_anthropic(monkeypatch):
    monkeypatch.setenv("YANDEX_API_KEY", "fake-key")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "fake-key-too")

    class FakeResponses:
        def create(self, **kwargs):
            return object()

    class FakeClient:
        def __init__(self, *args, **kwargs):
            self.responses = FakeResponses()

    import openai

    monkeypatch.setattr(openai, "OpenAI", FakeClient)

    status = check_llm_status()

    assert status["provider"] == "yandex"
