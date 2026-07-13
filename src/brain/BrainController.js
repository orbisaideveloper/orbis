/**
 * BrainController: Manages runtime configuration, system state,
 * passes requests to the DecisionEngine, and handles Persistent Memory.
 */
import { DecisionEngine } from './DecisionEngine.js';
import { ExecutionTracer } from './core/ExecutionTracer.js'; 
import { MemoryEngine } from './memory/MemoryEngine.js'; // 🟢 নতুন: মেমোরি ইঞ্জিন ইমপোর্ট

export class BrainController {
  constructor(initialConfig = {}) {
    this.config = {
      provider: 'gemini',
      memoryEnabled: true, // 🟢 ডিফল্টভাবে মেমোরি অন করে দিলাম!
      ...initialConfig
    };
    
    // 🟢 মেমোরি ইঞ্জিন চালু করা হলো
    this.memory = new MemoryEngine();

    // অরিজিনাল ইঞ্জিন তৈরি করে সেটিকে মেমোরির অ্যাক্সেস দেওয়া হলো
    const baseEngine = new DecisionEngine();
    baseEngine.memory = this.memory; 

    // ইঞ্জিনকে ট্রেসারের র‍্যাপারে মুড়িয়ে দেওয়া হলো
    this.decisionEngine = ExecutionTracer.wrap(baseEngine, 'DecisionEngine');
  }

  async handleRequest(payload) {
    let finalPayload = payload;
    const sessionId = payload.sessionId || 'default_user'; // মাল্টি-ইউজার সাপোর্ট

    // ১. মেমোরি অন থাকলে ইউজারের মেসেজ সেভ করা এবং হিস্ট্রি ফেচ করা
    if (this.config.memoryEnabled && payload.content) {
        await this.memory.saveConversation('user', payload.content, sessionId);
        
        // পুরনো মেমোরি (History) বের করে এনে payload-এর সাথে জুড়ে দেওয়া হলো
        const history = await this.memory.getRecentConversations(sessionId);
        finalPayload = { ...payload, history };
    }

    // ২. মেইন ডিসিশন ইঞ্জিনের কাছে রিকোয়েস্ট পাঠানো (ট্রেসার হয়ে)
    const response = await this.decisionEngine.processRequest(finalPayload, this.config);

    // ৩. AI-এর দেওয়া উত্তরটাও মেমোরিতে সেভ করে রাখা
    if (this.config.memoryEnabled && response) {
        // রেসপন্স স্ট্রিং হতে পারে বা অবজেক্ট হতে পারে, সেটা সামলে নেওয়া হলো
        const aiText = typeof response === 'string' ? response : response.text || JSON.stringify(response);
        await this.memory.saveConversation('orbis', aiText, sessionId);
    }

    return response;
  }

  getActiveConfig() { return { ...this.config }; }
  updateConfig(newConfig) { this.config = { ...this.config, ...newConfig }; }
  setProvider(provider) { this.config.provider = provider; }
  setMemoryStatus(status) { this.config.memoryEnabled = !!status; }
}
