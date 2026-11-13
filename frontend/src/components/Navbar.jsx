import React from 'react';
import { Sparkles, Flame, Github, Key, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Navbar({ systemStatus, onOpenApiKeyModal, hasApiKey }) {
  return (
    <header className="border-b border-slate-800 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                ViralClip<span className="text-pink-500">.AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 60s Viral Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Turn any long video into viral YouTube Shorts & Reels</p>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="flex items-center space-x-3">
          {/* FFmpeg Indicator */}
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs bg-slate-800/80 border border-slate-700">
            {systemStatus?.ffmpeg_ready ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">FFmpeg Ready (9:16 Encode)</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300">FFmpeg Setup Ready</span>
              </>
            )}
          </div>

          {/* Gemini AI Key button */}
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              hasApiKey
                ? "bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/40"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
            title="Configure Gemini API Key for enhanced hook psychology and clickbait titles"
          >
            <Key className="w-3.5 h-3.5 text-pink-400" />
            <span>{hasApiKey ? "AI Key Configured" : "Add AI Key (Optional)"}</span>
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
