import os
import uuid
import shutil
import asyncio
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel

from ..config import (
    DOWNLOADS_DIR, 
    CLIPS_DIR, 
    SUBTITLES_DIR, 
    get_ffmpeg_path, 
    SUBTITLE_STYLES
)
from ..services.downloader import (
    extract_video_info, 
    download_full_source_if_needed,
    download_video_segment
)
from ..services.transcriber import get_video_transcript
from ..services.viral_detector import (
    find_viral_segments, 
    enhance_clips_with_llm
)
from ..services.subtitle_generator import (
    generate_ass_subtitles, 
    generate_srt_subtitles
)
from ..services.video_renderer import render_vertical_clip

logger = logging.getLogger("api")
router = APIRouter()

# In-memory jobs tracking
jobs_db: Dict[str, Dict[str, Any]] = {}

class AnalyzeRequest(BaseModel):
    url: str

class GenerateClipsRequest(BaseModel):
    url: str
    target_duration: float = 60.0
    clip_count: int = 3
    subtitle_style: str = "mrbeast_hormozi"
    framing_mode: str = "blurred_split"
    viral_mode: str = "all"
    gemini_api_key: Optional[str] = None

class UpdateSubtitlesRequest(BaseModel):
    job_id: str
    clip_id: str
    words: list
    subtitle_style: Optional[str] = "mrbeast_hormozi"

