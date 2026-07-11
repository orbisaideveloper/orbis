import { GoogleGenAI } from "@google/genai";

export class GeminiProvider {
  constructor(apiKey) {
    this.name = 'GeminiProvider';
    // নতুন SDK ব্যবহার করা হচ্ছে
    this.client = new GoogleGenAI({ apiKey: apiKey });
  }

  async process(prompt) {
    try {
      const response = await this.client.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to process request");
    }
  }
}
