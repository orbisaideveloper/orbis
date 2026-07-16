/**
 * BrainController: Orchestrates Local NLP, Memory, and Decision Engine.
 * Refactored: Phase 12.0 - Integrated Dynamic Self-Doubt, Intent Classifier & Smart Recovery
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
      confidenceThreshold: 0.90, // কনফিডেন্স এর নিচে নামলেই জেমিনিকে ডাকবে
      ...initialConfig
    };
    
    this.memory = new MemoryInterface();
    this.localNLP = new LocalNLPEngine();
    this.autonomousMind = new OrbisAutonomousMind();

    const baseEngine = new DecisionEngine();
    baseEngine.memory = this.memory; 
    this.decisionEngine = ExecutionTracer.wrap(baseEngine, 'DecisionEngine');
  }

  // 🟢 FIXED: Query Refiner Bug (Length-Sorted Filters)
  cleanAndOptimizeQuery(prompt) {
      let clean = prompt.toLowerCase();
      
      const fillers = [
          'আমি তোমাকে', 'বলতে বলেছি', 'বলতে পারবে', 'বলতো', 'জানাও', 'দাও', 'দেখাও', 'একটু', 'ভাই', 'বল', 'প্লিজ', 'নাকি', 'কী', 'কেমন', 'বলবে', 'রিপোর্টটা', 'আমাকে',
          'please tell me', 'can you show me', 'what is the', 'tell me about', 'show me', 'give me', 'update', 'please', 'can you'
      ];
      
      // 🟢 BUG FIX: বড় শব্দগুলো আগে প্রসেস হবে, যাতে শব্দের মাঝখান থেকে কাটতে না পারে
      fillers.sort((a, b) => b.length - a.length);
      
      fillers.forEach(filler => {
          clean = clean.split(filler).join(' ');
      });
      
      const optimizedQuery = clean.replace(/\s+/g, ' ').trim();
      addLog('INFO', `QueryRefiner: Optimized "${prompt}" ➔ "${optimizedQuery}"`);
      return optimizedQuery || prompt;
  }

  async performLiveWebSearch(query) {
      const optimizedQuery = this.cleanAndOptimizeQuery(query);
      addLog('INFO', `WebRouter: Executing Direct Live Search for -> "${optimizedQuery}"`);
      
      try {
          const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(optimizedQuery)}`, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
          });
          const html = await response.text();
          
          const snippets = [...html.matchAll(/<a class="result__snippet[^>]*>(.*?)<\/a>/gi)]
              .map(m => m[1].replace(/<[^>]+>/g, '').trim())
              .filter(text => text.length > 0)
              .slice(0, 4); 
              
          if (snippets.length > 0) {
              addLog('OK', 'WebRouter: Successfully extracted live data.');
              return snippets; // Array রিটার্ন করছে যাতে সুন্দর করে সাজানো যায়
          }
          return null;
      } catch (error) {
          addLog('WARN', `WebRouter: Search failed - ${error.message}`);
          return null;
      }
  }

  detectSearchIntent(prompt) {
      const p = prompt.toLowerCase();
      const triggerWords = ['live', 'today', 'latest', 'score', 'weather', 'news', 'price', 'who is', 'what is', 'আজকের', 'লাইভ', 'খবর', 'আবহাওয়া', 'ওয়েদার', 'স্কোর', 'কে', 'কী', 'দাম', 'আপডেট', 'চলছে'];
      return triggerWords.some(word => p.includes(word));
  }

  // 🟢 NEW PILLAR 1: Dynamic Self-Doubt & Intent Classifier Engine
  calculateIntentConfidence(prompt) {
      const p = prompt.toLowerCase();
      const complexTriggers = [
          'code', 'program', 'function', 'write', 'create', 'html', 'javascript', 'backend',
          'কোড', 'প্রোগ্রাম', 'ফাংশন', 'রচনা', 'বিশ্লেষণ', 'কেন', 'কিভাবে', 'গাণিতিক', 'হিসাব', 'বানিয়ে দাও'
      ];
      const isComplex = complexTriggers.some(word => p.includes(word));
      
      if (isComplex) {
          addLog('INFO', 'SelfDoubt: Complex Logic Detected. Lowering confidence to force Gemini.');
          return { intent: 'COMPLEX_THINKING', confidence: 0.40 }; 
      }
      if (this.detectSearchIntent(prompt)) {
          return { intent: 'LIVE_INFO', confidence: 0.98 }; 
      }
      return { intent: 'GENERAL_TALK', confidence: 0.96 };
  }

  async handleRequest(payload) {
    const sessionId = payload.sessionId || 'default_user';
    let userPrompt = payload.content || "";
    
    // কগনিটিভ লেয়ারের মাধ্যমে ইন্টেন্ট এবং সেলফ-ডাউট স্কোর হিসাব করা
    const cognitiveAnalysis = this.calculateIntentConfidence(userPrompt);
    
    try {
        // 🟢 NEW PILLAR 2: Strict Gate Lock System (Gemini Bypass for Live Search)
        if (cognitiveAnalysis.intent === 'LIVE_INFO' && cognitiveAnalysis.confidence >= this.config.confidenceThreshold) {
            const searchResults = await this.performLiveWebSearch(userPrompt);
            if (searchResults) {
                addLog('OK', 'Brain: Gate Locked for External Providers. Resolving via Direct Search.');
                // ব্রেন নিজেই সরাসরি ডেটা ফরম্যাট করে সুন্দর আউটপুট বানিয়ে দিচ্ছে (জেমিনিকে ছাড়া)
                const directResponse = `🌐 **ORBIS লাইভ আপডেট:**\n\n${searchResults.map((info, index) => `🔹 ${info}`).join('\n\n')}`;
                
                await this.saveAutonomousContext(sessionId, userPrompt, directResponse);
                this.syncLiveTelemetry();
                return directResponse;
            }
        }

        // লোকাল ব্রেইন (NLP) চেক
        if (userPrompt && cognitiveAnalysis.intent === 'GENERAL_TALK') {
            const localResponse = await this.localNLP.processLocally(userPrompt, sessionId);
            if (localResponse && localResponse.confidence >= this.config.confidenceThreshold) {
                addLog('INFO', 'Brain: Answered directly from Local NLP.');
                await this.saveAutonomousContext(sessionId, userPrompt, localResponse.text);
                this.syncLiveTelemetry();
                return localResponse.text;
            }
        }

        // মেমোরি চেক 
        if (this.config.memoryEnabled && payload.content && cognitiveAnalysis.intent !== 'LIVE_INFO') {
            try {
                const cached = await this.memory.searchCognitiveMemory(sessionId, payload.content);
                if (cached) {
                    addLog('INFO', 'Brain: Answer loaded from Cognitive Memory.');
                    this.syncLiveTelemetry();
                    return cached;
                }
            } catch(e) {}
        }

        // ৪. শুধুমাত্র জটিল কাজের জন্য জেমিনি ইঞ্জিন কল
        addLog('INFO', `Brain: Esculating to Gemini. Intent: ${cognitiveAnalysis.intent} | Confidence: ${cognitiveAnalysis.confidence}`);
        const remoteResponse = await this.decisionEngine.processRequest(payload, this.config);
        addLog('OK', 'Brain: Received successful response from AI Provider.');
        
        await this.saveAutonomousContext(sessionId, payload.content, remoteResponse);
        this.syncLiveTelemetry();
        return remoteResponse;

    } catch (error) {
        addLog('ERR', `AI Provider/Execution Failed: ${error.message}`);
        console.error("[BrainController] 🚨 CRITICAL FAULT ➔ Activating Smart API Recovery Layer.");
        
        // 🟢 NEW PILLAR 3: Smart API Recovery (জেমিনির 503 এরর হলে ফলব্যাক)
        let contextHistory = [];
        try {
            contextHistory = await this.memory.loadConversation(sessionId, 5);
        } catch (memError) {}

        addLog('WARN', 'Brain: Transmitting historical context to Autonomous Mind for synthesis...');
        const dynamicFallback = this.autonomousMind.thinkAndReply(payload.content, contextHistory);
        
        await this.saveAutonomousContext(sessionId, payload.content, dynamicFallback);
        this.syncLiveTelemetry();
        return dynamicFallback;
    }
  }

  async saveAutonomousContext(sessionId, prompt, response) {
      if (!this.config.memoryEnabled || !prompt || !response) return;
      const textResponse = typeof response === 'string' ? response : JSON.stringify(response);
      try {
          await this.memory.saveConversation(sessionId, prompt, textResponse);
      } catch(e) {}
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
