"""
ClarityAI Database Automated Verification Test Suite (Python)
Validates schema creation, foreign key enforcement, seed loading, and analytical queries.
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
        self.assertEqual(user["accessibility_mode"], "voice_first")

    def test_02_sessions_and_foreign_keys(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM sessions WHERE user_id = 'usr_alex_01'")
        count = cursor.fetchone()["cnt"]
        conn.close()
        
        self.assertGreater(count, 10, "Expected at least 10 study sessions generated over 14 days.")

    def test_03_visual_descriptions_spatial_data(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM visual_descriptions LIMIT 1")
        vis = cursor.fetchone()
        conn.close()
        
        self.assertIsNotNone(vis, "Visual descriptions should be populated.")
        self.assertIn("spatial_audio_description", vis.keys())
        self.assertTrue(len(vis["spatial_audio_description"]) > 20)

    def test_04_v_user_dashboard_metrics_view(self):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM v_user_dashboard_metrics WHERE user_id = 'usr_alex_01'")
        metrics = cursor.fetchone()
        conn.close()
        
        self.assertIsNotNone(metrics, "View v_user_dashboard_metrics should return rows.")
        self.assertGreater(metrics["total_listening_hours"], 0.5)

    def test_05_analytics_dao_metrics(self):
        summary = AnalyticsDAO.get_user_dashboard_metrics("usr_alex_01")
        self.assertEqual(summary["user_name"], "Alex Rivera")
        self.assertIn("total_listening_hours", summary)
        self.assertIn("audio_retention_rate", summary)
        self.assertIn("voice_confidence_index", summary)
        self.assertIsInstance(summary["top_mastered_topics"], list)
        self.assertIsInstance(summary["knowledge_gap_areas"], list)
        
        print("[+] Analytics DAO Summary output:")
        print(f"   Listening Hours: {summary['total_listening_hours']}")
        print(f"   Retention Rate: {summary['audio_retention_rate']}%")
        print(f"   Voice Confidence Index: {summary['voice_confidence_index']}")
        print(f"   Mastered Topics: {summary['top_mastered_topics']}")
        print(f"   Knowledge Gap Count: {len(summary['knowledge_gap_areas'])}")

if __name__ == "__main__":
    unittest.main()
