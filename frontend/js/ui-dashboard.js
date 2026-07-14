// frontend/js/ui-dashboard.js
/**
 * UI Dashboard Module
 * * PHASE 10.3: Full-Scale Architectural Schema & Popup Data Fix
 */
window.Dashboard = {
    startTime: Date.now(),
    lastEventTimestamp: 0,
    latestTelemetrySnapshot: null, 
    
    init: function() {
        this.startUptimeCounter();
        this.setupCardInteractions();
        this.setupOutsideClickToClose(); 
        window.printLog('OK', 'Dashboard Diagnostic System Live.');
    },

    startUptimeCounter: function() {
        setInterval(() => {
            const el = document.getElementById('sys-uptime');
            if (el) el.innerText = Math.floor((Date.now() - this.startTime) / 1000) + ' s';
        }, 1000);
    },

    setupOutsideClickToClose: function() {
        const overlay = document.getElementById('dashboard-overlay');
        if (overlay) {
            ['click', 'touchstart'].forEach(evt => {
                overlay.addEventListener(evt, (e) => {
                    e.preventDefault(); 
                    const sidebar = document.getElementById('dev-sidebar');
                    if (sidebar) sidebar.style.display = 'none';
                    overlay.style.display = 'none';
                    
                    if (typeof window.toggleSidebar === 'function') window.toggleSidebar();
                    else if (typeof toggleSidebar === 'function') toggleSidebar();
                }, { passive: false });
            });
        }
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

        // Raw payload tracker
        console.log("📦 RAW PAYLOAD RECEIVED:", telemetry);

        if (telemetry.logs) this.syncAndRenderLogs(telemetry.logs);

        if(telemetry.apiPing) {
            const el = document.getElementById('net-ping');
            if(el) el.innerText = `${telemetry.apiPing} ms`;
        }
        if(telemetry.ramUsage) {
            const el = document.getElementById('sys-ram');
            if(el) el.innerText = `${telemetry.ramUsage} MB`;
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

        // 🟢 ফুল-স্কেল আর্কিটেকচারাল ট্রি অ্যানিমেশন
        const treeCanvas = document.getElementById('dependency-tree-canvas');
        if (treeCanvas) {
            const activeBus = telemetry.lastRoute || 'CORE_ROUTER';
            const status = (telemetry.provider_monitor && telemetry.provider_monitor.status) || 'ONLINE';
            const memNodes = telemetry.memoryNodes || 0;
            
            let treeHTML = `<div style="text-align:left; padding-left: 5px; line-height: 1.5; font-size: 0.65rem;">`;
            treeHTML += `<div style="color: #cbd5e1;">[👤] Client Interface</div>`;
            treeHTML += `<div style="color: #64748b;"> └── [🚦] Express Router</div>`;
            treeHTML += `<div style="color: #38bdf8; font-weight: bold;"> &nbsp;&nbsp;&nbsp;&nbsp;└── [⚙️] BrainController (CORE)</div>`;
            
            // Memory Branch
            treeHTML += `<div style="color: #a78bfa;"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── [💾] Supabase Memory (${memNodes} Nodes)</div>`;
            
            // Engine Branch
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
    },

    formatHumanText: function(dataObj) {
        if (!dataObj) return "No data available.";
        if (typeof dataObj === 'string') return dataObj.replace(/[{}"\[\]]/g, '').trim();
        let readableText = "";
        for (let key in dataObj) {
            let cleanKey = key.replace(/_/g, ' ').toUpperCase();
            // Object হলে JSON স্ট্রিং করে দেখানো
            let val = typeof dataObj[key] === 'object' ? JSON.stringify(dataObj[key]) : dataObj[key];
            readableText += `▪ ${cleanKey}: ${val}\n`;
        }
        return readableText.trim();
    },

    setupCardInteractions: function() {
        const clickableCards = document.querySelectorAll('.panel:not(.has-click-listener), .panel div[style*="border-radius: 4px"]:not(.has-click-listener)');
        
        clickableCards.forEach(card => {
            card.classList.add('has-click-listener');
            card.style.cursor = 'pointer'; 
            
            card.addEventListener('click', (e) => {
                if(e.target.closest('.log-controls') || e.target.closest('.filter-badge') || e.target.closest('input') || e.target.closest('button')) return;
                e.stopPropagation(); 
                
                let header = card.querySelector('.panel-header')?.innerText.trim() || card.querySelector('div[style*="font-weight: bold"]')?.innerText.trim() || 'System Details';
                let rawDataObj = "";
                
                // 🟢 ডেটা ম্যাপিং ফিক্স
                if (header.includes('LOGS')) {
                    rawDataObj = document.querySelector('.terminal')?.innerText || "Log stream empty.";
                } else if (this.latestTelemetrySnapshot) {
                    if (header.includes('INSPECTOR')) rawDataObj = this.latestTelemetrySnapshot.engineering_inspector || "No Inspector Data";
                    else if (header.includes('HEALTH')) rawDataObj = this.latestTelemetrySnapshot.memory_health || "No Memory Data";
                    else if (header.includes('TOKENS')) rawDataObj = { Active_Requests: this.latestTelemetrySnapshot.engineering_inspector?.active_requests || 0 };
                    else if (header.includes('SPEED')) rawDataObj = { Read: document.getElementById('db-read-ping')?.innerText, Write: document.getElementById('db-write-ping')?.innerText };
                    else if (header.includes('DEPENDENCY') || header.includes('VISUAL')) rawDataObj = this.latestTelemetrySnapshot; // 🟢 পুরো JSON ডেটা দেখাবে
                    else if (header.includes('EXECUTION')) rawDataObj = this.latestTelemetrySnapshot.architecture_analyzer || "No Routing Data";
                    else if (header.includes('SUPABASE') || header.includes('MEMORY BUS')) rawDataObj = { Sync: "OK", Nodes: this.latestTelemetrySnapshot.memoryNodes || 0, Route: this.latestTelemetrySnapshot.lastRoute || "N/A" };
                    else rawDataObj = this.latestTelemetrySnapshot || "Data fetching in progress...";
                } else {
                    rawDataObj = "Awaiting Server Telemetry...";
                }

                const cleanTextToCopy = this.formatHumanText(rawDataObj);

                const extraTools = `
                    <div style="${header.includes('LOGS') ? '' : 'margin-top:15px; border-top:1px dashed #ccc; padding-top:15px;'}">
                        <textarea class="copy-log-area" style="width:100%; height:160px; font-family:monospace; font-size:0.8rem; background:#f8fafc; padding:12px; border:1px solid #cbd5e1; border-radius:6px; margin-bottom:12px; color:#334155; line-height:1.5;" readonly>${cleanTextToCopy}</textarea>
                        <button onclick="navigator.clipboard.writeText(this.previousElementSibling.value); this.innerText='✅ COPIED SUCCESSFULLY!'; this.style.background='#10b981';" style="width:100%; padding:12px; background:#1e3a8a; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; transition:0.3s;">📋 COPY FULL DATA</button>
                    </div>
                `;
                
                this.showMinimalModal(header, card.innerHTML.includes('copy-log-area') ? "" : card.innerHTML + extraTools);
            });
        });
    },

    showMinimalModal: function(title, content) {
        const modal = document.createElement('div');
        modal.className = 'orbis-modal'; 
        modal.style = "position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:92%; max-width:500px; max-height:85vh; background:white; z-index:99999; border:1px solid #e2e8f0; padding:20px; border-radius:12px; overflow-y:auto; box-shadow:0 15px 50px rgba(0,0,0,0.5); display:flex; flex-direction:column;";
        modal.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
                <h3 style="color:#1e3a8a; margin:0; font-size:1rem; font-weight:bold;">${title}</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; font-size:1.5rem; color:#ef4444; cursor:pointer; font-weight:bold; line-height:1;">×</button>
            </div>
            <div style="flex:1;">${content}</div>
        `;
        document.body.appendChild(modal);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.Dashboard.init();
});
