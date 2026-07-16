/**
 * BrainController: Orchestrates Local NLP, Memory, and Decision Engine.
 * Refactored: Phase 10.5 - Integrated Smart Query Refiner & Multi-lingual Display Engine
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

  // 🟢 NEW: Smart Query Refiner (বড় বাক্য থেকে ফালতু শব্দ মুছে আসল সার্চ টার্ম বের করা)
  cleanAndOptimizeQuery(prompt) {
      let clean = prompt.toLowerCase();
      
      // বাংলা এবং ইংরেজির সাধারণ কথ্য শব্দ বা ফিল্টার (Conversational Fillers)
      const fillers = [
          'আমি তোমাকে', 'বলতে বলেছি', 'বলতে পারবে', 'বলতো', 'জানাও', 'দাও', 'দেখাও', 'একটু', 'ভাই', 'বল', 'প্লিজ', 'নাকি', 'কী', 'কেমন',
          'please tell me', 'can you show me', 'what is the', 'tell me about', 'show me', 'give me', 'update', 'please', 'can you'
      ];
      
      // বাক্য থেকে ফিল্টার শব্দগুলো মুছে ফেলা
      fillers.forEach(filler => {
          clean = clean.split(filler).join(' ');
      });
      
      // অতিরিক্ত স্পেস মুছে একদম ফ্রেশ কি-ওয়ার্ড রিটার্ন করা
      const optimizedQuery = clean.replace(/\s+/g, ' ').trim();
      addLog('INFO', `QueryRefiner: Optimized "${prompt}" ➔ "${optimizedQuery}"`);
      return optimizedQuery || prompt;
  }

  async performLiveWebSearch(query) {
      // প্রথমে বাক্যটিকে অপ্টিমাইজ বা ফিল্টার করে নেওয়া
      const optimizedQuery = this.cleanAndOptimizeQuery(query);
      addLog('INFO', `WebRouter: Executing Live Search for -> "${optimizedQuery}"`);
      
      try {
          const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(optimizedQuery)}`, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
          });
          const html = await response.text();
          
          const snippets = [...html.matchAll(/<a class="result__snippet[^>]*>(.*?)<\/a>/gi)]
              .map(m => m[1].replace(/<[^>]+>/g, '').trim())
              .filter(text => text.length > 0)
              .slice(0, 4); // Top 4 entries for maximum data density
              
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
      const triggerWords = ['live', 'today', 'latest', 'score', 'weather', 'news', 'price', 'who is', 'what is', 'আজকের', 'লাইভ', 'খবর', 'আবহাওয়া', 'ওয়েদার', 'স্কোর', 'কে', 'কী', 'দাম', 'আপডেট', 'চলছে'];
      return triggerWords.some(word => p.includes(word));
  }

  async handleRequest(payload) {
    const sessionId = payload.sessionId || 'default_user';
    let userPrompt = payload.content || "";
    let isLiveSearchExecuted = false;
    
    try {
        // ১. FIRST PRIORITY: Agentic Web Router (লাইভ সার্চ ও ন্যাচারাল ল্যাঙ্গুয়েজ ডিটেকশন)
        if (this.detectSearchIntent(userPrompt)) {
            const liveData = await this.performLiveWebSearch(userPrompt);
            if (liveData) {
                // 🟢 KHR: জেমিনিকে কড়া নির্দেশ যাতে সে ইন্টারনেটের ডেটা পড়ে বাংলায় সুন্দর করে ডিসপ্লে করে
                userPrompt = `CONTEXT (Live Web Data from Internet): ${liveData}\n\nUSER QUESTION: ${payload.content}\n\nINSTRUCTION: You are ORBIS AI. Analyze the live web context provided. Answer the user's question accurately. CRITICAL: Provide the final display output response in beautifully formatted, clear Bengali (বাংলা) language so it looks professional, regardless of the input search query language.`;
                isLiveSearchExecuted = true;
                payload.content = userPrompt; 
            }
        }

        // ২. SECOND PRIORITY: লোকাল ব্রেইন (NLP) চেক (লাইভ সার্চ না হলে তবেই এটি কাজ করবে)
        if (userPrompt && !isLiveSearchExecuted) {
            const localResponse = await this.localNLP.processLocally(userPrompt, sessionId);
            if (localResponse && localResponse.confidence >= this.config.confidenceThreshold) {
                addLog('INFO', 'Brain: Answered directly from Local NLP.');
                await this.saveAutonomousContext(sessionId, userPrompt, localResponse.text);
                this.syncLiveTelemetry();
                return localResponse.text;
            }
        }

        // ৩. মেমোরি চেক (Unified API)
        if (this.config.memoryEnabled && payload.content && !isLiveSearchExecuted) {
            try {
                const cached = await this.memory.searchCognitiveMemory(sessionId, payload.content);
                if (cached) {
                    addLog('INFO', 'Brain: Answer loaded from Cognitive Memory.');
                    this.syncLiveTelemetry();
                    return cached;
                }
            } catch(e) {}
        }

        // ৪. জেমিনি বা এক্সটার্নাল প্রোভাইডার কল
        addLog('INFO', `Brain: Sending payload to Gemini Engine... LiveContext: ${isLiveSearchExecuted}`);
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
