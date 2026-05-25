const WHISPER_SERVICE_URL = process.env.WHISPER_SERVICE_URL || 'http://localhost:8000';

export const isWhisperAvailable = async () => {
  try {
    const response = await fetch(`${WHISPER_SERVICE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`Whisper service available: ${data.model} model loaded`);
      return true;
    }
    return false;
  } catch (error) {
    console.log('Whisper service not available:', error.message);
    return false;
  }
};

export const transcribeWithLocalWhisper = async (videoUrl, videoId) => {
  try {
    console.log('Sending transcription request to Whisper service...');

    const response = await fetch(`${WHISPER_SERVICE_URL}/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_url: videoUrl,
        video_id: videoId
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('Whisper transcription successful!');
      return {
        success: true,
        transcript: data.transcript,
        fullText: data.full_text,
        source: 'whisper'
      };
    } else {
      console.error('Whisper transcription failed:', data.error);
      return {
        success: false,
        error: data.error || 'Transcription failed'
      };
    }
  } catch (error) {
    console.error('Whisper service error:', error.message);
    return {
      success: false,
      error: `Whisper service unavailable: ${error.message}`
    };
  }
};

export const getAvailableModels = async () => {
  try {
    const response = await fetch(`${WHISPER_SERVICE_URL}/models`);
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
};
