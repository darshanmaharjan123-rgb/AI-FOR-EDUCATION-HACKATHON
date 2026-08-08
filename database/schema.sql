-- ClarityAI Database Schema — Integrated Version
-- Voice-First AI Tutor for Sight-Impaired Learners
-- Compatible: SQLite (local dev) | PostgreSQL / Supabase (production)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'student',          -- 'student','educator','parent','researcher'
    accessibility_mode TEXT NOT NULL DEFAULT 'voice_first',
    vocal_speed_preference REAL NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    topic TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT 'General',       -- 'Mathematics','Science','History','Literature','Chemistry'
    session_type TEXT NOT NULL,                    -- 'visual_description','socratic_voice','comprehension_test'
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT 1,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Visual Descriptions Table
CREATE TABLE IF NOT EXISTS visual_descriptions (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    file_name TEXT,
    file_size_bytes INTEGER DEFAULT 0,
    file_format TEXT NOT NULL DEFAULT 'png',       -- 'pdf','png','jpg','svg','latex'
    diagram_type TEXT NOT NULL,                    -- 'chart','equation','diagram','article'
    status TEXT NOT NULL DEFAULT 'described',      -- 'processing','described','failed'
    spatial_audio_description TEXT NOT NULL,
    spatial_nodes_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- 4. Audio Logs Table
CREATE TABLE IF NOT EXISTS audio_logs (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    speaker TEXT NOT NULL,                         -- 'user' or 'ai'
    transcript_text TEXT NOT NULL,
    audio_url TEXT,
    sentiment_score REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- 5. Comprehension Logs Table
CREATE TABLE IF NOT EXISTS comprehension_logs (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    sub_topic TEXT NOT NULL,
    confidence_score INTEGER NOT NULL CHECK(confidence_score BETWEEN 0 AND 100),
    detected_gap TEXT,
    ai_feedback TEXT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Quiz History Table
CREATE TABLE IF NOT EXISTS quiz_history (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    user_audio_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT 0,
    score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100),
    vocal_confidence_index INTEGER NOT NULL CHECK(vocal_confidence_index BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Analytics Summary Table
CREATE TABLE IF NOT EXISTS analytics_summary (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    total_listening_hours REAL NOT NULL DEFAULT 0.0,
    avg_comprehension_score REAL NOT NULL DEFAULT 0.0,
    sessions_completed_count INTEGER NOT NULL DEFAULT 0,
    day_streak INTEGER NOT NULL DEFAULT 0,
    weekly_chart_json TEXT NOT NULL DEFAULT '[]',
    subject_distribution_json TEXT NOT NULL DEFAULT '{}',
    topic_mastery_json TEXT NOT NULL DEFAULT '{}',
    top_mastered_topics TEXT NOT NULL DEFAULT '[]',
    weak_topics TEXT NOT NULL DEFAULT '[]',
    audio_retention_rate REAL NOT NULL DEFAULT 0.0,
    voice_confidence_index REAL NOT NULL DEFAULT 0.0,
    knowledge_gap_areas TEXT NOT NULL DEFAULT '[]',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id     ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_timestamp   ON sessions(timestamp);
CREATE INDEX IF NOT EXISTS idx_sessions_subject     ON sessions(subject);
CREATE INDEX IF NOT EXISTS idx_audio_logs_session   ON audio_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_comp_user            ON comprehension_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_comp_score           ON comprehension_logs(confidence_score);
CREATE INDEX IF NOT EXISTS idx_quiz_user            ON quiz_history(user_id);

-- Dashboard View
CREATE VIEW IF NOT EXISTS v_user_dashboard_metrics AS
SELECT
    u.id AS user_id, u.name AS user_name, u.email, u.role, u.accessibility_mode,
    COALESCE(SUM(s.duration_seconds) / 3600.0, 0.0)        AS total_listening_hours,
    COALESCE(ROUND(AVG(c.confidence_score), 1), 0.0)        AS average_comprehension_score,
    COALESCE(ROUND(AVG(q.vocal_confidence_index), 1), 0.0)  AS voice_confidence_index,
    COUNT(DISTINCT s.id)                                     AS total_sessions_count,
    COUNT(DISTINCT c.id)                                     AS evaluated_concepts_count
FROM users u
LEFT JOIN sessions s           ON u.id = s.user_id
LEFT JOIN comprehension_logs c ON u.id = c.user_id
LEFT JOIN quiz_history q       ON u.id = q.user_id
GROUP BY u.id, u.name, u.email, u.role, u.accessibility_mode;
