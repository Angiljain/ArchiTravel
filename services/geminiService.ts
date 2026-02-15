
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { LandmarkInfo, AppLanguage } from "../types";

// Base64 helpers as required by guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const analyzeLandmark = async (base64Image: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const base64Data = base64Image.split(',')[1];
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
        { text: "Identify the main landmark in this image. Only provide the name of the landmark in English. If not a landmark, say 'Unknown'." }
      ]
    }
  });

  return response.text?.trim() || 'Unknown';
};

export const fetchLandmarkHistory = async (landmarkName: string, language: AppLanguage): Promise<LandmarkInfo> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tell me about the landmark "${landmarkName}". provide all output strictly in ${language}. I need its location, year built, architect, a brief historical summary (150 words), and 3 specific points of interest with coordinates (x, y as percentage 0-100) for an AR overlay.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          location: { type: Type.STRING },
          yearBuilt: { type: Type.STRING },
          architect: { type: Type.STRING },
          briefHistory: { type: Type.STRING },
          tags: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                label: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["x", "y", "label", "description"]
            }
          }
        },
        required: ["name", "location", "yearBuilt", "architect", "briefHistory", "tags"]
      }
    }
  });

  const rawData = JSON.parse(response.text || '{}');
  const searchSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter((chunk: any) => chunk.web)
    ?.map((chunk: any) => ({
      title: chunk.web.title,
      uri: chunk.web.uri
    })) || [];

  return { ...rawData, searchSources };
};

export const generateNarration = async (text: string, language: AppLanguage): Promise<AudioBuffer> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Narrate this history in ${language} like a professional tour guide with an enthusiastic tone: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Audio generation failed");

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const buffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
  return buffer;
};
