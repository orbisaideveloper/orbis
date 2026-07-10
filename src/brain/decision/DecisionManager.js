import { CapabilityRegistry } from '../registry/CapabilityRegistry.js';

/**
 * DecisionManager: Intelligently chooses the best AI provider
 * for every task using the CapabilityRegistry. No hardcoded selection.
 */
export class DecisionManager {
  constructor() {
    this.registry = new CapabilityRegistry();
  }

  evaluateTask(taskType) {
    const provider = this.registry.getProviderByTask(taskType);
    
    if (!provider) {
      console.warn(`[DecisionManager] No specific provider found for '${taskType}'. Fallback to GENERAL.`);
      // যদি স্পেসিফিক এআই না পাওয়া যায়, তবে GENERAL এআই বেছে নেবে
      return this.registry.getProviderByTask('GENERAL') || null;
    }
    
    console.log(`[DecisionManager] Selected provider '${provider.name}' for task '${taskType}'.`);
    return provider;
  }
}
