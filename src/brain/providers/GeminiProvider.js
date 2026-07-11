import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiProvider {
  constructor(apiKey) {
    this.name = 'GeminiProvider';
    // আপনার API Key রেন্ডারের এনভায়রনমেন্ট থেকে এখানে আসছে
    this.genAI = new GoogleGenerativeAI(apiKey);
    // এটি সবচেয়ে স্টেবল মডেল, এটিই ব্যবহার করুন
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async process(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Gemini Error:", error);
      throw new Error("Failed to process request");
    }
  }
}
