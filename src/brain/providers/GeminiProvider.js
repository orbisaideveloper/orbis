import { GoogleGenAI } from '@google/genai';

export class GeminiProvider {
  constructor(apiKey) {
    this.name = 'GeminiProvider';
    // গুগলের নতুন SDK ইনিশিয়ালাইজ করা হচ্ছে
    this.ai = new GoogleGenAI({ apiKey: apiKey });
  }

  async process(prompt) {
    try {
      // আমরা লেটেস্ট gemini-2.5-flash মডেল ব্যবহার করছি
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("[Gemini Error]", error);
      throw new Error("Failed to process request via Gemini API");
    }
  }
}
