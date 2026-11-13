import os
import sys
import zipfile
import urllib.request
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
TOOLS_DIR = BASE_DIR / "tools"
FFMPEG_DIR = TOOLS_DIR / "ffmpeg" / "bin"

def check_system_ffmpeg():
    system_ffmpeg = shutil.which("ffmpeg")
    if system_ffmpeg:
        print(f"[OK] Found system FFmpeg: {system_ffmpeg}")
        return True
    local_ffmpeg = FFMPEG_DIR / "ffmpeg.exe"
    if local_ffmpeg.exists():
        print(f"[OK] Found local FFmpeg: {local_ffmpeg}")
        return True
    return False

def download_ffmpeg_windows():
    print("[*] Downloading standalone FFmpeg for Windows...")
    FFMPEG_DIR.mkdir(parents=True, exist_ok=True)
    
    # Official Gyan.dev FFmpeg release build zip
    url = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
    zip_path = TOOLS_DIR / "ffmpeg.zip"
    
    try:
        print(f"[*] Fetching from {url}...")
        urllib.request.urlretrieve(url, str(zip_path))
        print("[*] Extracting ffmpeg.exe and ffprobe.exe...")
        
        with zipfile.ZipFile(str(zip_path), 'r') as zip_ref:
            for member in zip_ref.namelist():
                if member.endswith("ffmpeg.exe") or member.endswith("ffprobe.exe"):
                    filename = Path(member).name
                    target = FFMPEG_DIR / filename
                    with zip_ref.open(member) as source, open(target, "wb") as dest:
                        shutil.copyfileobj(source, dest)
                    print(f"[+] Extracted: {target}")
                    
        if zip_path.exists():
            zip_path.unlink()
            
        print("[SUCCESS] FFmpeg is installed and ready in tools/ffmpeg/bin/!")
        return True
    except Exception as e:
        print(f"[!] Error downloading FFmpeg: {e}")
        print("Tip: You can also install FFmpeg via 'winget install Gyan.FFmpeg' or 'choco install ffmpeg'")
        return False

if __name__ == "__main__":
    if check_system_ffmpeg():
        print("FFmpeg is already ready!")
    else:
        if sys.platform == "win32":
            download_ffmpeg_windows()
        else:
            print("On Linux/macOS, please install ffmpeg using your package manager (e.g. sudo apt install ffmpeg / brew install ffmpeg)")
