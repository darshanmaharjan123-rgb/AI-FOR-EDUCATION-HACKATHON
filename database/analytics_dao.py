"""
ClarityAI Analytics & Data Access Object (DAO) (Python)
Implements aggregation functions for Voice Analytics Dashboard.
"""

import json
from typing import Dict, List, Any, Optional
from db import get_connection

class AnalyticsDAO:
    @staticmethod
    def get_user_dashboard_metrics(user_id: str) -> Dict[str, Any]:
        """
        Retrieves real-time aggregated metrics for the user's dashboard:
        - Total Listening Hours
        - Audio Retention Rate (%)
        - Voice Confidence Index (0-100)
        - Mastered & Weak Topics
        - Knowledge Gap Areas
        """
        conn = get_connection()
        cursor = conn.cursor()

        # Fetch basic user info
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            conn.close()
            return {"error": f"User {user_id} not found"}

        # Fetch listening hours and session count
        cursor.execute("""
            SELECT 
                COALESCE(SUM(duration_seconds) / 3600.0, 0.0) as listening_hours,
                COUNT(id) as total_sessions
            FROM sessions 
            WHERE user_id = ?
        """, (user_id,))
        sess_stats = cursor.fetchone()
        listening_hours = round(sess_stats["listening_hours"], 2)
        total_sessions = sess_stats["total_sessions"]

        # Fetch Voice Confidence Index from quiz history and comprehension logs
        cursor.execute("""
            SELECT COALESCE(AVG(vocal_confidence_index), 0.0) as avg_quiz_confidence
            FROM quiz_history
            WHERE user_id = ?
        """, (user_id,))
        quiz_conf = cursor.fetchone()["avg_quiz_confidence"]

        cursor.execute("""
            SELECT COALESCE(AVG(confidence_score), 0.0) as avg_comprehension_confidence
            FROM comprehension_logs
            WHERE user_id = ?
        """, (user_id,))
        comp_conf = cursor.fetchone()["avg_comprehension_confidence"]

        vocal_confidence_index = round((quiz_conf * 0.5) + (comp_conf * 0.5), 1)

        # Compute Audio Retention Rate (Ratio of completed sessions > 2 mins vs short dropped sessions)
        cursor.execute("""
            SELECT 
                COUNT(*) as total_logs,
                SUM(CASE WHEN duration_seconds >= 120 THEN 1 ELSE 0 END) as retained_logs
            FROM sessions
            WHERE user_id = ?
        """, (user_id,))
        ret_stats = cursor.fetchone()
        retention_rate = 100.0
        if ret_stats["total_logs"] > 0:
            retention_rate = round((ret_stats["retained_logs"] / ret_stats["total_logs"]) * 100.0, 1)

        # Identify Mastered Topics (confidence >= 75)
        cursor.execute("""
            SELECT sub_topic, AVG(confidence_score) as avg_score
            FROM comprehension_logs
            WHERE user_id = ?
            GROUP BY sub_topic
            HAVING avg_score >= 75
            ORDER BY avg_score DESC
        """, (user_id,))
        mastered_topics = [row["sub_topic"] for row in cursor.fetchall()]

        # Identify Weak Topics & Knowledge Gap Areas (confidence < 60)
        cursor.execute("""
            SELECT sub_topic, AVG(confidence_score) as avg_score, detected_gap
            FROM comprehension_logs
            WHERE user_id = ?
            GROUP BY sub_topic
            HAVING avg_score < 60
            ORDER BY avg_score ASC
        """, (user_id,))
        gaps_data = cursor.fetchall()
        weak_topics = [row["sub_topic"] for row in gaps_data]
        knowledge_gaps = [
            {
                "topic": row["sub_topic"],
                "score": round(row["avg_score"], 1),
                "gap": row["detected_gap"] or "Needs foundational review"
            }
            for row in gaps_data
        ]

        # Sync or create row in analytics_summary
        cursor.execute("""
            INSERT INTO analytics_summary (
                id, user_id, total_listening_hours, top_mastered_topics, weak_topics,
                audio_retention_rate, voice_confidence_index, knowledge_gap_areas, last_updated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                total_listening_hours = excluded.total_listening_hours,
                top_mastered_topics = excluded.top_mastered_topics,
                weak_topics = excluded.weak_topics,
                audio_retention_rate = excluded.audio_retention_rate,
                voice_confidence_index = excluded.voice_confidence_index,
                knowledge_gap_areas = excluded.knowledge_gap_areas,
                last_updated = CURRENT_TIMESTAMP
        """, (
            f"summary_{user_id}",
            user_id,
            listening_hours,
            json.dumps(mastered_topics),
            json.dumps(weak_topics),
            retention_rate,
            vocal_confidence_index,
            json.dumps(knowledge_gaps)
        ))

        conn.commit()
        conn.close()

        return {
            "user_id": user_id,
            "user_name": user["name"],
            "accessibility_mode": user["accessibility_mode"],
            "total_listening_hours": listening_hours,
            "total_sessions": total_sessions,
            "audio_retention_rate": retention_rate,
            "voice_confidence_index": vocal_confidence_index,
            "top_mastered_topics": mastered_topics,
            "weak_topics": weak_topics,
            "knowledge_gap_areas": knowledge_gaps
        }

    @staticmethod
    def get_recent_sessions(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch recent learning sessions with associated details."""
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.*, 
                   vd.diagram_type, vd.spatial_audio_description,
                   COUNT(al.id) as audio_turns_count
            FROM sessions s
            LEFT JOIN visual_descriptions vd ON s.id = vd.session_id
            LEFT JOIN audio_logs al ON s.id = al.session_id
            WHERE s.user_id = ?
            GROUP BY s.id
            ORDER BY s.timestamp DESC
            LIMIT ?
        """, (user_id, limit))
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
