import os
import re
import json
import logging
from typing import Dict, Any, Optional
from pathlib import Path
from ..config import DOWNLOADS_DIR, get_ffmpeg_path

logger = logging.getLogger("downloader")

def clean_youtube_url(url: str) -> str:
    """Normalize YouTube URLs and remove extraneous tracking parameters."""
    url = url.strip()
    # Match standard youtube watch, shorts, or youtu.be
    return url

def extract_video_info(url: str) -> Dict[str, Any]:
    """Extract metadata for YouTube or Instagram video using yt-dlp."""
    try:
        import yt_dlp
    except ImportError:
        raise RuntimeError("yt-dlp is not installed. Please install requirements.")

    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'skip_download': True,
        'extract_flat': False,
    }

    clean_url = clean_youtube_url(url)
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(clean_url, download=False)
        except Exception as e:
            logger.error(f"Error extracting info from {clean_url}: {e}")
            raise ValueError(f"Could not fetch video details: {str(e)}")

    duration = info.get('duration') or 0
    title = info.get('title') or "Untitled Video"
    uploader = info.get('uploader') or info.get('channel') or "Unknown Creator"
    thumbnail = info.get('thumbnail') or ""
    video_id = info.get('id') or "video"
    view_count = info.get('view_count') or 0
    description = info.get('description') or ""

    return {
        "video_id": video_id,
        "title": title,
        "author": uploader,
        "duration": duration,
        "duration_formatted": f"{int(duration // 60)}:{int(duration % 60):02d}",
        "thumbnail": thumbnail,
        "view_count": view_count,
        "description": description[:300] if description else "",
        "webpage_url": clean_url,
    }

def download_video_segment(url: str, start_time: float, duration: float, output_path: str) -> str:
    """
    Download or cut a specific video segment using yt-dlp + ffmpeg.
    Target duration is typically up to 60 seconds.
    """
    import yt_dlp
    
    ffmpeg_exe = get_ffmpeg_path()
    
    ydl_opts = {
        'format': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best',
        'outtmpl': output_path,
        'quiet': True,
        'no_warnings': True,
        'ffmpeg_location': os.path.dirname(ffmpeg_exe) if os.path.dirname(ffmpeg_exe) else None,
        # Download specific section using download_ranges
        'download_ranges': yt_dlp.utils.download_range_func(None, [(start_time, start_time + duration)]),
        'force_keyframes_at_cuts': True,
        'overwrites': True,
    }
    
    # Remove existing if any
    if os.path.exists(output_path):
        try:
            os.remove(output_path)
        except Exception:
            pass

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    return output_path

def download_full_source_if_needed(url: str, output_path: str) -> str:
    """Download video stream in 720p/1080p for local slicing."""
    import yt_dlp
    
    ffmpeg_exe = get_ffmpeg_path()
    
    ydl_opts = {
        'format': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best',
        'outtmpl': output_path,
        'quiet': True,
        'no_warnings': True,
        'ffmpeg_location': os.path.dirname(ffmpeg_exe) if os.path.dirname(ffmpeg_exe) else None,
        'overwrites': True,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    return output_path
