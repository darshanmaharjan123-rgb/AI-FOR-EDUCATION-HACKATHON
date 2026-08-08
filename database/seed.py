"""
ClarityAI — Seed Script (integrated/database/seed.py)
Pre-populates 14 days of realistic study sessions aligned with the frontend UI.
"""
import json, random, sys
from datetime import datetime, timedelta
from db import init_db, get_connection
from analytics_dao import AnalyticsDAO

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

TOPICS = [
    {
        "topic": "Algebra & Equations: Quadratic Parabola",
        "subject": "Mathematics", "diagram_type": "equation",
        "file_name": "Quadratic_Graph.png", "file_format": "png", "file_size": 245000,
        "image_url": "https://clarity-edu.org/assets/quadratic_parabola.png",
        "spatial_description": "A U-shaped parabola, vertex at (2,5). Arms cross X-axis at -1 and 5.",
        "sub_topics": [
            {"name": "Algebra & Equations", "conf": 92, "gap": None},
            {"name": "Vertex Coordinates (h, k)", "conf": 95, "gap": None},
            {"name": "Discriminant & Complex Roots", "conf": 55, "gap": "Needs review on negative discriminant"},
        ],
    },
    {
        "topic": "Cell Biology: Photosynthesis Flowchart",
        "subject": "Science", "diagram_type": "diagram",
        "file_name": "Photosynthesis.pdf", "file_format": "pdf", "file_size": 512000,
        "image_url": "https://clarity-edu.org/assets/photosynthesis_flow.png",
        "spatial_description": "Solar photons at 12-o'clock strike thylakoid membranes, clockwise to ATP at 6-o'clock.",
        "sub_topics": [
            {"name": "Cell Biology", "conf": 78, "gap": None},
            {"name": "Light-Dependent Reaction", "conf": 88, "gap": None},
            {"name": "Calvin Cycle Carbon Fixation", "conf": 52, "gap": "Confused RuBP binding with NADPH"},
        ],
    },
    {
        "topic": "World History: 20th Century Trade Routes",
        "subject": "History", "diagram_type": "chart",
        "file_name": "Trade_Routes.svg", "file_format": "svg", "file_size": 180000,
        "image_url": "https://clarity-edu.org/assets/trade_routes.svg",
        "spatial_description": "Atlantic shipping lanes connect North America to Western Europe. Secondary arcs to South America and West Africa.",
        "sub_topics": [
            {"name": "World History", "conf": 65, "gap": "Needs timeline review on post-war shipping hubs"},
        ],
    },
    {
        "topic": "Literary Analysis: Shakespearean Sonnet Structure",
        "subject": "Literature", "diagram_type": "article",
        "file_name": "Sonnet_Meter.pdf", "file_format": "pdf", "file_size": 310000,
        "image_url": "https://clarity-edu.org/assets/sonnet_meter.pdf",
        "spatial_description": "14 lines: 3 quatrains + rhyming couplet. Iambic pentameter markers alternate in orange and teal.",
        "sub_topics": [
            {"name": "Literary Analysis", "conf": 84, "gap": None},
        ],
    },
    {
        "topic": "Chemistry: Electron Shell Distribution",
        "subject": "Chemistry", "diagram_type": "diagram",
        "file_name": "Electron_Shells.png", "file_format": "png", "file_size": 420000,
        "image_url": "https://clarity-edu.org/assets/electron_shells.png",
        "spatial_description": "Concentric rings: K-shell holds 2, L-shell holds 8 electrons orbiting symmetrically.",
        "sub_topics": [
            {"name": "Chemistry", "conf": 71, "gap": "Needs recap on valence shell octet rule"},
        ],
    },
]