@router.get("/system-status")
def system_status():
    """Verify system readiness (FFmpeg, disk storage)."""
    ffmpeg_exe = get_ffmpeg_path()
    ffmpeg_ready = False
    ffmpeg_version = "Not found"
    
    try:
        import subprocess
        proc = subprocess.run([ffmpeg_exe, "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if proc.returncode == 0:
            ffmpeg_ready = True
            first_line = proc.stdout.split("\n")[0]
            ffmpeg_version = first_line[:60]
    except Exception as e:
        ffmpeg_version = f"Error checking: {e}"

    return {
        "ffmpeg_ready": ffmpeg_ready,
        "ffmpeg_path": ffmpeg_exe,
        "ffmpeg_version": ffmpeg_version,
        "subtitle_styles": list(SUBTITLE_STYLES.keys()),
        "max_clip_duration": 60,
        "platform_support": ["YouTube Videos", "YouTube Streams", "YouTube Shorts", "Instagram Reels", "Direct URLs"]
    }

@router.post("/analyze")
def analyze_video(req: AnalyzeRequest):
    """Fetch video metadata and preview available information."""
    if not req.url or not req.url.strip():
        raise HTTPException(status_code=400, detail="Video URL is required")
    
    try:
        info = extract_video_info(req.url)
        return {
            "success": True,
            "video": info
        }
    except Exception as e:
        logger.error(f"Analyze error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

async def run_clipping_pipeline(job_id: str, req: GenerateClipsRequest):
    """
    Main asynchronous background pipeline:
    1. Extract Info & Transcript
    2. Algorithmic Viral Moment & Hook Detection
    3. LLM Enhancement (optional)
    4. Download Video Stream
    5. Generate Styled 9:16 Vertical Video + Trendy Subtitles
    """
    job = jobs_db[job_id]
    try:
        job["status"] = "processing"
        job["progress"] = 10
        job["current_step"] = "Analyzing video metadata and streaming parameters..."
        
        # Step 1: Video details
        info = extract_video_info(req.url)
        job["video_info"] = info
        video_id = info["video_id"]
        job["progress"] = 25
        job["current_step"] = "Fetching high-precision word timestamps and transcript..."

        # Step 2: Transcript
        transcript = get_video_transcript(req.url, video_id)
        job["progress"] = 40
        job["current_step"] = "Running AI Viral Detection Algorithm for top 60s hooks..."

        # Step 3: Viral Detection
        clips = find_viral_segments(
            transcript=transcript,
            video_duration=info["duration"],
            target_clip_duration=req.target_duration,
            max_clips=req.clip_count,
            mode=req.viral_mode
        )

        if not clips:
            raise ValueError("No viable 60s viral segments could be extracted from this video.")

        # Step 4: LLM Enhancement if API key is provided
        if req.gemini_api_key:
            job["current_step"] = "Enhancing hook psychology and titles with Gemini AI..."
            clips = enhance_clips_with_llm(clips, info["title"], req.gemini_api_key)

        job["progress"] = 55
        job["current_step"] = "Downloading source video stream..."

        # Download video to local temp for rendering
        source_video_path = str(DOWNLOADS_DIR / f"{video_id}.mp4")
        if not os.path.exists(source_video_path):
            try:
                download_full_source_if_needed(req.url, source_video_path)
            except Exception as e:
                logger.warning(f"Could not download full source at once: {e}. Slicing directly per clip.")

        # Step 5: Render clips
        rendered_clips = []
        total_clips = len(clips)
        
        for idx, clip in enumerate(clips):
            step_pct = 55 + int((idx / total_clips) * 40)
            job["progress"] = step_pct
            job["current_step"] = f"Rendering 9:16 vertical clip {idx + 1} of {total_clips} with animated subtitles..."
            
            clip_id = f"{job_id}_{clip['clip_id']}"
            clip_filename = f"{clip_id}.mp4"
            output_clip_path = str(CLIPS_DIR / clip_filename)
            
            # Generate styled ASS subtitles for this clip
            ass_path = str(SUBTITLES_DIR / f"{clip_id}.ass")
            srt_path = str(SUBTITLES_DIR / f"{clip_id}.srt")
            
            if clip.get("words"):
                generate_ass_subtitles(clip["words"], ass_path, style_key=req.subtitle_style)
                generate_srt_subtitles(clip["words"], srt_path)

            # Check if source video exists, else download segment directly
            input_media = source_video_path
            if not os.path.exists(input_media):
                temp_slice = str(DOWNLOADS_DIR / f"temp_{clip_id}.mp4")
                download_video_segment(req.url, clip["start"], clip["duration"], temp_slice)
                input_media = temp_slice
                render_start = 0.0
            else:
                render_start = clip["start"]

            # Render 9:16 vertical video with subtitles
            try:
                render_vertical_clip(
                    source_video_path=input_media,
                    output_clip_path=output_clip_path,
                    start_time=render_start,
                    duration=clip["duration"],
                    ass_subtitles_path=ass_path if os.path.exists(ass_path) else None,
                    framing_mode=req.framing_mode
                )
                clip["video_url"] = f"/api/clips/{clip_id}/video"
                clip["has_video"] = True
            except Exception as e:
                logger.error(f"Render error for clip {clip_id}: {e}")
                clip["has_video"] = False
                clip["video_error"] = str(e)

            clip["clip_uuid"] = clip_id
            rendered_clips.append(clip)

        job["progress"] = 100
        job["status"] = "completed"
        job["current_step"] = "Clips successfully generated and optimized for virality!"
        job["clips"] = rendered_clips

    except Exception as e:
        logger.error(f"Pipeline error for job {job_id}: {e}", exc_info=True)
        job["status"] = "failed"
        job["error"] = str(e)
        job["current_step"] = f"Failed: {str(e)}"

@router.post("/generate-clips")
def create_clipping_job(req: GenerateClipsRequest, background_tasks: BackgroundTasks):
    """Trigger the automated viral clip creation process."""
    if not req.url or not req.url.strip():
        raise HTTPException(status_code=400, detail="URL is required")

    job_id = str(uuid.uuid4())[:8]
    jobs_db[job_id] = {
        "job_id": job_id,
        "status": "queued",
        "progress": 0,
        "current_step": "Initializing clip creation queue...",
        "video_info": None,
        "clips": [],
        "error": None
    }

    # Run in async background task
    asyncio.create_task(run_clipping_pipeline(job_id, req))

    return {
        "job_id": job_id,
        "status": "queued"
    }

@router.get("/jobs/{job_id}")
def get_job_status(job_id: str):
    """Poll pipeline progress, logs, and generated clips."""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs_db[job_id]

@router.get("/clips/{clip_id}/video")
def get_clip_video(clip_id: str, download: bool = False):
    """Stream or download the generated MP4 clip."""
    clip_file = CLIPS_DIR / f"{clip_id}.mp4"
    if not clip_file.exists():
        raise HTTPException(status_code=404, detail="Clip video file not found")
    
    headers = {}
    if download:
        headers["Content-Disposition"] = f'attachment; filename="viral_short_{clip_id}.mp4"'
    
    return FileResponse(
        str(clip_file), 
        media_type="video/mp4",
        headers=headers
    )
