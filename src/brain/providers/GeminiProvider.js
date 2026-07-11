import { GoogleGenAI } from '@google/genai';

export class GeminiProvider {
  constructor(apiKey) {
    this.name = 'GeminiProvider';
    // গুগলের নতুন SDK-এর ইনিশিয়ালাইজেশন
    this.ai = new GoogleGenAI({ apiKey: apiKey });
  }

  async process(prompt) {
    try {
      const response = await this.ai.models.generateContent({
        // নতুন এবং লেটেস্ট মডেল যা আপনার AQ চাবির সাথে পারফেক্টলি কাজ করবে
        model: 'gemini-3.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini GenAI Error:", error);
      throw new Error("Failed to process request");
    }
  }
}
