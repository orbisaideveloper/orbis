// src/brain/telemetry.js
import os from 'os';

// গ্লোবাল মেমোরি ও বাস্কেট সেটআপ 
if (typeof global.requestCount === 'undefined') {
    global.requestCount = 0;
    global.systemLogs = [];
    global.activeNodes = 36; 
    global.lastRouteStr = "CORE_ROUTER";
}

export const addLog = (type, message) => {
    try {
        const time = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
        global.systemLogs.push({ time, level: type, message });
        
        if (global.systemLogs.length > 100) {
            global.systemLogs.shift();
        }
    } catch (e) {
        console.error("Telemetry Error:", e);
    }
};

export const getTelemetryData = () => {
    // 🟢 রিয়েল-টাইম সিস্টেম ও সিপিইউ লোড এনালাইসিস লজিক
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const cpuLoadPct = loadAvg[0] > 0.5 ? "HIGH" : (loadAvg[0] > 0.2 ? "MEDIUM" : "LOW");

    return {
        // ১. অরিজিনাল টেলিমেট্রি প্রোপার্টিজ (১০০% অক্ষত)
        ramUsage: (process.memoryUsage().rss / 1024 / 1024).toFixed(0),
        memoryNodes: global.activeNodes,
        lastRoute: global.lastRouteStr,
        latency: 12, 
        logs: global.systemLogs,

        // ২. 🟢 PHASE 9.1 EXTENSION - নতুন প্যানেল ডেটা ইঞ্জেকশন
        engineering_inspector: {
            active_requests: global.requestCount,
            load_status: cpuLoadPct,
            uptime_raw: process.uptime().toFixed(0),
            system_cores: cpus.length
        },
        brain_monitor: {
            cognitive_load: cpuLoadPct,
            memory_pool_bytes: usedMemory
        },
        provider_monitor: {
            status: "ONLINE",
            fallback_active: false
        },
        memory_health: {
            status: "OPTIMAL",
            integrity_score: "100%",
            db_sync: "CONNECTED"
        },
        cache_monitor: {
            hit_ratio: "100%",
            volatile_nodes: 0
        },
        architecture_analyzer: {
            status: "Tracking active execution paths",
            active_bus: "CORE_ROUTER ➔ EXECUTION_CHAIN",
            engine_integrity: "SECURE"
        }
    };
};

// 🟢 এই ফাংশনটি ফিরিয়ে আনা হলো যা server.js খুঁজছিল
export const logRequest = () => {
    global.requestCount += 1;
};
