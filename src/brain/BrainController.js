/**
 * BrainController: Manages runtime configuration, system state,
 * passes requests to the DecisionEngine, and handles Persistent Memory.
 */
import { DecisionEngine } from './DecisionEngine.js';
import { ExecutionTracer } from './core/ExecutionTracer.js'; 
import { MemoryEngine } from './memory/MemoryEngine.js';

export class BrainController {
  constructor(initialConfig = {}) {
    this.config = {
      provider: 'gemini',
      memoryEnabled: true,
      ...initialConfig
    };
    
    this.memory = new MemoryEngine();

    const baseEngine = new DecisionEngine();
    baseEngine.memory = this.memory; 

    this.decisionEngine = ExecutionTracer.wrap(baseEngine, 'DecisionEngine');
  }

  async handleRequest(payload) {
    let finalPayload = payload;
    const sessionId = payload.sessionId || 'default_user';

    // ১. মেমোরি অন থাকলে ইউজারের মেসেজ প্রসেস করা
    if (this.config.memoryEnabled && payload.content) {
        
        // 🚀 PHASE 6C: COGNITIVE BYPASS (API সাশ্রয় করার ম্যাজিক)
        // জেমিনির কাছে যাওয়ার আগেই আমরা লোকাল ভেক্টর ব্রেনে খুঁজব
        const cachedResponse = await this.memory.searchCognitiveMemory(payload.content, sessionId);
        
        if (cachedResponse) {
            console.log("[BrainController] 🧠 Cognitive Match Found! Bypassing Gemini API...");
            return cachedResponse; // উত্তর জানা থাকলে এখান থেকেই সোজা রিটার্ন!
        }

        // উত্তর না পেলে সাধারণ চ্যাট হিস্ট্রি সেভ করা এবং হিস্ট্রি ফেচ করা
        await this.memory.saveConversation('user', payload.content, sessionId);
        const history = await this.memory.getRecentConversations(sessionId);
        finalPayload = { ...payload, history };
    }

    // ২. মেইন ডিসিশন ইঞ্জিনের কাছে রিকোয়েস্ট পাঠানো (যেহেতু লোকাল মেমোরিতে উত্তর নেই)
    const response = await this.decisionEngine.processRequest(finalPayload, this.config);

    // ৩. AI-এর দেওয়া নতুন উত্তরটা মেমোরিতে সেভ করে রাখা
    if (this.config.memoryEnabled && response) {
        const aiText = typeof response === 'string' ? response : response.text || JSON.stringify(response);
        
        // সাধারণ হিস্ট্রি সেভ
        await this.memory.saveConversation('orbis', aiText, sessionId);
        
        // 🚀 PHASE 6C: নতুন উত্তরটা ভেক্টর ব্রেনে (Cognitive Memory) সেভ করে রাখা ভবিষ্যতের জন্য
        if (payload.content) {
            await this.memory.saveCognitiveMemory(sessionId, payload.content, aiText);
        }
    }

    return response;
  }

  getActiveConfig() { return { ...this.config }; }
  updateConfig(newConfig) { this.config = { ...this.config, ...newConfig }; }
  setProvider(provider) { this.config.provider = provider; }
  setMemoryStatus(status) { this.config.memoryEnabled = !!status; }
}
