const express = require('express');
const router = express.Router();
const db = require('../db/database');

/**
 * @route GET /api/sessions
 * @desc Get list of all recorded voice sessions
 */
router.get('/', (req, res) => {
  db.all('SELECT * FROM sessions ORDER BY started_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({
      success: true,
      count: rows.length,
      sessions: rows
    });
  });
});

/**
 * @route GET /api/sessions/:id
 * @desc Get single session details and associated audio analytics
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    db.all('SELECT * FROM audio_analytics WHERE session_id = ? ORDER BY created_at ASC', [id], (err, analytics) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({
        success: true,
        session: {
          ...session,
          analytics: analytics || []
        }
      });
    });
  });
});

/**
 * @route DELETE /api/sessions/:id
 * @desc Delete session by ID
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM sessions WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({
      success: true,
      message: `Session ${id} deleted successfully.`
    });
  });
});

module.exports = router;
