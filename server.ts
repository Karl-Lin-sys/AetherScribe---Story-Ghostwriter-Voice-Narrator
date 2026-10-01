import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const storyResponseSchema = {
  type: Type.OBJECT,
  properties: {
    sceneBreakdown: {
      type: Type.OBJECT,
      properties: {
        visualElements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Key physical objects, architecture, figures, and focal points in the scene',
        },
        lightingAndAtmosphere: {
          type: Type.STRING,
          description: 'Lighting conditions, shadows, luminescence, weather, and ambient particles',
        },
        sensoryDetails: {
          type: Type.OBJECT,
          properties: {
            visual: { type: Type.STRING, description: 'Dominant visual textures and contrasts' },
            auditory: { type: Type.STRING, description: 'Inferred sounds, echoes, or haunting silences' },
            tactileOrOlfactory: { type: Type.STRING, description: 'Temperature, moisture, smells, or physical sensations' },
          },
          required: ['visual', 'auditory', 'tactileOrOlfactory'],
        },
        environmentalLore: {
          type: Type.STRING,
          description: 'Implied history, civilization traces, or living world context suggested by the scene',
        },
      },
      required: ['visualElements', 'lightingAndAtmosphere', 'sensoryDetails', 'environmentalLore'],
    },
    moodAnalysis: {
      type: Type.OBJECT,
      properties: {
        primaryMood: { type: Type.STRING, description: 'Core emotional tone (e.g. Melancholic Foreboding, Electric Wonder)' },
        emotionalResonance: { type: Type.STRING, description: 'How the scene makes the observer feel' },
        colorPaletteVibe: { type: Type.STRING, description: 'Color harmony and emotional weight of hues' },
        underlyingTension: { type: Type.STRING, description: 'The hidden conflict or unspoken danger lingering in the scene' },
      },
      required: ['primaryMood', 'emotionalResonance', 'colorPaletteVibe', 'underlyingTension'],
    },
    ghostwrittenStory: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'An evocative, literary title for the story' },
        openingHook: { type: Type.STRING, description: 'Arresting first 1-2 sentences that seize attention immediately' },
        openingParagraph: {
          type: Type.STRING,
          description: 'A masterfully written, rich opening paragraph (~150-250 words) set in this world, steeped in sensory immersion, rhythm, and mood',
        },
        continuedExposition: {
          type: Type.STRING,
          description: 'A seamless second paragraph expanding the world, character perspective, or immediate stakes',
        },
      },
      required: ['title', 'openingHook', 'openingParagraph', 'continuedExposition'],
    },
    storyHooks: {
      type: Type.OBJECT,
      properties: {
        protagonistIdea: { type: Type.STRING, description: 'Compelling protagonist who belongs in or opposes this setting' },
        incitingIncident: { type: Type.STRING, description: 'An event or discovery that disrupts the status quo' },
        centralDilemma: { type: Type.STRING, description: 'The moral, survival, or emotional crisis at play' },
        continuationPrompts: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3 provocative creative directions or questions for what should happen next in this story',
        },
      },
      required: ['protagonistIdea', 'incitingIncident', 'centralDilemma', 'continuationPrompts'],
    },
  },
  required: ['sceneBreakdown', 'moodAnalysis', 'ghostwrittenStory', 'storyHooks'],
};

// 1. Image Analysis & Story Ghostwriting Route
// Required model: gemini-3.1-pro-preview for image understanding
app.post('/api/analyze-and-write', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', genre, tone, pov, focus, customInstructions } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'Image data is required' });
      return;
    }

    // Strip data URI prefix if present
    const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');

    const ai = getGeminiClient();

    const promptText = `
You are a master ghostwriter and literary critic known for arresting imagery, sensory prose, and profound atmospheric worldbuilding.
Examine this image with deep creative acuity.

Genre Target: ${genre || 'Atmospheric Speculative / Cinematic Fiction'}
Mood & Tone Target: ${tone || 'Evocative, Immersive, Lyrical with underlying tension'}
Point of View: ${pov || 'Third-Person Limited'}
Focus Emphasis: ${focus || 'Sensory atmosphere, worldbuilding texture, and immediate emotional hook'}
${customInstructions ? `Additional Author Directives: ${customInstructions}` : ''}

Tasks:
1. Conduct an in-depth breakdown of the visual scene: identify key architectural or natural elements, lighting, tactile textures, atmospheric particles, and environmental lore.
2. Analyze the emotional and psychic mood: identify primary mood, color resonance, and unspoken tension.
3. Ghostwrite a breathtaking, original opening story set in this exact world. It must not merely describe the picture as a spectator, but inhabit the world from within. Establish a visceral sense of place, sensory immersion (sounds, air, scents, shadows), and a compelling narrative pull.
4. Provide creative story continuation seeds: protagonist concept, inciting incident, and 3 provocative directions.

Respond strictly following the requested JSON structure.
`;

    let response;
    // Primary model as required: gemini-3.1-pro-preview
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: promptText,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: storyResponseSchema,
          systemInstruction: 'You are an acclaimed novelist and ghostwriter. Write prose with literary elegance, sharp sensory clarity, and rich cinematic rhythm. Avoid clichés, overly purple prose, and robotic exposition.',
        },
      });
    } catch (primaryError: any) {
      console.warn('Primary model gemini-3.1-pro-preview encountered error, attempting fallback to gemini-3.8-flash:', primaryError?.message);
      // Resilient fallback to gemini-3.8-flash
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: promptText,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: storyResponseSchema,
        },
      });
    }

    const rawText = response.text || '{}';
    const parsedData = JSON.parse(rawText);

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error analyzing image and ghostwriting story:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze image and generate story',
    });
  }
});

