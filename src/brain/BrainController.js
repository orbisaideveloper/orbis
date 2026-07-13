/**
 * BrainController: Orchestrates Local NLP, Memory, and Decision Engine.
 * Updated: Phase 7.9 - Developer Mode & Confidence-Based Routing.
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
      developerMode: true, // 🟢 ডিফল্ট অন
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
        // ধরলাম লোকাল রেসপন্সে এখন {text: '...', confidence: 0.9} ফরমেট আছে
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

    // ৩. ডেভেলপার মোড ইন্টারসেপ্ট (Gemini কল করার আগে)
    if (this.config.developerMode) {
        return `[Developer Mode] লোকাল ব্রেইন বা মেমোরিতে সঠিক উত্তর নেই। আমি কি জেমিনি (Gemini) এপিআই কল করব? (Yes/No)`;
    }

    // ৪. জেমিনি কল লজিক (ইন্টারসেপ্ট না থাকলে বা অনুমতি পেলে)
    try {
        const response = await this.decisionEngine.processRequest(payload, this.config);
        return response;
    } catch (error) {
        console.error("[BrainController] 🚨 API Error:", error.message);
        return "জেমিনি সার্ভার ব্যস্ত। আমি লোকাল মোডে আছি।";
    }
  }

  setDeveloperMode(status) { this.config.developerMode = !!status; }
}
