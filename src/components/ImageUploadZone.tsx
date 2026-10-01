import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Sliders, Wand2, Eye, RefreshCw } from 'lucide-react';
import { PRESET_SCENES, GENRE_OPTIONS, TONE_OPTIONS } from '../data/presets';
import { fileToBase64, urlToBase64 } from '../utils/imageUtils';

interface ImageUploadZoneProps {
  onAnalyze: (payload: {
    imageBase64: string;
    mimeType: string;
    genre: string;
    tone: string;
    pov: string;
    focus: string;
    customInstructions: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({ onAnalyze, isLoading }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [activeTab, setActiveTab] = useState<'upload' | 'presets'>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_SCENES[0].id);

  // Form options
  const [genre, setGenre] = useState<string>(GENRE_OPTIONS[0]);
  const [tone, setTone] = useState<string>(TONE_OPTIONS[0]);
  const [pov, setPov] = useState<string>('Third-Person Limited');
  const [focus, setFocus] = useState<string>('Sensory atmosphere, worldbuilding texture, and hidden danger');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-load default preset on first render if no image selected
  React.useEffect(() => {
    if (!selectedImage && activeTab === 'presets') {
      const defaultPreset = PRESET_SCENES[0];
      handleSelectPreset(defaultPreset.id);
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsConverting(true);
      const res = await fileToBase64(file);
      setSelectedImage(res.base64);
      setMimeType(res.mimeType);
      setSelectedPresetId('');
    } catch (err) {
      console.error('Failed to read image file:', err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleSelectPreset = async (presetId: string) => {
    const preset = PRESET_SCENES.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(presetId);
    setGenre(preset.genre);
    setTone(preset.tone);

    try {
      setIsConverting(true);
      const res = await urlToBase64(preset.imageUrl);
      setSelectedImage(res.base64);
      setMimeType(res.mimeType);
    } catch (err) {
      console.error('Failed to load preset image:', err);
      // Fallback: set the URL directly as reference
      setSelectedImage(preset.imageUrl);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        setIsConverting(true);
        const res = await fileToBase64(file);
        setSelectedImage(res.base64);
        setMimeType(res.mimeType);
        setSelectedPresetId('');
      } catch (err) {
        console.error('Failed to process dropped image:', err);
      } finally {
        setIsConverting(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage || isLoading || isConverting) return;
    await onAnalyze({
      imageBase64: selectedImage,
      mimeType,
      genre,
      tone,
      pov,
      focus,
      customInstructions,
    });
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 lg:p-8 backdrop-blur shadow-2xl relative overflow-hidden">
      {/* Decorative ambient gradient */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Intro Headline */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Step 1: Inhabit the Scene</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-slate-100 tracking-wide">
            Upload an Image to Awaken a Story
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            The AI vision model will dissect the lighting, atmosphere, and sensory clues, then ghostwrite an arresting opening paragraph set deep inside this world.
          </p>
        </div>

        {/* Tab Switcher: Presets vs Custom Upload */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inspiration Presets (4)</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom Photo</span>
            </button>
          </div>
        </div>

        {/* Preset Cards Selection */}
        {activeTab === 'presets' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_SCENES.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`group text-left rounded-xl overflow-hidden border transition-all relative ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/10 scale-[1.02]'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="h-28 w-full overflow-hidden bg-slate-950 relative">
                    <img
                      src={preset.imageUrl}
                      alt={preset.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 rounded-full p-0.5 shadow">
                        <Sparkles className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 bg-slate-950/90">
                    <p className="text-xs font-semibold text-slate-200 truncate">{preset.name}</p>
                    <p className="text-[10px] text-amber-400/80 truncate mt-0.5">{preset.genre.split('/')[0]}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Upload Dropzone */}
        {activeTab === 'upload' && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-950/60 hover:bg-slate-950/90 rounded-2xl p-8 text-center cursor-pointer transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-colors">
              <Upload className="w-7 h-7" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-200">
              Drag & drop any photo, illustration, or landscape
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Supports PNG, JPG, WEBP (up to 20MB)
            </p>
          </div>
        )}

        {/* Image Preview & Active Selection Display */}
        {selectedImage && (
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-36 h-24 sm:w-44 sm:h-28 rounded-lg overflow-hidden border border-slate-800 flex-shrink-0 bg-slate-900">
              <img
                src={selectedImage}
                alt="Selected scene preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 right-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[10px] text-slate-400 flex items-center gap-1">
                <Eye className="w-2.5 h-2.5" />
                <span>Ready</span>
              </div>
            </div>

            <div className="flex-1 space-y-1.5 text-center sm:text-left">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs font-semibold text-slate-200">Active Scene Image</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Ready for Vision Analysis
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">
                {selectedPresetId
                  ? PRESET_SCENES.find((p) => p.id === selectedPresetId)?.description
                  : 'Custom image uploaded from your device. The AI will extract world elements, mood, and ghostwrite an opening.'}
              </p>
            </div>
          </div>
        )}

        {/* Narrative Styling Controls */}
        <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Story Direction & Atmosphere</span>
            </div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              {showAdvanced ? 'Hide Customization' : 'Customize Style'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Story Genre & Setting Lore
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {GENRE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Emotional Tone & Atmosphere
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {TONE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showAdvanced && (
            <div className="space-y-3 pt-3 border-t border-slate-800/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Narrative Point of View
                  </label>
                  <select
                    value={pov}
                    onChange={(e) => setPov(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Third-Person Limited">Third-Person Limited (Deep In-World)</option>
                    <option value="First-Person Intimate">First-Person Intimate ("I smelled the brine...")</option>
                    <option value="Omniscient Cinematic">Omniscient Cinematic (Sweeping World Scope)</option>
                    <option value="Second-Person Unsettling">Second-Person Unsettling ("You step onto the crags...")</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Opening Focus
                  </label>
                  <select
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Sensory atmosphere, worldbuilding texture, and hidden danger">
                      Sensory Atmosphere & Environmental Texture
                    </option>
                    <option value="Character dilemma and urgent internal crisis">
                      Character Dilemma & Internal State
                    </option>
                    <option value="Immediate peril, tension, and ticking clock">
                      Immediate Peril & Suspense
                    </option>
                    <option value="Mysterious artifact, riddle, or ancient secret">
                      Ancient Secret & Cryptic Artifact
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Custom Premise / Author Directives (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. The character is fleeing the royal inquisitors; or a strange bell rings at midnight..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Primary CTA */}
        <div className="pt-2 text-center">
          <button
            onClick={handleSubmit}
            disabled={!selectedImage || isLoading || isConverting}
            className={`w-full sm:w-auto min-w-[280px] px-8 py-3.5 rounded-xl font-medium text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 mx-auto ${
              !selectedImage || isLoading || isConverting
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-slate-950 font-semibold hover:from-amber-400 hover:to-orange-500 border border-amber-400 shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                <span>Analyzing Scene & Ghostwriting with Gemini Pro...</span>
              </>
            ) : isConverting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                <span>Preparing Image...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Ghostwrite Story from this Image</span>
              </>
            )}
          </button>
          <p className="mt-2 text-[11px] text-slate-500">
            Powered by <strong className="font-mono text-cyan-400">gemini-3.1-pro-preview</strong> vision architecture
          </p>
        </div>
      </div>
    </div>
  );
};
