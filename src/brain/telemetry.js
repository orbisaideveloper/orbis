const os = require('os');

// ORBIS-এর গ্লোবাল সিস্টেম স্টেট ট্র্যাক করার জন্য অবজেক্ট
const systemState = {
    workflowState: 'IDLE', // অবস্থাগুলো হতে পারে: IDLE, PROCESSING, ERROR ইত্যাদি
    errorCount: 0
};

// সিস্টেমের লাইভ পারফরম্যান্স এবং টেলিমেট্রি ডেটা পাওয়ার ফাংশন
const getTelemetryData = () => {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
        timestamp: new Date().toISOString(),
        uptimeSeconds: process.uptime(), // সার্ভার কতক্ষণ ধরে চলছে
        memory: {
            totalMB: (totalMemory / 1024 / 1024).toFixed(2),
            usedMB: (usedMemory / 1024 / 1024).toFixed(2),
            freeMB: (freeMemory / 1024 / 1024).toFixed(2),
            usagePercent: ((usedMemory / totalMemory) * 100).toFixed(2) + '%'
        },
        workflow: systemState.workflowState,
        errors: systemState.errorCount
    };
};

// ওয়ার্কফ্লো স্টেট আপডেট করার জন্য হেল্পার ফাংশন
const updateWorkflowState = (newState) => {
    systemState.workflowState = newState;
};

// এরর ট্র্যাক করার জন্য হেল্পার ফাংশন
const logSystemError = () => {
    systemState.errorCount += 1;
};

module.exports = {
    getTelemetryData,
    updateWorkflowState,
    logSystemError
};
