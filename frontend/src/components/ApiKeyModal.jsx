import React, { useState } from 'react';
import { X, Key, Check, ExternalLink, Sparkles } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, setApiKey }) {
  if (!isOpen) return null;

  const [inputKey, setInputKey] = useState(apiKey || "");

  const handleSave = () => {
    setApiKey(inputKey.trim());
    localStorage.setItem("viralclip_gemini_key", inputKey.trim());
    onClose();
  };

  const handleClear = () => {
    setInputKey("");
    setApiKey("");
    localStorage.removeItem("viralclip_gemini_key");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-pink-500" />
            <h3 className="font-extrabold text-white text-base">Gemini AI Key (Optional)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          ClipViral uses an advanced local heuristic engine by default. Connecting a free Google Gemini API key enables deep psychological hook analysis, viral CTR title generation, and trending hashtag curation.
        </p>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Google AI Studio API Key
          </label>
          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:border-pink-500 outline-none"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-pink-400 hover:text-pink-300 flex items-center gap-1 font-semibold"
          >
            <span>Get free API key</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {apiKey && (
            <button
              onClick={handleClear}
              className="text-slate-500 hover:text-red-400"
            >
              Clear Saved Key
            </button>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white flex items-center space-x-1.5 shadow-lg shadow-pink-600/30"
          >
            <Check className="w-4 h-4" />
            <span>Save Key</span>
          </button>
        </div>
      </div>
    </div>
  );
}
