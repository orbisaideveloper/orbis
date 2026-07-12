import { GoogleGenAI } from '@google/genai';

export class GeminiProvider {
  constructor() {
    this.name = 'GeminiProvider';
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async execute(payload) { 
    try {
      // 🟢 FIX: ডেটা যেভাবেই আসুক (Object বা String), সেটাকে ঠিকমতো রিসিভ করার লজিক
      const promptText = typeof payload === 'string' ? payload : payload.content;

      if (!promptText) {
          throw new Error("Received empty prompt from DecisionEngine");
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-3.5-flash', // 🟢 আপনার লেটেস্ট মডেলটাই থাকল!
        contents: promptText, 
      });
      return response.text;
      
    } catch (error) {
      // ট্র্যাকিং এবং ডেভেলপারদের জন্য আসল এররটা ব্যাকগ্রাউন্ডে প্রিন্ট হবে
      console.error(`[GeminiProvider Internal Error]: ${error.message}`);
      
      // ইউজারের কাছে ORBIS নিজে বস হিসেবে এই সুন্দর রিপ্লাইটি দেবে
      return "আমি এই মুহূর্তে বাইরের সার্ভারের (Gemini) সাথে যোগাযোগ করতে পারছি না। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।";
    }
  }
}
