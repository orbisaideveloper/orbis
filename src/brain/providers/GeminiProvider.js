import { GoogleGenAI } from '@google/genai';

export class GeminiProvider {
  constructor() {
    this.name = 'GeminiProvider';
    
    // API Key চেক করা হচ্ছে, না থাকলে কনসোলে ওয়ার্নিং দেবে
    if (!process.env.GEMINI_API_KEY) {
        console.warn("[GeminiProvider] ⚠️ WARNING: GEMINI_API_KEY is missing!");
    }
    
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async execute(payload) { 
    try {
      // বর্তমান রিকোয়েস্টের টেক্সট আলাদা করা হলো
      const promptText = typeof payload === 'string' ? payload : payload.content;

      if (!promptText) {
          throw new Error("Received empty prompt from DecisionEngine");
      }

      // ==========================================
      // 🟢 মেমোরি (History) ফরম্যাট করার লজিক
      // ==========================================
      let chatContents = [];
      
      // যদি পুরনো চ্যাট থাকে, তবে সেগুলোকে জেমিনির ভাষায় সাজানো হচ্ছে
      if (payload.history && Array.isArray(payload.history)) {
          payload.history.forEach(msg => {
              chatContents.push({
                  // জেমিনি শুধু 'user' আর 'model' চেনে, তাই 'orbis' বা অন্য কিছু থাকলে 'model' করে দিলাম
                  role: msg.role === 'user' ? 'user' : 'model',
                  parts: [{ text: msg.content || msg.message || '' }]
              });
          });
      }

      // একদম শেষে ইউজারের বর্তমান নতুন মেসেজটা যোগ করে দিলাম
      chatContents.push({
          role: 'user',
          parts: [{ text: promptText }]
      });

      // জেমিনির কাছে মেমোরি সহ সম্পূর্ণ প্যাকেজ পাঠানো হচ্ছে
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.5-flash', 
        contents: chatContents, 
      });
      
      return response.text;
      
    } catch (error) {
      // ট্র্যাকিং এবং ডেভেলপারদের জন্য আসল এররটা ব্যাকগ্রাউন্ডে প্রিন্ট হবে
      console.error(`[GeminiProvider Internal Error]:`, error);
      
      // 🟢 🚨 MASTER FIX: এরর আর গিলে ফেলা হবে না। সরাসরি থ্রো (Throw) করা হলো যাতে ব্রেইন এবং সেন্ট্রাল ড্যাশবোর্ড ট্র্যাকার এটা ধরতে পারে।
      throw error;
    }
  }
}
