from app.llm_client import _apply_kb_safety_net, _build_system_prompt, _fallback_decompose
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
