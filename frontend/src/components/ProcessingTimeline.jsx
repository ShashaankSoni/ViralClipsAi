import React from 'react';
import { Loader2, CheckCircle2, Flame, Video, FileText, Cpu, Download } from 'lucide-react';

const STEPS = [
  { id: 1, label: "Stream Ingestion", icon: Video, minProgress: 15 },
  { id: 2, label: "Word-Level Transcripts", icon: FileText, minProgress: 35 },
  { id: 3, label: "AI Viral Hook Scoring", icon: Flame, minProgress: 55 },
  { id: 4, label: "9:16 Encode & Subtitles", icon: Cpu, minProgress: 85 },
  { id: 5, label: "Export Ready", icon: Download, minProgress: 100 }
];

export default function ProcessingTimeline({ job }) {
  if (!job) return null;

  const progress = job.progress || 0;
  const currentStepText = job.current_step || "Processing video...";

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-dark-900 border border-slate-800 p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />
            <h3 className="font-extrabold text-white text-lg">AI Clipping Engine in Progress</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">{currentStepText}</p>
        </div>

        {/* Progress percent badge */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-2xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              {progress}%
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-pink-500 animate-spin flex items-center justify-center">
            <Flame className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-500 shadow-lg shadow-pink-500/50"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps visualization */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
        {STEPS.map((step) => {
          const StepIcon = step.icon;
          const isDone = progress >= step.minProgress;
          const isCurrent = progress < step.minProgress && progress >= (step.minProgress - 25);

          return (
            <div 
              key={step.id}
              className={`p-3 rounded-xl border flex flex-col items-center text-center space-y-1.5 transition-all ${
                isDone 
                  ? "bg-slate-950 border-emerald-500/40 text-emerald-400"
                  : isCurrent
                  ? "bg-purple-950/30 border-pink-500/60 text-pink-300 animate-pulse"
                  : "bg-dark-950 border-slate-800/80 text-slate-500"
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-900">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>
              <span className="text-[11px] font-semibold leading-tight">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
