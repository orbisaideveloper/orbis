import { CapabilityRegistry } from '../registry/CapabilityRegistry.js';

export class DecisionManager {
  constructor() {
    this.registry = new CapabilityRegistry();
    // ইন্টারনাল কমান্ডের লিস্ট
    this.internalCommands = ['health', 'telemetry', 'workflow', 'memory', 'status', 'logs'];
  }

  evaluateTask(taskType, input) {
    // ১. চেক করবে এটি ইন্টারনাল কি না
    if (this.internalCommands.includes(input.toLowerCase())) {
      console.log(`[DecisionManager] Internal query detected: '${input}'. Processing by ORBIS.`);
      return { type: 'INTERNAL', name: 'ORBIS_CORE' };
    }

    // ২. ইন্টারনাল না হলে প্রোভাইডার খোঁজা (আগের লজিক)
    const provider = this.registry.getProviderByTask(taskType);
    
    if (!provider) {
      console.warn(`[DecisionManager] Fallback to GENERAL.`);
      return this.registry.getProviderByTask('GENERAL') || null;
    }
    
    console.log(`[DecisionManager] Selected provider '${provider.name}' for task '${taskType}'.`);
    return { type: 'EXTERNAL', ...provider };
  }
}
