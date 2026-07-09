import { CapabilityRegistry } from '../registry/CapabilityRegistry.js';

/**
 * ProviderOrchestrator: Brick for managing multi-AI API interactions.
 */
export class ProviderOrchestrator {
  async executeTask(taskType, prompt) {
    const provider = CapabilityRegistry.getProviderByTask(taskType);
    
    if (!provider) {
      throw new Error(`No active provider found for task: ${taskType}`);
    }

    console.log(`[ORBIS Orchestrator] Routing to: ${provider.name}`);
    // এখানে পরবর্তীতে আমাদের API Gateway কানেকশন বসবে
    return `Simulated response from ${provider.name} for: ${prompt}`;
  }
}
