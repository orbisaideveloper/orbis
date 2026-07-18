// frontend/js/ui-telemetry.js - System X-Ray Core Scanner
/**
 * * PHASE 10.4: Master Node & X-Ray Precision Fix
 * This file fetches data and distributes it to the UI Dashboard.
 * (Note: Master Telemetry Engine migrated to Admin Layer - Chapter 1)
 */

window.syncXRayData = function(data, computedPing = 8) {
    if (!data) return;

    // ১. হার্ডওয়্যার ও নেটওয়ার্ক আপডেট
    if (document.getElementById('sys-ram') && data.ramUsage) document.getElementById('sys-ram').innerText = data.ramUsage + ' MB';
    if (document.getElementById('net-ping')) document.getElementById('net-ping').innerText = computedPing + ' ms';
    if (document.getElementById('prov-gemini-latency') && data.latency) document.getElementById('prov-gemini-latency').innerText = data.latency + ' ms';
    if (document.getElementById('mem-nodes') && data.memoryNodes !== undefined) document.getElementById('mem-nodes').innerText = data.memoryNodes;
    if (document.getElementById('router-last') && data.lastRoute) document.getElementById('router-last').innerText = data.lastRoute;

    // ২. এক্স-রে ফাইল হেলথ চেকার (প্রতিটা ফাইলের লাইভ সোর্স স্টেট ট্র্যাকার)
    try {
        // Chat Module Check
        if (typeof window.dispatchToAI === 'function') {
            document.getElementById('st-chat').innerText = "ACTIVE";
            document.getElementById('st-chat').className = "xray-status status-ok";
        } else {
            throw new Error("ui-chat.js: Critical Ingestion Failure");
        }

        // Voice Module Check
        if (typeof window.startVoiceEngine === 'function') {
            document.getElementById('st-voice').innerText = "READY";
            document.getElementById('st-voice').className = "xray-status status-ok";
        } else {
            document.getElementById('st-voice').innerText = "DEAD";
            document.getElementById('st-voice').className = "xray-status status-fail";
        }

        // 🟢 DB Module Check Fix (Nodes 0 হলেও ডাটাবেস কানেক্টেড থাকতে পারে)
        if (data.memoryNodes !== undefined) {
            document.getElementById('st-supabase').innerText = "CONNECTED";
            document.getElementById('st-supabase').className = "xray-status status-ok";
            if (document.getElementById('mem-status')) {
                document.getElementById('mem-status').innerText = "OK";
                document.getElementById('mem-status').style.color = "#00e676";
            }
        } else {
            document.getElementById('st-supabase').innerText = "DROP_ALERT";
            document.getElementById('st-supabase').className = "xray-status status-fail";
            if (document.getElementById('mem-status')) {
                document.getElementById('mem-status').innerText = "ERROR";
                document.getElementById('mem-status').style.color = "#ff4d4d";
            }
        }

        // 🟢 Router Module Check Fix (আগে এটি মিসিং ছিল)
        if (document.getElementById('st-router')) {
            if (data.lastRoute) {
                document.getElementById('st-router').innerText = "ACTIVE";
                document.getElementById('st-router').className = "xray-status status-ok";
                document.getElementById('st-router').style.color = "#00e676";
            } else {
                document.getElementById('st-router').innerText = "STANDBY";
                document.getElementById('st-router').style.color = "#facc15";
            }
        }

        if(document.getElementById('xray-err-trace')) document.getElementById('xray-err-trace').style.display = 'none';

    } catch (err) {
        const errBox = document.getElementById('xray-err-trace');
        if (errBox) {
            errBox.style.display = 'block';
            errBox.innerText = `🚨 CRITICAL FAULT:\n${err.message}`;
        }
    }
};

if (window.globalEventBus) {
    window.globalEventBus.on('TelemetryUpdated', (data) => {
        window.syncXRayData(data, data.apiPing || 8);
    });
}
console.log("Ultimate System X-Ray Active (Slave Node - Master Engine Migrated).");
