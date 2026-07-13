/**
 * BrainController: Orchestrates Local NLP, Memory, and Decision Engine.
 * Updated: Phase 8.0 - Autonomous Multi-Language Fallback Integration.
 */
import { DecisionEngine } from './DecisionEngine.js';
import { ExecutionTracer } from './core/ExecutionTracer.js'; 
import { MemoryEngine } from './memory/MemoryEngine.js';
import { LocalNLPEngine } from './LocalNLPEngine.js';
// 🟢 🚨 NEW: অর্বিস স্বায়ত্তশাসিত থিংকিং মডিউল ইমপোর্ট
import { OrbisAutonomousMind } from './OrbisAutonomousMind.js';

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
    // 🟢 🚨 NEW: অর্বিসের নিজস্ব মাইন্ড ইনস্ট্যান্স তৈরি
    this.autonomousMind = new OrbisAutonomousMind();

    const baseEngine = new DecisionEngine();
    baseEngine.memory = this.memory; 
    this.decisionEngine = ExecutionTracer.wrap(baseEngine, 'DecisionEngine');
  }

  async handleRequest(payload) {
    const sessionId = payload.sessionId || 'default_user';
    
    try {
        // ১. লোকাল ব্রেইন (NLP) চেক
        if (payload.content) {
            const localResponse = await this.localNLP.processLocally(payload.content, sessionId);
            if (localResponse && localResponse.confidence >= this.config.confidenceThreshold) {
                return localResponse.text;
            }
        }

        // ২. মেমোরি চেক
        if (this.config.memoryEnabled && payload.content) {
            const cached = await this.memory.searchCognitiveMemory(payload.content, sessionId);
            if (cached) return cached;
        }

        // ৩. জেমিনি বা এক্সটার্নাল প্রোভাইডার কল
        return await this.decisionEngine.processRequest(payload, this.config);

    } catch (error) {
        console.error("[BrainController] 🚨 FINAL CATCH:", error.message);
        
        // 🟢 🚨 স্মার্ট ও স্বায়ত্তশাসিত ফলব্যাক লজিক:
        // হার্ডকোডেড টেক্সট তুলে দিয়ে অর্বিসের নিজস্ব মাইন্ডকে ওয়ার্কিং মেমোরি এবং ভাষা ডিটেক্ট করতে দেওয়া হলো
        let recentHistory = [];
        try {
            // শেষ ২-৩টি মেসেজের কনটেক্সট তুলে আনা
            recentHistory = await this.memory.getRecentConversations(sessionId, 3);
        } catch (memError) {
            console.error("[BrainController] Memory Context Fetch Failed:", memError.message);
        }

        // অর্বিস এখন নিজের বুদ্ধি দিয়ে ভাষা ও ইনটেন্ট বুঝে রিয়েল-টাইম উত্তর তৈরি করবে
        const dynamicFallback = this.autonomousMind.thinkAndReply(payload.content || "", recentHistory);
        
        return dynamicFallback;
    }
  }

  setDeveloperMode(status) { this.config.developerMode = !!status; }
}
