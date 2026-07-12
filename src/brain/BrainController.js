/**
 * BrainController: Manages runtime configuration, system state,
 * and passes requests to the DecisionEngine.
 */
import { DecisionEngine } from './DecisionEngine.js';
import { ExecutionTracer } from './core/ExecutionTracer.js'; // 🟢 নতুন: ট্রেসার ইমপোর্ট করা হলো

export class BrainController {
  constructor(initialConfig = {}) {
    this.config = {
      provider: 'gemini',
      memoryEnabled: false,
      ...initialConfig
    };
    
    // 🟢 নতুন: অরিজিনাল ইঞ্জিন তৈরি করে সেটিকে ট্রেসারের র‍্যাপারে মুড়িয়ে দেওয়া হলো
    const baseEngine = new DecisionEngine();
    this.decisionEngine = ExecutionTracer.wrap(baseEngine, 'DecisionEngine');
  }

  async handleRequest(payload) {
    // এখানে কোনো পরিবর্তন নেই, কিন্তু কলটি এখন অটোমেটিক ট্রেসারের ভেতর দিয়ে যাবে
    return await this.decisionEngine.processRequest(payload, this.config);
  }

  getActiveConfig() { return { ...this.config }; }
  updateConfig(newConfig) { this.config = { ...this.config, ...newConfig }; }
  setProvider(provider) { this.config.provider = provider; }
  setMemoryStatus(status) { this.config.memoryEnabled = !!status; }
}
