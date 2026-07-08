import DecisionEngine from './DecisionEngine.js';

class BrainController {
  constructor() {
    this.engine = new DecisionEngine();
  }

  process(data) {
    return this.engine.analyze(data);
  }
}

export default BrainController;
