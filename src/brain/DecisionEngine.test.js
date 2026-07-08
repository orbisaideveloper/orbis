import { MockProvider } from '../providers/MockProvider.js';

export class DecisionEngine {
  constructor() {
    this.provider = new MockProvider();
  }

  async processRequest(input) {
    // DecisionEngine প্রোভাইডারের মাধ্যমে রেসপন্স জেনারেট করবে
    return await this.provider.generateResponse(input);
  }
}

