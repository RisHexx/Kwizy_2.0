import { transcribeWithLocalWhisper, isWhisperAvailable } from './whisperService.js';

const TRANSCRIPT_SERVICE_URL = process.env.TRANSCRIPT_SERVICE_URL || 'http://localhost:8001';

export const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const getThumbnailUrl = (videoId) => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

const fetchTranscriptFromService = async (videoUrl, videoId) => {
  try {
    console.log('Requesting transcript from transcript service...');
    const response = await fetch(`${TRANSCRIPT_SERVICE_URL}/transcript`, {
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
    if (data.success && data.transcript?.length) {
      return {
        success: true,
        transcript: data.transcript,
        fullText: data.full_text,
        source: 'youtube'
      };
    }

    return {
      success: false,
      error: data.error || 'Transcript service returned no data'
    };
  } catch (error) {
    console.log('Transcript service error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

export const fetchYouTubeTranscript = async (videoUrl) => {
  const videoId = extractVideoId(videoUrl);

  if (!videoId) {
    return {
      success: false,
      error: 'Invalid YouTube URL'
    };
  }

  const transcriptResult = await fetchTranscriptFromService(videoUrl, videoId);
  if (transcriptResult.success) {
    return {
      success: true,
      videoId,
      thumbnail: getThumbnailUrl(videoId),
      transcript: transcriptResult.transcript,
      fullText: transcriptResult.fullText,
      source: transcriptResult.source
    };
  }

  console.log('Transcript service unavailable:', transcriptResult.error);

  // Fallback to local Whisper
  console.log('Falling back to Whisper service...');

  const whisperAvailable = await isWhisperAvailable();
  if (!whisperAvailable) {
    return {
      success: false,
      error: 'No captions available. Start the Whisper service: cd whisper-service && uvicorn main:app --port 8000',
      videoId
    };
  }

  const whisperResult = await transcribeWithLocalWhisper(videoUrl, videoId);

  if (whisperResult.success) {
    return {
      success: true,
      videoId,
      thumbnail: getThumbnailUrl(videoId),
      transcript: whisperResult.transcript,
      fullText: whisperResult.fullText,
      source: 'whisper'
    };
  }

  return {
    success: false,
    error: whisperResult.error || 'Failed to transcribe video',
    videoId
  };
};

export const formatTimestampLink = (videoId, seconds) => {
  return `https://youtube.com/watch?v=${videoId}&t=${seconds}s`;
};

export const formatTimestamp = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
