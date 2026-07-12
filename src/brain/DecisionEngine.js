import { GeminiProvider } from './providers/GeminiProvider.js';
// Node.js এর ফাইল সিস্টেম (fs) মডিউল ইমপোর্ট করা হলো, যাতে অরবিস নিজের ফাইল দেখতে পারে
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DecisionEngine {
  constructor() {
    this.provider = new GeminiProvider();
    
    // ==========================================
    // 🧠 অ্যাডভান্সড ইন্টেন্ট রিকগনিশন
    // ==========================================
    this.intents = {
      system_status: /পরিস্থিতি|স্ট্রাকচার|স্ট্যাটাস|status|system/i,
      identity: /তুমি কে|who are you|তোমার নাম|your name|অরবিস/i,
      capabilities: /তুমি কি কি করতে পারো|what can you do|ক্ষমতা/i,
      creator: /তোমাকে কে বানিয়েছে|who created you|ডেভেলপার/i,
      
      // নতুন: রিয়েল-টাইম সময়
      time: /কয়টা বাজে|সময় কত|এখন কটা|টাইম|time/i,
      
      // নতুন: সেলফ-ডায়াগনস্টিক (ফাইল চেক এবং কমজোরি বের করা)
      diagnostic: /ফাইল|কোথায় কী আছে|চেক করো|কমজোরি|ইম্প্রুভ|ঠিক আছে কিনা|ফাইল চেক|diagnostic|health|ভুলে যাচ্ছি/i
    };
  }

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
      
      // ১. রিয়েল-টাইম সময় বলা (সরাসরি সার্ভার থেকে)
      if (this.intents.time.test(text)) {
          // ভারতের শিলিগুড়ি/কলকাতা টাইমজোন অনুযায়ী সময়
          const time = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute:'2-digit' });
          return `[ORBIS Core]: এখন সময় ${time}।`;
      }

      // ২. সেলফ-ডায়াগনস্টিক (নিজের ফাইল নিজে স্ক্যান করা)
      if (this.intents.diagnostic.test(text)) {
          // রুট ফোল্ডার বের করা
          const rootDir = path.join(__dirname, '../..'); 
          
          // অরবিস যে ফাইলগুলো চেক করবে
          const criticalFiles = [
              'src/server.js',
              'src/brain/DecisionEngine.js',
              'src/brain/BrainController.js',
              'frontend/index.html',
              'frontend/js/ui-api.js',
              'frontend/js/ui-router.js'
          ];

          let report = "[ORBIS Diagnostic Core]: আমি আমার ইন্টারনাল ডিরেক্টরি স্ক্যান করেছি...<br><br><b>📁 কোর ফাইল স্ট্যাটাস:</b><br>";
          let missingCount = 0;

          // লুপ চালিয়ে ফাইলগুলো খুঁজছে
          for (const file of criticalFiles) {
              const fullPath = path.join(rootDir, file);
              if (fs.existsSync(fullPath)) {
                  report += `✅ <code>${file}</code> (Secure)<br>`;
              } else {
                  report += `❌ <code>${file}</code> (Missing/Error)<br>`;
                  missingCount++;
              }
          }

          report += "<br><b>🔍 অ্যানালিসিস ও কমজোরি (Weaknesses):</b><br>";
          
          if (missingCount === 0) {
              report += "- <b>ফাইল ইন্টিগ্রিটি:</b> চমৎকার! আমার সব কোর ফাইল সঠিক জায়গায় আছে, আপনি কিছুই হারাননি।<br>";
          } else {
              report += "- <b>ফাইল ইন্টিগ্রিটি:</b> সতর্কতা! কিছু কোর ফাইল মিসিং। সিস্টেম ঠিকমতো কাজ নাও করতে পারে।<br>";
          }
          
          report += "- <b>বর্তমান কমজোরি:</b> আমার 'লং-টার্ম মেমোরি' এখনো তৈরি হয়নি। আমি আগের মেসেজ মনে রাখতে পারছি না।<br>";
          report += "- <b>ইম্প্রুভমেন্ট সাজেশন:</b> মেমোরি মডিউল অ্যাক্টিভ করলে এবং আমাকে একটি ডেটাবেসের সাথে কানেক্ট করলে আমি একটি পারফেক্ট সুপার-ব্রেন হিসেবে কাজ করতে পারব।";

          return report;
      }

      // ৩. সিস্টেম স্ট্যাটাস
      if (this.intents.system_status.test(text)) {
         return `[ORBIS Core]: সিস্টেম সম্পূর্ণ সচল। বর্তমান প্রোভাইডার: ${config.provider || 'Gemini'}। মেমোরি স্ট্যাটাস: ${config.memoryEnabled ? 'Active' : 'Inactive'}।`;
      }

      // ৪. পরিচয় ও ক্ষমতা
      if (this.intents.identity.test(text)) {
         return "[ORBIS Core]: আমি ORBIS (Universal AI Engineering Platform)।";
      }

      // ==========================================
      // 🌐 এক্সটার্নাল প্রোভাইডার হ্যান্ডঅফ (Gemini API)
      // ==========================================
      const response = await this.provider.execute(input);
      return response; 

    } catch (error) {
      console.error("[DecisionEngine Error]:", error);
      return "[ORBIS Core Error]: সিস্টেমে একটি টেকনিক্যাল এরর হয়েছে। ব্রেন ইঞ্জিন রিকোয়েস্ট প্রসেস করতে ব্যর্থ হয়েছে।";
    }
  }
}
