import React, { useState } from 'react';
import { X, Check, Save, Type, RotateCcw } from 'lucide-react';

export default function SubtitleEditorModal({ clip, isOpen, onClose, onSave }) {
  if (!isOpen || !clip) return null;

  const [words, setWords] = useState(clip.words || []);

  const handleWordChange = (index, newWord) => {
    const updated = [...words];
    updated[index] = { ...updated[index], word: newWord };
    setWords(updated);
  };

  const handleMakeAllUppercase = () => {
    const updated = words.map(w => ({ ...w, word: w.word.toUpperCase() }));
    setWords(updated);
  };

  const handleSave = () => {
    onSave(clip.clip_id, words);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Type className="w-5 h-5 text-pink-400" />
            <h3 className="font-extrabold text-white text-base">Interactive Subtitle & Caption Editor</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Timeline Editor */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tweak individual words to ensure 100% accuracy and retention punch:</span>
            <button
              onClick={handleMakeAllUppercase}
              className="text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1"
            >
              Convert All to UPPERCASE
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {words.map((w, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 bg-dark-950 border border-slate-800 p-2 rounded-xl focus-within:border-pink-500"
              >
                <span className="text-[10px] font-mono text-slate-500 w-10 flex-shrink-0">
                  {w.start}s
                </span>
                <input
                  type="text"
                  value={w.word}
                  onChange={(e) => handleWordChange(idx, e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-white outline-none focus:ring-0"
                />
              </div>
            ))}
          </div>

          {words.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No word-level timings available for manual editing.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex justify-end space-x-2 bg-dark-950">
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
            <Save className="w-4 h-4" />
            <span>Save & Apply Subtitles</span>
          </button>
        </div>
      </div>
    </div>
  );
}
