import { BaseProvider } from './BaseProvider.js';

export class MockProvider extends BaseProvider {
  async generateResponse(_prompt) {
    return `ORBIS Engine response to: ${_prompt}`;
  }
}
