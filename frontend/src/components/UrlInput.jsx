import React, { useState } from 'react';
import { Youtube, Instagram, Play, ArrowRight, Sparkles, Clock, User, Eye, Clipboard, Check } from 'lucide-react';

const PRESETS = [
  {
    name: "MrBeast 50-Hour Challenge",
    url: "https://www.youtube.com/watch?v=0e3GPea1Tyg",
    type: "High Energy & Challenge"
  },
  {
    name: "Joe Rogan with Elon Musk",
    url: "https://www.youtube.com/watch?v=ycPr5-FLUQg",
    type: "Podcast & Hot Takes"
  },
  {
    name: "IShowSpeed Stream Highlights",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    type: "Comedic Reaction & Hype"
  }
];

export default function UrlInput({ 
  url, 
  setUrl, 
  onAnalyze, 
  analyzing, 
  videoInfo, 
  onGenerate, 
  generating 
}) {
  const [copied, setCopied] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
      }
    } catch (err) {
      // Clipboard permission denied or unavailable
    }
  };

  const handleSelectPreset = (presetUrl) => {
    setUrl(presetUrl);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Input container */}
      <div className="relative rounded-2xl bg-dark-900 border border-slate-800 p-2 sm:p-3 shadow-2xl shadow-purple-950/20 focus-within:border-pink-500/60 transition-all">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Platform icons */}
          <div className="flex items-center space-x-1 pl-2 text-slate-400">
            <Youtube className="w-6 h-6 text-red-500" />
            <span className="text-slate-600">/</span>
            <Instagram className="w-5 h-5 text-pink-500" />
          </div>

          {/* Text Input */}
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube or Instagram link (any video duration, stream, podcast)..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 px-3 py-2.5 outline-none focus:ring-0"
            disabled={generating}
          />

          {/* Paste button */}
          <button
            type="button"
            onClick={handlePaste}
            className="hidden sm:flex items-center space-x-1 px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/60"
            title="Paste from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Paste</span>
          </button>

          {/* Analyze / Generate button */}
          <button
            type="button"
            onClick={onGenerate}
            disabled={!url.trim() || generating}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center space-x-2 transition-all shadow-lg ${
              !url.trim() || generating
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                : "bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white hover:brightness-110 shadow-pink-500/25 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>{generating ? "Clipping..." : "Generate 60s Clips"}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Preset Recommendations */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-pink-400" /> Try instant sample:
        </span>
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectPreset(p.url)}
            className="text-xs px-2.5 py-1 rounded-full bg-dark-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span>{p.name}</span>
            <span className="text-[10px] text-pink-400 bg-pink-500/10 px-1.5 py-0.2 rounded-full border border-pink-500/20">{p.type}</span>
          </button>
        ))}
      </div>

      {/* Video Details Card Preview */}
      {videoInfo && (
        <div className="rounded-xl bg-dark-900/90 border border-slate-800 p-4 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative w-full sm:w-44 h-28 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
            {videoInfo.thumbnail ? (
              <img 
                src={videoInfo.thumbnail} 
                alt={videoInfo.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <Play className="w-8 h-8" />
              </div>
            )}
            <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-white">
              {videoInfo.duration_formatted || "60s"}
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
            <h3 className="font-bold text-white text-sm sm:text-base line-clamp-2 leading-snug">
              {videoInfo.title}
            </h3>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <User className="w-3.5 h-3.5 text-pink-400" />
                {videoInfo.author || "Unknown Creator"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {videoInfo.duration_formatted} total duration
              </span>
              {videoInfo.view_count > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  {Number(videoInfo.view_count).toLocaleString()} views
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 line-clamp-1 italic">
              {videoInfo.description || "Video loaded and ready for 60s viral segment analysis."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
