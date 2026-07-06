from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

from config import (
    HOST,
    PORT,
    TELEGRAM_BOT_TOKEN,
    get_db,
    init_db,
    load_organizations,
    save_organizations,
)
from export import create_payments_xlsx

app = Flask(__name__)
CORS(app, origins=[
    "https://ellieene.github.io",
    "http://161.104.17.204",
    "https://161-104-17-204.nip.io",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
])

init_db()


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/organizations")
def organizations():
    return jsonify({"organizations": load_organizations()})


@app.route("/api/organizations", methods=["POST"])
def create_organization():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()

    if not name:
        return jsonify({"error": "Укажите название организации"}), 400

    organizations_list = load_organizations()
    if name in organizations_list:
        return jsonify({"error": "Такая организация уже существует"}), 400

    organizations_list.append(name)
    organizations_list.sort()
    save_organizations(organizations_list)

    return jsonify({"message": "Организация добавлена", "organizations": organizations_list}), 201


@app.route("/api/organizations", methods=["DELETE"])
def delete_organization():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()

    if not name:
        return jsonify({"error": "Укажите организацию"}), 400

    organizations_list = load_organizations()
    if name not in organizations_list:
        return jsonify({"error": "Организация не найдена"}), 404

    organizations_list.remove(name)
    save_organizations(organizations_list)

    return jsonify({"message": f"Организация «{name}» удалена", "organizations": organizations_list})


@app.route("/api/payments", methods=["DELETE"])
def delete_payment():
    data = request.get_json(silent=True) or {}
    organization = (data.get("organization") or "").strip()
    date = (data.get("date") or "").strip()

    if not organization:
        return jsonify({"error": "Укажите организацию"}), 400

    if not date:
        return jsonify({"error": "Укажите дату"}), 400

    conn = get_db()
    cursor = conn.execute(
        "DELETE FROM payments WHERE organization = ? AND date = ?",
        (organization, date),
    )
    conn.commit()
    deleted = cursor.rowcount
    conn.close()

    if deleted == 0:
        return jsonify({"error": "Запись не найдена"}), 404

    return jsonify({"message": f"Удалено записей: {deleted}", "deleted": deleted})


@app.route("/api/payments", methods=["POST"])
def create_payment():
    data = request.get_json(silent=True) or {}

    organization = (data.get("organization") or "").strip()
    amount = data.get("amount")
    date = (data.get("date") or "").strip()
    telegram_user_id = data.get("telegram_user_id")

    if not organization:
        return jsonify({"error": "Укажите организацию"}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError()
    except (TypeError, ValueError):
        return jsonify({"error": "Некорректная сумма"}), 400

    if not date:
        return jsonify({"error": "Укажите дату"}), 400

    conn = get_db()
    cursor = conn.execute(
        """
        INSERT INTO payments (organization, amount, date, telegram_user_id)
        VALUES (?, ?, ?, ?)
        """,
        (organization, amount, date, telegram_user_id),
    )
    conn.commit()
    payment_id = cursor.lastrowid
    conn.close()

    return jsonify({"id": payment_id, "message": "Запись сохранена"}), 201


@app.route("/api/payments/export")
def export_payments():
    date_from = request.args.get("from", "")
    date_to = request.args.get("to", "")

    if not date_from or not date_to:
        return jsonify({"error": "Укажите период (from и to)"}), 400

    if date_from > date_to:
        return jsonify({"error": "Дата «from» не может быть позже «to»"}), 400

    conn = get_db()
    rows = conn.execute(
        """
        SELECT organization, amount, date, created_at
        FROM payments
        WHERE date >= ? AND date <= ?
        ORDER BY date ASC, id ASC
        """,
        (date_from, date_to),
    ).fetchall()
    conn.close()

    data = [dict(row) for row in rows]
    xlsx = create_payments_xlsx(data)

    filename = f"выплаты_{date_from}_{date_to}.xlsx"
    return send_file(
        xlsx,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name=filename,
    )


if __name__ == "__main__":
    if TELEGRAM_BOT_TOKEN:
        print("Telegram бот: токен загружен")
    else:
        print("Внимание: TELEGRAM_BOT_TOKEN не задан в .env")

    print(f"Сервер запущен: http://{HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=False)
