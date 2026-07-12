// src/brain/telemetry.js - Real-time Node.js Telemetry Sensor & Log Basket
import os from 'os';

// গ্লোবাল রিকোয়েস্ট কাউন্টার এবং লগ বাস্কেট
if (typeof global.requestCount === 'undefined') {
    global.requestCount = 0;
    global.systemLogs = []; // 🟢 নতুন: লগ জমানোর বাস্কেট
}

// 🟢 নতুন মেথড: যেকোনো ফাইল থেকে লগ বাস্কেটে ডেটা ঢোকানোর জন্য
export const addLog = (type, message) => {
    // বর্তমান সময় বের করা (hh:mm:ss)
    const time = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
    
    // বাস্কেটে নতুন লগ যুক্ত করা
    global.systemLogs.push({ time, type, message });
    
    // মেমরি বাঁচাতে বাস্কেটে শুধু শেষের ১০০টি লগ ধরে রাখব
    if (global.systemLogs.length > 100) {
        global.systemLogs.shift(); 
    }
};

export const getTelemetryData = () => {
    const realRamUsage = process.memoryUsage().rss / 1024 / 1024;
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
        },
        logs: global.systemLogs // 🟢 নতুন: ফ্রন্টএন্ডে পাঠানোর জন্য লগ বাস্কেট
    };
};

export const logRequest = () => {
    global.requestCount += 1;
};
