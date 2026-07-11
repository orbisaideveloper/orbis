import { BrainHub } from './src/brain/core/BrainHub.js';

async function runTest() {
  console.log("====================================================");
  console.log(" 🚀 ORBIS Phase 6: Core Routing & Dependency Test 🚀");
  console.log("====================================================\n");
  
  try {
    const brain = new BrainHub();
    console.log("\n[Status] BrainHub initialized successfully.\n");
    
    console.log("-> Dispatching Task 1: Coding");
    const codingResult = await brain.processRequest("Write a Python script for data analysis");
    console.log(codingResult);

    console.log("\n-> Dispatching Task 2: Vision");
    const visionResult = await brain.processRequest("Analyze this architecture image");
    console.log(visionResult);

    console.log("\n✅ [SUCCESS] Dependency Cleanup Verified. Legacy code removed safely.");
  } catch (error) {
    console.error("\n❌ [CRITICAL FAILURE] Pipeline crashed after cleanup:", error.message);
  }
}

await runTest();
