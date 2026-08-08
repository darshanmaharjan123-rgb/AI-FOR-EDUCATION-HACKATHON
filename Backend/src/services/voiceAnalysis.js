/**
 * ClarityAI Voice & Speech Analysis Engine
 * Evaluates spoken text and audio parameters to generate engagement, clarity, and pacing metrics.
 */

const COMMON_FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally', 'so yeah', 'right'];

function analyzeSpeech(transcript, durationSeconds = 10) {
  if (!transcript || typeof transcript !== 'string') {
    transcript = "Welcome to ClarityAI. This is a voice engagement analysis test.";
  }

  const words = transcript.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // Calculate WPM (Words Per Minute)
  const durationMinutes = Math.max(durationSeconds / 60, 0.1);
  const wpm = Math.round(wordCount / durationMinutes);

  // Count filler words
  let fillerCount = 0;
  const lowerTranscript = transcript.toLowerCase();
  COMMON_FILLER_WORDS.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lowerTranscript.match(regex);
    if (matches) {
      fillerCount += matches.length;
    }
  });

  // Calculate Clarity Score (0 - 100%) based on ideal WPM range (130-160) and filler frequency
  let baseClarity = 95;
  if (wpm < 100) baseClarity -= (100 - wpm) * 0.3;
  else if (wpm > 170) baseClarity -= (wpm - 170) * 0.4;

  const fillerPenalty = fillerCount * 3.5;
  const clarityScore = Math.max(Math.min(Math.round(baseClarity - fillerPenalty), 100), 45);

  // Pitch & Energy variance computation (simulated audio DSP values)
  const pitchStability = Math.min(Math.round(80 + Math.random() * 18), 100);
  const energyLevel = Math.min(Math.round(75 + Math.random() * 22), 100);
  const pauseEfficiency = Math.max(Math.round(90 - fillerCount * 4), 50);

  // Determine sentiment classification
  let sentiment = 'Confident & Clear';
  if (clarityScore < 65) sentiment = 'Needs Steady Pace';
  else if (wpm > 165) sentiment = 'Fast Paced / Energetic';
  else if (pitchStability > 90) sentiment = 'Highly Articulate';

  return {
    transcript,
    wordCount,
    durationSeconds,
    wpm,
    clarityScore,
    pitchStability,
    energyLevel,
    pauseEfficiency,
    fillerWordsCount: fillerCount,
    sentiment,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  analyzeSpeech,
  COMMON_FILLER_WORDS
};
