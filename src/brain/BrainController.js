/**
 * BrainController: Manages runtime configuration, system state,
 * passes requests to the DecisionEngine, handles Persistent Memory,
 * and routes requests via Local NLP Engine for ultra-low latency.
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
      ...initialConfig
    };
    
    this.memory = new MemoryEngine();
    this.localNLP = new LocalNLPEngine();

    const baseEngine = new DecisionEngine();
    baseEngine.memory = this.memory; 

    this.decisionEngine = ExecutionTracer.wrap(baseEngine, 'DecisionEngine');
  }

  async handleRequest(payload) {
    let finalPayload = payload;
    const sessionId = payload.sessionId || 'default_user';

    // 🚀 PHASE 7: LOCAL NLP BYPASS
    if (payload.content) {
        const localResponse = await this.localNLP.processLocally(payload.content, sessionId);
        if (localResponse) {
            console.log("[BrainController] ⚡ Local NLP Match! Bypassing API...");
            return localResponse;
        }
    }

    // ১. মেমোরি চেক
    if (this.config.memoryEnabled && payload.content) {
        const cachedResponse = await this.memory.searchCognitiveMemory(payload.content, sessionId);
        if (cachedResponse) {
            console.log("[BrainController] 🧠 Cognitive Match Found! Bypassing Gemini API...");
            return cachedResponse;
        }

        await this.memory.saveConversation('user', payload.content, sessionId);
        const history = await this.memory.getRecentConversations(sessionId);
        finalPayload = { ...payload, history };
    }

    // ২. মেইন ডিসিশন ইঞ্জিন (Try-Catch সার্কিট ব্রেকার)
    try {
        const response = await this.decisionEngine.processRequest(finalPayload, this.config);
        
        // ৩. মেমোরিতে সেভ করা
        if (this.config.memoryEnabled && response) {
            const aiText = typeof response === 'string' ? response : response.text || JSON.stringify(response);
            await this.memory.saveConversation('orbis', aiText, sessionId);
            if (payload.content) {
                await this.memory.saveCognitiveMemory(sessionId, payload.content, aiText);
            }
        }
        return response;
    } catch (error) {
        // 🚨 এরর হ্যান্ডলিং: জেমিনি ডাউন থাকলে লুপে পড়বে না
        console.error("[BrainController] 🚨 API Error: Gemini is unreachable.", error);
        return "জেমিনি সার্ভার বর্তমানে খুব ব্যস্ত বা ডাউন। আমি এখন লোকাল মোডে আছি, দয়া করে একটু পর আবার চেষ্টা করুন!";
    }
  }

  getActiveConfig() { return { ...this.config }; }
  updateConfig(newConfig) { this.config = { ...this.config, ...newConfig }; }
  setProvider(provider) { this.config.provider = provider; }
  setMemoryStatus(status) { this.config.memoryEnabled = !!status; }
}
