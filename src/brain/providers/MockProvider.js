import { BaseProvider } from './BaseProvider.js';

export class MockProvider extends BaseProvider {
  constructor() {
    super('mock');
  }

  async execute(prompt, context = []) {
    return {
      success: true,
      provider: this.name,
      timestamp: Date.now(),
      data: `ORBIS Engine response to: ${prompt}`
    };
  }
}
