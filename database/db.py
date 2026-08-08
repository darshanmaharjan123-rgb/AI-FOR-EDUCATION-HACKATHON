"""
ClarityAI — Database Connection Manager (integrated/database/db.py)
Handles SQLite init, schema creation, and reset on schema changes.
"""
import os
import sqlite3
from pathlib import Path

BASE_DIR   = Path(__file__).resolve().parent
DB_PATH    = BASE_DIR / "database.sqlite"
SCHEMA_PATH = BASE_DIR / "schema.sql"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db(reset: bool = False):
    if not SCHEMA_PATH.exists():
        raise FileNotFoundError(f"Schema not found: {SCHEMA_PATH}")

    if reset and DB_PATH.exists():
        os.remove(DB_PATH)

    schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")
    conn = get_connection()
    try:
        conn.executescript("DROP VIEW IF EXISTS v_user_dashboard_metrics;")
        conn.executescript(schema_sql)
        conn.commit()
        print(f"[DB] Initialized: {DB_PATH}")
    except Exception as e:
        conn.close()
        # Schema changed — reset and retry
        if DB_PATH.exists():
            os.remove(DB_PATH)
        conn = get_connection()
        conn.executescript(schema_sql)
        conn.commit()
        print(f"[DB] Re-created (schema changed): {DB_PATH}")
    finally:
        try: conn.close()
        except: pass


if __name__ == "__main__":
    init_db()
