import json
import os
import sqlite3
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "payments.db"
ORGANIZATIONS_FILE = BASE_DIR / "organizations.json"

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "5000"))
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")


def load_organizations():
    if ORGANIZATIONS_FILE.exists():
        with open(ORGANIZATIONS_FILE, encoding="utf-8") as f:
            return json.load(f)
    return []


def save_organizations(organizations):
    with open(ORGANIZATIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(organizations, f, ensure_ascii=False, indent=2)
        f.write("\n")


def get_db():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            organization TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            telegram_user_id INTEGER,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
        """
    )
    conn.commit()
    conn.close()
