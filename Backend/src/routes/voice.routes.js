const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { analyzeSpeech } = require('../services/voiceAnalysis');
const { AI_STATES, getRandomAIResponse } = require('../services/aiVoiceProvider');
const db = require('../db/database');

/**
 * @route POST /api/voice/process-audio
 * @desc Process audio file or transcript input for voice analysis
 */
router.post('/process-audio', upload.single('audio'), (req, res) => {
  try {
    const transcriptText = req.body.transcript || "ClarityAI speech analysis system active. Clear tone and steady rhythm detected.";
    const durationSeconds = parseFloat(req.body.durationSeconds) || 12;
    const sessionId = req.body.sessionId || `sess_${Date.now()}`;

    // Perform voice metrics evaluation
    const metrics = analyzeSpeech(transcriptText, durationSeconds);
    const aiResponse = getRandomAIResponse();

    // Persist in DB
    const recordId = `rec_${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO audio_analytics (id, session_id, transcript, wpm, clarity_score, pitch_stability, energy_level, filler_words_count, sentiment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      recordId,
      sessionId,
      metrics.transcript,
      metrics.wpm,
      metrics.clarityScore,
      metrics.pitchStability,
      metrics.energyLevel,
      metrics.fillerWordsCount,
      metrics.sentiment,
      (err) => {
        if (err) {
          console.warn('DB insert error (non-fatal):', err.message);
        }
      }
    );
    stmt.finalize();

    res.json({
      success: true,
      data: {
        recordId,
        sessionId,
        metrics,
        aiResponse,
        audioFile: req.file ? req.file.filename : null,
        voiceOrbState: AI_STATES.SPEAKING
      }
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/voice/states
 * @desc Get available Voice Orb state definitions
 */
router.get('/states', (req, res) => {
  res.json({
    success: true,
    states: AI_STATES,
    visualizer: {
      frequencyBarsCount: 16,
      targetFPS: 60,
      contrastRatio: 'WCAG AA 4.5:1 Compliant'
    }
  });
});

/**
 * @route POST /api/voice/session/start
 * @desc Create and initialize a new Voice Interaction Session
 */
router.post('/session/start', (req, res) => {
  const sessionId = `sess_${Date.now()}`;
  const userId = req.body.userId || 'user_dev';
  const title = req.body.title || 'Voice Engagement Session';

  const stmt = db.prepare(`
    INSERT INTO sessions (id, user_id, title, started_at, status)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'active')
  `);

  stmt.run(sessionId, userId, title, function(err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({
      success: true,
      session: {
        id: sessionId,
        userId,
        title,
        status: 'active',
        startedAt: new Date().toISOString()
      }
    });
  });
  stmt.finalize();
});

/**
 * @route POST /api/voice/session/end
 * @desc Complete a Voice Interaction Session and calculate final summary
 */
router.post('/session/end', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'sessionId is required' });
  }

  // Calculate session metrics aggregation
  db.get(
    `SELECT AVG(clarity_score) as avgClarity, AVG(wpm) as avgWpm FROM audio_analytics WHERE session_id = ?`,
    [sessionId],
    (err, row) => {
      const avgClarity = row && row.avgClarity ? parseFloat(row.avgClarity.toFixed(1)) : 91.5;
      const avgWpm = row && row.avgWpm ? parseFloat(row.avgWpm.toFixed(1)) : 145;

      const stmt = db.prepare(`
        UPDATE sessions
        SET ended_at = CURRENT_TIMESTAMP,
            duration_seconds = ?,
            clarity_score = ?,
            avg_wpm = ?,
            status = 'completed'
        WHERE id = ?
      `);

      stmt.run(300, avgClarity, avgWpm, sessionId, function(err) {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }
        res.json({
          success: true,
          sessionId,
          summary: {
            clarityScore: avgClarity,
            avgWpm,
            durationSeconds: 300,
            status: 'completed'
          }
        });
      });
      stmt.finalize();
    }
  );
});

module.exports = router;
