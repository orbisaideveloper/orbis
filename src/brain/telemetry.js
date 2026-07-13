// src/brain/telemetry.js
import os from 'os';

// গ্লোবাল মেমোরি ও বাস্কেট সেটআপ (যাতে ডেটা লস না হয়)
if (typeof global.requestCount === 'undefined') {
    global.requestCount = 0;
    global.systemLogs = [];
    global.activeNodes = 36; 
    global.lastRouteStr = "CORE_ROUTER";
}

export const addLog = (type, message) => {
    try {
        const time = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
        // ফ্রন্টএন্ড 'level' বা 'type' হিসেবে ডেটা খোঁজে
        global.systemLogs.push({ time, level: type, message });
        
        if (global.systemLogs.length > 100) {
            global.systemLogs.shift();
        }
    } catch (e) {
        console.error("Telemetry Error:", e);
    }
};

export const getTelemetryData = () => {
    return {
        // এই নামগুলো আপনার ui-telemetry.js এর সাথে ১০০% মেলানো হয়েছে
        ramUsage: (process.memoryUsage().rss / 1024 / 1024).toFixed(0),
        memoryNodes: global.activeNodes,
        lastRoute: global.lastRouteStr,
        latency: 12, 
        logs: global.systemLogs 
    };
};