// 2. Text-to-Speech Route
// Required model: gemini-3.8-flash-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Charon', style = 'Atmospheric, emotive audiobook narrator with dramatic pauses and vivid cadence' } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }

    // Limit text length if extremely long to avoid audio timeouts
    const trimmedText = text.trim().slice(0, 1500);

    const ai = getGeminiClient();

    let audioBase64: string | undefined;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: trimmedText,
                speechMetadata: {
                  style: style || 'Clear, expressive, cinematic audiobook narrator',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || 'Charon' },
            },
          },
        },
      });

      audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (ttsErr: any) {
      console.warn('gemini-3.8-flash-tts error, attempting fallback to gemini-3.8-flash-lite-tts:', ttsErr?.message);
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: trimmedText,
                speechMetadata: {
                  style: style || 'Clear, expressive, cinematic audiobook narrator',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || 'Charon' },
            },
          },
        },
      });
      audioBase64 = fallbackResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    }

    if (!audioBase64) {
      res.status(500).json({ error: 'No audio data was returned by the voice model' });
      return;
    }

    res.json({
      success: true,
      audioBase64,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Error generating speech:', error);
    res.status(500).json({
      error: error.message || 'Failed to synthesize speech',
    });
  }
});

// 3. Multi-turn Chat Route
// Required models: gemini-3.1-pro-preview for complex tasks, gemini-3.5-flash for general, gemini-3.1-flash-lite for fast
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, storyContext, modelPreference = 'gemini-3.5-flash' } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    // Validate selected model from required options
    const allowedModels = ['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
    const selectedModel = allowedModels.includes(modelPreference) ? modelPreference : 'gemini-3.5-flash';

    const ai = getGeminiClient();

    const systemInstruction = `You are "The Ghostwriter's Muse", a world-class literary editor, narrative architect, and creative co-writer.
You are actively collaborating with the author to expand, refine, and continue the story set in the uploaded scene.

CURRENT STORY CONTEXT:
- Title: "${storyContext?.title || 'Untitled'}"
- Genre: "${storyContext?.genre || 'Speculative / Literary'}"
- Primary Mood: "${storyContext?.mood || 'Atmospheric'}"
- Current Story Draft:
${storyContext?.currentStory || 'No draft text yet.'}

- Scene Details:
${storyContext?.imageAnalysis || 'Atmospheric world'}

YOUR CAPABILITIES & ROLE:
1. Provide evocative prose suggestions that seamlessly match the existing voice and tone.
2. Brainstorm unexpected plot turns, character choices, sensory details, and world lore.
3. If the user asks for a new paragraph or continuation, write polished, vivid paragraphs ready to be inserted directly into the story.
4. Offer feedback on pacing, emotional resonance, and dramatic tension.
5. Keep your tone encouraging, insightful, and steeped in writerly craft. When drafting prose, format it clearly with blockquotes or markdown so it stands out from conversational commentary.`;

    // Map conversation messages to GenAI contents structure
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    let response;
    try {
      response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction,
        },
      });
    } catch (err: any) {
      console.warn(`Chat model ${selectedModel} failed, trying fallback to gemini-3.8-flash:`, err?.message);
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });
    }

    res.json({
      success: true,
      text: response.text || '',
      modelUsed: selectedModel,
    });
  } catch (error: any) {
    console.error('Error in chat route:', error);
    res.status(500).json({
      error: error.message || 'Failed to process chat message',
    });
  }
});

// Setup Vite in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
