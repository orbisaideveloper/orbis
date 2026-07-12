/**
 * BrainController: Manages runtime configuration, system state, 
 * and routes messages to the DecisionManager.
 */
const DecisionManager = require('./DecisionManager'); // তোমার আগের DecisionManager

class BrainController {
  constructor(initialConfig = {}) {
    this.config = {
      provider: 'gemini', // ডিফল্ট প্রোভাইডার
      memoryEnabled: false,
      ...initialConfig
    };
  }

  // নতুন মেথড: এটিই server.js থেকে কল হবে
  async handleRequest(payload) {
    // Brain এর সিদ্ধান্ত অনুযায়ী মেসেজ প্রসেস হবে
    return await DecisionManager.decide(payload);
  }

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

// এক্সপোর্ট করার সময় একটি ইন্সট্যান্স তৈরি করে দিচ্ছি যাতে সব জায়গায় ব্যবহার করা যায়
module.exports = new BrainController();
