/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Feather,
  Volume2,
  Sparkles,
  Compass,
  Layers,
  MessageSquare,
  BookOpen,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Header } from './components/Header';
import { ImageUploadZone } from './components/ImageUploadZone';
import { StoryReaderEditor } from './components/StoryReaderEditor';
import { SceneAnalysisPanel } from './components/SceneAnalysisPanel';
import { GhostwriterChat } from './components/GhostwriterChat';
import { SavedStoriesModal } from './components/SavedStoriesModal';
import { StoryAnalysisResult, SavedStoryItem } from './types';

const STORAGE_KEY = 'aetherscribe_saved_stories';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState<StoryAnalysisResult | null>(null);
  const [currentImageBase64, setCurrentImageBase64] = useState<string | null>(null);
  const [currentGenre, setCurrentGenre] = useState<string>('Atmospheric Speculative Fiction');
  const [currentTone, setCurrentTone] = useState<string>('Dark, Foreboding & Tense');
  const [storyDraft, setStoryDraft] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Layout & Navigation State
  const [activeRightTab, setActiveRightTab] = useState<'chat' | 'analysis'>('chat');
  const [externalChatPrompt, setExternalChatPrompt] = useState<string>('');
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [savedStories, setSavedStories] = useState<SavedStoryItem[]>([]);
  const [isCurrentDraftSaved, setIsCurrentDraftSaved] = useState<boolean>(false);

  // Load saved stories on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedStories(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved stories from localStorage:', e);
    }
  }, []);

  // Save stories to localStorage
  const persistSavedStories = (stories: SavedStoryItem[]) => {
    setSavedStories(stories);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
    } catch (e) {
      console.error('Failed to save stories to localStorage:', e);
    }
  };

  const handleAnalyzeImage = async (payload: {
    imageBase64: string;
    mimeType: string;
    genre: string;
    tone: string;
    pov: string;
    focus: string;
    customInstructions: string;
  }) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetch('/api/analyze-and-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data = await response.json();
      const result: StoryAnalysisResult = data.data;

      setAnalysisResult(result);
      setCurrentImageBase64(payload.imageBase64);
      setCurrentGenre(payload.genre);
      setCurrentTone(payload.tone);

      // Initialize the draft with the opening hook and rich opening paragraph
      const initialDraft = `${result.ghostwrittenStory.openingHook}\n\n${result.ghostwrittenStory.openingParagraph}`;
      setStoryDraft(initialDraft);
      setIsCurrentDraftSaved(false);
      setActiveRightTab('chat');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'An error occurred while generating the story.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDraft = (newText: string) => {
    setStoryDraft(newText);
    setIsCurrentDraftSaved(false);
  };

  const handleAppendToStory = (textToAppend: string) => {
    // Clean text of markdown blockquotes or muse conversational prefixes if any
    const cleanedText = textToAppend.replace(/^>+\s*/gm, '').trim();
    setStoryDraft((prev) => `${prev.trim()}\n\n${cleanedText}`);
    setIsCurrentDraftSaved(false);
  };

  const handleSaveToLibrary = () => {
    if (!analysisResult) return;

    const existingIndex = savedStories.findIndex(
      (s) => s.title === analysisResult.ghostwrittenStory.title
    );

    const storyItem: SavedStoryItem = {
      id: existingIndex >= 0 ? savedStories[existingIndex].id : `story-${Date.now()}`,
      title: analysisResult.ghostwrittenStory.title,
      createdAt: Date.now(),
      genre: currentGenre,
      tone: currentTone,
      imageBase64: currentImageBase64 || '',
      analysis: analysisResult,
      storyDraft,
    };

    let updated: SavedStoryItem[];
    if (existingIndex >= 0) {
      updated = [...savedStories];
      updated[existingIndex] = storyItem;
    } else {
      updated = [storyItem, ...savedStories];
    }

    persistSavedStories(updated);
    setIsCurrentDraftSaved(true);
  };

  const handleSelectSavedStory = (story: SavedStoryItem) => {
    setAnalysisResult(story.analysis);
    setCurrentImageBase64(story.imageBase64);
    setCurrentGenre(story.genre);
    setCurrentTone(story.tone);
    setStoryDraft(story.storyDraft);
    setIsCurrentDraftSaved(true);
  };

  const handleDeleteSavedStory = (id: string) => {
    const updated = savedStories.filter((s) => s.id !== id);
    persistSavedStories(updated);
  };

  const handleResetToNewScene = () => {
    if (
      analysisResult &&
      !isCurrentDraftSaved &&
      !confirm('Start a new scene? Any unsaved edits to the current story will be lost.')
    ) {
      return;
    }
    setAnalysisResult(null);
    setCurrentImageBase64(null);
    setStoryDraft('');
    setErrorMessage(null);
  };

  const handlePromptFromSparks = (promptText: string) => {
    setActiveRightTab('chat');
    setExternalChatPrompt(`Help me develop this narrative branch: "${promptText}". Write the next vivid scene.`);
  };

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Global Navigation Header */}
      <Header
        onOpenSaved={() => setIsSavedModalOpen(true)}
        savedCount={savedStories.length}
        onReset={handleResetToNewScene}
        hasActiveStory={!!analysisResult}
      />

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <strong className="font-semibold block mb-0.5">Ghostwriting Notice</strong>
              <p>{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 text-xs font-semibold px-2 py-1 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {!analysisResult ? (
          /* View 1: Initial Scene Upload & Generation Zone */
          <div className="space-y-10 py-4">
            <ImageUploadZone onAnalyze={handleAnalyzeImage} isLoading={isLoading} />

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-900">
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-200">1. Scene & Mood Vision</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Extracts architectural details, environmental lore, lighting nuances, and auditory clues using{' '}
                  <span className="text-cyan-300 font-mono">gemini-3.1-pro-preview</span>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
                  <Volume2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-200">2. Expressive AI Narration</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Listen to your story read aloud with 5 distinctive voice personas and dramatic cadence using{' '}
                  <span className="text-amber-300 font-mono">gemini-3.8-flash-tts</span>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-200">3. Ghostwriter's Muse</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Multi-turn interactive chat companion with scene memory to draft subsequent paragraphs, twist plots, and develop characters.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* View 2: Active Story Studio & Co-Writing Workspace */
          <div className="space-y-6">
            {/* Top Workspace Breadcrumb & Scene Summary */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur">
              <div className="flex items-center gap-3">
                {currentImageBase64 && (
                  <div className="w-12 h-10 rounded-lg overflow-hidden border border-slate-700/80 flex-shrink-0 bg-slate-950">
                    <img
                      src={currentImageBase64}
                      alt="Current scene"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {analysisResult.ghostwrittenStory.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                      {currentGenre.split('/')[0]}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Atmosphere: <span className="text-slate-300">{analysisResult.moodAnalysis.primaryMood}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToNewScene}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Choose Another Image</span>
                </button>
              </div>
            </div>

            {/* Main Studio Two-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Story Reader, Editor & Audio Narrator (7 cols on lg) */}
              <div className="lg:col-span-7 space-y-6">
                <StoryReaderEditor
                  story={analysisResult.ghostwrittenStory}
                  storyDraft={storyDraft}
                  onUpdateDraft={handleUpdateDraft}
                  onSaveToLibrary={handleSaveToLibrary}
                  isSaved={isCurrentDraftSaved}
                />
              </div>

              {/* Right Column: Scene Breakdown & Multi-Turn Muse Chat (5 cols on lg) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Switcher between Muse Chat and Scene Analysis */}
                <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-1">
                  <button
                    onClick={() => setActiveRightTab('chat')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                      activeRightTab === 'chat'
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>The Muse Co-Writer</span>
                  </button>
                  <button
                    onClick={() => setActiveRightTab('analysis')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                      activeRightTab === 'analysis'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Scene & Lore Analysis</span>
                  </button>
                </div>

                {activeRightTab === 'chat' ? (
                  <GhostwriterChat
                    analysis={analysisResult}
                    currentStoryDraft={storyDraft}
                    storyTitle={analysisResult.ghostwrittenStory.title}
                    genre={currentGenre}
                    onAppendToStory={handleAppendToStory}
                    externalPrompt={externalChatPrompt}
                    onClearExternalPrompt={() => setExternalChatPrompt('')}
                  />
                ) : (
                  <SceneAnalysisPanel
                    analysis={analysisResult}
                    onSelectPrompt={handlePromptFromSparks}
                    imageBase64={currentImageBase64 || undefined}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Saved Stories Library Modal */}
      <SavedStoriesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedStories={savedStories}
        onSelectStory={handleSelectSavedStory}
        onDeleteStory={handleDeleteSavedStory}
      />
    </div>
  );
}
