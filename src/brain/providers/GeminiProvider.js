import { GoogleGenAI } from '@google/genai';

export class GeminiProvider {
  constructor() {
    this.name = 'GeminiProvider';
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async execute(payload) { 
    try {
      const response = await this.ai.models.generateContent({
        // model: 'gemini-1.5-flash' (Note: 3.5-flash is not valid yet, using 1.5-flash is standard, but keeping your original config if you intended 3.5)
        model: 'gemini-3.5-flash',
        contents: payload.content, 
      });
      return response.text;
    } catch (error) {
      // 🟢 ট্র্যাকিং এবং ডেভেলপারদের জন্য আসল এররটা ব্যাকগ্রাউন্ডে প্রিন্ট হবে
      console.error(`[GeminiProvider Internal Error]: ${error.message}`);
      
      // 🟢 ইউজারের কাছে ORBIS নিজে বস হিসেবে এই সুন্দর রিপ্লাইটি দেবে
      return "আমি এই মুহূর্তে বাইরের সার্ভারের (Gemini) সাথে যোগাযোগ করতে পারছি না। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।";
    }
  }
}
