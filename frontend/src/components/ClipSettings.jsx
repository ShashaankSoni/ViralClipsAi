import React from 'react';
import { Sliders, Flame, Laugh, Zap, Smartphone, Crop, Type, Layers } from 'lucide-react';

export default function ClipSettings({ settings, setSettings }) {
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-dark-900 border border-slate-800 p-5 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-pink-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Viral Clipping Parameters</h2>
        </div>
        <span className="text-xs text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20 font-semibold">
          Strict 60s Max Shorts
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Viral Mode */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-pink-500" /> Viral Hook Algorithm
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: "all", label: "🔥 All-Round Viral", desc: "Balanced hook, curiosity & pacing" },
              { id: "humor", label: "😂 Funniest / Reactions", desc: "Target laugh spikes & streamer comedy" },
              { id: "energy", label: "⚡ High Energy Climax", desc: "Loud peaks, shock & intensity" }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateSetting("viral_mode", item.id)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                  settings.viral_mode === item.id
                    ? "bg-purple-950/40 border-pink-500/80 text-white shadow-sm"
                    : "bg-dark-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="font-bold text-slate-200">{item.label}</div>
                <div className="text-[11px] text-slate-400">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Framing & Aspect Ratio */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" /> 9:16 Video Re-Framing
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { 
                id: "blurred_split", 
                label: "📱 Blurred Ambient Split", 
                desc: "Full 16:9 in center + blurred depth background (Recommended for Podcasts & Streams)" 
              },
              { 
                id: "center_crop", 
                label: "🔍 Smart Center Crop", 
                desc: "Fills 1080x1920 by cropping center" 
              },
              { 
                id: "fit", 
                label: "⬛ Letterbox Fit", 
                desc: "Clean black top and bottom bars" 
              }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateSetting("framing_mode", item.id)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                  settings.framing_mode === item.id
                    ? "bg-indigo-950/40 border-indigo-500/80 text-white shadow-sm"
                    : "bg-dark-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="font-bold text-slate-200">{item.label}</div>
                <div className="text-[11px] text-slate-400">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Subtitle Styles */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-yellow-400" /> Trendy Animated Subtitles
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { 
                id: "mrbeast_hormozi", 
                label: "🟡 MrBeast & Hormozi", 
                desc: "Punchy bold, yellow highlight, heavy black border" 
              },
              { 
                id: "neon_cyber", 
                label: "🟣 Neon Cyber Glow", 
                desc: "High-contrast cyan & green gaming font" 
              },
              { 
                id: "clean_minimal", 
                label: "⚪ Clean Modern", 
                desc: "Minimalist white with subtle shadow" 
              }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateSetting("subtitle_style", item.id)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                  settings.subtitle_style === item.id
                    ? "bg-amber-950/30 border-yellow-500/80 text-white shadow-sm"
                    : "bg-dark-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="font-bold text-slate-200">{item.label}</div>
                <div className="text-[11px] text-slate-400">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Subtitle Style Preview */}
      <div className="pt-2">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 flex items-center justify-between">
          <span>Live Subtitle Appearance Preview</span>
          <span className="text-[10px] text-emerald-400">Word-by-word active punch</span>
        </div>
        <div className="h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-3 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/10 to-indigo-500/5 pointer-events-none" />
          
          {settings.subtitle_style === "mrbeast_hormozi" && (
            <div className="sub-hormozi text-lg sm:text-xl text-center select-none">
              THIS IS <span className="sub-highlight-yellow">INSANE!</span>
            </div>
          )}
          {settings.subtitle_style === "neon_cyber" && (
            <div className="sub-neon text-lg sm:text-xl text-center select-none">
              LEVEL <span className="sub-highlight-neon">UNLOCKED!</span>
            </div>
          )}
          {settings.subtitle_style === "clean_minimal" && (
            <div className="text-base sm:text-lg font-bold text-white text-center drop-shadow-md select-none">
              The secret behind <span className="text-amber-400 font-extrabold">success</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
