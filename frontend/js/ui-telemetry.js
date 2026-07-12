// ui-telemetry.js - Frontend Telemetry Display
async function fetchTelemetry() {
    try {
        const res = await fetch('/api/telemetry');
        if(!res.ok) throw new Error();
        const json = await res.json();
        
        if (json.success && json.data) {
            const d = json.data;
            if(getEl('glow-dot')) getEl('glow-dot').className = "status-glow online";
            if(getEl('status-text')) {
                getEl('status-text').innerText = "SYSTEM ONLINE";
                getEl('status-text').style.color = "var(--green)";
            }
            if(getEl('tel-uptime')) getEl('tel-uptime').innerText = (d.brainHub?.uptime || 0) + 's';
            if(getEl('tel-ram')) getEl('tel-ram').innerText = (d.memoryEngine?.ramUsageMB || 0) + ' MB';
            if(getEl('tel-wf')) getEl('tel-wf').innerText = d.brainHub?.activeWorkflow || "IDLE";
            if(getEl('tel-req')) getEl('tel-req').innerText = d.performance?.totalRequests || 0;
        }
    } catch (e) {
        if(getEl('glow-dot')) getEl('glow-dot').className = "status-glow offline";
        if(getEl('status-text')) {
            getEl('status-text').innerText = "OFFLINE Connecting...";
            getEl('status-text').style.color = "var(--saffron)";
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        setInterval(fetchTelemetry, 3000);
        fetchTelemetry();
    } catch(e) {}
});
