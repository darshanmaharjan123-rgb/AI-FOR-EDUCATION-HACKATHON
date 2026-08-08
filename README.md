# 🧠 ClarityAI Backend Engine (Visual Studio Code Ready)

A high-performance Node.js, Express & Socket.io backend powering **ClarityAI**—designed with accessibility and Claymorphic UI integration in mind.

It powers real-time audio streaming for the **Clay Voice Orb** and serves data payloads for **Clay Analytics Cards** (Radar & Heatmap charts).

---

## 🚀 Quick Start in Visual Studio Code

### 1. Open Folder in VS Code
Open `C:\Users\DELL\.gemini\antigravity\scratch\clarity-ai-backend` (or your workspace directory) in Visual Studio Code.

### 2. Install Dependencies
Open the VS Code Terminal (`Ctrl + ~`) and run:
```bash
npm install
```

### 3. Run Development Server
- **Option A (Terminal):**
  ```bash
  npm run dev
  ```
- **Option B (VS Code Debugger):**
  Press **`F5`** or go to `Run and Debug` in VS Code and click **"Launch ClarityAI Backend (F5)"**.

---

## 📁 Repository & Codebase Architecture

```
clarity-ai-backend/
├── .vscode/
│   ├── launch.json            # VS Code F5 debug configuration
│   └── settings.json          # VS Code formatting & editor settings
├── .env.example               # Environment variables standard
├── .env                       # Local environment configuration
├── package.json               # Dependencies & scripts
├── data/
│   └── clarity.db             # Auto-generated SQLite database
├── uploads/                   # Audio recording storage
├── src/
│   ├── server.js              # Entry point: HTTP Server & Socket.io initialization
│   ├── db/
│   │   └── database.js        # SQLite schema initialization & seed data
│   ├── routes/
│   │   ├── voice.routes.js    # /api/voice routes (Audio processing, sessions)
│   │   ├── analytics.routes.js# /api/analytics routes (Radar & Heatmap chart datasets)
│   │   └── session.routes.js  # /api/sessions routes (History management)
│   ├── services/
│   │   ├── voiceAnalysis.js   # Voice engagement & speech metric engine (WPM, Clarity)
│   │   ├── analyticsEngine.js # Radar & Heatmap data aggregation logic
│   │   └── aiVoiceProvider.js # Voice Orb state machine & audio frequency generator
│   ├── socket/
│   │   └── voice.socket.js    # Real-time WebSocket connection for Clay Voice Orb
│   └── middleware/
│       ├── upload.js          # Multer audio upload middleware
│       └── errorHandler.js    # Global API error handler
└── test/
    └── api.test.js            # Automated verification test script
```

---

## 📡 API Reference & Endpoints

### 1. System Health
- **`GET /api/health`**  
  *Returns server status and operational metrics.*

### 2. Clay Analytics Cards (Radar & Heatmap)
- **`GET /api/analytics/engagement`**  
  *Returns overall voice engagement summary, clarity score, average WPM, and key metrics.*
- **`GET /api/analytics/radar`**  
  *Returns 6-axis Radar chart dataset (Tone, Articulation, Pace, Energy, Conciseness, Clarity).*
- **`GET /api/analytics/heatmap`**  
  *Returns temporal 7-day x 24-hour speech intensity matrix for Heatmap card.*

### 3. Voice Processing & Audio Upload
- **`POST /api/voice/process-audio`**  
  *Accepts multipart audio file (`audio`) or JSON (`transcript`, `durationSeconds`).*
  *Returns WPM, Clarity Score, Filler Word Count, Pitch Stability, and AI Response.*
- **`GET /api/voice/states`**  
  *Returns supported Clay Voice Orb states (`idle`, `listening`, `processing`, `speaking`).*

---

## ⚡ WebSocket Real-Time Interface (Clay Voice Orb)

Connect via Socket.io at `ws://localhost:5000`:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

// Receive live 60fps audio frequency amplitudes to animate 3D clay pulse
socket.on('orb:visualizer_stream', (data) => {
  console.log('Frequency amplitudes array:', data.amplitudes); 
  // Send values to React Clay Voice Orb component
});

// Send speech input stream
socket.emit('orb:voice_stream', {
  transcript: "Hello ClarityAI, checking voice engagement metrics."
});

// Listen for AI speech responses
socket.on('orb:speech_response', (data) => {
  console.log('AI Response:', data.aiResponse);
  console.log('Metrics:', data.metrics);
});
```

---

## 🧪 Verification & Testing

Run automated tests against the backend API:
```bash
npm test
```
