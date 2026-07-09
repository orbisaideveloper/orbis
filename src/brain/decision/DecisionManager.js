import { CapabilityRegistry } from '../registry/CapabilityRegistry.js';
import { ProviderOrchestrator } from '../orchestrator/ProviderOrchestrator.js';

export class DecisionManager {
  constructor() {
    this.orchestrator = new ProviderOrchestrator();
  }
  async processRequest(task, prompt) {
    const provider = CapabilityRegistry.getProviderByTask(task);
    if (!provider) throw new Error("No provider");
    return await this.orchestrator.executeTask(task, prompt);
  }
}
