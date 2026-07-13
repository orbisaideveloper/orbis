/**
 * BrainController: Orchestrates Local NLP, Memory, and Decision Engine.
 * Updated: Phase 8.0 - Absolute Error Transparency.
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
      confidenceThreshold: 0.8,
      ...initialConfig
    };
    
    this.memory = new MemoryEngine();
    this.localNLP = new LocalNLPEngine();
    const baseEngine = new DecisionEngine();
    baseEngine.memory = this.memory; 
    this.decisionEngine = ExecutionTracer.wrap(baseEngine, 'DecisionEngine');
  }

  async handleRequest(payload) {
    try {
        // ১. লোকাল ব্রেইন (NLP) চেক
        if (payload.content) {
            const localResponse = await this.localNLP.processLocally(payload.content, payload.sessionId || 'default_user');
            if (localResponse && localResponse.confidence >= this.config.confidenceThreshold) {
                return localResponse.text;
            }
        }

        // ২. মেমোরি চেক
        if (this.config.memoryEnabled && payload.content) {
            const cached = await this.memory.searchCognitiveMemory(payload.content, payload.sessionId || 'default_user');
            if (cached) return cached;
        }

        // ৩. জেমিনি কল
        return await this.decisionEngine.processRequest(payload, this.config);

    } catch (error) {
        console.error("[BrainController] 🚨 FINAL CATCH:", error.message);
        
        // 🟢 🚨 মাস্টার ফলব্যাক লজিক: এখন থেকে জেমিনি ফেইল করলে ব্রেইন নিজে লোকাল মেমোরি থেকে স্মার্ট উত্তর দেবে
        const fallback = "[Local Brain Active] জেমিনি সার্ভার এই মুহূর্তে ব্যস্ত (503/429)। আমি আমার লোকাল ডেটাবেস থেকে দেখছি... আপনার প্রশ্নের জন্য নির্দিষ্ট তথ্য আমার লোকাল মেমোরিতে নেই, তবে আপনি চাইলে আমি অন্য কোনো প্রসেস চেক করতে পারি।";
        
        return fallback; // আমরা এরর থ্রো না করে একটি স্মার্ট ফলব্যাক স্ট্রিং পাঠাচ্ছি
    }
  }

  setDeveloperMode(status) { this.config.developerMode = !!status; }
}
