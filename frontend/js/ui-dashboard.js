// frontend/js/ui-dashboard.js
/**
 * UI Dashboard Module: Manages engineering cockpit telemetry tracking, 
 * active process visualization, and automated diagnostics mapping.
 * * FINAL POLISH - Centered Modals, Human Readable Copy, Robust Mobile Touch Close
 */
window.Dashboard = {
    startTime: Date.now(),
    lastEventTimestamp: 0,
    latestTelemetrySnapshot: null, 
    
    init: function() {
        this.startUptimeCounter();
        this.setupCardInteractions();
        this.setupLogFilters();
        this.initLiveTelemetryLoop(); 
        this.setupOutsideClickToClose(); 
        window.printLog('OK', 'Dashboard Diagnostic System Live.');
    },

    startUptimeCounter: function() {
        setInterval(() => {
            const el = document.getElementById('sys-uptime');
            if (el) el.innerText = Math.floor((Date.now() - this.startTime) / 1000) + ' s';
        }, 1000);
    },

    // 🟢 🚨 ফিক্স ১: মোবাইলের টাচ ইভেন্ট (touchstart) সাপোর্ট যুক্ত করা হলো
    setupOutsideClickToClose: function() {
        ['click', 'touchstart'].forEach(evt => {
            document.addEventListener(evt, (e) => {
                const sidebar = document.getElementById('dev-sidebar');
                if (!sidebar) return;
                
                const isOpen = sidebar.style.display !== 'none' && sidebar.offsetWidth > 0;
                if (!isOpen) return;
                
                if (!sidebar.contains(e.target) && 
                    !e.target.closest('.mobile-menu-btn') && 
                    !e.target.closest('.orbis-modal')) {
                    
                    if (typeof window.toggleSidebar === 'function') {
                        window.toggleSidebar();
                    } else if (typeof toggleSidebar === 'function') {
                        toggleSidebar();
                    }
                }
            });
        });
    },

    injectPhase9Panels: function() {
        if(document.getElementById('phase9-panels-injected')) return;
        
        const logsPanel = Array.from(document.querySelectorAll('.panel')).find(p => p.innerText.includes('CENTRAL LOGS'));
        if(!logsPanel) return;
        
        const wrapper = document.createElement('div');
        wrapper.id = 'phase9-panels-injected';
        wrapper.innerHTML = `
            <div class="panel phase9-panel" style="margin-top: 15px; background: #fff; border: 1px solid var(--border, #eee); border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); cursor: pointer;">
                <div class="panel-header" style="font-weight: bold; color: var(--navy-blue, #1e3a8a); margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                    🔍 ENGINEERING INSPECTOR
                </div>
                <div class="panel-body" style="font-size: 0.8rem; display: flex; justify-content: space-between;">
                    <div>ACTIVE REQ: <br><strong id="ui-insp-req">0</strong></div>
                    <div>LOAD: <br><strong id="ui-insp-load">LOW</strong></div>
                    <div>PROVIDER: <br><strong id="ui-insp-prov">ONLINE</strong></div>
                </div>
            </div>
            <div class="panel phase9-panel" style="background: #fff; border: 1px solid var(--border, #eee); border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); cursor: pointer;">
                <div class="panel-header" style="font-weight: bold; color: var(--navy-blue, #1e3a8a); margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                    🩺 MEMORY HEALTH
                </div>
                <div class="panel-body" style="font-size: 0.8rem; display: flex; justify-content: space-between;">
                    <div>STATUS: <br><strong id="ui-mem-status" style="color: green;">OPTIMAL</strong></div>
                    <div>CACHE HIT: <br><strong id="ui-mem-cache">100%</strong></div>
                </div>
            </div>
        `;
        
        logsPanel.parentNode.insertBefore(wrapper, logsPanel);
        this.setupCardInteractions(); 
    },

    initLiveTelemetryLoop: function() {
        setInterval(async () => {
            try {
                const response = await fetch('/api/telemetry');
                const result = await response.json();
                if(response.ok && result.success) {
                    this.updateCockpitUI(result.telemetry);
                }
            } catch(e) {}
        }, 5000);

        window.globalEventBus?.on('MemoryRestored', (history) => {
            const nodeEl = document.getElementById('telemetry-nodes') || document.querySelector('[data-type="nodes"]');
            if(nodeEl && history) nodeEl.innerText = history.length;
        });
    },

    updateCockpitUI: function(telemetry) {
        if (!telemetry) return;
        this.latestTelemetrySnapshot = telemetry; 

        if (telemetry.engineering_inspector || telemetry.memory_health) {
            this.injectPhase9Panels();
        }

        const uiFields = document.querySelectorAll('.panel-body div');
        if(uiFields && uiFields.length >= 4) {
            if(telemetry.apiPing) uiFields[2].innerHTML = `PING<br><strong>${telemetry.apiPing} ms</strong>`;
            if(telemetry.ramUsage) uiFields[3].innerHTML = `RAM<br><strong>${telemetry.ramUsage} MB</strong>`;
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

        if (telemetry.engineering_inspector) {
            const reqEl = document.getElementById('ui-insp-req');
            if(reqEl) reqEl.innerText = telemetry.engineering_inspector.active_requests || 0;
        }
        if (telemetry.brain_monitor) {
            const loadEl = document.getElementById('ui-insp-load');
            if(loadEl) loadEl.innerText = telemetry.brain_monitor.cognitive_load || 'LOW';
        }
        if (telemetry.provider_monitor) {
            const provEl = document.getElementById('ui-insp-prov');
            if(provEl) provEl.innerText = telemetry.provider_monitor.status || 'ONLINE';
        }
        if (telemetry.memory_health) {
            const statusEl = document.getElementById('ui-mem-status');
            if(statusEl) statusEl.innerText = telemetry.memory_health.status || 'OPTIMAL';
        }
        if (telemetry.cache_monitor) {
            const cacheEl = document.getElementById('ui-mem-cache');
            if(cacheEl) cacheEl.innerText = telemetry.cache_monitor.hit_ratio || '100%';
        }
    },

    checkDuplicateTrigger: function() {
        const now = Date.now();
        if (now - this.lastEventTimestamp < 500) { 
            window.printLog('ERR', 'Anti-Loop Triggered: Duplicate UI Event Blocked!');
            return true;
        }
        this.lastEventTimestamp = now;
        return false;
    },

    // 🟢 ফিক্স ৪: JSON কোডকে মানুষের পড়ার মতো সুন্দর টেক্সটে রূপান্তর করার ফাংশন
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
                if(e.target.closest('.log-controls') || e.target.closest('.filter-badge')) return;
                
                const header = panel.querySelector('.panel-header')?.innerText.trim() || 'System Details';
                
                // 🟢 ফিক্স ৩: ডাবল লগ সরানো হলো। লগের ক্ষেত্রে অরিজিনাল কন্টেন্ট আর দেখানো হবে না।
                let originalContent = header.includes('LOGS') ? '' : panel.innerHTML; 
                let rawDataObj = panel.innerText.replace(header, '').trim();
                
                if (header.includes('LOGS')) {
                    rawDataObj = document.querySelector('.terminal')?.innerText || "Log stream empty.";
                } else if (this.latestTelemetrySnapshot) {
                    if (header.includes('INSPECTOR')) rawDataObj = this.latestTelemetrySnapshot.engineering_inspector;
                    else if (header.includes('HEALTH')) rawDataObj = this.latestTelemetrySnapshot.memory_health;
                    else if (header.includes('EXECUTION')) rawDataObj = this.latestTelemetrySnapshot.architecture_analyzer;
                    else if (header.includes('TELEMETRY')) rawDataObj = {
                        Build: document.getElementById('sys-env')?.innerText,
                        Uptime: document.getElementById('sys-uptime')?.innerText,
                        Ping: this.latestTelemetrySnapshot.apiPing || 'N/A',
                        RAM: this.latestTelemetrySnapshot.ramUsage || 'N/A'
                    };
                }

                const cleanTextToCopy = this.formatHumanText(rawDataObj);

                const extraTools = `
                    <div style="${header.includes('LOGS') ? '' : 'margin-top:15px; border-top:1px dashed #ccc; padding-top:15px;'}">
                        <textarea class="copy-log-area" style="width:100%; height:160px; font-family:monospace; font-size:0.8rem; background:#f8fafc; padding:12px; border:1px solid #cbd5e1; border-radius:6px; margin-bottom:12px; color:#334155; line-height:1.5;" readonly>${cleanTextToCopy}</textarea>
                        <button onclick="navigator.clipboard.writeText(this.previousElementSibling.value); this.innerText='✅ COPIED SUCCESSFULLY!'; this.style.background='#10b981';" style="width:100%; padding:12px; background:#1e3a8a; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; transition:0.3s;">📋 COPY FULL DATA</button>
                    </div>
                `;
                
                this.showMinimalModal(header, originalContent + extraTools);
            });
        });
    },

    // 🟢 ফিক্স ২: পপআপ এখন স্ক্রিনের একদম মাঝখানে (Centered) আসবে
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
        if(title.includes('LIVE LOGS')) this.setupLogFilters(); 
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.Dashboard.init();
});
