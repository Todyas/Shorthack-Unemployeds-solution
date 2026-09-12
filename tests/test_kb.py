from app.kb import get_kb_template_for_text
from app.models import Category


def test_matches_when_no_category_given():
    text = "Не могу подключиться к корпоративному Wi-Fi, пишет ошибку авторизации."
    assert get_kb_template_for_text(text) == "kb_wifi_auth_error"


def test_matches_when_category_is_the_enum_member():
    # Регрессия: get_kb_template_for_text сравнивал str(Category.WIFI) ("Category.WIFI")
    # со строкой из kb.json ("wifi") и никогда не находил совпадение, если категория
    # передавалась как enum, а не как голая строка.
    text = "Не могу подключиться к корпоративному Wi-Fi, пишет ошибку авторизации."
    assert get_kb_template_for_text(text, Category.WIFI) == "kb_wifi_auth_error"


def test_matches_when_category_is_a_plain_string():
    text = "Не могу подключиться к корпоративному Wi-Fi, пишет ошибку авторизации."
    assert get_kb_template_for_text(text, "wifi") == "kb_wifi_auth_error"


def test_category_mismatch_returns_none():
    text = "Не могу подключиться к корпоративному Wi-Fi, пишет ошибку авторизации."
    assert get_kb_template_for_text(text, Category.HR) is None


def test_no_keyword_match_returns_none():
    assert get_kb_template_for_text("Полностью не связанный с базой знаний текст") is None
