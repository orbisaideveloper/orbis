// frontend/js/ui-dashboard.js
/**
 * UI Dashboard Module
 * * PHASE 10.5: JSON Log Fix, Double Copy Fix, Anti-Blur & Modal Stacking Fix
 * * CHAPTER 2: Admin Cockpit Rendering Migrated & Shared Platform Context Adopted
 */
window.Dashboard = {
    startTime: Date.now(),
    lastEventTimestamp: 0,
    // latestTelemetrySnapshot removed - User Layer strictly reads from ORBIS_SHARED
    
    init: function() {
        this.startUptimeCounter();
        this.setupCardInteractions();
        this.setupOutsideClickToClose(); 
        if(typeof window.printLog === 'function') window.printLog('OK', 'Dashboard Diagnostic System Live.');
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

    formatHumanText: function(dataObj) {
        if (!dataObj) return "No data available.";
        if (typeof dataObj === 'string') return dataObj.replace(/[{}"\[\]]/g, '').trim();
        
        let readableText = "";
        for (let key in dataObj) {
            let cleanKey = key.replace(/_/g, ' ').toUpperCase();
            let val = dataObj[key];

            if ((key === 'logs' || key === 'LOGS') && Array.isArray(val)) {
                readableText += `▪ ${cleanKey}:\n`;
                val.forEach(l => {
                    let t = l.time || '--:--:--';
                    let lvl = l.level || 'INFO';
                    let msg = l.message || JSON.stringify(l);
                    readableText += `  [${t}] [${lvl}]: ${msg}\n`;
                });
            } else {
                let finalVal = typeof val === 'object' ? JSON.stringify(val) : val;
                readableText += `▪ ${cleanKey}: ${finalVal}\n`;
            }
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
                
                // STRICT RULE: Read ONLY from Shared Platform Context
                const currentSnapshot = (window.ORBIS_SHARED && window.ORBIS_SHARED.telemetry) 
                                        ? window.ORBIS_SHARED.telemetry.snapshot 
                                        : null;
                
                if (header.includes('LOGS')) {
                    rawDataObj = document.querySelector('.terminal')?.innerText || "Log stream empty.";
                } else if (currentSnapshot) {
                    if (header.includes('INSPECTOR')) rawDataObj = currentSnapshot.engineering_inspector || "No Inspector Data";
                    else if (header.includes('HEALTH')) rawDataObj = currentSnapshot.memory_health || "No Memory Data";
                    else if (header.includes('TOKENS')) rawDataObj = { Active_Requests: currentSnapshot.engineering_inspector?.active_requests || 0 };
                    else if (header.includes('SPEED')) rawDataObj = { Read: document.getElementById('db-read-ping')?.innerText, Write: document.getElementById('db-write-ping')?.innerText };
                    else if (header.includes('DEPENDENCY') || header.includes('VISUAL')) rawDataObj = currentSnapshot; 
                    else if (header.includes('EXECUTION')) rawDataObj = currentSnapshot.architecture_analyzer || "No Routing Data";
                    else if (header.includes('SUPABASE') || header.includes('MEMORY BUS')) rawDataObj = { Sync: "OK", Nodes: currentSnapshot.memoryNodes || 0, Route: currentSnapshot.lastRoute || "N/A" };
                    else rawDataObj = currentSnapshot || "Data fetching in progress...";
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
                
                let contentToShow = header.includes('LOGS') ? extraTools : (card.innerHTML + extraTools);
                this.showMinimalModal(header, contentToShow);
            });
        });
    },

    showMinimalModal: function(title, content) {
        const existing = document.getElementById('active-orbis-modal');
        if(existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'active-orbis-modal';
        overlay.style = "position:fixed; inset:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); z-index:99999; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(2px); -webkit-font-smoothing:antialiased;";

        const modal = document.createElement('div');
        modal.style = "width:92%; max-width:500px; max-height:85vh; background:white; padding:20px; border-radius:12px; box-shadow:0 15px 50px rgba(0,0,0,0.5); display:flex; flex-direction:column; overflow:hidden;";

        modal.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #e2e8f0; padding-bottom:12px; flex-shrink:0;">
                <h3 style="color:#1e3a8a; margin:0; font-size:1rem; font-weight:bold;">${title}</h3>
                <button onclick="document.getElementById('active-orbis-modal').remove()" style="background:none; border:none; font-size:1.5rem; color:#ef4444; cursor:pointer; font-weight:bold; line-height:1;">×</button>
            </div>
            <div style="flex:1; overflow-y:auto; -webkit-font-smoothing:antialiased;">${content}</div>
        `;

        overlay.addEventListener('click', (e) => {
            if(e.target === overlay) overlay.remove();
        });

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.Dashboard.init();
});
