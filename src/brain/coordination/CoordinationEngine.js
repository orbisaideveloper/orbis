import { AgentPlanner } from '../planner/AgentPlanner.js';
import { ExecutionBridge } from '../execution/ExecutionBridge.js';
import { ProviderRegistry } from '../registry/ProviderRegistry.js';
import { OpenAIProvider } from '../providers/OpenAIProvider.js';
import { GeminiProvider } from '../providers/GeminiProvider.js';

export class CoordinationEngine {
  constructor() {
    this.planner = new AgentPlanner();
    this.bridge = new ExecutionBridge();
    this.registry = new ProviderRegistry();

    // 1. Register Providers (This replaces hardcoding throughout the app)
    this.registry.registerProvider(new OpenAIProvider());
    this.registry.registerProvider(new GeminiProvider());
    
    // 2. Simulated Decision Manager (Maps capabilities to registered providers)
    this.decisionMatrix = {
      'analytical_reasoning': 'openai',
      'data_processing': 'gemini',
      'general_logic': 'gemini'
    };
  }

  async executeTask(taskId, taskInput) {
    const plan = this.planner.generatePlan(taskInput);
    const results = [];

    for (const step of plan.steps) {
      // FLOW: Planner -> Capability -> Decision Manager -> Registry -> Adapter -> Bridge
      const requiredCapability = step.capability || 'general_logic';
      const selectedProviderName = this.decisionMatrix[requiredCapability];
      
      const providerAdapter = this.registry.getProvider(selectedProviderName);
      
      const response = await this.bridge.dispatch(providerAdapter, step.action);
      
      results.push({ stepId: step.stepId, result: response.data });
      step.status = 'completed';
    }

    return { taskId, finalStatus: 'completed', executionResults: results };
  }
}
