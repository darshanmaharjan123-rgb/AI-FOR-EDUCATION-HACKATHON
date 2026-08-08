"""
ClarityAI Seed Generator (Python)
Pre-populates 2 weeks (14 days) of realistic study logs, voice conversations,
spatial audio descriptions, comprehension logs, and quiz results.
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
        "accessibility_mode": "voice_first",
        "vocal_speed_preference": 1.2
    }

    cursor.execute("""
        INSERT INTO users (id, name, email, accessibility_mode, vocal_speed_preference)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            accessibility_mode = excluded.accessibility_mode
    """, (demo_user["id"], demo_user["name"], demo_user["email"], demo_user["accessibility_mode"], demo_user["vocal_speed_preference"]))

    # Clean existing sessions for demo user to ensure seed idempotency
    cursor.execute("DELETE FROM sessions WHERE user_id = ?", (demo_user["id"],))

    topics_catalog = [
        {
            "topic": "Cellular Biology: Photosynthesis Flowchart",
            "diagram_type": "diagram",
            "image_url": "https://clarity-edu.org/assets/photosynthesis_flow.png",
            "spatial_description": "At 12 o'clock, solar photon energy strikes Thylakoid membranes in the chloroplast. Flowing clockwise to 3 o'clock, light-dependent reactions split water molecules (H2O), producing oxygen gas (O2) release at 4 o'clock and generating ATP energy carriers at 6 o'clock.",
            "sub_topics": [
                {"name": "Light-Dependent Reaction", "conf": 88, "gap": None},
                {"name": "ATP Synthase Energy Carrier", "conf": 82, "gap": None},
                {"name": "Calvin Cycle Carbon Fixation", "conf": 52, "gap": "Confused RuBP enzyme binding with NADPH reduction step"}
            ]
        },
        {
            "topic": "Algebra II: Quadratic Equation Graph & Vertex Form",
            "diagram_type": "equation",
            "image_url": "https://clarity-edu.org/assets/quadratic_parabola.png",
            "spatial_description": "A downward-opening U-shaped parabola. The apex vertex reaches peak height at coordinate (2, 5) near upper center. Two symmetric parabola arms curve downward to cross the horizontal X-axis at X = -1 and X = 5.",
            "sub_topics": [
                {"name": "Vertex Coordinates (h, k)", "conf": 94, "gap": None},
                {"name": "Axis of Symmetry", "conf": 90, "gap": None},
                {"name": "Discriminant & Complex Roots", "conf": 55, "gap": "Needs review on negative discriminant square roots"}
            ]
        },
        {
            "topic": "Astrophysics: Solar System Spatial Planetary Orbits",
            "diagram_type": "chart",
            "image_url": "https://clarity-edu.org/assets/solar_system_orbits.png",
            "spatial_description": "In the center center rests the glowing Sun orb. Inner terrestrial planets Mercury, Venus, Earth, and Mars orbit closely within inner concentric circles. Beyond the central asteroid belt ring, gas giants Jupiter and Saturn sweep wide outer elliptical arcs.",
            "sub_topics": [
                {"name": "Terrestrial Planet Densities", "conf": 91, "gap": None},
                {"name": "Asteroid Belt Orbital Radius", "conf": 85, "gap": None},
                {"name": "Kepler's Third Law of Planetary Motion", "conf": 58, "gap": "Requires audio breakdown of orbital period squared ratio"}
            ]
        },
        {
            "topic": "Human Anatomy: Dual Cardiac Circulation System",
            "diagram_type": "diagram",
            "image_url": "https://clarity-edu.org/assets/cardiac_circulation.png",
            "spatial_description": "Upper right atrium receives deoxygenated blood from body veins. Flowing down into the right ventricle, blood pumps leftward to pulmonary arteries into the lungs for oxygen exchange before returning to left atrium at upper left.",
            "sub_topics": [
                {"name": "Systemic vs Pulmonary Circuit", "conf": 86, "gap": None},
                {"name": "Atrioventricular Valve Mechanics", "conf": 80, "gap": None},
                {"name": "Cardiac Electrical Conduction SA Node", "conf": 54, "gap": "Struggles to recall Purkinje fiber impulse propagation"}
            ]
        }
    ]

    now = datetime.now()
    session_counter = 1
    
    print("[*] Generating 14 days of realistic study sessions...")

    for day_offset in range(14, 0, -1):
        day_date = now - timedelta(days=day_offset)
        # 1-2 sessions per day
        num_sessions = random.choice([1, 2])

        for s_idx in range(num_sessions):
            catalog_item = topics_catalog[(session_counter - 1) % len(topics_catalog)]
            session_id = f"sess_2026_{session_counter:03d}"
            duration = random.randint(480, 1800) # 8 to 30 mins
            sess_time = day_date + timedelta(hours=random.randint(9, 18), minutes=random.randint(0, 59))
            sess_timestamp_str = sess_time.strftime("%Y-%m-%d %H:%M:%S")

            sess_type = random.choice(["visual_description", "socratic_voice", "comprehension_test"])

            cursor.execute("""
                INSERT INTO sessions (id, user_id, topic, session_type, duration_seconds, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (session_id, demo_user["id"], catalog_item["topic"], sess_type, duration, sess_timestamp_str))

            # Visual Description log
            vis_id = f"vis_{session_counter:03d}"
            cursor.execute("""
                INSERT INTO visual_descriptions (id, session_id, image_url, diagram_type, spatial_audio_description, spatial_nodes_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                vis_id, session_id, catalog_item["image_url"], catalog_item["diagram_type"],
                catalog_item["spatial_description"],
                json.dumps({"center": "Core concept", "top_left": "Input flow", "bottom_right": "Output product"}),
                sess_timestamp_str
            ))

            # Audio conversational logs (2-4 turns)
            for turn in range(1, random.randint(3, 5)):
                # AI Turn
                cursor.execute("""
                    INSERT INTO audio_logs (id, session_id, speaker, transcript_text, audio_url, sentiment_score, created_at)
                    VALUES (?, ?, 'ai', ?, ?, 0.8, ?)
                """, (
                    f"aud_{session_counter:03d}_{turn}_ai", session_id,
                    f"Let's explore the key visual spatial details of {catalog_item['topic']}. Would you like me to describe the central elements first?",
                    f"https://audio.clarity.ai/tts_{session_id}_{turn}.mp3",
                    sess_timestamp_str
                ))
                # User Voice Turn
                cursor.execute("""
                    INSERT INTO audio_logs (id, session_id, speaker, transcript_text, audio_url, sentiment_score, created_at)
                    VALUES (?, ?, 'user', ?, ?, 0.7, ?)
                """, (
                    f"aud_{session_counter:03d}_{turn}_usr", session_id,
                    f"Yes please! Tell me where the main components are positioned spatially.",
                    f"https://audio.clarity.ai/stt_{session_id}_{turn}.wav",
                    sess_timestamp_str
                ))

            # Comprehension Logs
            for sub in catalog_item["sub_topics"]:
                comp_id = f"comp_{session_counter:03d}_{random.randint(100, 999)}"
                # Add slight random variation to score (+- 5)
                varied_score = max(35, min(100, sub["conf"] + random.randint(-5, 5)))
                cursor.execute("""
                    INSERT INTO comprehension_logs (id, session_id, user_id, sub_topic, confidence_score, detected_gap, ai_feedback, evaluated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    comp_id, session_id, demo_user["id"], sub["name"], varied_score,
                    sub["gap"],
                    "Strong comprehension of spatial layout. Focus voice practice on specific terminology." if varied_score >= 70 else "Recommended short Socratic voice recap.",
                    sess_timestamp_str
                ))

            # Voice Quiz History
            quiz_id = f"qz_{session_counter:03d}"
            vocal_conf = random.randint(70, 98)
            cursor.execute("""
                INSERT INTO quiz_history (id, session_id, user_id, question_text, user_audio_answer, is_correct, score, vocal_confidence_index, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                quiz_id, session_id, demo_user["id"],
                f"Describe the spatial arrangement of {catalog_item['topic']} in your own words.",
                f"The main elements flow from upper left across the center to lower right.",
                1 if vocal_conf >= 75 else 0,
                vocal_conf,
                vocal_conf,
                sess_timestamp_str
            ))

            session_counter += 1

    conn.commit()
    conn.close()

    print("[+] Computing aggregated user dashboard analytics...")
    summary = AnalyticsDAO.get_user_dashboard_metrics(demo_user["id"])
    print(f"[SUCCESS] Seed complete for {demo_user['name']}!")
    print(f"   - Total Listening Hours: {summary['total_listening_hours']} hrs")
    print(f"   - Voice Confidence Index: {summary['voice_confidence_index']} / 100")
    print(f"   - Audio Retention Rate: {summary['audio_retention_rate']}%")
    print(f"   - Mastered Topics ({len(summary['top_mastered_topics'])}): {summary['top_mastered_topics']}")
    print(f"   - Knowledge Gap Areas ({len(summary['knowledge_gap_areas'])}): {[g['topic'] for g in summary['knowledge_gap_areas']]}")

if __name__ == "__main__":
    seed_database()
