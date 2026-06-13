import os
import tempfile
import shutil
from pathlib import Path
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import whisper
import yt_dlp
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Kwizy Whisper Service",
    description="AI-powered transcription service using OpenAI Whisper",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper model on startup
MODEL_NAME = os.getenv("WHISPER_MODEL", "base")
model = None

@app.on_event("startup")
async def load_model():
    global model
    logger.info(f"Loading Whisper model: {MODEL_NAME}")
    model = whisper.load_model(MODEL_NAME)
    logger.info("Whisper model loaded successfully!")

# Request/Response models
class TranscribeRequest(BaseModel):
    video_url: str
    video_id: str

class TranscriptSegment(BaseModel):
    text: str
    start: int
    duration: int

class TranscribeResponse(BaseModel):
    success: bool
    transcript: list[TranscriptSegment] = []
    full_text: str = ""
    source: str = "whisper"
    error: str = None

class HealthResponse(BaseModel):
    status: str
    model: str
    message: str


def download_audio(video_url: str, output_path: str) -> str:
    """Download audio from YouTube video using yt-dlp"""
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
            'preferredquality': '192',
        }],
        'outtmpl': output_path,
        'quiet': True,
        'no_warnings': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])

    # yt-dlp adds extensions, find the actual file
    wav_path = output_path + ".wav"
    if os.path.exists(wav_path):
        return wav_path

    # Try without extension if already included
    if os.path.exists(output_path):
        return output_path

    raise FileNotFoundError(f"Downloaded audio not found at {output_path}")


def transcribe_audio(audio_path: str) -> dict:
    """Transcribe audio file using Whisper"""
    result = model.transcribe(audio_path, language="en")
    return result


def cleanup_files(*paths):
    """Clean up temporary files"""
    for path in paths:
        try:
            if path and os.path.exists(path):
                os.remove(path)
                logger.info(f"Cleaned up: {path}")
        except Exception as e:
            logger.error(f"Failed to clean up {path}: {e}")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        model=MODEL_NAME,
        message="Whisper service is running"
    )


@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_video(request: TranscribeRequest, background_tasks: BackgroundTasks):
    """
    Transcribe a YouTube video using Whisper

    Downloads the audio and transcribes it using the loaded Whisper model.
    Returns transcript with timestamps for each segment.
    """
    if not model:
        raise HTTPException(status_code=503, detail="Whisper model not loaded yet")

    temp_dir = tempfile.mkdtemp(prefix="kwizy_")
    audio_path = None

    try:
        logger.info(f"Starting transcription for video: {request.video_id}")

        # Download audio
        output_path = os.path.join(temp_dir, f"{request.video_id}")
        logger.info("Downloading audio from YouTube...")
        audio_path = download_audio(request.video_url, output_path)
        logger.info(f"Audio downloaded to: {audio_path}")

        # Transcribe
        logger.info("Starting Whisper transcription...")
        result = transcribe_audio(audio_path)
        logger.info("Transcription complete!")

        # Format segments with timestamps
        segments = []
        for segment in result.get("segments", []):
            segments.append(TranscriptSegment(
                text=segment["text"].strip(),
                start=int(segment["start"]),
                duration=int(segment["end"] - segment["start"])
            ))

        full_text = " ".join([s.text for s in segments])

        # Schedule cleanup
        background_tasks.add_task(cleanup_files, audio_path)
        background_tasks.add_task(shutil.rmtree, temp_dir, ignore_errors=True)

        return TranscribeResponse(
            success=True,
            transcript=segments,
            full_text=full_text,
            source="whisper"
        )

    except yt_dlp.utils.DownloadError as e:
        logger.error(f"Download error: {e}")
        background_tasks.add_task(shutil.rmtree, temp_dir, ignore_errors=True)
        return TranscribeResponse(
            success=False,
            error=f"Failed to download video: {str(e)}"
        )

    except Exception as e:
        logger.error(f"Transcription error: {e}")
        background_tasks.add_task(shutil.rmtree, temp_dir, ignore_errors=True)
        return TranscribeResponse(
            success=False,
            error=str(e)
        )


@app.post("/transcribe-file", response_model=TranscribeResponse)
async def transcribe_upload(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    if not model:
        raise HTTPException(status_code=503, detail="Whisper model not loaded yet")

    temp_dir = tempfile.mkdtemp(prefix="kwizy_upload_")
    suffix = Path(file.filename or "upload").suffix or ".mp4"
    temp_path = os.path.join(temp_dir, f"upload{suffix}")

    try:
        logger.info("Saving uploaded file for transcription")
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        logger.info("Starting Whisper transcription on uploaded file")
        result = transcribe_audio(temp_path)

        segments = []
        for segment in result.get("segments", []):
            segments.append(TranscriptSegment(
                text=segment["text"].strip(),
                start=int(segment["start"]),
                duration=int(segment["end"] - segment["start"])
            ))

        full_text = " ".join([s.text for s in segments])

        if background_tasks:
            background_tasks.add_task(cleanup_files, temp_path)
            background_tasks.add_task(shutil.rmtree, temp_dir, ignore_errors=True)
        else:
            cleanup_files(temp_path)
            shutil.rmtree(temp_dir, ignore_errors=True)

        return TranscribeResponse(
            success=True,
            transcript=segments,
            full_text=full_text,
            source="whisper"
        )

    except Exception as e:
        logger.error(f"Upload transcription error: {e}")
        if background_tasks:
            background_tasks.add_task(shutil.rmtree, temp_dir, ignore_errors=True)
        else:
            shutil.rmtree(temp_dir, ignore_errors=True)
        return TranscribeResponse(
            success=False,
            error=str(e)
        )
    finally:
        try:
            await file.close()
        except Exception:
            pass


@app.get("/models")
async def list_models():
    """List available Whisper models"""
    return {
        "models": [
            {"name": "tiny", "parameters": "39M", "speed": "~32x", "vram": "~1GB"},
            {"name": "base", "parameters": "74M", "speed": "~16x", "vram": "~1GB"},
            {"name": "small", "parameters": "244M", "speed": "~6x", "vram": "~2GB"},
            {"name": "medium", "parameters": "769M", "speed": "~2x", "vram": "~5GB"},
            {"name": "large", "parameters": "1550M", "speed": "1x", "vram": "~10GB"},
        ],
        "current_model": MODEL_NAME
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
