import BrainController from './BrainController.js';

class DecisionEngine {
  constructor() {
    this.brain = new BrainController();
  }

  processTask(task) {
    const status = this.brain.getSystemStatus();
    
    if (status === 'active') {
      return `Task "${task}" is being processed by ORBIS.`;
    } else {
      return "System is inactive. Cannot process task.";
    }
  }
}

export default DecisionEngine;
