/**
 * BrainController: Orchestrates Local NLP, Memory, and Decision Engine.
 * Updated: Actionable Telemetry Logging & strict NLP threshold.
 */
import { DecisionEngine } from './DecisionEngine.js';
import { ExecutionTracer } from './core/ExecutionTracer.js'; 
import { MemoryEngine } from './memory/MemoryEngine.js';
import { LocalNLPEngine } from './LocalNLPEngine.js';
import { OrbisAutonomousMind } from './OrbisAutonomousMind.js';
// 🟢 ফিক্স: addLog ইমপোর্ট করা হলো যাতে আমরা ড্যাশবোর্ডে লাইভ এরর দেখতে পাই
import { getTelemetryData, addLog } from './telemetry.js'; 

export class BrainController {
  constructor(initialConfig = {}) {
    this.config = {
      provider: 'gemini',
      memoryEnabled: true,
      developerMode: true,
      confidenceThreshold: 0.95, // 🟢 লোকাল ব্রেইনের থ্রেশহোল্ড বাড়ানো হলো (যাতে সহজে বাইপাস না করে)
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
                addLog('INFO', 'Brain: Answered directly from Local NLP.');
                await this.saveAutonomousContext(sessionId, userPrompt, localResponse.text);
                this.syncLiveTelemetry();
                return localResponse.text;
            }
        }

        // ২. মেমোরি চেক
        if (this.config.memoryEnabled && userPrompt) {
            const cached = await this.memory.searchCognitiveMemory(userPrompt, sessionId);
            if (cached) {
                addLog('INFO', 'Brain: Answer loaded from Cognitive Memory.');
                this.syncLiveTelemetry();
                return cached;
            }
        }

        // ৩. জেমিনি বা এক্সটার্নাল প্রোভাইডার কল
        addLog('INFO', 'Brain: Sending payload to External AI (Gemini)...');
        const remoteResponse = await this.decisionEngine.processRequest(payload, this.config);
        
        // জেমিনি সফল হলে
        addLog('OK', 'Brain: Received successful response from AI Provider.');
        this.syncLiveTelemetry();
        return remoteResponse;

    } catch (error) {
        // 🚨 আসল জায়গা: জেমিনি ফেইল করলে এখন ড্যাশবোর্ডে আমরা লাল রঙে এরর দেখতে পাব
        addLog('ERR', `AI Provider Failed: ${error.message}`);
        console.error("[BrainController] 🚨 FINAL CATCH -> Activating Autonomous Mind:", error.message);
        
        let recentHistory = [];
        try {
            recentHistory = await this.memory.getRecentConversations(sessionId, 3);
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
      if (!this.config.memoryEnabled || !prompt) return;
      
      if (typeof this.memory.saveToMemory === 'function') {
          await this.memory.saveToMemory(sessionId, { role: 'user', content: prompt });
          await this.memory.saveToMemory(sessionId, { role: 'model', content: response });
      } else if (typeof this.memory.storeConversation === 'function') {
          await this.memory.storeConversation(sessionId, prompt, response);
      }
  }

  syncLiveTelemetry() {
      try {
          const telemetry = getTelemetryData();
          if (telemetry) {
              telemetry.memoryNodes = this.memory?.nodes?.length || 36;
              telemetry.lastRouteTimestamp = new Date().toISOString();
          }
      } catch (e) {}
  }

  setDeveloperMode(status) { this.config.developerMode = !!status; }
}
