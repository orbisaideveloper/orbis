// frontend/js/ui-telemetry.js - Final Autonomous X-Ray Engine
let isXRayFetching = false;

// সেন্ট্রাল আপডেট ফাংশন
window.updateXRayReport = function(data, computedPing) {
    if (!data) return;

    // ১. হার্ডওয়্যার ও নেটওয়ার্ক আপডেট
    const ramEl = document.getElementById('sys-ram');
    if (ramEl) ramEl.innerText = (data.ramUsage || 0) + ' MB';
    
    const pingEl = document.getElementById('net-ping');
    if (pingEl) pingEl.innerText = (computedPing || 0) + ' ms';
    
    const nodesEl = document.getElementById('mem-nodes');
    if (nodesEl) nodesEl.innerText = (data.memoryNodes || 0);

    // ২. এক্স-রে ফাইল হেলথ স্ট্যাটাস
    const xrayMap = {
        'st-chat': typeof window.dispatchToAI === 'function',
        'st-voice': typeof window.startVoiceEngine === 'function',
        'st-router': !!window.WorkflowRouter,
        'st-supabase': data.memoryNodes > 0
    };

    for (let id in xrayMap) {
        const el = document.getElementById(id);
        if (el) {
            el.innerText = xrayMap[id] ? 'OK' : 'FAIL';
            el.className = 'xray-status ' + (xrayMap[id] ? 'status-ok' : 'status-fail');
        }
    }
};

// ডাটা পোলিং
setInterval(async () => {
    if (isXRayFetching) return;
    isXRayFetching = true;
    const start = Date.now();

    try {
        const response = await fetch('/api/telemetry');
        if (response.ok) {
            const result = await response.json();
            const ping = Date.now() - start;
            if (result.success && result.telemetry) {
                window.updateXRayReport(result.telemetry, ping);
            }
        }
    } catch (e) {
        console.error("Telemetry Connection Failed");
    } finally {
        isXRayFetching = false;
    }
}, 2000);
