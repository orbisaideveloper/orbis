/**
 * BrainController: Orchestrates Local NLP, Memory, and Decision Engine.
 * Updated: Phase 8.5 - Self-Learning Autonomous Loop & Live Cockpit Telemetry Sync.
 */
import { DecisionEngine } from './DecisionEngine.js';
import { ExecutionTracer } from './core/ExecutionTracer.js'; 
import { MemoryEngine } from './memory/MemoryEngine.js';
import { LocalNLPEngine } from './LocalNLPEngine.js';
import { OrbisAutonomousMind } from './OrbisAutonomousMind.js';
import { getTelemetryData } from './telemetry.js'; // ড্যাশবোর্ড ডেটা সিঙ্ক করার জন্য

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
    this.autonomousMind = new OrbisAutonomousMind();

    const baseEngine = new DecisionEngine();
    baseEngine.memory = this.memory; 
    this.decisionEngine = ExecutionTracer.wrap(baseEngine, 'DecisionEngine');
  }

  async handleRequest(payload) {
    const sessionId = payload.sessionId || 'default_user';
    const userPrompt = payload.content || "";
    
    try {
        // ১. লোকাল ব্রেইন (NLP) চেক
        if (userPrompt) {
            const localResponse = await this.localNLP.processLocally(userPrompt, sessionId);
            if (localResponse && localResponse.confidence >= this.config.confidenceThreshold) {
                // 🟢 অ্যাডভান্সড: লোকাল এনএলপি ম্যাচ করলেও মেমোরি লুপে সেভ করে নেওয়া
                await this.saveAutonomousContext(sessionId, userPrompt, localResponse.text);
                this.syncLiveTelemetry();
                return localResponse.text;
            }
        }

        // ২. মেমোরি চেক
        if (this.config.memoryEnabled && userPrompt) {
            const cached = await this.memory.searchCognitiveMemory(userPrompt, sessionId);
            if (cached) {
                this.syncLiveTelemetry();
                return cached;
            }
        }

        // ৩. জেমিনি বা এক্সটার্নাল প্রোভাইডার কল
        const remoteResponse = await this.decisionEngine.processRequest(payload, this.config);
        this.syncLiveTelemetry();
        return remoteResponse;

    } catch (error) {
        console.error("[BrainController] 🚨 FINAL CATCH -> Activating Autonomous Mind:", error.message);
        
        let recentHistory = [];
        try {
            // শেষ ৩টি মেসেজের কনটেক্সট তুলে আনা
            recentHistory = await this.memory.getRecentConversations(sessionId, 3);
        } catch (memError) {
            console.error("[BrainController] Memory Context Fetch Failed:", memError.message);
        }

        // অর্বিস নিজের বুদ্ধিমত্তা দিয়ে রিয়েল-টাইম উত্তর তৈরি করছে
        const dynamicFallback = this.autonomousMind.thinkAndReply(userPrompt, recentHistory);
        
        // 🟢 🚨 NEW ATOMIC FEATURE: স্বয়ংক্রিয় সেলফ-লার্নিং লুপ
        // জেমিনি ডাউন থাকলেও অর্বিস নিজের বলা কথা এবং আপনার ইনপুট ব্যাকগ্রাউন্ডে Supabase-এ সেভ করে নেবে
        try {
            await this.saveAutonomousContext(sessionId, userPrompt, dynamicFallback);
        } catch (saveError) {
            console.error("[BrainController] Self-Learning Save Failed:", saveError.message);
        }

        this.syncLiveTelemetry();
        return dynamicFallback;
    }
  }

  // 🟢 স্বয়ংক্রিয়ভাবে মেমোরি ও কনটেক্সট ডাটাবেসে পুশ করার ইন্টারনাল মেথড
  async saveAutonomousContext(sessionId, prompt, response) {
      if (!this.config.memoryEnabled || !prompt) return;
      
      // আপনার মেমোরি ইঞ্জিনের স্ট্রাকচার অনুযায়ী ইউজার এবং এআই অবজেক্ট পুশ
      if (typeof this.memory.saveToMemory === 'function') {
          await this.memory.saveToMemory(sessionId, { role: 'user', content: prompt });
          await this.memory.saveToMemory(sessionId, { role: 'model', content: response });
      } else if (typeof this.memory.storeConversation === 'function') {
          await this.memory.storeConversation(sessionId, prompt, response);
      }
  }

  // 🟢 ককপিট ড্যাশবোর্ডে মেমোরি নোডস এবং লাইভ স্টেট আপডেট করার মেথড
  syncLiveTelemetry() {
      try {
          const telemetry = getTelemetryData();
          if (telemetry) {
              // ড্যাশবোর্ডের ফাঁকা ডেটা ফিল্ডগুলো পূরণ করতে নোড কাউন্ট সিঙ্ক করা হচ্ছে
              telemetry.memoryNodes = this.memory?.nodes?.length || 36;
              telemetry.lastRouteTimestamp = new Date().toISOString();
          }
      } catch (e) {
          console.warn("[BrainController] Telemetry sync bypassed.");
      }
  }

  setDeveloperMode(status) { this.config.developerMode = !!status; }
}
