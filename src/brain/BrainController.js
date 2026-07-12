/**
 * BrainController: Manages runtime configuration, system state,
 * and passes requests to the DecisionEngine.
 */
import { DecisionEngine } from './DecisionEngine.js';

export class BrainController {
  constructor(initialConfig = {}) {
    // আপনার আগের অরিজিনাল কনফিগারেশন (ডিফল্ট প্রোভাইডার জেমিনি করা হলো)
    this.config = {
      provider: 'gemini',
      memoryEnabled: false,
      ...initialConfig
    };
    
    // নতুন ডিসিশন ইঞ্জিন ইনিশিয়ালাইজ করা হলো
    this.decisionEngine = new DecisionEngine();
  }

  // নতুন মেথড: server.js থেকে এই মেথডটি কল হবে এবং এটি কনফিগসহ ডিসিশন ইঞ্জিনে পাঠাবে
  async handleRequest(payload) {
    return await this.decisionEngine.processRequest(payload, this.config);
  }

  // আপনার আগের অরিজিনাল মেথডগুলো হুবহু অক্ষত রাখা হলো
  getActiveConfig() {
    return { ...this.config };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  setProvider(provider) {
    this.config.provider = provider;
  }

  setMemoryStatus(status) {
    this.config.memoryEnabled = !!status;
  }
}
