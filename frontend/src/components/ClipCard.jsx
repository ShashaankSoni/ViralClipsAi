import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Flame, 
  Clock, 
  Edit3, 
  Share2, 
  Instagram, 
  Youtube,
  Zap
} from 'lucide-react';

export default function ClipCard({ 
  clip, 
  index, 
  onEditSubtitles, 
  subtitleStyle = "mrbeast_hormozi" 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const copyToClipboard = (text, setCopiedFn) => {
    navigator.clipboard.writeText(text);
    setCopiedFn(true);
    setTimeout(() => setCopiedFn(false), 2000);
  };

  // Find active subtitle words at currentTime
  const activeWordObj = clip.words?.find(
    w => currentTime >= w.start && currentTime <= w.end
  );

  return (
    <div className="rounded-2xl bg-dark-900 border border-slate-800 overflow-hidden shadow-2xl flex flex-col md:flex-row hover:border-slate-700 transition-all">
      {/* Left: 9:16 Vertical Video Player */}
      <div className="relative w-full md:w-72 lg:w-80 aspect-[9/16] bg-slate-950 flex-shrink-0 flex items-center justify-center overflow-hidden group">
        {clip.has_video && clip.video_url ? (
          <video
            ref={videoRef}
            src={clip.video_url}
            loop
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer"
          />
        ) : (
          /* Visual Simulation Poster if video rendering is pending or demo mode */
          <div 
            onClick={togglePlay}
            className="w-full h-full relative cursor-pointer bg-gradient-to-b from-slate-900 via-purple-950/40 to-slate-950 flex flex-col items-center justify-between p-4"
          >
            {/* Top watermarks */}
            <div className="w-full flex justify-between items-center text-xs text-slate-400">
              <span className="bg-black/60 px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                <Flame className="w-3 h-3 text-pink-500" /> #{index + 1}
              </span>
              <span className="bg-pink-500/20 text-pink-400 border border-pink-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                9:16 SHORT
              </span>
            </div>

            {/* Center Play button */}
            <div className="w-16 h-16 rounded-full bg-pink-500/90 text-white flex items-center justify-center shadow-2xl shadow-pink-500/40 transform group-hover:scale-110 transition-transform">
              <Play className="w-7 h-7 ml-1 fill-white" />
            </div>

            {/* Dynamic Trendy Subtitles Preview Overlay */}
            <div className="w-full text-center pb-8 px-2 z-10 pointer-events-none">
              <div className="sub-hormozi text-lg leading-tight uppercase">
                {activeWordObj ? (
                  <span>
                    LOOK AT THIS <span className="sub-highlight-yellow">{activeWordObj.word}!</span>
                  </span>
                ) : (
                  <span>
                    VIRAL MOMENT <span className="sub-highlight-yellow">UNLOCKED!</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Video overlay controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
          <div className="flex justify-between items-center pointer-events-auto">
            <span className="bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white">
              {clip.duration}s
            </span>
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="pointer-events-auto flex items-center justify-center pb-2">
            <button
              onClick={togglePlay}
              className="p-3 rounded-full bg-pink-500/90 hover:bg-pink-500 text-white shadow-lg"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 ml-0.5 fill-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Right: Clip Details, Viral Score, Titles & Captions */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-4">
        {/* Header: Score and Category */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400">
                {clip.category || "🔥 VIRAL MOMENT"}
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {clip.start}s - {clip.end}s ({clip.duration}s)
              </span>
            </div>

            {/* Viral Score Badge */}
            <div className="flex items-center space-x-1.5 bg-purple-950/60 border border-pink-500/40 px-3 py-1 rounded-full">
              <Flame className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-300">Viral Index:</span>
              <span className="text-sm font-black text-pink-400">{clip.viral_score}/100</span>
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight line-clamp-2">
            {clip.title}
          </h3>

          <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
            <strong className="text-pink-400">Why this goes viral: </strong>
            {clip.why_viral}
          </p>
        </div>

        {/* Copyable Titles & Social Captions */}
        <div className="space-y-3">
          {/* YouTube Shorts Title */}
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
              <Youtube className="w-3.5 h-3.5 text-red-500" /> High-CTR YouTube Shorts Title
            </label>
            <div className="flex items-center justify-between gap-2 bg-dark-950 border border-slate-800 rounded-xl p-2.5">
              <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                {clip.youtube_title || `${clip.title} #shorts`}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(clip.youtube_title || `${clip.title} #shorts`, setCopiedTitle)}
                className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors flex-shrink-0"
              >
                {copiedTitle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTitle ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Instagram Caption */}
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
              <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram Reels Caption & Tags
            </label>
            <div className="flex items-center justify-between gap-2 bg-dark-950 border border-slate-800 rounded-xl p-2.5">
              <span className="text-xs text-slate-400 line-clamp-1">
                {clip.caption}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(clip.caption, setCopiedCaption)}
                className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors flex-shrink-0"
              >
                {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCaption ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons: Download & Edit */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <a
            href={clip.has_video && clip.video_url ? `${clip.video_url}?download=true` : "#"}
            download={`viral_short_${clip.clip_id}.mp4`}
            onClick={(e) => {
              if (!clip.has_video) {
                e.preventDefault();
                alert("This clip was generated in analysis mode. Ensure FFmpeg is installed to render the full MP4 file.");
              }
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white hover:brightness-110 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-pink-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Download 60s Clip (MP4)</span>
          </a>

          <button
            type="button"
            onClick={() => onEditSubtitles(clip)}
            className="px-3.5 py-2.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-pink-400" />
            <span>Edit Subtitles</span>
          </button>
        </div>
      </div>
    </div>
  );
}
