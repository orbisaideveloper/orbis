import { TaskProcessor } from './TaskProcessor.js';

const processor = new TaskProcessor();

async function runTest() {
  console.log("--- ORBIS Testing & Refinement ---");
  
  // টেস্ট ১: কোডিং টাস্ক
  const codingResult = await processor.routeTask("Write a Python script", "CODING");
  console.log(codingResult);

  // টেস্ট ২: ভিশন টাস্ক (ভবিষ্যতের জন্য)
  const visionResult = await processor.routeTask("Analyze this image", "VISION");
  console.log(visionResult);
}

runTest().catch(console.error);
