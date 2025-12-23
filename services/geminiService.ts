import { GoogleGenAI } from "@google/genai";
import { Emotion, Letter } from '../types';

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateReflectivePrompt = async (emotion: Emotion, context?: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "What is weighing on your heart today? Write it down to let it go.";
  }

  try {
    let prompt = `You are a gentle, poetic therapist. Generate a single, short (under 20 words) reflective writing prompt for someone feeling "${emotion}". It should encourage them to write a letter to release this feeling. Do not use quotes.`;
    
    if (context && context.length > 10) {
        prompt += `\n\nContext from their current writing: "${context.substring(0, 300)}..."`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text?.trim() || "Write to release what you are holding.";
  } catch (error) {
    console.error("Error generating prompt:", error);
    return "Write whatever comes to your mind. Let it flow like water.";
  }
};

export const detectEmotionFromText = async (text: string): Promise<Emotion | null> => {
  const ai = getAiClient();
  if (!ai || !text.trim()) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following text and categorize it into exactly one of these emotions: ${Object.values(Emotion).join(', ')}. Return ONLY the emotion name. Text: "${text.substring(0, 1000)}"`,
    });
    
    const result = response.text?.trim();
    const matched = Object.values(Emotion).find(e => e.toLowerCase() === result?.toLowerCase());
    return matched || null;
  } catch (error) {
    console.error("Error detecting emotion:", error);
    return null;
  }
};

export const poetifyText = async (text: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai || !text.trim()) return text;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rewrite the following text to be more poetic, metaphorical, and emotional, keeping the original core meaning. Keep it roughly the same length. Text: "${text}"`,
    });
    
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Error poetifying text:", error);
    return text;
  }
};

export const generateVaultInsights = async (letters: Letter[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai || letters.length === 0) return "The stars are silent. Write more to hear their whispers.";

  try {
    const recent = letters.slice(0, 10).map(l => `[${l.emotion}]: ${l.content.substring(0, 100)}...`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these recent journal entries/letters from a user. Provide a gentle, 2-sentence poetic insight about the user's recent emotional journey. Speak directly to them. Entries:\n${recent}`,
    });
    
    return response.text?.trim() || "Your journey is unique. Keep writing to discover more.";
  } catch (error) {
    console.error("Error generating insights:", error);
    return "The stars are clouded today.";
  }
};

export const generateDailyPrompt = async (): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "What words would you release today?";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: "Generate a short, poetic, daily question (under 10 words) asking the user what they want to let go of today. No quotes.",
        });
        return response.text?.trim() || "What words would you release today?";
    } catch (e) {
        return "What words would you release today?";
    }
}

export const generateAnonymousWhisper = async (): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "I hope tomorrow is brighter...";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: "Write a very short (under 10 words), anonymous, poetic confession or wish that someone might release into the sky. Examples: 'I miss who we were', 'Forgiving myself slowly', 'Hoping for rain'. No quotes.",
        });
        return response.text?.trim() || "Someone is listening.";
    } catch (e) {
        return "The sky holds our secrets.";
    }
}
