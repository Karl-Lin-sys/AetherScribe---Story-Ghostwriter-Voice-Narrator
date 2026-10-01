import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Zap,
  BookOpen,
  PlusCircle,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Cpu,
} from 'lucide-react';
import { ChatMessage, GeminiChatModel, StoryAnalysisResult } from '../types';

interface GhostwriterChatProps {
  analysis: StoryAnalysisResult;
  currentStoryDraft: string;
  storyTitle: string;
  genre: string;
  onAppendToStory: (textToAppend: string) => void;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
}

export const GhostwriterChat: React.FC<GhostwriterChatProps> = ({
  analysis,
  currentStoryDraft,
  storyTitle,
  genre,
  onAppendToStory,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<GeminiChatModel>('gemini-3.5-flash');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize welcoming message on first mount
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: `Greetings, author. I am your Ghostwriter's Muse. I've studied the atmosphere of "${storyTitle}"—from the ${analysis.sceneBreakdown.lightingAndAtmosphere.toLowerCase()} to the underlying tension of ${analysis.moodAnalysis.underlyingTension.toLowerCase()}.\n\nHow shall we expand this tale? I can ghostwrite the next scene, craft dialogue, introduce an unexpected twist, or deepen the sensory prose.`,
          timestamp: Date.now(),
          modelUsed: 'gemini-3.5-flash',
        },
      ]);
    }
  }, [analysis, storyTitle]);

  // Handle external prompt passed from SceneAnalysis sparks
  useEffect(() => {
    if (externalPrompt) {
      setInputValue(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
      inputRef.current?.focus();
    }
  }, [externalPrompt]);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare payload with conversation history & story context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          storyContext: {
            title: storyTitle,
            genre,
            mood: analysis.moodAnalysis.primaryMood,
            currentStory: currentStoryDraft,
            imageAnalysis: `${analysis.sceneBreakdown.lightingAndAtmosphere}. Lore: ${analysis.sceneBreakdown.environmentalLore}`,
          },
          modelPreference: selectedModel,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to get response from Muse');
      }

      const data = await response.json();
      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.text,
        timestamp: Date.now(),
        modelUsed: data.modelUsed || selectedModel,
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'model',
        content: `I encountered an unexpected shadow while formulating that idea: ${err.message}. Please try again or switch model speed.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Clear the conversation history with the Muse?')) {
      setMessages([
        {
          id: `reset-${Date.now()}`,
          role: 'model',
          content: 'The slate is cleared. What narrative direction would you like to explore next?',
          timestamp: Date.now(),
        },
      ]);
    }
  };

  // Quick suggestion chips
  const quickChips = [
    'Write the next paragraph',
    'Introduce a sudden twist',
    'Deepen sensory descriptions',
    'Draft dialogue for protagonist',
    'Give 3 alternative endings',
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur shadow-2xl flex flex-col h-[640px]">
      {/* Chat Header */}
      <div className="border-b border-slate-800/80 pb-3 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>The Ghostwriter's Muse</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/30 text-violet-300 font-mono">
                Interactive Co-Writer
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Multi-turn narrative companion with scene memory</p>
          </div>
        </div>

        {/* Clear and Model options */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Model Selector Bar */}
      <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800/80 mb-3 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400 font-medium pl-1 flex items-center gap-1">
          <Cpu className="w-3 h-3 text-violet-400" />
          <span>Muse Engine:</span>
        </span>
        <div className="flex rounded-lg bg-slate-900 p-0.5 gap-0.5">
          <button
            onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              selectedModel === 'gemini-3.1-pro-preview'
                ? 'bg-violet-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="gemini-3.1-pro-preview: Deep literary reasoning and complex narrative architecture"
          >
            Pro 3.1 (Deep)
          </button>
          <button
            onClick={() => setSelectedModel('gemini-3.5-flash')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              selectedModel === 'gemini-3.5-flash'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="gemini-3.5-flash: General balanced co-writing"
          >
            Flash 3.5 (Balanced)
          </button>
          <button
            onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              selectedModel === 'gemini-3.1-flash-lite'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="gemini-3.1-flash-lite: Fast brainstorms and rapid idea sparks"
          >
            Lite 3.1 (Fast)
          </button>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-violet-900/40 border border-violet-700/50 flex items-center justify-center text-violet-300 flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 ${
                  isUser
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-100 rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {isUser ? 'You (Author)' : "The Ghostwriter's Muse"}
                  </span>
                  {!isUser && message.modelUsed && (
                    <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-violet-300 border border-slate-800">
                      {message.modelUsed}
                    </span>
                  )}
                </div>

                {/* Message Body */}
                <div className="font-serif-story text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>

                {/* Actions on Model Messages (Insert into draft or Copy) */}
                {!isUser && (
                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyMessage(message.id, message.content)}
                      className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onAppendToStory(message.content)}
                      className="text-[10px] text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 transition-colors"
                      title="Append this response directly to your active story document"
                    >
                      <PlusCircle className="w-3 h-3 text-amber-400" />
                      <span>Append to Story</span>
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-amber-900/40 border border-amber-700/50 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-center">
            <div className="w-7 h-7 rounded-lg bg-violet-900/40 border border-violet-700/50 flex items-center justify-center text-violet-300 flex-shrink-0">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none p-3 text-xs text-slate-400 flex items-center gap-2">
              <span className="animate-pulse">Muse is crafting prose with {selectedModel}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="py-2 overflow-x-auto flex gap-1.5 flex-shrink-0 no-scrollbar">
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full text-[10px] bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-violet-500/40 text-slate-300 hover:text-violet-200 whitespace-nowrap transition-colors flex items-center gap-1"
          >
            <Zap className="w-2.5 h-2.5 text-amber-400" />
            <span>{chip}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="pt-2 border-t border-slate-800/80 flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the Muse to continue, rewrite, create dialogue... (Shift+Enter for new line)"
          rows={2}
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-violet-500/60 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors resize-none"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim() || isLoading}
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
            !inputValue.trim() || isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-500/20 active:scale-95'
          }`}
          title="Send message to Muse"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
