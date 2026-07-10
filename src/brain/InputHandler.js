import { DecisionEngine } from './DecisionEngine.js'; // Fix 1: Named import

export class InputHandler { // Fix 2: Named export for consistency
  constructor() {
    this.engine = new DecisionEngine();
  }

  handleInput(command) {
    console.log("Input received: " + command);
    return this.engine.processRequest(command); // Fix 3: processRequest instead of processTask
  }
}
