/**
 * Analytics Engine for Clay Analytics Cards (Radar & Heatmap Charts)
 */

function getVoiceEngagementOverview() {
  return {
    overallScore: 89.4,
    scoreDelta: '+4.2% vs last week',
    totalSpeechTimeMinutes: 142,
    sessionsCount: 18,
    averageWpm: 146,
    clarityLevel: 'Optimal (WCAG AA Compliant UI Feedback)',
    keyMetrics: [
      { label: 'Voice Clarity', value: '92%', target: '90%', status: 'excellent' },
      { label: 'Pace (WPM)', value: '146 WPM', target: '130-160 WPM', status: 'optimal' },
      { label: 'Filler Word Rate', value: '1.2 / min', target: '< 2.0 / min', status: 'great' },
      { label: 'Tone Stability', value: '88%', target: '85%', status: 'good' }
    ]
  };
}

function getRadarChartData() {
  return {
    dimensions: [
      { axis: 'Tone Stability', value: 88, fullMark: 100 },
      { axis: 'Articulation', value: 92, fullMark: 100 },
      { axis: 'Pace Efficiency', value: 85, fullMark: 100 },
      { axis: 'Energy Balance', value: 90, fullMark: 100 },
      { axis: 'Conciseness', value: 82, fullMark: 100 },
      { axis: 'Overall Clarity', value: 94, fullMark: 100 }
    ],
    benchmark: [
      { axis: 'Tone Stability', value: 75, fullMark: 100 },
      { axis: 'Articulation', value: 80, fullMark: 100 },
      { axis: 'Pace Efficiency', value: 78, fullMark: 100 },
      { axis: 'Energy Balance', value: 70, fullMark: 100 },
      { axis: 'Conciseness', value: 75, fullMark: 100 },
      { axis: 'Overall Clarity', value: 80, fullMark: 100 }
    ]
  };
}

function getHeatmapData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  
  const grid = days.map(day => {
    return {
      day,
      slots: timeSlots.map(time => {
        // Engagement intensity level (0 to 100)
        const base = Math.floor(Math.random() * 40) + 50;
        const isPeak = (day === 'Wed' || day === 'Thu') && (time === '10:00' || time === '14:00');
        const intensity = isPeak ? 98 : base;
        return {
          time,
          intensity,
          clarityScore: intensity > 80 ? 'High' : intensity > 60 ? 'Medium' : 'Low',
          sessionCount: Math.floor(intensity / 25)
        };
      })
    };
  });

  return {
    days,
    timeSlots,
    heatmapGrid: grid
  };
}

module.exports = {
  getVoiceEngagementOverview,
  getRadarChartData,
  getHeatmapData
};
