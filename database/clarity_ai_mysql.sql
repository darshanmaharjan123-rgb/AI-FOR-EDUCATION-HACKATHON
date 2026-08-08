-- ClarityAI Complete MySQL / MariaDB Dump File for XAMPP & phpMyAdmin
-- Includes database creation, table DDL schemas, indexes, views, and pre-populated seed data.

CREATE DATABASE IF NOT EXISTS clarity_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clarity_ai;

-- 1. Users Table
DROP TABLE IF EXISTS analytics_summary;
DROP TABLE IF EXISTS quiz_history;
DROP TABLE IF EXISTS comprehension_logs;
DROP TABLE IF EXISTS audio_logs;
DROP TABLE IF EXISTS visual_descriptions;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    accessibility_mode VARCHAR(50) NOT NULL DEFAULT 'voice_first',
    vocal_speed_preference DOUBLE NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Sessions Table
CREATE TABLE sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL DEFAULT 'General',
    session_type VARCHAR(50) NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 0,
    is_completed TINYINT(1) NOT NULL DEFAULT 1,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Visual Descriptions Table
CREATE TABLE visual_descriptions (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    image_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size_bytes INT DEFAULT 0,
    file_format VARCHAR(20) NOT NULL DEFAULT 'png',
    diagram_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'described',
    spatial_audio_description TEXT NOT NULL,
    spatial_nodes_json LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Audio Logs Table
CREATE TABLE audio_logs (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    speaker VARCHAR(20) NOT NULL,
    transcript_text TEXT NOT NULL,
    audio_url TEXT,
    sentiment_score DOUBLE DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Comprehension Logs Table
CREATE TABLE comprehension_logs (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    sub_topic VARCHAR(255) NOT NULL,
    confidence_score INT NOT NULL CHECK(confidence_score BETWEEN 0 AND 100),
    detected_gap TEXT,
    ai_feedback TEXT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Quiz History Table
CREATE TABLE quiz_history (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    question_text TEXT NOT NULL,
    user_audio_answer TEXT NOT NULL,
    is_correct TINYINT(1) NOT NULL DEFAULT 0,
    score INT NOT NULL CHECK(score BETWEEN 0 AND 100),
    vocal_confidence_index INT NOT NULL CHECK(vocal_confidence_index BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Analytics Summary Table
CREATE TABLE analytics_summary (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE NOT NULL,
    total_listening_hours DOUBLE NOT NULL DEFAULT 0.0,
    avg_comprehension_score DOUBLE NOT NULL DEFAULT 0.0,
    sessions_completed_count INT NOT NULL DEFAULT 0,
    day_streak INT NOT NULL DEFAULT 0,
    weekly_chart_json LONGTEXT NOT NULL,
    subject_distribution_json LONGTEXT NOT NULL,
    topic_mastery_json LONGTEXT NOT NULL,
    top_mastered_topics LONGTEXT NOT NULL,
    weak_topics LONGTEXT NOT NULL,
    audio_retention_rate DOUBLE NOT NULL DEFAULT 0.0,
    voice_confidence_index DOUBLE NOT NULL DEFAULT 0.0,
    knowledge_gap_areas LONGTEXT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_subject ON sessions(subject);
CREATE INDEX idx_audio_logs_session_id ON audio_logs(session_id);
CREATE INDEX idx_comprehension_user_id ON comprehension_logs(user_id);

-- Analytical View
CREATE OR REPLACE VIEW v_user_dashboard_metrics AS
SELECT 
    u.id AS user_id,
    u.name AS user_name,
    u.email AS user_email,
    u.role AS user_role,
    u.accessibility_mode,
    COALESCE(SUM(s.duration_seconds) / 3600.0, 0.0) AS total_listening_hours,
    COALESCE(ROUND(AVG(c.confidence_score), 1), 0.0) AS average_comprehension_score,
    COALESCE(ROUND(AVG(q.vocal_confidence_index), 1), 0.0) AS voice_confidence_index,
    COUNT(DISTINCT s.id) AS total_sessions_count
FROM users u
LEFT JOIN sessions s ON u.id = s.user_id
LEFT JOIN comprehension_logs c ON u.id = c.user_id
LEFT JOIN quiz_history q ON u.id = q.user_id
GROUP BY u.id, u.name, u.email, u.role, u.accessibility_mode;

-- Seed Data Insertion
INSERT INTO users (id, name, email, password_hash, role, accessibility_mode, vocal_speed_preference) VALUES
('usr_alex_01', 'Alex Rivera', 'alex.rivera@clarity.ai', 'pbkdf2_sha256$hash_demo_12345', 'student', 'voice_first', 1.2),
('usr_sarah_02', 'Sarah Martinez', 'sarah.m@clarity.ai', 'pbkdf2_sha256$hash_demo_67890', 'educator', 'screen_reader', 1.0);

INSERT INTO sessions (id, user_id, topic, subject, session_type, duration_seconds, is_completed) VALUES
('sess_2026_001', 'usr_alex_01', 'Algebra & Equations: Quadratic Parabola Vertex Form', 'Mathematics', 'visual_description', 1240, 1),
('sess_2026_002', 'usr_alex_01', 'Cell Biology: Photosynthesis Flowchart', 'Science', 'socratic_voice', 1580, 1),
('sess_2026_003', 'usr_alex_01', 'World History: 20th Century Trade Routes', 'History', 'comprehension_test', 920, 1),
('sess_2026_004', 'usr_alex_01', 'Literary Analysis: Shakespearean Sonnet Rhythm', 'Literature', 'visual_description', 1100, 1),
('sess_2026_005', 'usr_alex_01', 'Chemistry: Periodic Table Electron Shell Distribution', 'Chemistry', 'socratic_voice', 1350, 1);

INSERT INTO visual_descriptions (id, session_id, image_url, file_name, file_size_bytes, file_format, diagram_type, status, spatial_audio_description) VALUES
('vis_001', 'sess_2026_001', 'https://clarity-edu.org/assets/quadratic_parabola.png', 'Quadratic_Parabola_Graph.png', 245000, 'png', 'equation', 'described', 'A downward-opening U-shaped parabola. The apex vertex reaches peak height at coordinate (2, 5) near upper center.'),
('vis_002', 'sess_2026_002', 'https://clarity-edu.org/assets/photosynthesis_flow.png', 'Photosynthesis_Diagram.pdf', 512000, 'pdf', 'diagram', 'described', 'At 12 oclock, solar photon energy strikes Thylakoid membranes in the chloroplast.');

INSERT INTO audio_logs (id, session_id, speaker, transcript_text, sentiment_score) VALUES
('aud_001_ai', 'sess_2026_001', 'ai', 'Hello Alex! I am ready to describe the Quadratic Parabola graph.', 0.8),
('aud_001_usr', 'sess_2026_001', 'user', 'Can you tell me where the vertex is located spatially?', 0.7);

INSERT INTO comprehension_logs (id, session_id, user_id, sub_topic, confidence_score, detected_gap, ai_feedback) VALUES
('comp_001', 'sess_2026_001', 'usr_alex_01', 'Algebra & Equations', 92, NULL, 'Strong comprehension of quadratic vertex coordinates.'),
('comp_002', 'sess_2026_002', 'usr_alex_01', 'Cell Biology', 78, NULL, 'Understands light dependent reaction.'),
('comp_003', 'sess_2026_003', 'usr_alex_01', 'World History', 65, 'Needs review on post-war industrial shipping hubs', 'Recommended short audio recap.');

INSERT INTO quiz_history (id, session_id, user_id, question_text, user_audio_answer, is_correct, score, vocal_confidence_index) VALUES
('qz_001', 'sess_2026_001', 'usr_alex_01', 'Describe the spatial arrangement of the vertex.', 'The vertex is at coordinate (2,5) near the top center.', 1, 95, 92);

INSERT INTO analytics_summary (id, user_id, total_listening_hours, avg_comprehension_score, sessions_completed_count, day_streak, weekly_chart_json, subject_distribution_json, topic_mastery_json, top_mastered_topics, weak_topics, audio_retention_rate, voice_confidence_index, knowledge_gap_areas) VALUES
('summary_usr_alex_01', 'usr_alex_01', 142.0, 88.0, 347, 21,
'[{"day":"Mon","comprehension":72,"engagement":60},{"day":"Tue","comprehension":85,"engagement":75},{"day":"Wed","comprehension":78,"engagement":82},{"day":"Thu","comprehension":91,"engagement":70},{"day":"Fri","comprehension":88,"engagement":85},{"day":"Sat","comprehension":65,"engagement":55},{"day":"Sun","comprehension":94,"engagement":90}]',
'{"Mathematics":40,"Science":30,"History":18,"Literature":12}',
'{"Algebra & Equations":92,"Cell Biology":78,"World History":65,"Literary Analysis":84,"Chemistry":71}',
'["Algebra & Equations","Literary Analysis","Cell Biology"]',
'["World History"]', 96.5, 88.4,
'[{"topic":"World History","score":65,"gap":"Needs review on post-war industrial shipping hubs"}]');
