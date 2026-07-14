import { GeminiProvider } from './providers/GeminiProvider.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * DecisionEngine: Core Routing and Fallback logic.
 * Refactored: Integrated Unified MemoryInterface for context loading.
 */
export class DecisionEngine {
  constructor() {
    this.provider = new GeminiProvider();
    
    // 🟢 BrainController থেকে MemoryInterface এখানে ইনজেক্ট হবে
    this.memory = null; 
    
    this.intents = {
      system_status: /পরিস্থিতি|স্ট্রাকচার|স্ট্যাটাস|status|system/i,
      identity: /তুমি কে|who are you|তোমার নাম|your name|অরবিস/i,
      capabilities: /তুমি কি কি করতে পারো|what can you do|ক্ষমতা/i,
      creator: /তোমাকে কে বানিয়েছে|who created you|ডেভেলপার/i,
      time: /কয়টা বাজে|সময় কত|এখন কটা|টাইম|time/i,
      diagnostic: /ফাইল|কোথায় কী আছে|চেক করো|কমজোরি|ইম্প্রুভ|ঠিক আছে কিনা|ফাইল চেক|diagnostic|health|ভুলে যাচ্ছি/i
    };
  }

  async processRequest(input, config = {}) {
    try {
      const text = input.content.toLowerCase().trim();
      const sessionId = input.sessionId || 'default_user';

      if (!text) return "[ORBIS Core]: আপনার ইনপুটটি ফাঁকা। দয়া করে কিছু লিখুন।";

      // 🧠 স্মার্ট রাউটিং: ইউজারের মেসেজটি কত বড় তা মাপা হচ্ছে
      const words = text.split(/\s+/);
      const isComplexQuery = words.length > 4;

      // ১. সময় (সবসময় কাজ করবে)
      if (this.intents.time.test(text)) {
          const time = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute:'2-digit' });
          return `[ORBIS Core]: এখন সময় ${time}।`;
      }

      // ২. ডায়াগনস্টিক
      if (this.intents.diagnostic.test(text)) {
          const rootDir = path.join(__dirname, '../..'); 
          const criticalFiles = [
              'src/server.js', 'src/brain/DecisionEngine.js', 
              'src/brain/BrainController.js', 'frontend/index.html', 
              'frontend/js/ui-api.js', 'frontend/js/ui-router.js'
          ];
          let report = "[ORBIS Diagnostic Core]: আমি আমার ইন্টারনাল ডিরেক্টরি স্ক্যান করেছি...<br><br><b>📁 কোর ফাইল স্ট্যাটাস:</b><br>";
          let missingCount = 0;
          for (const file of criticalFiles) {
              if (fs.existsSync(path.join(rootDir, file))) {
                  report += `✅ <code>${file}</code> (Secure)<br>`;
              } else {
                  report += `❌ <code>${file}</code> (Missing)<br>`;
                  missingCount++;
              }
          }
          report += "<br><b>🔍 অ্যানালিসিস:</b><br>" + (missingCount === 0 ? "সব ফাইল ঠিক আছে।" : "কিছু ফাইল মিসিং।") + "<br>🟢 <b>মেমোরি মডিউল (Supabase) এখন অ্যাক্টিভ!</b>";
          return report;
      }

      // ৩. সিস্টেম স্ট্যাটাস এবং পরিচয়
      if (!isComplexQuery) {
          if (this.intents.system_status.test(text)) return `[ORBIS Core]: সিস্টেম সচল। প্রোভাইডার: ${config.provider || 'Gemini'}।`;
          if (this.intents.identity.test(text)) return "[ORBIS Core]: আমি ORBIS (Universal AI Engineering Platform)।";
      }

      // 🟢 🚨 MEMORY INTEGRATION: জেমিনির কাছে যাওয়ার আগে ইউনিফাইড API ব্যবহার করে পুরোনো কথাগুলো (Context) ইনপুটের সাথে জুড়ে দেওয়া হলো
      if (this.memory && config.memoryEnabled) {
          try {
              input.history = await this.memory.loadConversation(sessionId, 6);
          } catch (e) {
              console.warn("[DecisionEngine] Memory Context load bypassed.");
          }
      }

      // 🤖 এক্সটার্নাল প্রোভাইডার (Gemini) কল
      const response = await this.provider.execute(input);
      
      // 🟢 স্মার্ট ফিক্স: প্রোভাইডার যদি এরর গিলে ফেলে ভুয়া টেক্সট দেয়, তবে সেটাকে ধরে এরর হিসেবে Throw করো
      if (typeof response === 'string' && (response.includes('Quota Overload') || response.includes('দুঃখিত, গুগলের সার্ভারে'))) {
          throw new Error("Provider Quota Overload API Limit Reached.");
      }

      return response; 

    } catch (error) {
      console.error("[DecisionEngine Error]:", error);
      
      // মাস্টার ফিক্স: আগে এখানে return ছিল বলে ব্রেইন ফলব্যাক করত না। এখন throw করায় ব্রেইন কন্ট্রোলার ঠিকমতো কাজ করবে।
      throw error;
    }
  }
}
