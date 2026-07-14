// frontend/js/ui-dashboard.js
/**
 * UI Dashboard Module: Manages engineering cockpit telemetry tracking, 
 * active process visualization, and automated diagnostics mapping.
 * * PHASE 9.1 EXTENSION - Universal Copy Cards, Outside Click Close, Dynamic Panels
 */
window.Dashboard = {
    startTime: Date.now(),
    lastEventTimestamp: 0,
    latestTelemetrySnapshot: null, // Stores the latest data for copy/export
    
    init: function() {
        this.startUptimeCounter();
        this.setupCardInteractions();
        this.setupLogFilters();
        this.initLiveTelemetryLoop(); 
        this.setupOutsideClickToClose(); // 🟢 NEW: Outside click listener for UX
        window.printLog('OK', 'Dashboard Diagnostic System Live.');
    },

    startUptimeCounter: function() {
        setInterval(() => {
            const el = document.getElementById('sys-uptime');
            if (el) el.innerText = Math.floor((Date.now() - this.startTime) / 1000) + ' s';
        }, 1000);
    },

    // 🟢 🚨 SMART DIAGNOSTIC: Background Click Detector to Close Dashboard
    setupOutsideClickToClose: function() {
        document.addEventListener('click', (e) => {
            // Prevent closing if we are interacting with an open pop-up modal
            if (e.target.closest('.orbis-modal')) return;

            // Find the main cockpit header by text
            const cockpitHeader = Array.from(document.querySelectorAll('*')).find(el => 
                el.innerText && (el.innerText.includes('DIAGNOSTIC COCKPIT') || el.textContent.includes('DIAGNOSTIC COCKPIT'))
            );
            
            if (cockpitHeader) {
                // Find the absolute/fixed wrapper container
                const mainContainer = cockpitHeader.closest('div[style*="fixed"], div[style*="absolute"]') || cockpitHeader.parentElement.parentElement;
                
                // If the click is completely outside the dashboard wrapper
                if (mainContainer && !mainContainer.contains(e.target)) {
                    // Prevent closing if clicking a nav toggle or header button outside
                    if(e.target.closest('header, nav, button') && !e.target.closest('div[style*="fixed"]')) return;
                    
                    // Find the 'X' button inside the dashboard and trigger its click
                    const crossBtn = mainContainer.querySelector('button, .text-danger, i');
                    if (crossBtn && (crossBtn.innerText.includes('×') || crossBtn.innerHTML.includes('times'))) {
                        crossBtn.click();
                    }
                }
            }
        });
    },

    // 🟢 🚨 NEW: Dynamic Injection of Phase 9.1 Telemetry Panels
    injectPhase9Panels: function() {
        if(document.getElementById('phase9-panels-injected')) return;
        
        // Find CENTRAL LOGS panel to insert the new panels right above it
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
        this.setupCardInteractions(); // Re-bind clicks for new panels
    },

    initLiveTelemetryLoop: function() {
        setInterval(async () => {
            try {
                const response = await fetch('/api/telemetry');
                const result = await response.json();
                if(response.ok && result.success) {
                    this.updateCockpitUI(result.telemetry);
                }
            } catch(e) {
                // Silent bypass
            }
        }, 5000);

        window.globalEventBus?.on('MemoryRestored', (history) => {
            const nodeEl = document.getElementById('telemetry-nodes') || document.querySelector('[data-type="nodes"]');
            if(nodeEl && history) nodeEl.innerText = history.length;
        });
    },

    updateCockpitUI: function(telemetry) {
        if (!telemetry) return;
        this.latestTelemetrySnapshot = telemetry; // Store for export/copy functionality

        // 🟢 Phase 9.1: Auto-generate new panels if engineering data is present
        if (telemetry.engineering_inspector || telemetry.memory_health) {
            this.injectPhase9Panels();
        }

        // 1. Original Updates (Ping, RAM)
        const uiFields = document.querySelectorAll('.panel-body div');
        if(uiFields && uiFields.length >= 4) {
            if(telemetry.apiPing) uiFields[2].innerHTML = `PING<br><strong>${telemetry.apiPing} ms</strong>`;
            if(telemetry.ramUsage) uiFields[3].innerHTML = `RAM<br><strong>${telemetry.ramUsage} MB</strong>`;
        }

        // 2. Original Updates (Execution Bus)
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

        // 3. 🟢 Phase 9.1 Data Binding
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

    setupCardInteractions: function() {
        // Find panels that don't have a click listener yet to prevent multiple firings
        const panels = document.querySelectorAll('.panel:not(.has-click-listener)');
        panels.forEach(panel => {
            panel.classList.add('has-click-listener');
            panel.addEventListener('click', (e) => {
                if(e.target.closest('.log-controls') || e.target.closest('.filter-badge')) return;
                
                const header = panel.querySelector('.panel-header')?.innerText.trim() || 'System Details';
                const originalContent = panel.innerHTML; 
                
                // 🟢 NEW: Gather raw data for the copy textarea
                let rawDataText = panel.innerText.replace(header, '').trim();
                
                if (header.includes('LOGS')) {
                    rawDataText = document.querySelector('.terminal')?.innerText || rawDataText;
                } else if (this.latestTelemetrySnapshot) {
                    // Extract rich JSON data if available
                    if (header.includes('INSPECTOR')) rawDataText = JSON.stringify(this.latestTelemetrySnapshot.engineering_inspector, null, 2);
                    else if (header.includes('HEALTH')) rawDataText = JSON.stringify(this.latestTelemetrySnapshot.memory_health, null, 2);
                    else if (header.includes('EXECUTION')) rawDataText = JSON.stringify(this.latestTelemetrySnapshot.architecture_analyzer || {status: "Tracking active execution paths"}, null, 2);
                }

                // 🟢 NEW: Universal Copy Action block for deep analysis
                const extraTools = `
                    <div style="margin-top:15px; border-top:1px dashed var(--border, #ccc); padding-top:15px;">
                        <textarea class="copy-log-area" style="width:100%; height:150px; font-family:monospace; font-size:0.75rem; background:#f8fafc; padding:10px; border:1px solid var(--border, #ccc); border-radius:4px; margin-bottom:10px;" readonly>${rawDataText}</textarea>
                        <button onclick="navigator.clipboard.writeText(this.previousElementSibling.value); this.innerText='✅ COPIED TO CLIPBOARD!'; this.style.background='var(--green, green)';" style="width:100%; padding:10px; background:var(--navy-blue, #1e3a8a); color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer; transition:0.3s;">📋 COPY FULL DATA</button>
                    </div>
                `;
                
                this.showMinimalModal(header, originalContent + extraTools);
            });
        });
    },

    showMinimalModal: function(title, content) {
        const modal = document.createElement('div');
        modal.className = 'orbis-modal'; // Added for outside click detection
        modal.style = "position:fixed; top:5%; left:5%; width:90%; max-height:90vh; background:white; z-index:9999; border:1px solid #ccc; padding:20px; border-radius:8px; overflow-y:auto; box-shadow:0 4px 20px rgba(0,0,0,0.4); display:flex; flex-direction:column;";
        modal.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--border, #ccc); padding-bottom:10px;">
                <h3 style="color:var(--navy-blue, #1e3a8a); margin:0;">${title}</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; font-size:1.5rem; color:var(--red, red); cursor:pointer; font-weight:bold;">×</button>
            </div>
            <div style="flex:1;">${content}</div>
        `;
        document.body.appendChild(modal);
        if(title.includes('LIVE LOGS')) this.setupLogFilters(); 
    },

    setupLogFilters: function() {
        const badges = document.querySelectorAll('.filter-badge');
        badges.forEach(badge => {
            badge.addEventListener('click', (e) => {
                badges.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.applyLogFilter(e.target.getAttribute('data-filter'));
            });
        });
    },

    applyLogFilter: function(filter) {
        const logs = document.querySelectorAll('.log-line');
        logs.forEach(log => {
            if (filter === 'ALL') {
                log.style.display = 'block';
            } else {
                if (log.innerText.toUpperCase().includes(filter.toUpperCase())) {
                    log.style.display = 'block';
                } else {
                    log.style.display = 'none';
                }
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.Dashboard.init();
});
