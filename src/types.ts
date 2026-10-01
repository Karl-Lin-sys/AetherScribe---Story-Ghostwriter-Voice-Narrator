export interface SceneBreakdown {
  visualElements: string[];
  lightingAndAtmosphere: string;
  sensoryDetails: {
    visual: string;
    auditory: string;
    tactileOrOlfactory: string;
  };
  environmentalLore: string;
}

export interface MoodAnalysis {
  primaryMood: string;
  emotionalResonance: string;
  colorPaletteVibe: string;
  underlyingTension: string;
}

export interface GhostwrittenStory {
  title: string;
  openingHook: string;
  openingParagraph: string;
  continuedExposition: string;
}

export interface StoryHooks {
  protagonistIdea: string;
  incitingIncident: string;
  centralDilemma: string;
  continuationPrompts: string[];
}

export interface StoryAnalysisResult {
  sceneBreakdown: SceneBreakdown;
  moodAnalysis: MoodAnalysis;
  ghostwrittenStory: GhostwrittenStory;
  storyHooks: StoryHooks;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  modelUsed?: string;
}

export interface SavedStoryItem {
  id: string;
  title: string;
  createdAt: number;
  genre: string;
  tone: string;
  imageBase64: string;
  analysis: StoryAnalysisResult;
  storyDraft: string;
}

export type GeminiChatModel = 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';

export type TTSVoice = 'Charon' | 'Kore' | 'Fenrir' | 'Puck' | 'Zephyr';

export interface PresetScene {
  id: string;
  name: string;
  genre: string;
  tone: string;
  description: string;
  imageUrl: string;
}
