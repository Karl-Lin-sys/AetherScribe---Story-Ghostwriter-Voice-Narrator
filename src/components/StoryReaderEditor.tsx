import React, { useState } from 'react';
import {
  BookOpen,
  Edit3,
  Copy,
  Check,
  Download,
  BookmarkPlus,
  Type,
  Sparkles,
  Maximize2,
  FileText,
} from 'lucide-react';
import { GhostwrittenStory } from '../types';
import { calculateReadingTime } from '../utils/imageUtils';
import { VoiceNarratorBar } from './VoiceNarratorBar';

interface StoryReaderEditorProps {
  story: GhostwrittenStory;
  storyDraft: string;
  onUpdateDraft: (text: string) => void;
  onSaveToLibrary: () => void;
  isSaved: boolean;
}

export const StoryReaderEditor: React.FC<StoryReaderEditorProps> = ({
  story,
  storyDraft,
  onUpdateDraft,
  onSaveToLibrary,
  isSaved,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');

  const fullTextToRead = storyDraft.trim() || `${story.openingHook} ${story.openingParagraph}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullTextToRead);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    const markdownContent = `# ${story.title}\n\n*${story.openingHook}*\n\n${storyDraft || story.openingParagraph}\n\n---\n*Ghostwritten with AetherScribe Vision & AI*`;
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(story.title || 'story').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getFontSizeClasses = () => {
    switch (fontSize) {
      case 'normal':
        return 'text-base sm:text-lg leading-relaxed';
      case 'xlarge':
        return 'text-xl sm:text-2xl leading-loose';
      case 'large':
      default:
        return 'text-lg sm:text-xl leading-relaxed sm:leading-loose';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:p-8 backdrop-blur shadow-2xl space-y-6">
      {/* Voice Narrator Bar at the top of the reading room */}
      <VoiceNarratorBar storyText={fullTextToRead} storyTitle={story.title} />

      {/* Story Document Card */}
      <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-6 sm:p-10 relative overflow-hidden shadow-inner">
        {/* Subtle paper aesthetic watermark / texture */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Story Header & Meta */}
        <div className="border-b border-slate-800/80 pb-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <span className="text-[11px] uppercase tracking-widest font-semibold text-amber-400">
                Ghostwritten Opening Act
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-slate-100 tracking-wide">
                {story.title}
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{calculateReadingTime(fullTextToRead)}</span>
              </p>
            </div>

            {/* Reading vs Editing controls */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
                <button
                  onClick={() => setIsEditing(false)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    !isEditing
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read</span>
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isEditing
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Font size picker */}
              <div className="hidden sm:flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs text-slate-400">
                <button
                  onClick={() => setFontSize('normal')}
                  className={`px-2 py-1 rounded text-[11px] ${fontSize === 'normal' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
                  title="Normal font size"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-2 py-1 rounded text-xs font-semibold ${fontSize === 'large' ? 'bg-slate-800 text-amber-300' : 'hover:text-slate-200'}`}
                  title="Large font size"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('xlarge')}
                  className={`px-2 py-1 rounded text-sm font-bold ${fontSize === 'xlarge' ? 'bg-slate-800 text-amber-300' : 'hover:text-slate-200'}`}
                  title="Extra large font size"
                >
                  A
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Arresting Opening Hook Callout */}
        {story.openingHook && !isEditing && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-400">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400 block mb-1">
              Opening Hook
            </span>
            <p className="font-serif-story italic text-base sm:text-lg text-amber-200/90 font-medium">
              "{story.openingHook}"
            </p>
          </div>
        )}

        {/* Main Story Body */}
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Author Workspace (Changes automatically update the voice narration text)</span>
              <span>{storyDraft.split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <textarea
              value={storyDraft}
              onChange={(e) => onUpdateDraft(e.target.value)}
              rows={12}
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-amber-500/60 rounded-xl p-4 font-serif-story text-slate-200 text-lg leading-relaxed focus:outline-none transition-colors resize-y"
              placeholder="Expand the story or edit the ghostwritten prose..."
            />
          </div>
        ) : (
          <div className={`font-serif-story text-slate-200 space-y-6 ${getFontSizeClasses()}`}>
            {/* Paragraph rendering with elegant literary typography */}
            {storyDraft ? (
              storyDraft.split('\n\n').map((para, i) => (
                <p key={i} className="first-of-type:first-letter:text-4xl first-of-type:first-letter:font-bold first-of-type:first-letter:mr-1 first-of-type:first-letter:float-left first-of-type:first-letter:text-amber-400">
                  {para}
                </p>
              ))
            ) : (
              <p className="first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:text-amber-400">
                {story.openingParagraph}
              </p>
            )}

            {/* Optional second paragraph / continued exposition if present */}
            {story.continuedExposition && !storyDraft.includes(story.continuedExposition) && (
              <div className="pt-4 border-t border-slate-850">
                <span className="text-[10px] font-sans uppercase tracking-widest text-slate-500 block mb-2 font-semibold">
                  Worldbuilding Expansion
                </span>
                <p className="text-slate-300/90">{story.continuedExposition}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer actions for the document */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Story'}</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .md</span>
            </button>
          </div>

          <button
            onClick={onSaveToLibrary}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              isSaved
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300'
            }`}
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved in Library' : 'Save Draft to Library'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
