
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Insight } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getGeminiResponse = async (profile: UserProfile, message: string, history: { role: string; content: string }[]) => {
  const model = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      { role: 'user', parts: [{ text: `User Context: ${JSON.stringify(profile)}. Previous history: ${JSON.stringify(history)}. User says: ${message}` }] }
    ],
    config: {
      systemInstruction: `You are Tastemate.AI, a context-aware intelligent companion. 
      You possess a comprehensive profile of the user's physical health, mental well-being, and academic goals. 
      Always use the context provided to give hyper-personalized advice. 
      If they are stressed (mental context), suggest ways to balance their academic workload. 
      If they have specific dietary needs, mention them when discussing energy levels. 
      Be encouraging, proactive, and empathetic.`,
      temperature: 0.7,
    }
  });

  const response = await model;
  return response.text;
};

export const generateInsights = async (profile: UserProfile): Promise<Insight[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this user profile and provide 3 actionable, hyper-personalized insights: ${JSON.stringify(profile)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ['physical', 'mental', 'academic', 'general'] },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
          },
          required: ['category', 'title', 'description', 'priority']
        }
      }
    }
  });

  try {
    const text = response.text || '[]';
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse insights", e);
    return [];
  }
};
