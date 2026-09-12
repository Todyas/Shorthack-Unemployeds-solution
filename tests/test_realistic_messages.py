"""Реальные сообщения из демо-тестирования — намеренно длинные, разговорные,
с словами-паразитами. Регрессия для двух проблем, замеченных на практике:
1) резюме обрывалось посередине слова (raw_text[:120]);
2) карточка заявки показывала одинаковый выдуманный "Уверенность: 78%" и
   канцелярскую "Возможная причина" вместо реального обоснования.
"""

from app.llm_client import _fallback_decompose
from app.models import Category


VENDING_MACHINE_MESSAGE = (
    "Я уже несколько лет учусь в МИСиСе, и у меня короче не выдалась короче эта, "
    "как её, в автомате вендинговом в Б583 шоколадка не выпала."
)

PRINTER_MOVED_MESSAGE = (
    "У меня короче был этот короче, большой принтер, а щас вот принтер унесли "
    "из аудитории Б393, и вот как мне печатать то емое"
)


def test_vending_machine_message_gets_other_category_with_real_reasoning():
    result = _fallback_decompose(VENDING_MACHINE_MESSAGE)
    assert len(result.tickets) == 1

    ticket = result.tickets[0]
    assert ticket.category == Category.OTHER
    assert ticket.reasoning
    assert "78%" not in ticket.reasoning
    assert not ticket.summary.endswith("шокола")  # раньше обрывалось точно тут


def test_printer_moved_message_gets_other_category_with_real_reasoning():
    # В KEYWORD_RULES нет ключевого слова "принтер" — категория намеренно "other",
    # реальное обоснование должно честно сказать, что совпадений не найдено,
    # а не выдавать канцелярскую заглушку про "автоматически на основе текста".
    result = _fallback_decompose(PRINTER_MOVED_MESSAGE)
    assert len(result.tickets) == 1

    ticket = result.tickets[0]
    assert ticket.category == Category.OTHER
    assert ticket.reasoning
    assert "Определено автоматически на основе текста обращения" not in ticket.reasoning
    assert not ticket.summary.endswith("то ем")  # раньше обрывалось точно тут


def test_no_ticket_summary_ever_ends_mid_word_for_long_rambling_text():
    long_rambling_text = (
        "Ну короче слушайте, у меня тут такая история приключилась, значит захожу "
        "я утром в лабораторию, а там всё оборудование почему-то повёрнуто вообще "
        "не в ту сторону, кто-то явно ночью химичил с настройками стендов."
    )
    result = _fallback_decompose(long_rambling_text)
    for ticket in result.tickets:
        if ticket.summary != ticket.original_fragment:
            assert ticket.summary.endswith("…")
            assert ticket.summary[-2] != " "
