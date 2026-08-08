# Outdoor Learning — Voice-First AI Tutor for Sight-Impaired Learners
> **AI for Education Hackathon 2026** — Integrated Codebase

---

## 🌟 Overview
Outdoor Learning transforms visual educational content (diagrams, equations, charts) into vivid, spatial audio descriptions with zero-latency voice interaction. Built specifically for sight-impaired and accessibility-focused learners.

---

## 🔗 Architecture — Linked Branches

| Layer | Source Branch | Description |
|:---|:---|:---|
| **Frontend** | `Front-end` | WCAG 2.1 AA compliant UI, Voice Orb, Chat Demo, Analytics Dashboard |
| **Database** | `Database` | SQLite schema, DAO metrics engine, 347-session seed generator |
| **API Server** | Integrated | REST API (`server.py`) bridging UI to SQLite backend |

---

## 🚀 One-Click Quickstart

### Prerequisites
- **Python 3.8+** installed (no extra `pip` or `npm` installs required!)

### How to Run
Run the single launcher command:

```bash
python start.py
```

This will automatically:
1. Initialize `database.sqlite` and seed 347 realistic learning sessions across 5 subjects.
2. Open `frontend/index.html` in your default web browser.
3. Start the REST API server at `http://localhost:5000/api`.

---

## 📂 Project Structure

```
integrated/
├── frontend/
│   ├── index.html       # WCAG 2.1 AA HTML5 layout
│   ├── style.css        # Vanilla CSS design system
│   └── app.js           # Interactive UI logic & REST API bindings
├── database/
│   ├── schema.sql       # 7 relational tables & analytics view
│   ├── db.py            # SQLite connection manager
│   ├── analytics_dao.py # Dashboard metrics engine
│   └── seed.py          # 14-day study data generator
├── server.py            # Python REST API server (port 5000)
├── start.py             # One-click launcher script
└── README.md            # Quickstart documentation
```

---

## 📡 API Endpoints

- `GET  /api/health` — API health check
- `GET  /api/analytics/dashboard?user_id=usr_alex_01` — Returns listening hours, streak, comprehension score & topic mastery
- `GET  /api/visuals/recent` — Recent uploaded visual descriptions
- `POST /api/auth/signup` — Register new user
- `POST /api/auth/signin` — User login
- `POST /api/sessions/chat` — Log voice/text chat turns to database
- `POST /api/visuals/upload` — Save uploaded document metadata and return spatial audio description

---

## 🏆 Hackathon Team
- **Frontend Lead**: Accessibility & UI Engineer
- **Database Lead**: SQLite Schema & Data Architect
- **Backend/AI Lead**: Voice & API Integration Specialist
