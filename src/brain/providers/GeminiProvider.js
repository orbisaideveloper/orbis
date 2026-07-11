import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiProvider {
  constructor(apiKey) {
    // এখানে আমরা সরাসরি আপনার API Key ব্যবহার করছি
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async process(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      // এই এররটিই আমাদের বলে দেবে কী সমস্যা
      console.error("Gemini Error:", error.message);
      return "Error: Could not connect to Gemini.";
    }
  }
}
