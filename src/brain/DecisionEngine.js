import { GeminiProvider } from './providers/GeminiProvider.js';

export class DecisionEngine {
  constructor() {
    this.provider = new GeminiProvider();
    
    // ==========================================
    // 🧠 অ্যাডভান্সড ইন্টেন্ট রিকগনিশন (Regex Patterns)
    // ==========================================
    this.intents = {
      system_status: /পরিস্থিতি|স্ট্রাকচার|স্ট্যাটাস|status|system/i,
      identity: /তুমি কে|who are you|তোমার নাম|your name|অরবিস/i,
      capabilities: /তুমি কি কি করতে পারো|what can you do|ক্ষমতা/i,
      creator: /তোমাকে কে বানিয়েছে|who created you|ডেভেলপার/i
    };
  }

  // ব্রেন কন্ট্রোলার থেকে payload এবং config দুটোই রিসিভ করবে
  async processRequest(input, config = {}) {
    try {
      const text = input.content.toLowerCase().trim();

      if (!text) {
         return "[ORBIS Core]: আপনার ইনপুটটি ফাঁকা। দয়া করে কিছু লিখুন।";
      }

      console.log(`[Brain]: Analyzing intent for: "${text}"`);

      // ==========================================
      // ⚡ ইন্টারনাল কগনিটিভ রাউটিং (ORBIS Core Logic)
      // ==========================================
      
      if (this.intents.system_status.test(text)) {
         return `[ORBIS Core]: সিস্টেম সম্পূর্ণ সচল। রাউটার, ব্রেন কন্ট্রোলার এবং ডিসিশন ইঞ্জিন সিঙ্কড। বর্তমান প্রোভাইডার: ${config.provider || 'Gemini'}। মেমোরি স্ট্যাটাস: ${config.memoryEnabled ? 'Active' : 'Inactive'}।`;
      }

      if (this.intents.identity.test(text)) {
         return "[ORBIS Core]: আমি ORBIS (Universal AI Engineering Platform)। আমি কোনো সাধারণ চ্যাটবট নই, আমি একটি সেন্ট্রালাইজড এআই ব্রেন যা বিভিন্ন এআই মডেলকে নিয়ন্ত্রণ এবং পরিচালনা করতে সক্ষম।";
      }

      if (this.intents.capabilities.test(text)) {
          return "[ORBIS Core]: আমি ডিসিশন মেকিং, সিস্টেম টেলিমেট্রি অ্যানালিসিস এবং এক্সটার্নাল এপিআই রাউটিং করতে পারি। আমার বর্তমান ইঞ্জিন স্ট্রাকচার লেগো (LEGO) আর্কিটেকচারে তৈরি, যা আমাকে যেকোনো নতুন সিস্টেমের সাথে যুক্ত হতে সাহায্য করে।";
      }

      if (this.intents.creator.test(text)) {
          return "[ORBIS Core]: আমাকে ORBIS AI Developer প্ল্যাটফর্মের অধীনে ডেভেলপ করা হয়েছে একটি মডুলার এআই ইঞ্জিন হিসেবে।";
      }

      // ==========================================
      // 🌐 এক্সটার্নাল প্রোভাইডার হ্যান্ডঅফ (Gemini API)
      // ==========================================
      console.log("[Brain]: Intent external. Routing to Gemini Provider...");
      
      const response = await this.provider.execute(input);
      return response; 

    } catch (error) {
      console.error("[DecisionEngine Error]:", error);
      return "[ORBIS Core Error]: সিস্টেমে একটি টেকনিক্যাল এরর হয়েছে। ব্রেন ইঞ্জিন রিকোয়েস্ট প্রসেস করতে ব্যর্থ হয়েছে।";
    }
  }
}
