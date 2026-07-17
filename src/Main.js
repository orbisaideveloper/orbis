import { TaskProcessor } from './TaskProcessor.js';

const processor = new TaskProcessor();

async function runTest() {
  console.log("--- ORBIS Testing & Refinement ---");
  
  const codingResult = await processor.routeTask("Write a Python script", "CODING");
  console.log(codingResult);

  const visionResult = await processor.routeTask("Analyze this image", "VISION");
  console.log(visionResult);
}

await runTest();
