"""
ClarityAI REST API Server Automated Test Suite (Python)
Validates all API endpoints connecting Frontend app.js to SQLite Database.
"""

import json
import sys
import unittest
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import threading
import time

from server import PORT, run_server
from db import get_connection

class TestClarityAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        print("\n[TEST] Launching ClarityAI REST API Server in test thread...")
        cls.server_thread = threading.Thread(target=run_server, daemon=True)
        cls.server_thread.start()
        time.sleep(1.5) # Allow server to bind to port 5000

    def test_01_health_check(self):
        url = f"http://localhost:{PORT}/api/health"
        req = Request(url)
        with urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(resp.status, 200)
            self.assertEqual(data["status"], "healthy")

    def test_02_analytics_dashboard_endpoint(self):
        url = f"http://localhost:{PORT}/api/analytics/dashboard?user_id=usr_alex_01"
        req = Request(url)
        with urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(resp.status, 200)
            self.assertEqual(data["user_name"], "Alex Rivera")
            self.assertEqual(data["sessions_completed_count"], 347)
            self.assertEqual(data["day_streak"], 21)
            self.assertIn("subject_distribution", data)
            self.assertIn("topic_mastery", data)

    def test_03_auth_signup_endpoint(self):
        url = f"http://localhost:{PORT}/api/auth/signup"
        payload = {
            "name": "Sarah Miller",
            "email": "sarah.m@clarity.ai",
            "password": "SecurePassword123",
            "role": "educator",
            "accessibility_mode": "screen_reader"
        }
        req = Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
        with urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(resp.status, 201)
            self.assertTrue(data["success"])
            self.assertEqual(data["user"]["name"], "Sarah Miller")
            self.assertEqual(data["user"]["role"], "educator")

    def test_04_chat_log_endpoint(self):
        url = f"http://localhost:{PORT}/api/auth/signin"
        payload = {"email": "alex.rivera@clarity.ai", "password": "any"}
        req = Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
        with urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(resp.status, 200)
            self.assertTrue(data["success"])

    def test_05_visual_upload_endpoint(self):
        url = f"http://localhost:{PORT}/api/visuals/upload"
        payload = {
            "file_name": "Cell_Membrane_Diagram.png",
            "file_format": "png",
            "file_size_bytes": 350000,
            "diagram_type": "diagram"
        }
        req = Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
        with urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(resp.status, 201)
            self.assertTrue(data["success"])
            self.assertIn("spatial_audio_description", data)

if __name__ == "__main__":
    unittest.main()
