// src/brain/decision/DecisionManager.js

class DecisionManager {
  constructor() {
    this.decisions = new Map();
  }

  registerDecision(task, provider) {
    if (!task || !provider) {
      throw new Error('Task and Provider are required');
    }
    this.decisions.set(task, provider);
  }

  getDecision(task) {
    return this.decisions.get(task);
  }
}

export default DecisionManager;
