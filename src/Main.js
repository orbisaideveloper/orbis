import BrainController from './brain/BrainController.js';

const brain = new BrainController();
const inputData = { message: "Initiating ORBIS System" };

const result = brain.process(inputData);
console.log("System Status:", result);
import DecisionEngine from './DecisionEngine.js';

const engine = new DecisionEngine();
console.log(engine.processTask("Test Task"));
