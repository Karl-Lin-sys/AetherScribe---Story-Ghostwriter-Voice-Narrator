import React from 'react';
import { X, BookOpen, Trash2, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { SavedStoryItem } from '../types';

interface SavedStoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedStories: SavedStoryItem[];
  onSelectStory: (story: SavedStoryItem) => void;
  onDeleteStory: (id: string) => void;
}

export const SavedStoriesModal: React.FC<SavedStoriesModalProps> = ({
  isOpen,
  onClose,
  savedStories,
  onSelectStory,
  onDeleteStory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Saved Stories Library</h3>
              <p className="text-xs text-slate-400">
                {savedStories.length} {savedStories.length === 1 ? 'draft' : 'drafts'} saved locally
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stories List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {savedStories.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 mx-auto flex items-center justify-center text-slate-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-300">Your library is currently empty</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate a story from an image and click "Save Draft to Library" to preserve your work.
              </p>
            </div>
          ) : (
            savedStories.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {item.imageBase64 && (
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-800 flex-shrink-0 bg-slate-900">
                      <img
                        src={item.imageBase64}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="text-amber-400/90 font-medium">{item.genre}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-serif-story italic">
                      "{item.analysis.ghostwrittenStory.openingHook}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      onSelectStory(item);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-medium text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteStory(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors"
                    title="Delete saved story"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
