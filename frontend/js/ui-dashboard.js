// frontend/js/ui-dashboard.js
/**
 * UI Dashboard Module: Manages engineering cockpit telemetry tracking, 
 * active process visualization, and automated diagnostics mapping.
 */
window.Dashboard = {
    startTime: Date.now(),
    lastEventTimestamp: 0,
    
    init: function() {
        this.startUptimeCounter();
        this.setupCardInteractions();
        this.setupLogFilters();
        this.initLiveTelemetryLoop(); // লাইভ সার্ভার সিঙ্ক চালু হলো
        window.printLog('OK', 'Dashboard Diagnostic System Live.');
    },

    startUptimeCounter: function() {
        setInterval(() => {
            const el = document.getElementById('sys-uptime');
            if (el) el.innerText = Math.floor((Date.now() - this.startTime) / 1000) + ' s';
        }, 1000);
    },

    // 🟢 🚨 NEW HIGH-INTEL FEATURE: লাইভ টেলিমেট্রি সিঙ্ক লুপ
    initLiveTelemetryLoop: function() {
        // প্রতি ৫ সেকেন্ড পর পর সার্ভার থেকে ব্যাকগ্রাউন্ড টেলিমেট্রি আপডেট নেবে
        setInterval(async () => {
            try {
                const response = await fetch('/api/telemetry');
                const result = await response.json();
                if(response.ok && result.success) {
                    this.updateCockpitUI(result.telemetry);
                }
            } catch(e) {
                // সাইলেন্ট বাইপাস যাতে লগে ফ্লাড না হয়
            }
        }, 5000);

        // গ্লোবাল ইন্টারসেপ্টর হুক: যদি এপিআই গেটওয়ে কোনো ডেটা পায়, তা সরাসরি এখানেও রিফ্লেক্ট হবে
        window.globalEventBus?.on('MemoryRestored', (history) => {
            const nodeEl = document.getElementById('telemetry-nodes') || document.querySelector('[data-type="nodes"]');
            if(nodeEl && history) nodeEl.innerText = history.length;
        });
    },

    // 🟢 ককপিট ড্যাশবোর্ডের ভিজ্যুয়াল মেকানিজম আপডেট করার মেইন মেথড
    updateCockpitUI: function(telemetry) {
        if (!telemetry) return;

        // ১. এপিআই পিং এবং ল্যাটেন্সি আপডেট
        const pingEl = document.getElementById('api-ping') || document.querySelector('.panel:nth-child(3) .panel-body div'); 
        const ramEl = document.getElementById('ram-usage') || document.querySelector('.panel:nth-child(4) .panel-body div');
        const latencyEl = document.getElementById('gemini-latency') || document.querySelector('[data-type="latency"]');
        const nodesEl = document.getElementById('memory-nodes') || document.querySelector('[data-type="nodes"]');
        
        // আপনার ইউআই কন্টেইনার ম্যাচিং (স্ক্রিনশটের সাপেক্ষে ডাইনামিক ইন্জেকশন)
        const uiFields = document.querySelectorAll('.panel-body div');
        if(uiFields && uiFields.length >= 4) {
            if(telemetry.apiPing) uiFields[2].innerText = `${telemetry.apiPing} ms`;
            if(telemetry.ramUsage) uiFields[3].innerText = `${telemetry.ramUsage} MB`;
        }

        // ২. এক্সিকিউশন পাথ বা ভিজ্যুয়াল লাইট আপডেট (User -> Router -> Core)
        const pathNodes = document.querySelectorAll('.execution-path span, .panel-body span');
        if(pathNodes && telemetry.lastRoute) {
            pathNodes.forEach(node => {
                if(telemetry.lastRoute.includes(node.innerText)) {
                    node.style.color = 'var(--green)';
                    node.style.fontWeight = 'bold';
                } else {
                    node.style.color = '';
                    node.style.fontWeight = '';
                }
            });
        }
    },

    // 🟢 🚨 SMART DIAGNOSTIC: ইভেন্ট লকিং (ডুপ্লিকেট মেসেজ ঠেকাতে এন্টি-লুপ প্রোটেকশন)
    checkDuplicateTrigger: function() {
        const now = Date.now();
        if (now - this.lastEventTimestamp < 500) { // ৫০০ মিলিসেকেন্ডের মধ্যে ডাবল ফায়ার হলে
            window.printLog('ERR', 'Anti-Loop Triggered: Duplicate UI Event Blocked!');
            return true;
        }
        this.lastEventTimestamp = now;
        return false;
    },

    setupCardInteractions: function() {
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            panel.addEventListener('click', (e) => {
                if(e.target.closest('.log-controls') || e.target.closest('.filter-badge')) return;
                const header = panel.querySelector('.panel-header')?.innerText.trim() || 'System Details';
                const originalContent = panel.innerHTML; 
                let extraTools = "";

                if (header.includes('LIVE LOGS')) {
                    const logText = document.querySelector('.terminal')?.innerText || 'No logs found.';
                    extraTools = `
                        <div style="margin-top:15px; border-top:1px dashed var(--border); padding-top:15px;">
                            <textarea id="copy-log-area" style="width:100%; height:150px; font-family:monospace; font-size:0.75rem; background:#f8fafc; padding:10px; border:1px solid var(--border); border-radius:4px; margin-bottom:10px;" readonly>${logText}</textarea>
                            <button onclick="navigator.clipboard.writeText(document.getElementById('copy-log-area').value); this.innerText='✅ COPIED!'; this.style.background='var(--green)';" style="width:100%; padding:10px; background:var(--navy-blue); color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer; transition:0.3s;">📋 COPY FULL LOGS</button>
                        </div>
                    `;
                }
                this.showMinimalModal(header, originalContent + extraTools);
            });
        });
    },

    showMinimalModal: function(title, content) {
        const modal = document.createElement('div');
        modal.style = "position:fixed; top:5%; left:5%; width:90%; max-height:90vh; background:white; z-index:9999; border:1px solid #ccc; padding:20px; border-radius:8px; overflow-y:auto; box-shadow:0 4px 20px rgba(0,0,0,0.4); display:flex; flex-direction:column;";
        modal.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:10px;">
                <h3 style="color:var(--navy-blue); margin:0;">${title}</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; font-size:1.5rem; color:var(--red); cursor:pointer; font-weight:bold;">×</button>
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
