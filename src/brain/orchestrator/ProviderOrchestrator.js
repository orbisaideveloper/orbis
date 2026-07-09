import { CapabilityRegistry } from '../registry/CapabilityRegistry.js';

export class ProviderOrchestrator {
  async executeTask(taskType, prompt) {
    const provider = CapabilityRegistry.getProviderByTask(taskType);
    if (!provider) {
      throw new Error(`No provider found: ${taskType}`);
    }
    return `Simulated response from ${provider.name}`;
  }
}
