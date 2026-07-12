// src/brain/telemetry.js - Real-time Node.js Telemetry Sensor
const os = require('os');

// গ্লোবাল রিকোয়েস্ট কাউন্টার (যদি আগে থেকে না থাকে)
if (typeof global.requestCount === 'undefined') {
    global.requestCount = 0;
}

const getSystemStats = () => {
    // process.memoryUsage().rss আমাদের অ্যাপের আসল র‍্যাম ব্যবহার বের করে (MB তে)
    const realRamUsage = process.memoryUsage().rss / 1024 / 1024;
    
    // process.uptime() সার্ভার কতক্ষণ ধরে চালু আছে তার একদম সঠিক সেকেন্ড দেয়
    const realUptime = Math.round(process.uptime());

    return {
        memoryEngine: {
            ramUsageMB: realRamUsage.toFixed(2),
            osTotalMem: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + ' GB' // শুধু ব্যাকএন্ড লগের জন্য
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

// রিকোয়েস্ট কাউন্ট বাড়ানোর ফাংশন (server.js থেকে কল করার জন্য)
const logRequest = () => {
    global.requestCount += 1;
};

module.exports = { 
    getSystemStats,
    logRequest
};
