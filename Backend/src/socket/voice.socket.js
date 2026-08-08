/**
 * WebSocket handler for low-latency Clay Voice Orb audio streaming & state synchronization.
 */

const { AI_STATES, generateFrequencyData, getRandomAIResponse } = require('../services/aiVoiceProvider');
const { analyzeSpeech } = require('../services/voiceAnalysis');

function registerVoiceSocket(io) {
  let visualizerInterval = null;

  io.on('connection', (socket) => {
    console.log(`🔌 Clay Voice Orb client connected: ${socket.id}`);

    let currentState = AI_STATES.IDLE;

    // Send initial handshake state
    socket.emit('orb:state', {
      state: currentState,
      message: 'Clay Voice Orb ready',
      visualizer: generateFrequencyData(currentState)
    });

    // Start 60fps / 100ms visualizer frequency ticker
    const visualizerTimer = setInterval(() => {
      socket.emit('orb:visualizer_stream', {
        amplitudes: generateFrequencyData(currentState),
        timestamp: Date.now()
      });
    }, 100);

    // Client changes orb state (e.g. user presses mic button)
    socket.on('orb:set_state', (data) => {
      if (data && data.state && Object.values(AI_STATES).includes(data.state)) {
        currentState = data.state;
        console.log(`🎙️ Voice Orb [${socket.id}] state -> ${currentState}`);
        
        io.emit('orb:state_changed', {
          socketId: socket.id,
          state: currentState,
          timestamp: Date.now()
        });
      }
    });

    // Client streams audio chunk / transcript text
    socket.on('orb:voice_stream', (data) => {
      const transcript = data.transcript || "Simulated audio stream packet";
      currentState = AI_STATES.PROCESSING;
      
      socket.emit('orb:state', { state: currentState, message: 'Analyzing voice features...' });

      setTimeout(() => {
        const metrics = analyzeSpeech(transcript, 10);
        const aiResponse = getRandomAIResponse();
        currentState = AI_STATES.SPEAKING;

        socket.emit('orb:speech_response', {
          state: currentState,
          aiResponse,
          metrics,
          timestamp: Date.now()
        });

        // Return to IDLE state after speaking response
        setTimeout(() => {
          currentState = AI_STATES.IDLE;
          socket.emit('orb:state', { state: currentState, message: 'Standing by' });
        }, 4000);

      }, 800);
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Clay Voice Orb client disconnected: ${socket.id}`);
      clearInterval(visualizerTimer);
    });
  });
}

module.exports = registerVoiceSocket;
