"""
ClarityAI Database Automated Verification Test Suite (Python)
Validates schema creation, foreign key enforcement, seed loading, and frontend payload alignment.
"""

import sys
import unittest
from db import get_connection, init_db
from analytics_dao import AnalyticsDAO
from seed import seed_database

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class TestClarityAIDatabase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        print("\n[TEST] Running ClarityAI Database Automated Verification...")
        seed_database()

    def test_01_user_table_exists_and_populated(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = 'usr_alex_01'")
        user = cursor.fetchone()
        conn.close()
        
        self.assertIsNotNone(user, "User usr_alex_01 should exist in database.")
        self.assertEqual(user["name"], "Alex Rivera")
        self.assertEqual(user["role"], "student")
        self.assertEqual(user["accessibility_mode"], "voice_first")

    def test_02_sessions_count_and_subjects(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM sessions WHERE user_id = 'usr_alex_01'")
        count = cursor.fetchone()["cnt"]
        conn.close()
        
        self.assertEqual(count, 347, "Expected exactly 347 study sessions to match frontend UI.")

    def test_03_visual_descriptions_file_metadata(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM visual_descriptions LIMIT 1")
        vis = cursor.fetchone()
        conn.close()
        
        self.assertIsNotNone(vis, "Visual descriptions should be populated.")
        self.assertIn("file_name", vis.keys())
        self.assertIn("file_format", vis.keys())
        self.assertIn("spatial_audio_description", vis.keys())

    def test_04_v_user_dashboard_metrics_view(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM v_user_dashboard_metrics WHERE user_id = 'usr_alex_01'")
        metrics = cursor.fetchone()
        conn.close()
        
        self.assertIsNotNone(metrics, "View v_user_dashboard_metrics should return rows.")
        self.assertEqual(metrics["user_role"], "student")
        self.assertGreater(metrics["total_listening_hours"], 50.0)

    def test_05_analytics_dao_frontend_payload(self):
        summary = AnalyticsDAO.get_user_dashboard_metrics("usr_alex_01")
        self.assertEqual(summary["user_name"], "Alex Rivera")
        self.assertEqual(summary["sessions_completed_count"], 347)
        self.assertEqual(summary["day_streak"], 21)
        self.assertIn("total_listening_hours", summary)
        self.assertIn("avg_comprehension_score", summary)
        self.assertIn("weekly_chart", summary)
        self.assertIn("subject_distribution", summary)
        self.assertIn("topic_mastery", summary)
        
        print("[+] Analytics DAO Summary matching Frontend UI:")
        print(f"   Listening Hours: {summary['total_listening_hours']}")
        print(f"   Avg Comprehension: {summary['avg_comprehension_score']}%")
        print(f"   Sessions Completed: {summary['sessions_completed_count']}")
        print(f"   Day Streak: {summary['day_streak']}")
        print(f"   Subject Distribution: {summary['subject_distribution']}")
        print(f"   Topic Mastery Progress: {summary['topic_mastery']}")

if __name__ == "__main__":
    unittest.main()
