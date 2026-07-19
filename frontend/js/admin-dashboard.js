// frontend/js/admin-dashboard.js
/**
 * Admin Dashboard Module
 * CHAPTER 2 & 3: Cockpit Rendering Migration & X-Ray Integration
 * REFACTORED: SonarCloud Code Smells Resolved
 */

// Initialize Shared Platform Context (Single Source of Truth)
window.ORBIS_SHARED = window.ORBIS_SHARED || {};
window.ORBIS_SHARED.telemetry = window.ORBIS_SHARED.telemetry || {
    snapshot: null,
    lastUpdate: null
};

window.AdminDashboard = {
    init: function() {
        console.log('[ORBIS] Admin Dashboard Cockpit Live. X-Ray Diagnostics Unified.');
    },

    syncAndRenderLogs: function(serverLogs) {
        if (!serverLogs || !Array.isArray(serverLogs)) return;
        let localLogs = JSON.parse(localStorage.getItem('orbis_logs') || '[]');
        
        serverLogs.forEach(log => {
            let logStr = `[${log.time}] [${log.level}]: ${log.message}`;
            let isDuplicate = localLogs.slice(-20).some(l => l.includes(log.time) && l.includes(log.message));
            if (!isDuplicate) localLogs.push(logStr);
        });
        
        // [FIXED] Issue 1: Prefer negative index over length minus index for 'slice'
        if (localLogs.length > 100) localLogs = localLogs.slice(-100);
        
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

    // --- Helper Functions to Reduce Cognitive Complexity ---

    _updateChatStatus: function() {
        if (typeof window.dispatchToAI === 'function') {
            const el = document.getElementById('st-chat');
            if(el) { el.innerText = "ACTIVE"; el.className = "xray-status status-ok"; }
        } else {
            // [FIXED] Issue 3: Use TypeError instead of generic Error
            throw new TypeError("ui-chat.js: Critical Ingestion Failure");
        }
    },

    _updateVoiceStatus: function() {
        const el = document.getElementById('st-voice');
        if (!el) return;
        if (typeof window.startVoiceEngine === 'function') {
            el.innerText = "READY"; el.className = "xray-status status-ok";
        } else {
            el.innerText = "DEAD"; el.className = "xray-status status-fail";
        }
    },

    _updateMemoryStatus: function(data) {
        const el = document.getElementById('st-supabase');
        const memSt = document.getElementById('mem-status');
        if (data.memoryNodes !== undefined) {
            if(el) { el.innerText = "CONNECTED"; el.className = "xray-status status-ok"; }
            if(memSt) { memSt.innerText = "OK"; memSt.style.color = "#00e676"; }
        } else {
            if(el) { el.innerText = "DROP_ALERT"; el.className = "xray-status status-fail"; }
            if(memSt) { memSt.innerText = "ERROR"; memSt.style.color = "#ff4d4d"; }
        }
    },

    _updateRouterStatus: function(data) {
        const routerEl = document.getElementById('st-router');
        if (!routerEl) return;
        if (data.lastRoute) {
            routerEl.innerText = "ACTIVE";
            routerEl.className = "xray-status status-ok";
            routerEl.style.color = "#00e676";
        } else {
            routerEl.innerText = "STANDBY";
            routerEl.style.color = "#facc15";
        }
    },

    // [FIXED] Issue 2: Reduced Cognitive Complexity by extracting logic to helpers
    syncXRayDiagnostics: function(data, computedPing) {
        try {
            this._updateChatStatus();
            this._updateVoiceStatus();
            this._updateMemoryStatus(data);
            this._updateRouterStatus(data);

            const errBox = document.getElementById('xray-err-trace');
            if(errBox) errBox.style.display = 'none';

        } catch (err) {
            const errBox = document.getElementById('xray-err-trace');
            if (errBox) {
                errBox.style.display = 'block';
                errBox.innerText = `🚨 CRITICAL FAULT:\n${err.message}`;
            }
        }
    },

    _updateCoreMetrics: function(telemetry, computedPing) {
        if(document.getElementById('net-ping')) document.getElementById('net-ping').innerText = `${computedPing} ms`;
        if(document.getElementById('live-ping')) document.getElementById('live-ping').innerText = computedPing;
        if(document.getElementById('prov-gemini-latency') && telemetry.latency) document.getElementById('prov-gemini-latency').innerText = `${telemetry.latency} ms`;
        if(document.getElementById('router-last') && telemetry.lastRoute) document.getElementById('router-last').innerText = telemetry.lastRoute;
        
        if(telemetry.ramUsage) {
            if(document.getElementById('sys-ram')) document.getElementById('sys-ram').innerText = `${telemetry.ramUsage} MB`;
            if(document.getElementById('live-ram')) document.getElementById('live-ram').innerText = telemetry.ramUsage;
        }

        if(telemetry.memoryNodes !== undefined && document.getElementById('mem-nodes')) {
            document.getElementById('mem-nodes').innerText = telemetry.memoryNodes;
        }
    },

    _updateInspectorMetrics: function(telemetry) {
        if (!telemetry.engineering_inspector) return;
        
        const req = telemetry.engineering_inspector.active_requests || 0;
        const reqEl = document.getElementById('ui-insp-req');
        if(reqEl) reqEl.innerText = req;
        
        const loadEl = document.getElementById('ui-insp-load');
        if(loadEl) {
            loadEl.innerText = telemetry.engineering_inspector.load_status || 'LOW';
            // [FIXED] Hidden Bug: 'loadloadEl' was a typo in original code
            loadEl.style.color = telemetry.engineering_inspector.load_status === 'HIGH' ? '#facc15' : '#10b981';
        }
        
        const usedEl = document.getElementById('token-used');
        if(usedEl) usedEl.innerText = req * 154; 
        
        const costEl = document.getElementById('token-cost');
        if(costEl) costEl.innerText = '$' + ((req * 154) * 0.00005).toFixed(4);
    },

    _updateProviderMetrics: function(telemetry) {
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
    },

    _renderRoutingCanvas: function(telemetry) {
        const treeCanvas = document.getElementById('dependency-tree-canvas');
        if (!treeCanvas) return;

        const activeBus = telemetry.lastRoute || 'CORE_ROUTER';
        // [FIXED] Issue 5: Prefer using an optional chain expression (?.)
        const status = telemetry.provider_monitor?.status || 'ONLINE';
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
    },

    // [FIXED] Issue 4: Reduced Cognitive Complexity by extracting logic to helpers
    updateCockpitUI: function(telemetry) {
        if (!telemetry) return;
        
        window.ORBIS_SHARED.telemetry.snapshot = telemetry;
        window.ORBIS_SHARED.telemetry.lastUpdate = Date.now();

        console.log("📦 [ADMIN COCKPIT] RAW PAYLOAD RECEIVED:", telemetry);

        if (telemetry.logs) this.syncAndRenderLogs(telemetry.logs);

        const computedPing = telemetry.apiPing || telemetry.latency || 8;
        
        // Delegating tasks to Helper Functions
        this._updateCoreMetrics(telemetry, computedPing);
        this.syncXRayDiagnostics(telemetry, computedPing);
        this._updateInspectorMetrics(telemetry);
        this._updateProviderMetrics(telemetry);
        this._renderRoutingCanvas(telemetry);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.AdminDashboard.init();
});
