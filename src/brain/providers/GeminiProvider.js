import { GoogleGenAI } from '@google/genai';

export class GeminiProvider {
  constructor() {
    this.name = 'GeminiProvider';
    // রেন্ডারের এনভায়রনমেন্ট থেকে কি-টি নিচ্ছে
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async execute(payload) { // আমরা 'process' এর বদলে 'execute' ব্যবহার করব
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: payload.content, // payload থেকে কন্টেন্ট নিচ্ছে
      });
      return response.text;
    } catch (error) {
      console.error("Gemini GenAI Error:", error);
      throw new Error("Gemini Provider failed to process request");
    }
  }
}
