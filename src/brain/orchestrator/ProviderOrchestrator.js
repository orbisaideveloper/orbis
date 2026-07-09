import { CapabilityRegistry } from '../registry/CapabilityRegistry.js';
import { ProviderOrchestrator } from '../orchestrator/ProviderOrchestrator.js';

export class DecisionManager {
  constructor() {
    this.orchestrator = new ProviderOrchestrator();
  }
  async processRequest(taskType, prompt) {
    const provider = CapabilityRegistry.getProviderByTask(taskType);
    if (!provider) throw new Error(`No capability: ${taskType}`);
    return await this.orchestrator.executeTask(taskType, prompt);
  }
}
