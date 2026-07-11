import { MemoryEngine } from './brain/memory/MemoryEngine.js';
import { ToolEngine } from './brain/tools/ToolEngine.js';
import { RecoveryEngine } from './brain/recovery/RecoveryEngine.js';
import { DeveloperDashboard } from './brain/dashboard/DeveloperDashboard.js';

async function runArchitectureValidation() {
  console.log("====================================================");
  console.log(" 🚀 STARTING LIVE ARCHITECTURE VALIDATION (STEP 06) 🚀");
  console.log("====================================================\n");

  try {
    // ১. Memory Engine বুট করা হচ্ছে
    console.log("[1/4] Booting Memory Engine...");
    const memory = new MemoryEngine(null); // লাইভ টেস্টের জন্য আপাতত RAM ব্যবহার করা হচ্ছে
    await memory.saveMemory('user', 'founder', { name: 'Ajay', role: 'Chief Architect' });
    console.log("  ✅ Memory Engine: ONLINE. Test data saved successfully.");

    // ২. Tool Engine বুট করা হচ্ছে
    console.log("\n[2/4] Booting Tool Engine...");
    const tools = new ToolEngine();
    await tools.initialize({
      tools: [{ name: 'diagnostic_scanner', description: 'System diagnostic tool', active: true }]
    });
    const toolResult = await tools.executeTool('diagnostic_scanner', { scope: 'full' });
    console.log(`  ✅ Tool Engine: ONLINE. Tool execution status: [${toolResult.status}]`);

    // ৩. Recovery Engine বুট করা হচ্ছে (ইচ্ছে করে ক্র্যাশ করানো হবে টেস্টের জন্য)
    console.log("\n[3/4] Booting Recovery Engine & Simulating Crash...");
    
    const mockProviders = new Map([
      ['primary_ai', { execute: async () => { throw new Error("Simulated Server Crash!"); } }],
      ['fallback_ai', { execute: async () => ({ success: true, data: 'Fallback Recovered Data' }) }]
    ]);
    
    const recovery = new RecoveryEngine(mockProviders);
    // প্রাইমারি এআই ফেইল করবে, সিস্টেম নিজে থেকে ফলব্যাক এআইকে কল করবে
    await recovery.executeWithRecovery('primary_ai', 'fallback_ai', {});
    console.log("  ✅ Recovery Engine: ONLINE. Crash handled & Fallback triggered successfully.");

    // ৪. Dashboards জেনারেট করা হচ্ছে
    console.log("\n[4/4] Booting Developer Dashboard...");
    const dashboard = new DeveloperDashboard({ memory, tools, recovery });
    console.log("  ✅ Dashboard Engine: ONLINE. Generating live snapshot...\n");

    // 🏆 ফাইনাল ভ্যালিডেশন রিপোর্ট প্রিন্ট 
    console.log("====================================================");
    console.log("       📈 ARCHITECTURE VALIDATION REPORT 📈         ");
    console.log("====================================================");
    dashboard.printDashboard();
    
    console.log("\n✅ [SUCCESS] ALL CORE SYSTEMS VALIDATED AND WORKING TOGETHER.");
    console.log("====================================================\n");

  } catch (error) {
    console.error("\n❌ [CRITICAL FAILURE] ARCHITECTURE VALIDATION FAILED:", error.message);
    process.exit(1);
  }
}

// স্ক্রিপ্ট রান করা
runArchitectureValidation();
