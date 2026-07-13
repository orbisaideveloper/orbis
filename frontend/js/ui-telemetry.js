// frontend/js/ui-telemetry.js - System X-Ray Core Scanner
let isXRayFetching = false;

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
        if (typeof window.dispatchToAI === 'function') {
            document.getElementById('st-chat').innerText = "ACTIVE";
            document.getElementById('st-chat').className = "xray-status status-ok";
        } else {
            throw new Error("ui-chat.js: Critical Ingestion Failure");
        }

        if (typeof window.startVoiceEngine === 'function') {
            document.getElementById('st-voice').innerText = "READY";
            document.getElementById('st-voice').className = "xray-status status-ok";
        } else {
            document.getElementById('st-voice').innerText = "DEAD";
            document.getElementById('st-voice').className = "xray-status status-fail";
        }

        if (data.memoryNodes && data.memoryNodes > 0) {
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

        if(document.getElementById('xray-err-trace')) document.getElementById('xray-err-trace').style.display = 'none';

    } catch (err) {
        const errBox = document.getElementById('xray-err-trace');
        if (errBox) {
            errBox.style.display = 'block';
            errBox.innerText = `🚨 CRITICAL FAULT:\n${err.message}`;
        }
    }
};

// লাইভ টার্মিনাল লগ রেন্ডারার
function renderTerminalLogs(logs) {
    const logBox = document.getElementById('log-box');
    if (!logBox || !logs) return;

    logBox.innerHTML = '';
    logs.forEach(log => {
        const line = document.createElement('div');
        line.style.marginBottom = '3px';
        const level = log.level || log.type || 'INFO';
        const msg = log.message || log.msg || '';
        
        line.style.color = level === 'ERR' || level === 'ERROR' ? '#ff4d4d' : level === 'OK' ? '#00e676' : '#64b5f6';
        line.innerText = `[${log.time}] [${level}]: ${msg}`;
        logBox.appendChild(line);
    });
    logBox.scrollTop = logBox.scrollHeight;
}

// প্রতি ২ সেকেন্ড পর পর ব্যাকএন্ড থেকে সোর্স রিপোর্ট স্ক্যান করার অটো লুপ
setInterval(async () => {
    if (isXRayFetching) return;
    isXRayFetching = true;
    const start = Date.now();

    try {
        const response = await fetch('/api/telemetry');
        if (response.ok) {
            const result = await response.json();
            const computedPing = Date.now() - start;

            // ডেটা ডিরেক্টলি বা result.telemetry এর মাধ্যমে রিসিভ করা
            const telemetryData = result.telemetry || result;
            
            if (telemetryData) {
                window.syncXRayData(telemetryData, computedPing);
                if (telemetryData.logs) renderTerminalLogs(telemetryData.logs);
            }
        }
    } catch (e) {
        if (document.getElementById('st-telemetry')) {
            document.getElementById('st-telemetry').innerText = "OFFLINE";
            document.getElementById('st-telemetry').className = "xray-status status-fail";
        }
    } finally {
        isXRayFetching = false;
    }
}, 2000);

if (window.globalEventBus) {
    window.globalEventBus.on('TelemetryUpdated', (data) => {
        window.syncXRayData(data);
    });
}
console.log("Ultimate System X-Ray Active.");
