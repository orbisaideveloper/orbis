import { AgentPlanner } from '../planner/AgentPlanner.js';
import { CollaborationHub } from '../collaboration/CollaborationHub.js';

/**
 * CoordinationEngine: The central execution loop.
 * Ties together the planner, collaboration hub, and AI providers.
 * Manages the end-to-end execution of a task across multiple AI models.
 */
export class CoordinationEngine {
  constructor() {
    this.planner = new AgentPlanner();
    this.hub = new CollaborationHub();
  }

  /**
   * Executes a task by planning it and routing steps to simulated providers.
   * @param {string} taskId - Unique identifier for the task.
   * @param {string} taskInput - The raw task description.
   */
  async executeTask(taskId, taskInput) {
    // 1. Initialize collaboration session
    this.hub.createSession(taskId);

    // 2. Generate execution plan using AgentPlanner
    const plan = this.planner.generatePlan(taskInput);
    this.hub.addMessage(taskId, 'system', 'system', `Plan generated with ${plan.steps.length} steps.`);

    const results = [];

    // 3. Execute steps (Simulation of real provider communication for Phase 4)
    for (const step of plan.steps) {
      // Simulate dynamic provider selection: e.g., 'openai' for logic, 'gemini' for data
      const assignedProvider = step.action.includes('Analyze') ? 'openai' : 'gemini';
      
      // Simulate provider processing time & response
      const simulatedResponse = `[${assignedProvider}] Successfully processed step: ${step.action}`;
      
      // Log the provider's output to the collaboration hub safely
      this.hub.addMessage(taskId, assignedProvider, 'assistant', simulatedResponse);
      
      results.push({ 
        stepId: step.stepId, 
        provider: assignedProvider, 
        response: simulatedResponse 
      });
      
      step.status = 'completed';
    }

    // 4. Safely close the session after all steps are done
    this.hub.closeSession(taskId);

    return {
      taskId,
      originalTask: taskInput,
      finalStatus: 'completed',
      executionResults: results,
      contextHistory: this.hub.getSessionContext(taskId)
    };
  }
}
