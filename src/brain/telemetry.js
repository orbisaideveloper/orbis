// src/brain/telemetry.js - Real-time Node.js Telemetry Sensor (ES Module Fix)
import os from 'os';

// গ্লোবাল রিকোয়েস্ট কাউন্টার
if (typeof global.requestCount === 'undefined') {
    global.requestCount = 0;
}

export const getTelemetryData = () => {
    // process.memoryUsage().rss আমাদের অ্যাপের আসল র‍্যাম ব্যবহার বের করে (MB তে)
    const realRamUsage = process.memoryUsage().rss / 1024 / 1024;
    
    // process.uptime() সার্ভার কতক্ষণ ধরে চালু আছে তার একদম সঠিক সেকেন্ড দেয়
    const realUptime = Math.round(process.uptime());

    return {
        memoryEngine: {
            ramUsageMB: realRamUsage.toFixed(2),
            osTotalMem: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + ' GB'
        },
        brainHub: {
            uptime: realUptime,
            activeWorkflow: "IDLE"
        },
        performance: {
            totalRequests: global.requestCount
        }
    };
};

export const logRequest = () => {
    global.requestCount += 1;
};
