/**
 * BrainController: Orchestrates Local NLP, Memory, and Decision Engine.
 * Refactored: Phase 9.0 - Integrated with Unified MemoryInterface.
 */
import { DecisionEngine } from './DecisionEngine.js';
import { ExecutionTracer } from './core/ExecutionTracer.js'; 
// 🟢 ফিক্স: MemoryEngine-এর বদলে আমাদের নতুন মাস্টার গেটওয়ে MemoryInterface আনা হলো
import { MemoryInterface } from './memory/MemoryInterface.js'; 
import { LocalNLPEngine } from './LocalNLPEngine.js';
import { OrbisAutonomousMind } from './OrbisAutonomousMind.js';
import { getTelemetryData, addLog } from './telemetry.js'; 

export class BrainController {
  constructor(initialConfig = {}) {
    this.config = {
      provider: 'gemini',
      memoryEnabled: true,
      developerMode: true,
      confidenceThreshold: 0.95, 
      ...initialConfig
    };
    
    // 🟢 ব্রেইন এখন সরাসরি গেটওয়ের সাথে কথা বলবে
    this.memory = new MemoryInterface();
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
                addLog('INFO', 'Brain: Answered directly from Local NLP.');
                await this.saveAutonomousContext(sessionId, userPrompt, localResponse.text);
                this.syncLiveTelemetry();
                return localResponse.text;
            }
        }

        // ২. মেমোরি চেক (Unified API)
        if (this.config.memoryEnabled && userPrompt) {
            // 🟢 API স্ট্যান্ডার্ড অনুযায়ী আর্গুমেন্ট পাঠানো হচ্ছে
            const cached = await this.memory.searchCognitiveMemory(sessionId, userPrompt);
            if (cached) {
                addLog('INFO', 'Brain: Answer loaded from Cognitive Memory.');
                this.syncLiveTelemetry();
                return cached;
            }
        }

        // ৩. জেমিনি বা এক্সটার্নাল প্রোভাইডার কল
        addLog('INFO', 'Brain: Sending payload to External AI (Gemini)...');
        const remoteResponse = await this.decisionEngine.processRequest(payload, this.config);
        
        addLog('OK', 'Brain: Received successful response from AI Provider.');
        
        // 🟢 সফল হলে নতুন ইন্টারফেস দিয়ে সেভ করা
        await this.saveAutonomousContext(sessionId, userPrompt, remoteResponse);
        
        this.syncLiveTelemetry();
        return remoteResponse;

    } catch (error) {
        addLog('ERR', `AI Provider Failed: ${error.message}`);
        console.error("[BrainController] 🚨 FINAL CATCH -> Activating Autonomous Mind:", error.message);
        
        let recentHistory = [];
        try {
            // 🟢 ইউনিফায়েড API ব্যবহার করা হলো
            recentHistory = await this.memory.loadConversation(sessionId, 3);
        } catch (memError) {}

        addLog('WARN', 'Brain: Activating Local Fallback Identity...');
        const dynamicFallback = this.autonomousMind.thinkAndReply(userPrompt, recentHistory);
        
        try {
            await this.saveAutonomousContext(sessionId, userPrompt, dynamicFallback);
        } catch (saveError) {}

        this.syncLiveTelemetry();
        return dynamicFallback;
    }
  }

  async saveAutonomousContext(sessionId, prompt, response) {
      if (!this.config.memoryEnabled || !prompt || !response) return;
      
      // 🟢 লিগ্যাসি চেকের ঝামেলা বাদ দিয়ে সরাসরি ইউনিফায়েড API কল
      const textResponse = typeof response === 'string' ? response : JSON.stringify(response);
      await this.memory.saveConversation(sessionId, prompt, textResponse);
  }

  syncLiveTelemetry() {
      try {
          const telemetry = getTelemetryData();
          if (telemetry) {
              telemetry.memoryNodes = this.memory.nodes?.length || 0;
              telemetry.lastRouteTimestamp = new Date().toISOString();
          }
      } catch (e) {}
  }

  setDeveloperMode(status) { this.config.developerMode = !!status; }
}
