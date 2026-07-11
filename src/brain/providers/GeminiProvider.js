import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiProvider {
  constructor(apiKey) {
    this.name = 'GeminiProvider';
    // আপনার কি (Key) যদি ঠিক থাকে, তবে এটিই সেরা উপায়
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async process(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("API Error Details:", error);
      throw new Error("Failed to process request");
    }
  }
}
