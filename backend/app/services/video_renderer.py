import os
import subprocess
import logging
from pathlib import Path
from typing import Optional, Dict, Any
from ..config import get_ffmpeg_path, CLIPS_DIR

logger = logging.getLogger("video_renderer")

def escape_ffmpeg_path(path: str) -> str:
    """Escape Windows file paths for FFmpeg filter complex syntax."""
    # Convert backslashes to forward slashes and escape colon
    p = path.replace("\\", "/")
    if ":" in p and not p.startswith("/"):
        drive, rest = p.split(":", 1)
        p = f"{drive}\\:{rest}"
    return p

def render_vertical_clip(
    source_video_path: str,
    output_clip_path: str,
    start_time: float,
    duration: float,
    ass_subtitles_path: Optional[str] = None,
    framing_mode: str = "blurred_split" # "blurred_split", "center_crop", "fit"
) -> str:
    """
    Cuts video segment and renders into 9:16 vertical format (1080x1920)
    with optional burnt-in trendy ASS subtitles.
    """
    ffmpeg_exe = get_ffmpeg_path()
    
    # Ensure duration does not exceed 60s
    duration = min(60.0, max(5.0, duration))
    
    # Build video filter graph
    # Target resolution: 1080x1920 (standard 9:16 vertical HD)
    filters = []
    
    if framing_mode == "blurred_split":
        # 1. Background: scaled to fill 1080x1920, cropped, and heavily blurred
        # 2. Foreground: scaled to fit 1080 width, centered vertically
        vf_split = (
            "[0:v]split=2[bg_raw][fg_raw];"
            "[bg_raw]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5[bg_blurred];"
            "[fg_raw]scale=1080:-2[fg_scaled];"
            "[bg_blurred][fg_scaled]overlay=x=(W-w)/2:y=(H-h)/2[merged]"
        )
        current_stream = "[merged]"
        filters.append(vf_split)
    elif framing_mode == "center_crop":
        # Direct center crop to 9:16
        vf_crop = "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[cropped]"
        current_stream = "[cropped]"
        filters.append(vf_crop)
    else: # "fit" with black bars
        vf_fit = "[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2[padded]"
        current_stream = "[padded]"
        filters.append(vf_fit)

    # Add subtitle filter if provided
    if ass_subtitles_path and os.path.exists(ass_subtitles_path):
        escaped_ass = escape_ffmpeg_path(ass_subtitles_path)
        sub_filter = f"{current_stream}ass='{escaped_ass}'[outv]"
        filters.append(sub_filter)
        final_stream = "[outv]"
    else:
        final_stream = current_stream

    filter_complex = ";".join(filters)
    # Remove bracket wrapper for final output map if single stream
    output_map = final_stream.replace("[", "").replace("]", "")

    cmd = [
        ffmpeg_exe,
        "-y",
        "-ss", str(start_time),
        "-i", source_video_path,
        "-t", str(duration),
        "-filter_complex", filter_complex,
        "-map", f"[{output_map}]",
        "-map", "0:a?",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "22",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        output_clip_path
    ]

    logger.info(f"Running FFmpeg render: {' '.join(cmd)}")
    
    try:
        proc = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        return output_clip_path
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg render error: {e.stderr}")
        # Try fallback simpler render without complex filter if filter syntax fails
        return fallback_simple_render(source_video_path, output_clip_path, start_time, duration, ffmpeg_exe)

def fallback_simple_render(
    source_path: str, 
    output_path: str, 
    start_time: float, 
    duration: float, 
    ffmpeg_exe: str
) -> str:
    """Fallback slicing if advanced filter graph encounters an error."""
    cmd = [
        ffmpeg_exe,
        "-y",
        "-ss", str(start_time),
        "-i", source_path,
        "-t", str(duration),
        "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-c:a", "aac",
        "-movflags", "+faststart",
        output_path
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
    return output_path
