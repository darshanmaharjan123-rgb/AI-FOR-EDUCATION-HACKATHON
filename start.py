"""
Outdoor Learning — One-Click Startup Script (start.py)
1. Seeds SQLite database with study sessions & metrics
2. Opens frontend in default web browser automatically
3. Starts REST API Server on http://localhost:5000
"""
import os
import sys
import time
import webbrowser
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Ensure BASE_DIR is first in sys.path so top-level server.py is imported
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Add database folder to sys.path for database imports
db_dir = BASE_DIR / "database"
if str(db_dir) not in sys.path:
    sys.path.append(str(db_dir))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def main():
    print(f"\n{'='*60}")
    print("  🚀 Starting Outdoor Learning — Voice-First AI Tutor Platform")
    print(f"{'='*60}\n")

    # Step 1: Seed database
    print("[1/3] Initializing & seeding SQLite database ...")
    try:
        from seed import seed_database
        seed_database()
    except Exception as e:
        print(f"[!] Warning seeding database: {e}")

    # Step 2: Open Browser
    frontend_html = (BASE_DIR / "frontend" / "index.html").as_uri()
    print(f"\n[2/3] Opening Frontend in Web Browser ...")
    print(f"      File: {frontend_html}")
    time.sleep(1)
    webbrowser.open(frontend_html)

    # Step 3: Run API Server
    print(f"\n[3/3] Launching REST API Server on http://localhost:5000 ...")
    import server
    server.run(seed=False)

if __name__ == "__main__":
    main()
