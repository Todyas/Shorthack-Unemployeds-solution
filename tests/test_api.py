from fastapi.testclient import TestClient

from main import create_app


def test_ingest_creates_resolved_and_clarify_tickets(tmp_path):
    db_path = tmp_path / "tickets.db"
    app = create_app(f"sqlite:///{db_path}")
    client = TestClient(app)

    response = client.post(
        "/api/tickets/ingest",
        json={
            "raw_text": "Не могу подключиться к корпоративному Wi-Fi, пишет ошибку авторизации. И еще согласуйте отпуск в системе!",
            "allow_ai_reply": True,
        },
    )

    assert response.status_code == 201, response.text
    payload = response.json()
    assert payload["parent_message_id"]
    assert len(payload["created_tickets"]) == 2

    tickets = client.get("/api/tickets").json()
    assert len(tickets) == 2
    statuses = {ticket["status"] for ticket in tickets}
    assert "resolved" in statuses
    assert "clarify" in statuses


def test_patch_and_send_ticket(tmp_path):
    db_path = tmp_path / "tickets-send.db"
    app = create_app(f"sqlite:///{db_path}")
    client = TestClient(app)

    ingest = client.post(
        "/api/tickets/ingest",
        json={"raw_text": "Проблема с VPN. Нужна срочная помощь.", "allow_ai_reply": False},
    )
    ticket_id = ingest.json()["created_tickets"][0]["id"]

    patch = client.patch(f"/api/tickets/{ticket_id}", json={"status": "in_progress", "draft_reply": "Исправляем сейчас."})
    assert patch.status_code == 200, patch.text
    patched = patch.json()
    assert patched["status"] == "in_progress"
    assert patched["draft_reply"] == "Исправляем сейчас."

    sent = client.post(f"/api/tickets/{ticket_id}/send")
    assert sent.status_code == 200, sent.text
    assert sent.json()["status"] == "resolved"


def test_reanalyze_refreshes_category_and_draft_without_moving_status(tmp_path):
    db_path = tmp_path / "tickets-reanalyze.db"
    app = create_app(f"sqlite:///{db_path}")
    client = TestClient(app)

    ingest = client.post(
        "/api/tickets/ingest",
        json={"raw_text": "Не могу подключиться к корпоративному Wi-Fi, пишет ошибку авторизации.", "allow_ai_reply": False},
    )
    ticket_id = ingest.json()["created_tickets"][0]["id"]

    # Оператор уже взял заявку в работу — "Перезапустить анализ" не должен сбрасывать статус.
    client.patch(f"/api/tickets/{ticket_id}", json={"status": "in_progress"})

    reanalyzed = client.post(f"/api/tickets/{ticket_id}/reanalyze")
    assert reanalyzed.status_code == 200, reanalyzed.text
    payload = reanalyzed.json()
    assert payload["status"] == "in_progress"
    assert payload["category"] == "wifi"
    assert payload["kb_template_id"] == "kb_wifi_auth_error"
    assert payload["draft_reply"]


def test_reanalyze_missing_ticket_returns_404(tmp_path):
    db_path = tmp_path / "tickets-reanalyze-404.db"
    app = create_app(f"sqlite:///{db_path}")
    client = TestClient(app)

    response = client.post("/api/tickets/999/reanalyze")
    assert response.status_code == 404
