import BrainController from './brain/BrainController.js';

const brain = new BrainController();
const inputData = { message: "Initiating ORBIS System" };

const result = brain.process(inputData);
console.log("System Status:", result);
