"""
ClarityAI Database Connection & Core Management Utility (Python)
Provides zero-config SQLite initialization & query helper functions.
"""

import os
import sqlite3
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "database.sqlite"
SCHEMA_PATH = BASE_DIR / "schema.sql"

def get_connection():
    """Establish connection to SQLite database with Row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db(reset: bool = False):
    """Initialize database tables and views from schema.sql."""
    if not SCHEMA_PATH.exists():
        raise FileNotFoundError(f"Schema file not found at {SCHEMA_PATH}")

    if reset and DB_PATH.exists():
        try:
            os.remove(DB_PATH)
        except Exception:
            pass

    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    conn = get_connection()
    try:
        # Enable foreign keys and execute schema
        conn.executescript("DROP VIEW IF EXISTS v_user_dashboard_metrics;")
        conn.executescript(schema_sql)
        conn.commit()
        print(f"[SUCCESS] Database initialized successfully at {DB_PATH}")
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Error initializing database: {e}")
        # If schema altered, reset database file
        conn.close()
        if DB_PATH.exists():
            os.remove(DB_PATH)
            conn = get_connection()
            conn.executescript(schema_sql)
            conn.commit()
            print(f"[SUCCESS] Database re-created successfully at {DB_PATH}")
            return
        raise e
    finally:
        try:
            conn.close()
        except Exception:
            pass

if __name__ == "__main__":
    init_db()
