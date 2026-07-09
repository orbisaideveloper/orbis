import { CapabilityRegistry } from '../registry/CapabilityRegistry.js';
import { ProviderOrchestrator } from '../orchestrator/ProviderOrchestrator.js';

/**
 * DecisionManager: Brick that intelligently routes tasks to the best AI provider.
 */
export class DecisionManager {
  constructor() {
    this.orchestrator = new ProviderOrchestrator();
  }

  async processRequest(taskType, prompt) {
    console.log(`[ORBIS Manager] Analyzing task type: ${taskType}`);
    
    const provider = CapabilityRegistry.getProviderByTask(taskType);
    if (!provider) {
      throw new Error(`No capability found for: ${taskType}`);
    }

    return await this.orchestrator.executeTask(taskType, prompt);
  }
}
