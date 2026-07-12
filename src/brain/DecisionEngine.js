// src/brain/DecisionEngine.js
import { GeminiProvider } from './providers/GeminiProvider.js';

export class DecisionEngine {
  constructor() {
    // এখন আর MockProvider নয়, সরাসরি জেমিনি কানেক্টেড
    this.provider = new GeminiProvider();
  }

  async processRequest(input) {
    try {
      // জেমিনি প্রোভাইডারের execute মেথড কল করা হচ্ছে
      const response = await this.provider.execute(input);
      
      // জেমিনি থেকে আসা টেক্সট রিটার্ন করছি
      return response; 
    } catch (error) {
      console.error("DecisionEngine Error:", error);
      throw new Error("DecisionEngine could not complete the request.");
    }
  }
}
