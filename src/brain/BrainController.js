/**
 * BrainController: Orchestrates Local NLP, Memory, and Decision Engine.
 * Refactored: Phase 10.2 - Fixed Intent Hijacking & Memory Error Handling
 */
import { DecisionEngine } from './DecisionEngine.js';
import { ExecutionTracer } from './core/ExecutionTracer.js'; 
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
    
    this.memory = new MemoryInterface();
    this.localNLP = new LocalNLPEngine();
    this.autonomousMind = new OrbisAutonomousMind();

    const baseEngine = new DecisionEngine();
    baseEngine.memory = this.memory; 
    this.decisionEngine = ExecutionTracer.wrap(baseEngine, 'DecisionEngine');
  }

  async performLiveWebSearch(query) {
      addLog('INFO', `WebRouter: Executing Live Search for -> "${query}"`);
      try {
          const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
          });
          const html = await response.text();
          
          const snippets = [...html.matchAll(/<a class="result__snippet[^>]*>(.*?)<\/a>/gi)]
              .map(m => m[1].replace(/<[^>]+>/g, '').trim())
              .filter(text => text.length > 0)
              .slice(0, 3); 
              
          if (snippets.length > 0) {
              addLog('OK', 'WebRouter: Successfully extracted live data.');
              return snippets.join(' | ');
          }
          return null;
      } catch (error) {
          addLog('WARN', `WebRouter: Search failed - ${error.message}`);
          return null;
      }
  }

  detectSearchIntent(prompt) {
      const p = prompt.toLowerCase();
      const triggerWords = ['live', 'today', 'latest', 'score', 'weather', 'news', 'price', 'who is', 'what is', 'আজকের', 'লাইভ', 'খবর', 'আবহাওয়া', 'ওয়েদার', 'স্কোর', 'কে', 'কী', 'দাম', 'আপডেট'];
      return triggerWords.some(word => p.includes(word));
  }

  async handleRequest(payload) {
    const sessionId = payload.sessionId || 'default_user';
    let userPrompt = payload.content || "";
    let isLiveSearchExecuted = false;
    
    try {
        // 🟢 ১. FIRST PRIORITY: Agentic Web Router (লাইভ সার্চ আগে চেক হবে)
        if (this.detectSearchIntent(userPrompt)) {
            const liveData = await this.performLiveWebSearch(userPrompt);
            if (liveData) {
                userPrompt = `CONTEXT (Live Web Data): ${liveData}\n\nUSER QUESTION: ${userPrompt}\n\nINSTRUCTION: Using the live context provided, answer the user's question naturally in their language.`;
                isLiveSearchExecuted = true;
                payload.content = userPrompt; 
            }
        }

        // 🟢 ২. SECOND PRIORITY: লোকাল ব্রেইন (NLP) চেক
        // (লাইভ সার্চ না হলে তবেই সে লোকাল রুলস চেক করবে)
        if (userPrompt && !isLiveSearchExecuted) {
            const localResponse = await this.localNLP.processLocally(userPrompt, sessionId);
            if (localResponse && localResponse.confidence >= this.config.confidenceThreshold) {
                addLog('INFO', 'Brain: Answered directly from Local NLP.');
                await this.saveAutonomousContext(sessionId, userPrompt, localResponse.text);
                this.syncLiveTelemetry();
                return localResponse.text;
            }
        }

        // ৩. মেমোরি চেক (Try-Catch দিয়ে ঘেরা হলো যাতে ক্র্যাশ না করে)
        if (this.config.memoryEnabled && payload.content && !isLiveSearchExecuted) {
            try {
                const cached = await this.memory.searchCognitiveMemory(sessionId, payload.content);
                if (cached) {
                    addLog('INFO', 'Brain: Answer loaded from Cognitive Memory.');
                    this.syncLiveTelemetry();
                    return cached;
                }
            } catch(e) { /* পুরোনো কলাম নামের এরর ইগনোর করবে */ }
        }

        // ৪. জেমিনি বা এক্সটার্নাল প্রোভাইডার কল
        addLog('INFO', `Brain: Sending payload to External AI (Gemini)... LiveContext: ${isLiveSearchExecuted}`);
        const remoteResponse = await this.decisionEngine.processRequest(payload, this.config);
        addLog('OK', 'Brain: Received successful response from AI Provider.');
        
        // ৫. সফল হলে সেভ করা
        const originalPromptForDb = isLiveSearchExecuted ? payload.content.split('USER QUESTION: ')[1].split('\n\nINSTRUCTION:')[0] : payload.content;
        await this.saveAutonomousContext(sessionId, originalPromptForDb, remoteResponse);
        
        this.syncLiveTelemetry();
        return remoteResponse;

    } catch (error) {
        addLog('ERR', `AI Provider Failed: ${error.message}`);
        const dynamicFallback = this.autonomousMind.thinkAndReply(payload.content, []);
        await this.saveAutonomousContext(sessionId, payload.content, dynamicFallback);
        return dynamicFallback;
    }
  }

  async saveAutonomousContext(sessionId, prompt, response) {
      if (!this.config.memoryEnabled || !prompt || !response) return;
      const textResponse = typeof response === 'string' ? response : JSON.stringify(response);
      try {
          await this.memory.saveConversation(sessionId, prompt, textResponse);
      } catch(e) {
          // 🟢 পুরোনো কলামের এরর যাতে লগ স্ক্রিন নোংরা না করে তাই সাইলেন্ট করা হলো
      }
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
