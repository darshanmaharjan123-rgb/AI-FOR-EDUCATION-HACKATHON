"""
ClarityAI — REST API Server (integrated/server.py)
Bridges the Frontend (frontend/index.html) ↔ Database (database/database.sqlite).
Zero external dependencies — uses Python's built-in http.server + sqlite3.

Endpoints:
  GET  /api/health
  GET  /api/analytics/dashboard?user_id=<id>
  GET  /api/visuals/recent?user_id=<id>&limit=<n>
  POST /api/auth/signup          { name, email, password, role, accessibility_mode }
  POST /api/auth/signin          { email, password }
  POST /api/sessions/chat        { session_id, speaker, transcript_text }
  POST /api/visuals/upload       { file_name, file_format, file_size_bytes, diagram_type }
"""

import json, os, sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

# Allow imports from database/ sub-package
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "database"))

from db import get_connection, init_db
from analytics_dao import AnalyticsDAO

PORT = 5000


class Handler(BaseHTTPRequestHandler):

    # ── silence default request logging (uncomment to debug) ──
    def log_message(self, fmt, *args):
        pass

    def _cors(self, status=200, ctype="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type,Authorization")
        self.end_headers()

    def _json(self, data, status=200):
        body = json.dumps(data, default=str).encode()
        self._cors(status)
        self.wfile.write(body)

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b"{}"
        try:    return json.loads(raw.decode())
        except: return {}

    # ── PREFLIGHT ────────────────────────────────────────────
    def do_OPTIONS(self):
        self._cors(204)

    # ── GET ──────────────────────────────────────────────────
    def do_GET(self):
        parsed = urlparse(self.path)
        path   = parsed.path
        qs     = parse_qs(parsed.query)

        if path == "/api/health":
            self._json({"status": "healthy", "service": "ClarityAI API", "port": PORT})

        elif path == "/api/analytics/dashboard":
            uid = qs.get("user_id", ["usr_alex_01"])[0]
            self._json(AnalyticsDAO.get_user_dashboard_metrics(uid))

        elif path == "/api/visuals/recent":
            uid   = qs.get("user_id", ["usr_alex_01"])[0]
            limit = int(qs.get("limit", [10])[0])
            self._json(AnalyticsDAO.get_recent_sessions(uid, limit))

        else:
            self._json({"error": "Not found"}, 404)

    # ── POST ─────────────────────────────────────────────────
    def do_POST(self):
        path = urlparse(self.path).path
        data = self._read_body()

        # /api/auth/signup ─────────────────────────────────
        if path == "/api/auth/signup":
            name  = data.get("name", "Learner").strip()
            email = data.get("email", "").strip()
            pwd   = data.get("password", "")
            role  = data.get("role", "student")
            mode  = data.get("accessibility_mode", "voice_first")
            if not email:
                return self._json({"success": False, "error": "Email required"}, 400)

            uid  = f"usr_{abs(hash(email)) % 10_000_000:07d}"
            conn = get_connection()
            try:
                conn.execute("""INSERT INTO users
                    (id,name,email,password_hash,role,accessibility_mode)
                    VALUES(?,?,?,?,?,?)""",
                    (uid, name, email, f"hash_{pwd}", role, mode))
                conn.commit()
                self._json({"success": True,
                            "user": {"id":uid,"name":name,"email":email,"role":role}}, 201)
            except Exception as e:
                conn.rollback()
                self._json({"success": False, "error": str(e)}, 409)
            finally:
                conn.close()

        # /api/auth/signin ─────────────────────────────────
        elif path == "/api/auth/signin":
            email = data.get("email", "").strip()
            conn  = get_connection()
            cur   = conn.cursor()
            cur.execute("SELECT * FROM users WHERE email=?", (email,))
            user = cur.fetchone()
            conn.close()
            if user:
                self._json({"success": True, "user": dict(user)})
            else:
                self._json({"success": False, "error": "Invalid credentials"}, 401)

        # /api/sessions/chat ───────────────────────────────
        elif path == "/api/sessions/chat":
            sid     = data.get("session_id", "sess_0001")
            speaker = data.get("speaker", "user")
            text    = data.get("transcript_text", "")
            log_id  = f"aud_{abs(hash(text+sid)) % 1_000_000:06d}"
            conn    = get_connection()
            try:
                conn.execute("""INSERT OR IGNORE INTO audio_logs
                    (id,session_id,speaker,transcript_text,created_at)
                    VALUES(?,?,?,?,CURRENT_TIMESTAMP)""",
                    (log_id, sid, speaker, text))
                conn.commit()
                self._json({"success": True, "log_id": log_id}, 201)
            finally:
                conn.close()

        # /api/visuals/upload ──────────────────────────────
        elif path == "/api/visuals/upload":
            fname  = data.get("file_name", "upload.png")
            fmt    = data.get("file_format", "png").lower()
            fsize  = data.get("file_size_bytes", 0)
            dtype  = data.get("diagram_type", "diagram")
            desc   = (f"Uploaded '{fname}' ({fmt.upper()}). AI generated spatial audio "
                      "description with labeled nodes and directional relationships.")
            sid    = f"sess_up_{abs(hash(fname)) % 100_000:05d}"
            vis_id = f"vis_up_{abs(hash(fname)) % 100_000:05d}"
            conn   = get_connection()
            try:
                conn.execute("""INSERT OR IGNORE INTO sessions
                    (id,user_id,topic,subject,session_type,duration_seconds)
                    VALUES(?,?,?,?,?,300)""",
                    (sid,"usr_alex_01",f"Visual: {fname}","Science","visual_description"))
                conn.execute("""INSERT OR IGNORE INTO visual_descriptions
                    (id,session_id,image_url,file_name,file_size_bytes,
                     file_format,diagram_type,status,spatial_audio_description)
                    VALUES(?,?,?,?,?,?,?,'described',?)""",
                    (vis_id,sid,f"https://uploads.clarity.ai/{fname}",
                     fname,fsize,fmt,dtype,desc))
                conn.commit()
                self._json({"success": True, "vis_id": vis_id,
                            "file_name": fname, "status": "described",
                            "spatial_audio_description": desc}, 201)
            finally:
                conn.close()

        else:
            self._json({"error": "Not found"}, 404)


def run(seed: bool = True):
    if seed:
        from seed import seed_database
        seed_database()
    httpd = HTTPServer(("", PORT), Handler)
    print(f"\n{'='*55}")
    print(f"  ClarityAI REST API  |  http://localhost:{PORT}")
    print(f"  Frontend            |  open integrated/frontend/index.html")
    print(f"{'='*55}\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[API] Server stopped.")


if __name__ == "__main__":
    run()
