// frontend/js/ui-dashboard.js
/**
 * UI Dashboard Module
 * * PHASE 10.1: Master-Slave Architecture (Slave Node)
 * This file ONLY handles UI updates and receives data from ui-telemetry.js
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

    // 🟢 গ্যারান্টেড টাচ ক্লোজ লজিক
    setupOutsideClickToClose: function() {
        const overlay = document.getElementById('dashboard-overlay');
        if (overlay) {
            ['click', 'touchstart'].forEach(evt => {
                overlay.addEventListener(evt, (e) => {
                    e.preventDefault(); 
                    const sidebar = document.getElementById('dev-sidebar');
                    if (sidebar) sidebar.style.display = 'none';
                    overlay.style.display = 'none';
                    
                    if (typeof window.toggleSidebar === 'function') {
                        window.toggleSidebar();
                    } else if (typeof toggleSidebar === 'function') {
                        toggleSidebar();
                    }
                }, { passive: false });
            });
        }
    },

    // 🟢 পার্মানেন্ট লগবুক: LocalStorage এবং কালার কোডিং লজিক
    syncAndRenderLogs: function(serverLogs) {
        if (!serverLogs || !Array.isArray(serverLogs)) return;
        
        let localLogs = JSON.parse(localStorage.getItem('orbis_logs') || '[]');
        
        serverLogs.forEach(log => {
            let logStr = `[${log.time}] [${log.level}]: ${log.message}`;
            let isDuplicate = localLogs.slice(-20).some(l => l.includes(log.time) && l.includes(log.message));
            if (!isDuplicate) {
                localLogs.push(logStr);
            }
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

    // 🟢 এই ফাংশনটি এখন মাস্টার (ui-telemetry.js) থেকে কল হবে
    updateCockpitUI: function(telemetry) {
        if (!telemetry) return;
        this.latestTelemetrySnapshot = telemetry; 

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
            document.getElementById('ui-insp-req').innerText = req;
            document.getElementById('ui-insp-load').innerText = telemetry.engineering_inspector.load_status || 'LOW';
            document.getElementById('ui-insp-load').style.color = telemetry.engineering_inspector.load_status === 'HIGH' ? '#facc15' : '#10b981';
            
            document.getElementById('token-used').innerText = req * 154; 
            document.getElementById('token-cost').innerText = '$' + ((req * 154) * 0.00005).toFixed(4);
        }

        if (telemetry.provider_monitor) {
            document.getElementById('ui-insp-prov').innerText = telemetry.provider_monitor.status || 'ONLINE';
            document.getElementById('ui-insp-prov').style.color = telemetry.provider_monitor.status === 'OFFLINE' ? '#ef4444' : '#10b981';
        }

        if (telemetry.latency || telemetry.apiPing) {
            const basePing = telemetry.apiPing || telemetry.latency || 45;
            document.getElementById('db-read-ping').innerText = Math.max(12, basePing - 15) + ' ms';
            document.getElementById('db-write-ping').innerText = (basePing + 10) + ' ms';
        }

        // 🟢 শক্তিশালী ডিপেনডেন্সি ট্রি লজিক
        const treeCanvas = document.getElementById('dependency-tree-canvas');
        if (treeCanvas) {
            const activeBus = telemetry.lastRoute || 'CORE_ROUTER';
            const status = (telemetry.provider_monitor && telemetry.provider_monitor.status) || 'ONLINE';
            
            let treeHTML = `<div style="text-align:left; padding-left: 20px;">`;
            treeHTML += `<div style="color: #38bdf8; margin-bottom:4px;">[⚙️] BrainController.js</div>`;
            treeHTML += `<div style="border-left: 1px solid #475569; margin-left: 10px; padding-left: 10px;">`;
            
            if (activeBus.includes('Local') || status === 'OFFLINE' || status === 'ERROR' || status === '503') {
                treeHTML += `<div style="color: #10b981; margin-bottom:4px;"> ├── [🧠] LocalNLPEngine (ACTIVE)</div>`;
                treeHTML += `<div style="color: #64748b;"> └── [🌐] GeminiProvider (STANDBY)</div>`;
            } else {
                treeHTML += `<div style="color: #64748b; margin-bottom:4px;"> ├── [🧠] LocalNLPEngine (BYPASS)</div>`;
                treeHTML += `<div style="color: #10b981;"> └── [🌐] GeminiProvider (ACTIVE)</div>`;
            }

            if (status === 'ERROR' || status === '503' || activeBus.includes('Fallback')) {
                 treeHTML += `<div style="color: #ef4444; margin-top:4px; font-weight:bold; animation: blinker 1s infinite;"> &nbsp;&nbsp;&nbsp;&nbsp; ⚠️ API_FAULT_DETECTED</div>`;
            }

            treeHTML += `</div></div>`;
            treeCanvas.innerHTML = treeHTML;
        }

        const pathNodes = document.querySelectorAll('.execution-path span, .panel-body span');
        if(pathNodes && telemetry.lastRoute) {
            pathNodes.forEach(node => {
                if(telemetry.lastRoute.includes(node.innerText)) {
                    node.style.color = 'var(--green, green)';
                    node.style.fontWeight = 'bold';
                } else {
                    node.style.color = '';
                    node.style.fontWeight = '';
                }
            });
        }
    },

    formatHumanText: function(dataObj) {
        if (!dataObj) return "No data available.";
        if (typeof dataObj === 'string') return dataObj.replace(/[{}"\[\]]/g, '').trim();
        
        let readableText = "";
        for (let key in dataObj) {
            let cleanKey = key.replace(/_/g, ' ').toUpperCase();
            readableText += `▪ ${cleanKey}: ${dataObj[key]}\n`;
        }
        return readableText.trim();
    },

    setupCardInteractions: function() {
        const panels = document.querySelectorAll('.panel:not(.has-click-listener)');
        panels.forEach(panel => {
            panel.classList.add('has-click-listener');
            panel.addEventListener('click', (e) => {
                if(e.target.closest('.log-controls') || e.target.closest('.filter-badge') || e.target.closest('input') || e.target.closest('button')) return;
                
                const header = panel.querySelector('.panel-header')?.innerText.trim() || 'System Details';
                let originalContent = header.includes('LOGS') ? '' : panel.innerHTML; 
                let rawDataObj = panel.innerText.replace(header, '').trim();
                
                if (header.includes('LOGS')) {
                    rawDataObj = document.querySelector('.terminal')?.innerText || "Log stream empty.";
                } else if (this.latestTelemetrySnapshot) {
                    if (header.includes('INSPECTOR') || header.includes('DIAGNOSTICS')) rawDataObj = this.latestTelemetrySnapshot.
