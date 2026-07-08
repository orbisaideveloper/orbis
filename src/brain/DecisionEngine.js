import { MockProvider } from '../providers/MockProvider.js';

export class DecisionEngine {
  constructor() {
    this.provider = new MockProvider();
  }

  async processRequest(input) {
    return await this.provider.generateResponse(input);
  }
}
