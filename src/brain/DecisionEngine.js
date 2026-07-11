import { MockProvider } from '../providers/MockProvider.js';

export class DecisionEngine {
  constructor() {
    this.provider = new MockProvider();
  }

  async processRequest(input) {
    // Updated to use the modern execute() method instead of legacy generateResponse()
    const response = await this.provider.execute(input);
    return response.data;
  }
}
