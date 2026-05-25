import inspect
import logging
import os
import re
from xml.etree import ElementTree
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.proxies import GenericProxyConfig

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Kwizy Transcript Service",
    description="Fetches YouTube captions using youtube-transcript-api",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TranscriptRequest(BaseModel):
    video_url: str | None = None
    video_id: str | None = None


class TranscriptSegment(BaseModel):
    text: str
    start: int
    duration: int


class TranscriptResponse(BaseModel):
    success: bool
    transcript: list[TranscriptSegment] = []
    full_text: str = ""
    source: str = "youtube"
    error: str | None = None


class HealthResponse(BaseModel):
    status: str
    message: str


YOUTUBE_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Connection": "keep-alive"
}

COOKIES_PATH = os.getenv("YOUTUBE_COOKIES_PATH")
YOUTUBE_LANGUAGES = os.getenv("YOUTUBE_LANGUAGES", "en").split(",")
PROXY_HTTP_URL = os.getenv("YOUTUBE_PROXY_HTTP_URL")
PROXY_HTTPS_URL = os.getenv("YOUTUBE_PROXY_HTTPS_URL")


def extract_video_id(url: str) -> str | None:
    patterns = [
        r"(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)",
        r"^([a-zA-Z0-9_-]{11})$"
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def build_api_client():
    kwargs = {}
    signature = inspect.signature(YouTubeTranscriptApi.__init__)

    if "headers" in signature.parameters:
        kwargs["headers"] = YOUTUBE_HEADERS

    if COOKIES_PATH and os.path.exists(COOKIES_PATH) and "cookies" in signature.parameters:
        kwargs["cookies"] = COOKIES_PATH

    if (PROXY_HTTP_URL or PROXY_HTTPS_URL) and "proxy_config" in signature.parameters:
        kwargs["proxy_config"] = GenericProxyConfig(
            http_url=PROXY_HTTP_URL,
            https_url=PROXY_HTTPS_URL
        )

    return YouTubeTranscriptApi(**kwargs)


def fetch_transcript(video_id: str):
    ytt_api = build_api_client()
    languages = [lang.strip() for lang in YOUTUBE_LANGUAGES if lang.strip()]
    return ytt_api.fetch(video_id, languages=languages)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="healthy", message="Transcript service is running")


@app.post("/transcript", response_model=TranscriptResponse)
async def get_transcript(request: TranscriptRequest):
    video_id = request.video_id
    if not video_id and request.video_url:
        video_id = extract_video_id(request.video_url)

    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid or missing YouTube video ID")

    try:
        fetched = fetch_transcript(video_id)
        if not fetched or not fetched.snippets:
            return TranscriptResponse(success=False, error="No transcript available")

        formatted = [
            TranscriptSegment(
                text=snippet.text.strip(),
                start=int(snippet.start),
                duration=int(snippet.duration)
            )
            for snippet in fetched.snippets
        ]

        full_text = " ".join(segment.text for segment in formatted).strip()

        return TranscriptResponse(
            success=True,
            transcript=formatted,
            full_text=full_text,
            source="youtube"
        )

    except ElementTree.ParseError as exc:
        logger.info("Transcripts unavailable for %s: %s", video_id, exc)
        return TranscriptResponse(success=False, error="No transcript available")
    except Exception as exc:
        logger.exception("Transcript service error for %s", video_id)
        return TranscriptResponse(success=False, error=str(exc))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
