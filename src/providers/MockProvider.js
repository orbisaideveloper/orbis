import { BaseProvider } from './BaseProvider.js';

export class MockProvider extends BaseProvider {
  async generateResponse(prompt) {
    return `ORBIS Engine response to: ${prompt}`;
  }
}
