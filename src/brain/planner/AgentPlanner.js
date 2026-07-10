/**
 * AgentPlanner: Responsible for intelligent task planning.
 * Breaks down complex tasks into smaller, executable steps.
 */
export class AgentPlanner {
  constructor() {
    this.planningStrategy = 'sequential'; // Default execution strategy
  }

  generatePlan(taskInput) {
    if (!taskInput || taskInput.trim() === '') {
      throw new Error('Task input cannot be empty.');
    }

    const steps = this._simulateTaskBreakdown(taskInput);

    return {
      originalTask: taskInput,
      status: 'planned',
      createdAt: Date.now(),
      steps: steps
    };
  }

  /**
   * Simulates breaking a task into logical steps based on keywords.
   * No hardcoded provider names here anymore. We only request 'capabilities'.
   * @private
   */
  _simulateTaskBreakdown(task) {
    const lowerTask = task.toLowerCase();
    
    // Custom logic for analytical tasks
    if (lowerTask.includes('analyze')) {
      return [
        { stepId: 1, action: 'Gather Data', capability: 'data_processing', status: 'pending' },
        { stepId: 2, action: 'Analyze Data', capability: 'analytical_reasoning', status: 'pending' }
      ];
    }

    // Default generic execution plan
    return [
      { stepId: 1, action: 'Execute Task', capability: 'general_logic', status: 'pending' }
    ];
  }
}
