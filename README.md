# ⚡ ViralClip Studio — AI 60s Shorts & Reels Generator

> **Turn any long YouTube or Instagram video into viral, high-retention 60-second clips formatted in 9:16 vertical with Hormozi-style animated subtitles.**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-TailwindCSS%203-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg?logo=python&logoColor=white)](https://python.org)
[![FFmpeg](https://img.shields.io/badge/Media-FFmpeg-007808.svg?logo=ffmpeg&logoColor=white)](https://ffmpeg.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Why ViralClip Studio?

Manual video clipping takes **3 to 5 hours** per video: scrubbing through 2-hour podcasts or gaming streams, finding funny reactions, re-framing horizontal video into vertical, typing subtitles word-by-word, and designing click-worthy titles.

**ViralClip Studio automates the entire end-to-end pipeline in under 60 seconds:**
1. 🎯 **Scans Any Video Duration**: Ingests 10-minute videos, 3-hour podcasts, or multi-hour livestreams without lag.
2. 🧠 **Algorithmic Viral Hook Detection**: Evaluates opening 3-second hook strength, laughter/comedic timing, speech pacing (140-180 WPM), and climax resolution to skip boring filler.
3. ⏱️ **Strict 60-Second Clips**: Automatically bounds every clip to 60 seconds or less—the strict ceiling for YouTube Shorts and Instagram Reels algorithm monetization.
4. 📱 **9:16 Smart Re-Framing**: Applies the industry-standard **Blurred Ambient Split** layout (crisp 16:9 video centered with aesthetic blurred depth background) or **Smart Center Crop**.
5. 💬 **Trendy Alex Hormozi / MrBeast Subtitles**: Burns high-retention, word-by-word bold uppercase captions with neon yellow highlights and black outlines into the video stream.
6. 📈 **CTR Titles & Hashtag Generation**: Produces ready-to-copy all-caps viral titles and hashtag-loaded captions (`#shorts #viral #reels #fyp`) designed to beat the algorithm.

---

## 🏗️ System Architecture

```
                  ┌───────────────────────────────┐
                  │    YouTube / Instagram URL    │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                     [ 1. Ingestion Engine ]
                     • yt-dlp metadata fetch
                     • youtube-transcript-api
                                  │
                                  ▼
                  [ 2. AI & Algorithmic Scorer ]
                  • Hook Index (First 3-5 seconds)
                  • Humor & Laughter Peak Detection
                  • WPM & Speech Density Pacing
                  • Optional: Gemini AI Enhancement
                                  │
                                  ▼
                   [ 3. High-Retention Renderer ]
                   • Strict <= 60s slice
                   • 9:16 Vertical Filter Graph (FFmpeg)
                   • ASS Styled Subtitles Burn-in
                                  │
                                  ▼
               ┌──────────────────────────────────────┐
               │  Ready-to-Post 1080x1920 MP4 Video   │
               │  + Viral Title & Instagram Captions  │
               └──────────────────────────────────────┘
```

---

## 🛠️ Prerequisites

- **Python 3.10+** (Tested on Python 3.11)
- **Node.js 18+** (v20+ recommended)
- **FFmpeg** (for video re-framing and subtitle burning)

---

## ⚡ Quickstart Guide

### 1. Clone or Open the Repository
```bash
git clone https://github.com/your-username/viral-clips-ai.git
cd viral-clips-ai
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3. FFmpeg Setup (Windows / macOS / Linux)

If FFmpeg is not installed on your system:
- **Windows (Automatic Script)**:
  ```bash
  python scripts/setup_ffmpeg.py
  ```
  *Or via winget:* `winget install Gyan.FFmpeg`
- **macOS**: `brew install ffmpeg`
- **Linux (Ubuntu/Debian)**: `sudo apt update && sudo apt install ffmpeg`

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

### 5. Start the Application

You can start the full stack with two terminal windows:

**Terminal 1 (Backend API):**
```bash
# From project root
python run.py
# Server starts at: http://127.0.0.1:8000
```

**Terminal 2 (Frontend UI):**
```bash
cd frontend
npm run dev
# Vite UI starts at: http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 🎨 Subtitle Styles & Presets

| Style Preset | Font | Primary / Highlight Color | Retention Psychology |
|---|---|---|---|
| **MrBeast & Hormozi** | Arial Black / Montserrat | White / Neon Yellow (`#FFFF00`) | Bold, rapid 2-3 word pop; impossible to look away |
| **Neon Cyberpunk** | Impact | Cyan (`#22D3EE`) / Neon Green | Gaming & tech streams; high contrast dark mode |
| **Clean Minimalist** | Montserrat Bold | White with dark translucent pill | Educational, podcasts & finance niches |

---

## 🧠 Viral Scoring Breakdown

Every potential 60-second window is scored on a **0 to 100 Viral Index**:
- **Hook Strength (0-35 pts)**: Opening 3-5 seconds curiosity questions (`"Did you know..."`, `"The craziest thing is..."`, `"Stop doing this"`).
- **Humor & Emotion (0-30 pts)**: Explicit laughter markers (`[Laughter]`, `haha`, `lmao`), shocked streamer expressions.
- **Energy & Climax (0-25 pts)**: Peak vocal pitch, exclamations, punchline resolutions.
- **Speech Pacing (0-15 pts)**: 130-180 WPM sweet spot (monotone low WPM is penalized).
- **Anti-Boring Filter**: Sponsor reads, subscriber intros, and slow transitions are automatically penalized and cut.

---

## 📤 Pushing to GitHub

To push this project to your GitHub account:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all files
git add .

# 3. Commit
git commit -m "feat: initial commit of ViralClip Studio AI generator"

# 4. Create a new repository on GitHub (e.g. 'viral-clips-ai')
# 5. Link and push to your remote repo:
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/viral-clips-ai.git
git push -u origin main
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
