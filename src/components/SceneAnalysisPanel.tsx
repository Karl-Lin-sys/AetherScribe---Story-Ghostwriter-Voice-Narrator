import React, { useState } from 'react';
import {
  Compass,
  Palette,
  Eye,
  Volume2,
  Wind,
  Layers,
  Sparkles,
  User,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { StoryAnalysisResult } from '../types';

interface SceneAnalysisPanelProps {
  analysis: StoryAnalysisResult;
  onSelectPrompt: (promptText: string) => void;
  imageBase64?: string;
}

export const SceneAnalysisPanel: React.FC<SceneAnalysisPanelProps> = ({
  analysis,
  onSelectPrompt,
  imageBase64,
}) => {
  const [activeTab, setActiveTab] = useState<'scene' | 'mood' | 'seeds'>('scene');
  const [showFullImage, setShowFullImage] = useState<boolean>(false);

  const { sceneBreakdown, moodAnalysis, storyHooks } = analysis;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 lg:p-6 backdrop-blur shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Scene & Mood Intelligence</span>
              <span className="text-[10px] font-mono text-cyan-400 font-normal px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                gemini-3.1-pro
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Deep visual dissection and atmospheric extraction</p>
          </div>
        </div>

        {/* Thumbnail reference */}
        {imageBase64 && (
          <div
            onClick={() => setShowFullImage(!showFullImage)}
            className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700/80 cursor-pointer hover:border-amber-400 transition-all flex-shrink-0"
            title="Click to view scene image"
          >
            <img src={imageBase64} alt="Analyzed scene" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('scene')}
          className={`py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'scene'
              ? 'bg-slate-800 text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Setting</span>
        </button>
        <button
          onClick={() => setActiveTab('mood')}
          className={`py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'mood'
              ? 'bg-slate-800 text-amber-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Mood</span>
        </button>
        <button
          onClick={() => setActiveTab('seeds')}
          className={`py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'seeds'
              ? 'bg-slate-800 text-violet-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Story Seeds</span>
        </button>
      </div>

      {/* Tab 1: Scene & Environmental Breakdown */}
      {activeTab === 'scene' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Visual Elements Pill Cloud */}
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-2">
              Identified Setting Anchors
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sceneBreakdown.visualElements.map((el, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md text-xs bg-slate-950 border border-slate-800 text-slate-300 font-medium"
                >
                  {el}
                </span>
              ))}
            </div>
          </div>

          {/* Lighting & Atmosphere */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Eye className="w-3 h-3" />
              <span>Lighting & Radiance</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {sceneBreakdown.lightingAndAtmosphere}
            </p>
          </div>

          {/* Sensory Matrix */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
              Sensory Clues
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/60 space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-semibold uppercase">
                  <Eye className="w-2.5 h-2.5" />
                  <span>Textures</span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-3">
                  {sceneBreakdown.sensoryDetails.visual}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/60 space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold uppercase">
                  <Volume2 className="w-2.5 h-2.5" />
                  <span>Inferred Sounds</span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-3">
                  {sceneBreakdown.sensoryDetails.auditory}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/60 space-y-1">
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold uppercase">
                  <Wind className="w-2.5 h-2.5" />
                  <span>Air & Tactile</span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-3">
                  {sceneBreakdown.sensoryDetails.tactileOrOlfactory}
                </p>
              </div>
            </div>
          </div>

          {/* Environmental Lore */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Compass className="w-3 h-3" />
              <span>Implied World Lore</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {sceneBreakdown.environmentalLore}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Mood & Atmosphere Analysis */}
      {activeTab === 'mood' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/30">
            <span className="text-[10px] uppercase font-semibold text-amber-400 tracking-wider">
              Primary Atmospheric Mood
            </span>
            <h4 className="text-base font-semibold text-amber-200 mt-0.5">
              {moodAnalysis.primaryMood}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {moodAnalysis.emotionalResonance}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Palette className="w-3 h-3" />
              <span>Color Weight & Aesthetic</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {moodAnalysis.colorPaletteVibe}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-rose-950/40">
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Underlying Tension & Peril</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {moodAnalysis.underlyingTension}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Character & Story Seeds */}
      {activeTab === 'seeds' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3 h-3" />
              <span>Protagonist Suggestion</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {storyHooks.protagonistIdea}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" />
              <span>Inciting Disruption</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {storyHooks.incitingIncident}
            </p>
          </div>

          {/* Continuation Directions */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>Prompt Ideas for the Muse (Click to Ask)</span>
            </span>
            <div className="space-y-1.5">
              {storyHooks.continuationPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => onSelectPrompt(prompt)}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all text-xs text-slate-300 hover:text-amber-200 flex items-center justify-between group"
                >
                  <span className="line-clamp-2">{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expanded Image Modal / Drawer */}
      {showFullImage && imageBase64 && (
        <div className="pt-2">
          <div className="rounded-xl overflow-hidden border border-slate-700 max-h-64 bg-black relative">
            <img src={imageBase64} alt="Full view" className="w-full h-full object-contain mx-auto" />
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-xs text-slate-300 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
