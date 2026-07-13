/**
 * BrainController: Orchestrates Local NLP, Memory, and Decision Engine.
 * Updated: Phase 7.9 - Smart Routing & Intelligent Fallback System.
 */
import { DecisionEngine } from './DecisionEngine.js';
import { ExecutionTracer } from './core/ExecutionTracer.js'; 
import { MemoryEngine } from './memory/MemoryEngine.js';
import { LocalNLPEngine } from './LocalNLPEngine.js';

export class BrainController {
  constructor(initialConfig = {}) {
    this.config = {
      provider: 'gemini',
      memoryEnabled: true,
      developerMode: true,
      confidenceThreshold: 0.8, // 🟢 কনফিডেন্স লেভেল
      ...initialConfig
    };
    
    this.memory = new MemoryEngine();
    this.localNLP = new LocalNLPEngine();
    const baseEngine = new DecisionEngine();
    baseEngine.memory = this.memory; 
    this.decisionEngine = ExecutionTracer.wrap(baseEngine, 'DecisionEngine');
  }

  async handleRequest(payload) {
    const sessionId = payload.sessionId || 'default_user';

    // ১. লোকাল ব্রেইন (NLP) চেক
    if (payload.content) {
        const localResponse = await this.localNLP.processLocally(payload.content, sessionId);
        if (localResponse && localResponse.confidence >= this.config.confidenceThreshold) {
            console.log("[BrainController] ⚡ Local NLP High Confidence Match!");
            return localResponse.text;
        }
    }

    // ২. মেমোরি চেক
    if (this.config.memoryEnabled && payload.content) {
        const cached = await this.memory.searchCognitiveMemory(payload.content, sessionId);
        if (cached) {
            console.log("[BrainController] 🧠 Cognitive Match Found!");
            return cached;
        }
    }

    // ৩. জেমিনি কল লজিক (যেহেতু লোকাল ব্রেইনে বা মেমোরিতে উত্তর নেই)
    try {
        console.log("[BrainController] 🌐 Routing to External API (Gemini)...");
        const response = await this.decisionEngine.processRequest(payload, this.config);
        return response;
    } catch (error) {
        console.error("[BrainController] 🚨 API Error:", error.message);
        
        // ৪. স্মার্ট ফলব্যাক (জেমিনি ডাউন থাকলে ব্রেইন নিজে সামলে নেবে)
        const fallbackResponses = [
            "অজয় বাবু, এই মুহূর্তে বাইরের সার্ভার (Gemini) খুব ব্যস্ত আছে। তবে আমি আমার লোকাল মেমোরি থেকে কাজ চালিয়ে নেওয়ার চেষ্টা করছি। বলুন কীভাবে সাহায্য করতে পারি?",
            "জেমিনির সাথে কানেকশন করা যাচ্ছে না (সার্ভার লোড বেশি)। আমি এখন পুরোপুরি আমার লোকাল ব্রেইন (NLP) ব্যবহার করছি।",
            "বাইরের এপিআই এখন ডাউন আছে। তবে চিন্তার কিছু নেই, আমার নিজস্ব মেমোরি অ্যাক্টিভ আছে। আপনি কোড বা লজিক সম্পর্কিত কিছু জানতে চাইলে বলতে পারেন।"
        ];
        
        // ন্যাচারাল শোনানোর জন্য র‍্যান্ডম মেসেজ নির্বাচন
        const randomReply = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        return `[Local Brain Active] 🧠 ${randomReply}`;
    }
  }

  setDeveloperMode(status) { this.config.developerMode = !!status; }
}
