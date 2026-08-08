/**
 * AI Voice Provider & State Manager for Clay Voice Orb
 */

const AI_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  ERROR: 'error'
};

const SAMPLE_AI_RESPONSES = [
  "I heard you clearly! Your voice pacing is currently at 145 words per minute, which is in the optimal range for accessibility.",
  "Great articulation! Your clarity index is 94%. Would you like to review your speech radar breakdown?",
  "I'm listening. Speak naturally, and I will analyze your tone stability and pause efficiency in real-time.",
  "Your speech energy is vibrant and clear. I've updated your engagement heatmap for this session."
];

function generateFrequencyData(state = AI_STATES.LISTENING) {
  // Generates 16 frequency amplitude bars (values between 0.0 and 1.0)
  // to drive smooth claymorphic waveform animations on the frontend orb
  const bars = 16;
  const amplitudes = [];

  for (let i = 0; i < bars; i++) {
    if (state === AI_STATES.IDLE) {
      // Subtle ambient breathing pulse
      amplitudes.push(0.1 + Math.sin(Date.now() / 800 + i) * 0.05);
    } else if (state === AI_STATES.LISTENING) {
      // Dynamic audio input waveform simulation
      amplitudes.push(0.2 + Math.random() * 0.7);
    } else if (state === AI_STATES.PROCESSING) {
      // Concentric ripple frequencies
      amplitudes.push(0.4 + Math.cos(Date.now() / 300 + i * 0.5) * 0.3);
    } else if (state === AI_STATES.SPEAKING) {
      // Active voice playback frequencies
      amplitudes.push(0.3 + Math.abs(Math.sin(Date.now() / 200 + i)) * 0.65);
    } else {
      amplitudes.push(0.05);
    }
  }

  return amplitudes.map(v => Math.max(0.05, Math.min(1.0, parseFloat(v.toFixed(3)))));
}

function getRandomAIResponse() {
  const index = Math.floor(Math.random() * SAMPLE_AI_RESPONSES.length);
  return SAMPLE_AI_RESPONSES[index];
}

module.exports = {
  AI_STATES,
  generateFrequencyData,
  getRandomAIResponse
};
