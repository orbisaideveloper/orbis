/**
 * BrainController: Orchestrates Local NLP, Memory, and Decision Engine.
 * Refactored: Phase 10.0 - Integrated Autonomous Web Search & Agentic Routing
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
    
    // 🟢 Core Modules Initialization
    this.memory = new MemoryInterface();
    this.localNLP = new LocalNLPEngine();
    this.autonomousMind = new OrbisAutonomousMind();

    const baseEngine = new DecisionEngine();
    baseEngine.memory = this.memory; 
    this.decisionEngine = ExecutionTracer.wrap(baseEngine, 'DecisionEngine');
  }

  // 🟢 NEW: Zero-Cost Live Web Scraper (DuckDuckGo HTML Parser)
  async performLiveWebSearch(query) {
      addLog('INFO', `WebRouter: Executing Live Search for -> "${query}"`);
      try {
          // Using fetch (Native in Node 18+)
          const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
          });
          const html = await response.text();
          
          // Regex to extract snippets safely without heavy libraries
          const snippets = [...html.matchAll(/<a class="result__snippet[^>]*>(.*?)<\/a>/gi)]
              .map(m => m[1].replace(/<[^>]+>/g, '').trim())
              .filter(text => text.length > 0)
              .slice(0, 3); // Take top 3 results
              
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

  // 🟢 NEW: Intent Recognition for Live Data
  detectSearchIntent(prompt) {
      const p = prompt.toLowerCase();
      const triggerWords = ['live', 'today', 'latest', 'score', 'weather', 'news', 'price', 'who is', 'what is', 'আজকের', 'লাইভ', 'খবর', 'আবহাওয়া', 'স্কোর', 'কে', 'কী', 'দাম', 'আপডেট'];
      return triggerWords.some(word => p.includes(word));
  }

  async handleRequest(payload) {
    const sessionId = payload.sessionId || 'default_user';
    let userPrompt = payload.content || "";
    let isLiveSearchExecuted = false;
    
    try {
        // ১. লোকাল ব্রেইন (NLP) চেক - Basic Chat (Hi, Hello)
        if (userPrompt) {
            const localResponse = await this.localNLP.processLocally(userPrompt, sessionId);
            if (localResponse && localResponse.confidence >= this.config.confidenceThreshold) {
                addLog('INFO', 'Brain: Answered directly from Local NLP.');
                await this.saveAutonomousContext(sessionId, userPrompt, localResponse.text);
                this.syncLiveTelemetry();
                return localResponse.text;
            }
        }

        // 🟢 ২. NEW: Agentic Web Router (Live Data Check)
        if (this.detectSearchIntent(userPrompt)) {
            const liveData = await this.performLiveWebSearch(userPrompt);
            if (liveData) {
                // Injecting live data into prompt context for Gemini to format beautifully
                userPrompt = `CONTEXT (Live Web Data): ${liveData}\n\nUSER QUESTION: ${userPrompt}\n\nINSTRUCTION: Using the live context provided, answer the user's question naturally in their language.`;
                isLiveSearchExecuted = true;
                payload.content = userPrompt; // Update payload for DecisionEngine
            }
        }

        // ৩. মেমোরি চেক (Unified API) - Skip memory if it's a live search
        if (this.config.memoryEnabled && payload.content && !isLiveSearchExecuted) {
            const cached = await this.memory.searchCognitiveMemory(sessionId, payload.content);
            if (cached) {
                addLog('INFO', 'Brain: Answer loaded from Cognitive Memory.');
                this.syncLiveTelemetry();
                return cached;
            }
        }

        // ৪. জেমিনি বা এক্সটার্নাল প্রোভাইডার কল
        addLog('INFO', `Brain: Sending payload to External AI (Gemini)... LiveContext: ${isLiveSearchExecuted}`);
        const remoteResponse = await this.decisionEngine.processRequest(payload, this.config);
        
        addLog('OK', 'Brain: Received successful response from AI Provider.');
        
        // ৫. সফল হলে নতুন ইন্টারফেস দিয়ে সেভ করা
        const originalPromptForDb = isLiveSearchExecuted ? payload.content.split('USER QUESTION: ')[1].split('\n\nINSTRUCTION:')[0] : payload.content;
        await this.saveAutonomousContext(sessionId, originalPromptForDb, remoteResponse);
        
        this.syncLiveTelemetry();
        return remoteResponse;

    } catch (error) {
        addLog('ERR', `AI Provider Failed: ${error.message}`);
        console.error("[BrainController] 🚨 FINAL CATCH -> Activating Autonomous Mind:", error.message);
        
        let recentHistory = [];
        try {
            recentHistory = await this.memory.loadConversation(sessionId, 3);
        } catch (memError) {}

        addLog('WARN', 'Brain: Activating Local Fallback Identity...');
        const dynamicFallback = this.autonomousMind.thinkAndReply(payload.content, recentHistory);
        
        try {
            await this.saveAutonomousContext(sessionId, payload.content, dynamicFallback);
        } catch (saveError) {}

        this.syncLiveTelemetry();
        return dynamicFallback;
    }
  }

  async saveAutonomousContext(sessionId, prompt, response) {
      if (!this.config.memoryEnabled || !prompt || !response) return;
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
