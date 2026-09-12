from __future__ import annotations

import json
from pathlib import Path

from .models import Category

KB_PATH = Path(__file__).resolve().parent.parent / "kb.json"


def load_kb() -> list[dict]:
    if not KB_PATH.exists():
        return []
    with KB_PATH.open("r", encoding="utf-8") as file:
        payload = json.load(file)
    return payload if isinstance(payload, list) else []


def get_kb_by_category(category: str) -> dict | None:
    for entry in load_kb():
        if entry.get("category") == category:
            return entry
    return None


def get_kb_template_for_text(raw_text: str, category: Category | str | None = None) -> str | None:
    lower_text = raw_text.lower()
    category_value = category.value if isinstance(category, Category) else category
    for entry in load_kb():
        entry_category = entry.get("category")
        if category_value and category_value != entry_category:
            continue
        keywords = entry.get("keywords", [])
        if any(keyword.lower() in lower_text for keyword in keywords):
            return entry.get("id")
    return None
