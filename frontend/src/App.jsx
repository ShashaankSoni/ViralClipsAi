import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  Sparkles, 
  Video, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  ExternalLink,
  Zap,
  TrendingUp,
  Share2
} from 'lucide-react';

import Navbar from './components/Navbar';
import UrlInput from './components/UrlInput';
import ClipSettings from './components/ClipSettings';
import ProcessingTimeline from './components/ProcessingTimeline';
import ClipCard from './components/ClipCard';
import SubtitleEditorModal from './components/SubtitleEditorModal';
import ApiKeyModal from './components/ApiKeyModal';

const MOCK_DEMO_CLIPS = [
  {
    clip_id: "demo_1",
    title: "HE ACCIDENTALLY REVEALED HIS SECRET?! 💀",
    category: "😂 HILARIOUS REACTION",
    viral_score: 98,
    hook_score: 96,
    why_viral: "High-voltage hook in the first 2 seconds with an explosive comedic punchline that forces loop-replays.",
    start: 42.0,
    end: 101.5,
    duration: 59.5,
    youtube_title: "HE ACCIDENTALLY REVEALED HIS SECRET?! 💀 #shorts",
    caption: "Wait till the very end to see his reaction... I couldn't stop laughing! 😭👇\n\n#shorts #viral #trending #reels #explore #streamer",
    has_video: false,
    words: [
      { word: "WAIT", start: 0.0, end: 0.4 },
      { word: "UNTIL", start: 0.4, end: 0.8 },
      { word: "YOU", start: 0.8, end: 1.1 },
      { word: "SEE", start: 1.1, end: 1.5 },
      { word: "WHAT", start: 1.5, end: 1.8 },
      { word: "HAPPENS", start: 1.8, end: 2.3 },
      { word: "NEXT!", start: 2.3, end: 2.8 }
    ]
  },
  {
    clip_id: "demo_2",
    title: "THE $10,000,000 MISTAKE EVERYONE MAKES 🤯",
    category: "🤯 MIND-BLOWING HOOK",
    viral_score: 95,
    hook_score: 94,
    why_viral: "Curiosity gap triggering intense FOMO; 160 WPM delivery eliminates viewer drop-off.",
    start: 185.0,
    end: 244.0,
    duration: 59.0,
    youtube_title: "THE $10,000,000 MISTAKE EVERYONE MAKES 🤯 #shorts",
    caption: "Never make this mistake with your content or business! Save this video for later 📌\n\n#shorts #entrepreneur #viral #mindset #reels",
    has_video: false,
    words: [
      { word: "RULE", start: 0.0, end: 0.4 },
      { word: "NUMBER", start: 0.4, end: 0.8 },
      { word: "ONE:", start: 0.8, end: 1.3 },
      { word: "NEVER", start: 1.3, end: 1.8 },
      { word: "DO", start: 1.8, end: 2.1 },
      { word: "THIS!", start: 2.1, end: 2.6 }
    ]
  },
  {
    clip_id: "demo_3",
    title: "1 IN A MILLION CLUTCH MOMENT ⚡",
    category: "⚡ HIGH-ENERGY CLIMAX",
    viral_score: 93,
    hook_score: 91,
    why_viral: "Instant loud reaction combined with unexpected plot twist at second 48.",
    start: 510.0,
    end: 569.5,
    duration: 59.5,
    youtube_title: "1 IN A MILLION CLUTCH MOMENT ⚡ (IMPOSSIBLE) #shorts",
    caption: "Bro was not expecting that to happen at all! Tag someone who needs to see this 🔥\n\n#shorts #gaming #clutch #viral #fyp",
    has_video: false,
    words: [
      { word: "BRO", start: 0.0, end: 0.3 },
      { word: "ARE", start: 0.3, end: 0.6 },
      { word: "YOU", start: 0.6, end: 0.9 },
      { word: "SERIOUS", start: 0.9, end: 1.5 },
      { word: "RIGHT", start: 1.5, end: 1.8 },
      { word: "NOW?!", start: 1.8, end: 2.4 }
    ]
  }
];

