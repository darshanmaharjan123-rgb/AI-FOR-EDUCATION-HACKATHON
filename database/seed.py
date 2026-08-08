"""
ClarityAI Seed Generator (Python)
Pre-populates realistic study logs, subjects, topic mastery, spatial audio descriptions,
and analytics summaries matching the Frontend landing page dashboard.
"""

import json
import random
import sys
from datetime import datetime, timedelta
from db import init_db, get_connection
from analytics_dao import AnalyticsDAO

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def seed_database():
    print("[*] Initializing schema...")
    init_db()

    conn = get_connection()
    cursor = conn.cursor()

    print("[*] Seeding primary demo user...")
    demo_user = {
        "id": "usr_alex_01",
        "name": "Alex Rivera",
        "email": "alex.rivera@clarity.ai",
        "password_hash": "pbkdf2_sha256$hash_demo_12345",
        "role": "student",
        "accessibility_mode": "voice_first",
        "vocal_speed_preference": 1.2
    }

    cursor.execute("""
        INSERT INTO users (id, name, email, password_hash, role, accessibility_mode, vocal_speed_preference)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            role = excluded.role,
            accessibility_mode = excluded.accessibility_mode
    """, (demo_user["id"], demo_user["name"], demo_user["email"], demo_user["password_hash"], demo_user["role"], demo_user["accessibility_mode"], demo_user["vocal_speed_preference"]))

    # Clean existing sessions for demo user to ensure seed idempotency
    cursor.execute("DELETE FROM sessions WHERE user_id = ?", (demo_user["id"],))

    topics_catalog = [
        {
            "topic": "Algebra & Equations: Quadratic Parabola Vertex Form",
            "subject": "Mathematics",
            "diagram_type": "equation",
            "file_name": "Quadratic_Parabola_Graph.png",
            "file_format": "png",
            "file_size": 245000,
            "image_url": "https://clarity-edu.org/assets/quadratic_parabola.png",
            "spatial_description": "A downward-opening U-shaped parabola. The apex vertex reaches peak height at coordinate (2, 5) near upper center. Two symmetric parabola arms curve downward to cross the horizontal X-axis at X = -1 and X = 5.",
            "sub_topics": [
                {"name": "Algebra & Equations", "conf": 92, "gap": None},
                {"name": "Vertex Coordinates (h, k)", "conf": 95, "gap": None},
                {"name": "Discriminant & Complex Roots", "conf": 55, "gap": "Needs review on negative discriminant square roots"}
            ]
        },
        {
            "topic": "Cell Biology: Photosynthesis Flowchart",
            "subject": "Science",
            "diagram_type": "diagram",
            "file_name": "Photosynthesis_Diagram.pdf",
            "file_format": "pdf",
            "file_size": 512000,
            "image_url": "https://clarity-edu.org/assets/photosynthesis_flow.png",
            "spatial_description": "At 12 o'clock, solar photon energy strikes Thylakoid membranes in the chloroplast. Flowing clockwise to 3 o'clock, light-dependent reactions split water molecules (H2O), producing oxygen gas (O2) release at 4 o'clock and generating ATP energy carriers at 6 o'clock.",
            "sub_topics": [
                {"name": "Cell Biology", "conf": 78, "gap": None},
                {"name": "Light-Dependent Reaction", "conf": 88, "gap": None},
                {"name": "Calvin Cycle Carbon Fixation", "conf": 52, "gap": "Confused RuBP enzyme binding with NADPH reduction step"}
            ]
        },
        {
            "topic": "World History: 20th Century Trade Routes",
            "subject": "History",
            "diagram_type": "chart",
            "file_name": "World_Trade_Routes.svg",
            "file_format": "svg",
            "file_size": 180000,
            "image_url": "https://clarity-edu.org/assets/trade_routes.svg",
            "spatial_description": "Central Atlantic ocean corridor displaying major shipping lanes connecting North America to Western Europe. Secondary maritime lines arc south toward South America and West Africa.",
            "sub_topics": [
                {"name": "World History", "conf": 65, "gap": "Needs timeline audio review on post-war industrial shipping hubs"}
            ]
        },
        {
            "topic": "Literary Analysis: Shakespearean Sonnet Rhythm",
            "subject": "Literature",
            "diagram_type": "article",
            "file_name": "Sonnet_Meter_Structure.pdf",
            "file_format": "pdf",
            "file_size": 310000,
            "image_url": "https://clarity-edu.org/assets/sonnet_meter.pdf",
            "spatial_description": "Fourteen lines divided into three quatrains and a final rhyming couplet. Iambic pentameter stressed-unstressed rhythm markers are highlighted in alternating orange and teal lines.",
            "sub_topics": [
                {"name": "Literary Analysis", "conf": 84, "gap": None}
            ]
        },
        {
            "topic": "Chemistry: Periodic Table Electron Shell Distribution",
            "subject": "Chemistry",
            "diagram_type": "diagram",
            "file_name": "Electron_Shells.png",
            "file_format": "png",
            "file_size": 420000,
            "image_url": "https://clarity-edu.org/assets/electron_shells.png",
            "spatial_description": "Concentric rings around the central atomic nucleus. Inner K-shell holds 2 electrons, followed by L-shell holding 8 electrons orbiting symmetrically.",
            "sub_topics": [
                {"name": "Chemistry", "conf": 71, "gap": "Requires recap on valence shell octet electron sharing"}
            ]
        }
    ]

    now = datetime.now()
    session_counter = 1
    
    print("[*] Generating study sessions matching Frontend UI...")

    # We will generate 347 total sessions in session history log
    for s_idx in range(1, 348):
        catalog_item = topics_catalog[(s_idx - 1) % len(topics_catalog)]
        session_id = f"sess_2026_{s_idx:03d}"
        duration = random.randint(480, 1800) # 8 to 30 mins
        day_offset = random.randint(0, 30)
        sess_time = now - timedelta(days=day_offset, hours=random.randint(1, 12))
        sess_timestamp_str = sess_time.strftime("%Y-%m-%d %H:%M:%S")

        sess_type = random.choice(["visual_description", "socratic_voice", "comprehension_test"])

        cursor.execute("""
            INSERT INTO sessions (id, user_id, topic, subject, session_type, duration_seconds, is_completed, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?)
        """, (session_id, demo_user["id"], catalog_item["topic"], catalog_item["subject"], sess_type, duration, sess_timestamp_str))

        # Insert detailed records for the most recent 20 sessions
        if s_idx <= 20:
            vis_id = f"vis_{s_idx:03d}"
            cursor.execute("""
                INSERT INTO visual_descriptions (id, session_id, image_url, file_name, file_size_bytes, file_format, diagram_type, status, spatial_audio_description, spatial_nodes_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'described', ?, ?, ?)
            """, (
                vis_id, session_id, catalog_item["image_url"], catalog_item["file_name"], catalog_item["file_size"],
                catalog_item["file_format"], catalog_item["diagram_type"],
                catalog_item["spatial_description"],
                json.dumps({"center": "Core concept", "top_left": "Input flow", "bottom_right": "Output product"}),
                sess_timestamp_str
            ))

            # Audio conversational logs (2-3 turns)
            for turn in range(1, 3):
                cursor.execute("""
                    INSERT INTO audio_logs (id, session_id, speaker, transcript_text, audio_url, sentiment_score, created_at)
                    VALUES (?, ?, 'ai', ?, ?, 0.8, ?)
                """, (
                    f"aud_{s_idx:03d}_{turn}_ai", session_id,
                    f"Let's explore the key visual spatial details of {catalog_item['topic']}. Would you like me to describe the central elements first?",
                    f"https://audio.clarity.ai/tts_{session_id}_{turn}.mp3",
                    sess_timestamp_str
                ))
                cursor.execute("""
                    INSERT INTO audio_logs (id, session_id, speaker, transcript_text, audio_url, sentiment_score, created_at)
                    VALUES (?, ?, 'user', ?, ?, 0.7, ?)
                """, (
                    f"aud_{s_idx:03d}_{turn}_usr", session_id,
                    f"Yes please! Tell me where the main components are positioned spatially.",
                    f"https://audio.clarity.ai/stt_{session_id}_{turn}.wav",
                    sess_timestamp_str
                ))

            # Comprehension Logs
            for sub in catalog_item["sub_topics"]:
                comp_id = f"comp_{s_idx:03d}_{random.randint(100, 999)}"
                cursor.execute("""
                    INSERT INTO comprehension_logs (id, session_id, user_id, sub_topic, confidence_score, detected_gap, ai_feedback, evaluated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    comp_id, session_id, demo_user["id"], sub["name"], sub["conf"],
                    sub["gap"],
                    "Strong comprehension of spatial layout." if sub["conf"] >= 75 else "Recommended short Socratic recap.",
                    sess_timestamp_str
                ))

            # Voice Quiz History
            quiz_id = f"qz_{s_idx:03d}"
            cursor.execute("""
                INSERT INTO quiz_history (id, session_id, user_id, question_text, user_audio_answer, is_correct, score, vocal_confidence_index, created_at)
                VALUES (?, ?, ?, ?, ?, 1, 88, 85, ?)
            """, (
                quiz_id, session_id, demo_user["id"],
                f"Describe the spatial arrangement of {catalog_item['topic']}.",
                f"The primary elements are arranged systematically in 3 sections.",
                sess_timestamp_str
            ))

    conn.commit()
    conn.close()

    print("[+] Computing aggregated user dashboard analytics...")
    summary = AnalyticsDAO.get_user_dashboard_metrics(demo_user["id"])
    print(f"[SUCCESS] Seed complete for {demo_user['name']}!")
    print(f"   - Total Listening Hours: {summary['total_listening_hours']} hrs")
    print(f"   - Avg Comprehension Score: {summary['avg_comprehension_score']}%")
    print(f"   - Sessions Completed: {summary['sessions_completed_count']}")
    print(f"   - Day Streak: {summary['day_streak']} days")
    print(f"   - Subject Distribution: {summary['subject_distribution']}")
    print(f"   - Topic Mastery: {summary['topic_mastery']}")

if __name__ == "__main__":
    seed_database()
