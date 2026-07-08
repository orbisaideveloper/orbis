import DecisionEngine from './DecisionEngine.js';

class InputHandler {
  constructor() {
    this.engine = new DecisionEngine();
  }

  handleInput(command) {
    console.log("Input received: " + command);
    return this.engine.processTask(command);
  }
}

export default InputHandler;