export default function App() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [job, setJob] = useState(null);
  const [clips, setClips] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("viralclip_gemini_key") || "");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [editingClip, setEditingClip] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [settings, setSettings] = useState({
    target_duration: 60.0,
    clip_count: 3,
    subtitle_style: "mrbeast_hormozi",
    framing_mode: "blurred_split",
    viral_mode: "all"
  });

  // Fetch system status on load
  useEffect(() => {
    fetch('/api/system-status')
      .then(res => res.json())
      .then(data => setSystemStatus(data))
      .catch(() => {
        // Fallback status if offline
        setSystemStatus({ ffmpeg_ready: false, subtitle_styles: ["mrbeast_hormozi"] });
      });
  }, []);

  // Poll for job progress
  useEffect(() => {
    let intervalId;
    if (job && job.job_id && (job.status === "processing" || job.status === "queued")) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/jobs/${job.job_id}`);
          if (res.ok) {
            const data = await res.json();
            setJob(data);
            if (data.status === "completed") {
              setGenerating(false);
              setClips(data.clips || []);
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 }
              });
            } else if (data.status === "failed") {
              setGenerating(false);
              setErrorMessage(data.error || "Video processing failed.");
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 1500);
    }
    return () => clearInterval(intervalId);
  }, [job]);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setAnalyzing(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Analysis failed");
      setVideoInfo(data.video);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!url.trim()) return;
    setGenerating(true);
    setErrorMessage(null);
    setClips([]);

    try {
      const res = await fetch('/api/generate-clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          target_duration: settings.target_duration,
          clip_count: settings.clip_count,
          subtitle_style: settings.subtitle_style,
          framing_mode: settings.framing_mode,
          viral_mode: settings.viral_mode,
          gemini_api_key: apiKey || null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to start generation");

      setJob({
        job_id: data.job_id,
        status: "processing",
        progress: 10,
        current_step: "Initializing video streams and transcripts..."
      });
    } catch (err) {
      setGenerating(false);
      setErrorMessage(err.message);
    }
  };

  const handleLoadDemo = () => {
    setVideoInfo({
      title: "How To Make Millions From YouTube Shorts in 2026",
      author: "Viral Growth Academy",
      duration: 3600,
      duration_formatted: "1:00:00",
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      view_count: 1420500,
      description: "Complete masterclass on viral retention, comedic timing, and short-form hooks."
    });
    setClips(MOCK_DEMO_CLIPS);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handleSaveSubtitles = (clipId, newWords) => {
    setClips(prev => prev.map(c => {
      if (c.clip_id === clipId) {
        return { ...c, words: newWords };
      }
      return c;
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100 selection:bg-pink-500 selection:text-white">
      {/* Navbar */}
      <Navbar 
        systemStatus={systemStatus} 
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasApiKey={Boolean(apiKey)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/30 text-pink-400 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 fill-pink-500" />
            <span>AI Short-Form Viral Extractor</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Turn Any Long Video Into <br />
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-400 bg-clip-text text-transparent">
              Viral 60s Shorts & Reels
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Give any YouTube or Instagram link (any duration, podcast, stream, or challenge). 
            Our algorithm detects the highest-energy hooks, cuts 60-second viral moments, reframes to 9:16 vertical, and burns retention-gluing subtitles.
          </p>

          {/* Quick Demo Button */}
          <div className="pt-1 flex items-center justify-center gap-3">
            <button
              onClick={handleLoadDemo}
              className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Load Interactive Demo Clips</span>
            </button>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* URL Input & Presets */}
        <UrlInput
          url={url}
          setUrl={setUrl}
          onAnalyze={handleAnalyze}
          analyzing={analyzing}
          videoInfo={videoInfo}
          onGenerate={handleGenerate}
          generating={generating}
        />

        {/* Clip Settings Drawer */}
        <ClipSettings
          settings={settings}
          setSettings={setSettings}
        />

        {/* Pipeline Stepper / Progress */}
        {generating && (
          <ProcessingTimeline job={job} />
        )}

        {/* Results Section */}
        {clips.length > 0 && (
          <section className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Flame className="w-6 h-6 text-pink-500 fill-pink-500" />
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Generated 60s Viral Clips ({clips.length})
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Ranked by hook retention, laugh spikes, and algorithmic momentum.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> 100% Ready for YouTube & Instagram
                </span>
              </div>
            </div>

            {/* Clips Grid */}
            <div className="space-y-6">
              {clips.map((clip, idx) => (
                <ClipCard
                  key={clip.clip_id || idx}
                  clip={clip}
                  index={idx}
                  onEditSubtitles={(c) => setEditingClip(c)}
                  subtitleStyle={settings.subtitle_style}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Subtitle Editor Modal */}
      <SubtitleEditorModal
        clip={editingClip}
        isOpen={Boolean(editingClip)}
        onClose={() => setEditingClip(null)}
        onSave={handleSaveSubtitles}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-dark-950 py-8 text-center text-xs text-slate-500 space-y-2">
        <p>ViralClip Studio — Built for creators, streamers, and viral editors aiming for millions of views.</p>
        <p className="text-slate-600">Supports YouTube (Long-form, livestreams, podcasts) & Instagram Reels.</p>
      </footer>
    </div>
  );
}
