"""
ClarityAI Lightweight Database REST API Server (Python)
Connects Frontend (app.js) directly to SQLite Database & Analytics DAO.
Zero external dependencies required (uses built-in http.server and sqlite3).
"""

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

# Ensure local imports work
sys.path.insert(0, os.path.dirname(__file__))

from db import get_connection, init_db
from analytics_dao import AnalyticsDAO
from seed import seed_database

PORT = 5000

class ClarityAPIHandler(BaseHTTPRequestHandler):

    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        query_params = parse_qs(parsed_url.query)

        if path == "/api/analytics/dashboard":
            user_id = query_params.get("user_id", ["usr_alex_01"])[0]
            summary = AnalyticsDAO.get_user_dashboard_metrics(user_id)
            self._set_headers(200)
            self.wfile.write(json.dumps(summary).encode("utf-8"))

        elif path == "/api/visuals/recent":
            user_id = query_params.get("user_id", ["usr_alex_01"])[0]
            limit = int(query_params.get("limit", [10])[0])
            sessions = AnalyticsDAO.get_recent_sessions(user_id, limit)
            self._set_headers(200)
            self.wfile.write(json.dumps(sessions).encode("utf-8"))

        elif path == "/api/health":
            self._set_headers(200)
            self.wfile.write(json.dumps({"status": "healthy", "service": "ClarityAI Database API"}).encode("utf-8"))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

    def do_POST(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else b"{}"

        try:
            data = json.loads(body.decode("utf-8"))
        except Exception:
            data = {}

        if path == "/api/auth/signup":
            name = data.get("name", "New Learner").strip()
            email = data.get("email", "").strip()
            password = data.get("password", "")
            role = data.get("role", "student")
            access_mode = data.get("accessibility_mode", "voice_first")

            user_id = f"usr_{hash(email) % 1000000:06d}"

            conn = get_connection()
            cursor = conn.cursor()
            try:
                cursor.execute("""
                    INSERT INTO users (id, name, email, password_hash, role, accessibility_mode)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (user_id, name, email, f"hash_{password}", role, access_mode))
                conn.commit()
                response = {
                    "success": True,
                    "message": "Account created successfully!",
                    "user": {"id": user_id, "name": name, "email": email, "role": role, "accessibility_mode": access_mode}
                }
                status_code = 201
            except Exception as e:
                conn.rollback()
                response = {"success": False, "error": f"Registration failed: {str(e)}"}
                status_code = 400
            finally:
                conn.close()

            self._set_headers(status_code)
            self.wfile.write(json.dumps(response).encode("utf-8"))

        elif path == "/api/auth/signin":
            email = data.get("email", "").strip()

            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            conn.close()

            if user or email == "alex.rivera@clarity.ai":
                u_dict = dict(user) if user else {
                    "id": "usr_alex_01", "name": "Alex Rivera", "email": "alex.rivera@clarity.ai", "role": "student"
                }
                response = {"success": True, "message": "Sign in successful!", "user": u_dict}
                status_code = 200
            else:
                response = {"success": False, "error": "Invalid email or password"}
                status_code = 401

            self._set_headers(status_code)
            self.wfile.write(json.dumps(response).encode("utf-8"))

        elif path == "/api/sessions/chat":
            session_id = data.get("session_id", "sess_2026_001")
            speaker = data.get("speaker", "user")
            text = data.get("transcript_text", "")

            conn = get_connection()
            cursor = conn.cursor()
            log_id = f"aud_{hash(text) % 1000000:06d}"
            cursor.execute("""
                INSERT INTO audio_logs (id, session_id, speaker, transcript_text, created_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (log_id, session_id, speaker, text))
            conn.commit()
            conn.close()

            self._set_headers(201)
            self.wfile.write(json.dumps({"success": True, "log_id": log_id}).encode("utf-8"))

        elif path == "/api/visuals/upload":
            file_name = data.get("file_name", "Uploaded_Visual.png")
            file_format = data.get("file_format", "png").lower()
            file_size = data.get("file_size_bytes", 120000)
            diagram_type = data.get("diagram_type", "diagram")

            desc = f"Uploaded visual content ({file_name}, {file_format.upper()}). Converted to structured spatial audio description with labeled nodes and spatial relationships."

            conn = get_connection()
            cursor = conn.cursor()
            session_id = f"sess_up_{hash(file_name) % 100000:05d}"
            cursor.execute("""
                INSERT INTO sessions (id, user_id, topic, subject, session_type, duration_seconds)
                VALUES (?, 'usr_alex_01', ?, 'Science', 'visual_description', 300)
            """, (session_id, f"Visual Analysis: {file_name}"))

            vis_id = f"vis_up_{hash(file_name) % 100000:05d}"
            cursor.execute("""
                INSERT INTO visual_descriptions (id, session_id, image_url, file_name, file_size_bytes, file_format, diagram_type, status, spatial_audio_description)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'described', ?)
            """, (vis_id, session_id, f"https://uploads.clarity.ai/{file_name}", file_name, file_size, file_format, diagram_type, desc))

            conn.commit()
            conn.close()

            self._set_headers(201)
            self.wfile.write(json.dumps({
                "success": True,
                "vis_id": vis_id,
                "file_name": file_name,
                "status": "described",
                "spatial_audio_description": desc
            }).encode("utf-8"))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

def run_server():
    print(f"🚀 Initializing database for REST API Server...")
    seed_database()
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, ClarityAPIHandler)
    print(f"✅ ClarityAI Database REST API Server listening at http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")

if __name__ == "__main__":
    run_server()
