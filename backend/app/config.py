import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
DOWNLOADS_DIR = STORAGE_DIR / "downloads"
CLIPS_DIR = STORAGE_DIR / "clips"
SUBTITLES_DIR = STORAGE_DIR / "subtitles"
TOOLS_DIR = BASE_DIR / "tools"
FFMPEG_DIR = TOOLS_DIR / "ffmpeg" / "bin"

# Create directories
for directory in [STORAGE_DIR, DOWNLOADS_DIR, CLIPS_DIR, SUBTITLES_DIR, TOOLS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Detect FFmpeg executable
def get_ffmpeg_path() -> str:
    # 1. Local tools folder
    local_ffmpeg = FFMPEG_DIR / "ffmpeg.exe"
    if local_ffmpeg.exists():
        return str(local_ffmpeg)
    
    # 2. Check PATH
    import shutil
    system_ffmpeg = shutil.which("ffmpeg")
    if system_ffmpeg:
        return system_ffmpeg
        
    # 3. Check imageio-ffmpeg if installed
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        pass
        
    return "ffmpeg"

def get_ffprobe_path() -> str:
    local_ffprobe = FFMPEG_DIR / "ffprobe.exe"
    if local_ffprobe.exists():
        return str(local_ffprobe)
    import shutil
    system_ffprobe = shutil.which("ffprobe")
    if system_ffprobe:
        return system_ffprobe
    return "ffprobe"

# Subtitle Style Presets for ASS format
SUBTITLE_STYLES = {
    "mrbeast_hormozi": {
        "name": "MrBeast & Hormozi (High Retention)",
        "fontname": "Arial Black",
        "fontsize": 22,
        "primary_color": "&H00FFFFFF",      # White text
        "secondary_color": "&H0000FFFF",    # Bright Yellow highlight
        "outline_color": "&H00000000",      # Deep Black border
        "back_color": "&H80000000",         # Shadow
        "bold": 1,
        "outline": 3.5,
        "shadow": 1.5,
        "alignment": 2,                     # Bottom Center
        "margin_v": 70                      # Above TikTok / Reels UI
    },
    "neon_cyber": {
        "name": "Neon Cyberpunk (Viral Tech)",
        "fontname": "Impact",
        "fontsize": 24,
        "primary_color": "&H00FFFF00",      # Cyan
        "secondary_color": "&H0000FF99",    # Neon Green
        "outline_color": "&H00220022",      # Dark Purple outline
        "back_color": "&H00000000",
        "bold": 1,
        "outline": 3.0,
        "shadow": 2.0,
        "alignment": 2,
        "margin_v": 75
    },
    "clean_minimal": {
        "name": "Clean Modern Minimalist",
        "fontname": "Montserrat",
        "fontsize": 18,
        "primary_color": "&H00FFFFFF",
        "secondary_color": "&H00FFAA00",
        "outline_color": "&H00111111",
        "back_color": "&H60000000",
        "bold": 1,
        "outline": 2.0,
        "shadow": 1.0,
        "alignment": 2,
        "margin_v": 65
    }
}