def seed_database():
    print("[*] Initializing database schema ...")
    init_db()

    conn = get_connection()
    cur  = conn.cursor()

    # Demo user
    cur.execute("""
        INSERT INTO users (id,name,email,password_hash,role,accessibility_mode,vocal_speed_preference)
        VALUES (?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name, role=excluded.role
    """, ("usr_alex_01","Alex Rivera","alex.rivera@clarity.ai",
          "pbkdf2_sha256$demo","student","voice_first",1.2))

    # Clear old demo sessions to keep idempotent
    cur.execute("DELETE FROM sessions WHERE user_id='usr_alex_01'")

    now = datetime.now()
    print("[*] Generating 347 study sessions ...")
    for idx in range(1, 348):
        t = TOPICS[(idx-1) % len(TOPICS)]
        sid = f"sess_{idx:04d}"
        dur = random.randint(480, 1800)
        ts  = (now - timedelta(days=random.randint(0, 30),
                               hours=random.randint(1, 12))).strftime("%Y-%m-%d %H:%M:%S")
        stype = random.choice(["visual_description","socratic_voice","comprehension_test"])

        cur.execute("""INSERT INTO sessions
            (id,user_id,topic,subject,session_type,duration_seconds,is_completed,timestamp)
            VALUES(?,?,?,?,?,?,1,?)""",
            (sid,"usr_alex_01",t["topic"],t["subject"],stype,dur,ts))

        if idx <= 25:
            cur.execute("""INSERT INTO visual_descriptions
                (id,session_id,image_url,file_name,file_size_bytes,file_format,
                 diagram_type,status,spatial_audio_description,created_at)
                VALUES(?,?,?,?,?,?,?,'described',?,?)""",
                (f"vis_{idx:04d}",sid,t["image_url"],t["file_name"],t["file_size"],
                 t["file_format"],t["diagram_type"],t["spatial_description"],ts))

            for turn in range(1, 3):
                cur.execute("""INSERT INTO audio_logs
                    (id,session_id,speaker,transcript_text,sentiment_score,created_at)
                    VALUES(?,?,'ai',?,0.8,?)""",
                    (f"aud_{idx:04d}_{turn}_ai",sid,
                     f"Let me spatially describe '{t['topic']}'. Ready?",ts))
                cur.execute("""INSERT INTO audio_logs
                    (id,session_id,speaker,transcript_text,sentiment_score,created_at)
                    VALUES(?,?,'user',?,0.7,?)""",
                    (f"aud_{idx:04d}_{turn}_usr",sid,
                     "Yes, please describe the central components first.",ts))

            for sub in t["sub_topics"]:
                cur.execute("""INSERT INTO comprehension_logs
                    (id,session_id,user_id,sub_topic,confidence_score,detected_gap,ai_feedback,evaluated_at)
                    VALUES(?,?,?,?,?,?,?,?)""",
                    (f"comp_{idx:04d}_{random.randint(100,999)}",sid,"usr_alex_01",
                     sub["name"],sub["conf"],sub["gap"],
                     "Strong spatial comprehension." if sub["conf"]>=75 else "Socratic recap recommended.",ts))

            cur.execute("""INSERT INTO quiz_history
                (id,session_id,user_id,question_text,user_audio_answer,is_correct,score,vocal_confidence_index,created_at)
                VALUES(?,?,?,?,?,1,88,85,?)""",
                (f"qz_{idx:04d}",sid,"usr_alex_01",
                 f"Describe the spatial layout of '{t['topic']}'.",
                 "Primary elements are arranged in three spatial sections.",ts))

    conn.commit()
    conn.close()

    print("[+] Computing analytics summary ...")
    m = AnalyticsDAO.get_user_dashboard_metrics("usr_alex_01")
    print(f"[OK] Seed complete!")
    print(f"     Listening Hours  : {m['total_listening_hours']} h")
    print(f"     Comprehension    : {m['avg_comprehension_score']}%")
    print(f"     Sessions         : {m['sessions_completed_count']}")
    print(f"     Day Streak       : {m['day_streak']}")
    print(f"     Topic Mastery    : {m['topic_mastery']}")


if __name__ == "__main__":
    seed_database()
