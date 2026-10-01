import React from 'react';
import { Feather, Volume2, Sparkles, BookOpen, Compass, BookmarkCheck } from 'lucide-react';

interface HeaderProps {
  onOpenSaved: () => void;
  savedCount: number;
  onReset: () => void;
  hasActiveStory: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSaved, savedCount, onReset, hasActiveStory }) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-violet-500/20 to-sky-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-inner">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl tracking-wider text-slate-100">
                AetherScribe
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-300">
                Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Vision-driven story ghostwriter & expressive narrator
            </p>
          </div>
        </div>

        {/* Feature & Model Badges */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vision: <strong className="font-mono text-cyan-300">gemini-3.1-pro</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Narrator: <strong className="font-mono text-amber-300">gemini-3.8-flash-tts</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Muse: <strong className="font-mono text-violet-300">Multi-Turn Chat</strong></span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {hasActiveStory && (
            <button
              onClick={onReset}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
              title="Start a new story with a different scene"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>New Scene</span>
            </button>
          )}

          <button
            onClick={onOpenSaved}
            className="px-3 py-1.5 text-xs font-medium text-amber-200 hover:text-amber-100 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1.5"
            title="Open saved story drafts"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Library</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 font-mono text-[10px]">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
