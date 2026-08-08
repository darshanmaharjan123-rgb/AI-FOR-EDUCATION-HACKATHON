const express = require('express');
const router = express.Router();
const {
  getVoiceEngagementOverview,
  getRadarChartData,
  getHeatmapData
} = require('../services/analyticsEngine');

/**
 * @route GET /api/analytics/engagement
 * @desc Get Voice Engagement Summary metrics for Clay Analytics Cards
 */
router.get('/engagement', (req, res) => {
  try {
    const overview = getVoiceEngagementOverview();
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/analytics/radar
 * @desc Get Radar Chart dimensional scores (Clay Analytics Radar Widget)
 */
router.get('/radar', (req, res) => {
  try {
    const radarData = getRadarChartData();
    res.json({
      success: true,
      data: radarData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/analytics/heatmap
 * @desc Get Temporal Voice Engagement Heatmap data (Clay Analytics Heatmap Widget)
 */
router.get('/heatmap', (req, res) => {
  try {
    const heatmapData = getHeatmapData();
    res.json({
      success: true,
      data: heatmapData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
