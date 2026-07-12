import { DecisionEngine } from './DecisionEngine.js';

export class BrainController {
  constructor(initialConfig = {}) {
    this.config = {
      provider: 'gemini',
      memoryEnabled: false,
      ...initialConfig
    };
    // DecisionEngine ইনিশিয়ালাইজ করা হলো
    this.decisionEngine = new DecisionEngine(); 
  }

  // server.js থেকে এই মেথডটি কল হবে
  async handleRequest(payload) {
    return await this.decisionEngine.processRequest(payload);
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
