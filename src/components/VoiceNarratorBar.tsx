import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Download,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Mic,
  Headphones,
} from 'lucide-react';
import { VOICE_PROFILES } from '../data/presets';
import { TTSVoice } from '../types';

interface VoiceNarratorBarProps {
  storyText: string;
  storyTitle: string;
}

export const VoiceNarratorBar: React.FC<VoiceNarratorBarProps> = ({ storyText, storyTitle }) => {
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice>('Charon');
  const [selectedStyle, setSelectedStyle] = useState<string>(VOICE_PROFILES[0].defaultStyle);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousTextRef = useRef<string>(storyText);

  // If story text changes, invalidate existing audio so user can regenerate fresh narration
  useEffect(() => {
    if (storyText !== previousTextRef.current) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setAudioBase64(null);
      setCurrentTime(0);
      setAudioDuration(0);
      previousTextRef.current = storyText;
    }
  }, [storyText]);

  // Update default style when voice changes
  const handleVoiceChange = (voiceId: TTSVoice) => {
    setSelectedVoice(voiceId);
    const profile = VOICE_PROFILES.find((v) => v.id === voiceId);
    if (profile) {
      setSelectedStyle(profile.defaultStyle);
    }
    // Invalidate current audio so next play synthesizes with new voice
    if (audioBase64) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      setAudioBase64(null);
    }
  };

  const handleSynthesizeAndPlay = async () => {
    if (!storyText.trim()) return;

    // If we already have synthesized audio, just toggle playback
    if (audioBase64 && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (err) {
          console.error('Audio play error:', err);
        }
      }
      return;
    }

    // Call TTS API with gemini-3.8-flash-tts
    try {
      setIsSynthesizing(true);
      setErrorMessage(null);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: storyText,
          voice: selectedVoice,
          style: selectedStyle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to synthesize narration');
      }

      const data = await response.json();
      if (!data.audioBase64) {
        throw new Error('No audio data received');
      }

      setAudioBase64(data.audioBase64);

      // Initialize HTMLAudioElement
      const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
      } else {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
      }

      const audio = audioRef.current;
      audio.playbackRate = playbackRate;

      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration || 0);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.onerror = (e) => {
        console.error('Audio element playback error:', e);
        setIsPlaying(false);
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err: any) {
      console.error('TTS error:', err);
      setErrorMessage(err.message || 'Error generating narration');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), audioDuration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleDownload = () => {
    if (!audioBase64) return;
    const link = document.createElement('a');
    link.href = `data:audio/wav;base64,${audioBase64}`;
    const safeTitle = (storyTitle || 'story-narration').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    link.download = `${safeTitle}-${selectedVoice.toLowerCase()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const currentProfile = VOICE_PROFILES.find((v) => v.id === selectedVoice);

  return (
    <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xl relative">
      <div className="flex flex-col gap-4">
        {/* Top bar with Read Aloud trigger and Voice Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Primary Read Aloud Button */}
            <button
              onClick={handleSynthesizeAndPlay}
              disabled={isSynthesizing || !storyText.trim()}
              className={`px-5 py-2.5 rounded-xl font-medium text-xs tracking-wider uppercase transition-all shadow-lg flex items-center gap-2 ${
                isSynthesizing
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
                  : isPlaying
                  ? 'bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 border border-amber-300 shadow-amber-500/30'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold border border-amber-400 shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isSynthesizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Synthesizing Voice...</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-slate-950" />
                  <span>Pause Narration</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                  <span>Read Aloud</span>
                </>
              )}
            </button>

            {/* Active Voice Persona Tag */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <Headphones className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Voice:</span>
              <strong className="text-amber-300 font-semibold">{currentProfile?.name}</strong>
              <span className="text-[10px] text-slate-500 hidden md:inline">({currentProfile?.badge})</span>
            </div>
          </div>

          {/* Model info and Settings Toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Model: <span className="font-mono text-amber-300">gemini-3.8-flash-tts</span></span>
            </div>

            <button
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className={`p-2 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
                showVoiceSettings
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Configure Voice & Style"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="text-xs hidden sm:inline">Voice Cast</span>
            </button>

            {audioBase64 && (
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Download Narration (.wav)"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Voice Selection Panel (Collapsible) */}
        {showVoiceSettings && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Select AI Narrator Persona
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {VOICE_PROFILES.map((vp) => {
                  const isSelected = selectedVoice === vp.id;
                  return (
                    <button
                      key={vp.id}
                      onClick={() => handleVoiceChange(vp.id as TTSVoice)}
                      className={`text-left p-2.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/10 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-amber-200">{vp.name}</span>
                        <span className="text-[10px] text-slate-500">{vp.gender}</span>
                      </div>
                      <p className="text-[10px] text-amber-400/90 font-medium mt-0.5">{vp.badge}</p>
                      <p className="text-[9px] text-slate-400 mt-1 line-clamp-2 leading-tight">{vp.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Narrative Cadence & Style Directive
              </label>
              <input
                type="text"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                placeholder="e.g. Atmospheric, emotive storyteller with dramatic pauses..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Guides the vocal tone, emotional weight, and pacing delivered by Gemini Flash TTS.
              </p>
            </div>
          </div>
        )}

        {/* Player Controls & Timeline (visible when audio exists or playing) */}
        {(audioBase64 || audioDuration > 0) && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2">
            {/* Timeline Slider */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-400 min-w-[36px]">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={audioDuration || 1}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[11px] font-mono text-slate-400 min-w-[36px]">
                {formatTime(audioDuration)}
              </span>
            </div>

            {/* Playback Controls & Waveform Simulation */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSkip(-5)}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                  title="Rewind 5 seconds"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleSynthesizeAndPlay}
                  className="p-2 rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-amber-300" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-amber-300 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => handleSkip(5)}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                  title="Forward 5 seconds"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                {/* Speed Multiplier Pill */}
                <div className="flex items-center ml-2 border-l border-slate-800 pl-2 gap-1 text-[11px]">
                  {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleRateChange(rate)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        playbackRate === rate
                          ? 'bg-amber-500/30 text-amber-300 font-bold'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Animated Waveform Visualizer */}
              <div className="flex items-center gap-0.5 h-4 px-2">
                {[4, 12, 8, 16, 10, 14, 6, 15, 9, 13, 5, 11].map((height, i) => (
                  <span
                    key={i}
                    className={`w-0.5 rounded-full transition-all duration-150 ${
                      isPlaying
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-slate-700'
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(3, (height * (1 + Math.sin(currentTime * 4 + i))) / 1.5)}px` : '3px',
                      animationDelay: `${i * 80}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error message notification if any */}
        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-800/60 text-xs text-red-300">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};
