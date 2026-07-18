// frontend/js/admin-dashboard.js
/**
 * Admin Dashboard Module
 * Extracted from ui-dashboard.js - Handles strictly Admin Cockpit & Telemetry visuals
 */
window.AdminDashboard = {
    latestTelemetrySnapshot: null,
    
    init: function() {
        console.log('[ORBIS] Admin Dashboard Cockpit Live.');
    },

    syncAndRenderLogs: function(serverLogs) {
        if (!serverLogs || !Array.isArray(serverLogs)) return;
        let localLogs = JSON.parse(localStorage.getItem('orbis_logs') || '[]');
        
        serverLogs.forEach(log => {
            let logStr = `[${log.time}] [${log.level}]: ${log.message}`;
            let isDuplicate = localLogs.slice(-20).some(l => l.includes(log.time) && l.includes(log.message));
            if (!isDuplicate) localLogs.push(logStr);
        });
        
        if (localLogs.length > 100) localLogs = localLogs.slice(localLogs.length - 100);
        localStorage.setItem('orbis_logs', JSON.stringify(localLogs));
        
        const logBox = document.getElementById('log-box');
        if (logBox) {
            logBox.innerHTML = localLogs.map(logStr => {
                let color = '#f8fafc'; 
                if (logStr.includes('[ERR]') || logStr.includes('FAILED') || logStr.includes('503')) color = '#ef4444'; 
                else if (logStr.includes('[WARN]') || logStr.includes('HIGH')) color = '#facc15'; 
                else if (logStr.includes('[OK]') || logStr.includes('ONLINE') || logStr.includes('Success')) color = '#10b981'; 
                else if (logStr.includes('[INFO]')) color = '#38bdf8'; 
                
                return `<div style="color:${color}; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.05);">${logStr}</div>`;
            }).join('');
            logBox.scrollTop = logBox.scrollHeight; 
        }
    },

    updateCockpitUI: function(telemetry) {
        if (!telemetry) return;
        this.latestTelemetrySnapshot = telemetry; 

        console.log("📦 RAW PAYLOAD RECEIVED:", telemetry);

        if (telemetry.logs) this.syncAndRenderLogs(telemetry.logs);

        // Map telemetry to the Sidebar IDs and Admin Dashboard top-bar IDs
        if(telemetry.apiPing) {
            const el = document.getElementById('net-ping');
            if(el) el.innerText = `${telemetry.apiPing} ms`;
            
            const livePingEl = document.getElementById('live-ping');
            if(livePingEl) livePingEl.innerText = telemetry.apiPing; // Admin Top Stat
        }
        
        if(telemetry.ramUsage) {
            const el = document.getElementById('sys-ram');
            if(el) el.innerText = `${telemetry.ramUsage} MB`;
            
            const liveRamEl = document.getElementById('live-ram');
            if(liveRamEl) liveRamEl.innerText = telemetry.ramUsage; // Admin Top Stat
        }

        if (telemetry.engineering_inspector) {
            const req = telemetry.engineering_inspector.active_requests || 0;
            const reqEl = document.getElementById('ui-insp-req');
            if(reqEl) reqEl.innerText = req;
            
            const loadEl = document.getElementById('ui-insp-load');
            if(loadEl) {
                loadEl.innerText = telemetry.engineering_inspector.load_status || 'LOW';
                loadEl.style.color = telemetry.engineering_inspector.load_status === 'HIGH' ? '#facc15' : '#10b981';
            }
            
            const usedEl = document.getElementById('token-used');
            if(usedEl) usedEl.innerText = req * 154; 
            
            const costEl = document.getElementById('token-cost');
            if(costEl) costEl.innerText = '$' + ((req * 154) * 0.00005).toFixed(4);
        }

        if (telemetry.provider_monitor) {
            const provEl = document.getElementById('ui-insp-prov');
            if (provEl) {
                provEl.innerText = telemetry.provider_monitor.status || 'ONLINE';
                provEl.style.color = telemetry.provider_monitor.status === 'OFFLINE' ? '#ef4444' : '#10b981';
            }
        }

        if (telemetry.latency || telemetry.apiPing) {
            const basePing = telemetry.apiPing || telemetry.latency || 45;
            const readEl = document.getElementById('db-read-ping');
            if(readEl) readEl.innerText = Math.max(12, basePing - 15) + ' ms';
            const writeEl = document.getElementById('db-write-ping');
            if(writeEl) writeEl.innerText = (basePing + 10) + ' ms';
        }

        // Generate X-Ray Routing Canvas
        const treeCanvas = document.getElementById('dependency-tree-canvas');
        if (treeCanvas) {
            const activeBus = telemetry.lastRoute || 'CORE_ROUTER';
            const status = (telemetry.provider_monitor && telemetry.provider_monitor.status) || 'ONLINE';
            const memNodes = telemetry.memoryNodes || 0;
            
            let treeHTML = `<div style="text-align:left; padding-left: 5px; line-height: 1.5; font-size: 0.65rem;">`;
            treeHTML += `<div style="color: #cbd5e1;">[👤] Client Interface</div>`;
            treeHTML += `<div style="color: #64748b;"> └── [🚦] Express Router</div>`;
            treeHTML += `<div style="color: #38bdf8; font-weight: bold;"> &nbsp;&nbsp;&nbsp;&nbsp;└── [⚙️] BrainController (CORE)</div>`;
            
            treeHTML += `<div style="color: #a78bfa;"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── [💾] Supabase Memory (${memNodes} Nodes)</div>`;
            treeHTML += `<div style="color: #94a3b8;"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── [⚡] Cognitive Switch</div>`;
            
            if (activeBus.includes('Local') || status === 'OFFLINE' || status === 'ERROR' || status === '503') {
                treeHTML += `<div style="color: #10b981; font-weight:bold;"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── [🧠] LocalNLPEngine (ACTIVE)</div>`;
                treeHTML += `<div style="color: #475569;"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── [☁️] GeminiProvider (STANDBY)</div>`;
                if (status === 'OFFLINE' || status === 'ERROR' || status === '503') {
                    treeHTML += `<div style="color: #ef4444; margin-top:2px; font-weight:bold; animation: blinker 1s infinite;"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⚠️ API_FAULT_DETECTED</div>`;
                }
            } else {
                treeHTML += `<div style="color: #475569;"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── [🧠] LocalNLPEngine (BYPASS)</div>`;
                treeHTML += `<div style="color: #10b981; font-weight:bold;"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── [☁️] GeminiProvider (ACTIVE)</div>`;
            }

            treeHTML += `</div>`;
            treeCanvas.innerHTML = treeHTML;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.AdminDashboard.init();
});
