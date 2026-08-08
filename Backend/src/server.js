require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

const db = require('./db/database');
const registerVoiceSocket = require('./socket/voice.socket');
const voiceRoutes = require('./routes/voice.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const sessionRoutes = require('./routes/session.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Setup Socket.io for real-time Clay Voice Orb stream
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static audio uploads
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'ClarityAI Backend Engine',
    version: '1.0.0',
    aesthetic: 'Claymorphism for Accessibility (WCAG AA)',
    timestamp: new Date().toISOString()
  });
});

// Register API Routes
app.use('/api/voice', voiceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sessions', sessionRoutes);

// Register WebSockets
registerVoiceSocket(io);

// Global Error Handler
app.use(errorHandler);

// Start HTTP Server
server.listen(PORT, () => {
  console.log(`
  ======================================================
  🧠 ClarityAI Backend Engine Running on Port ${PORT}
  ------------------------------------------------------
  🌐 Health Check: http://localhost:${PORT}/api/health
  🎙️ Voice API:    http://localhost:${PORT}/api/voice/states
  📊 Analytics:    http://localhost:${PORT}/api/analytics/engagement
  📈 Radar Data:   http://localhost:${PORT}/api/analytics/radar
  🔥 Heatmap Data: http://localhost:${PORT}/api/analytics/heatmap
  ⚡ WebSocket:    ws://localhost:${PORT}
  ======================================================
  `);
});

module.exports = { app, server };
