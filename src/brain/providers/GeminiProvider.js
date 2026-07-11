import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiProvider {
  constructor(apiKey) {
    this.name = 'GeminiProvider';
    // নতুন জেনারেশনের এপিআই কী-এর জন্য flash-latest মডেলটি সবচেয়ে স্টেবল
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  }

  async process(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Gemini Provider Error:", error);
      throw new Error("Failed to process request");
    }
  }
}
