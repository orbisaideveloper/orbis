// js/ui-dashboard.js - Engineering Cockpit Controller
window.Dashboard = {
    startTime: Date.now(),
    
    init: function() {
        this.startUptimeCounter();
        this.setupLogFilters();
        window.printLog('OK', 'Engineering Cockpit Initialized.');
    },

    // ⏱️ লাইভ আপটাইম কাউন্টার
    startUptimeCounter: function() {
        setInterval(() => {
            const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);
            const el = document.getElementById('sys-uptime');
            if (el) el.innerText = `${uptimeSec} s`;
        }, 1000);
    },

    // 📊 যেকোনো ডেটা প্যানেল আপডেট করার ইউনিভার্সাল ফাংশন
    updateMetric: function(elementId, value) {
        const el = document.getElementById(elementId);
        if (el) el.innerText = value;
    },

    // 🧩 মডিউল স্ট্যাটাস আপডেট (ready, busy, offline, error)
    updateModuleState: function(moduleId, state) {
        const el = document.getElementById(`mod-${moduleId}`);
        if (el) {
            el.className = `mod-pill ${state.toLowerCase()}`;
        }
    },

    // ⚡ ওয়ার্কফ্লো পাথ হাইলাইটার
    updateWorkflow: function(activeStep) {
        const steps = ['wf-user', 'wf-router', 'wf-core', 'wf-provider'];
        steps.forEach(step => {
            const el = document.getElementById(step);
            if (el) {
                if (step === activeStep) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            }
        });
    },

    // 🚨 সেন্ট্রাল এরর ট্র্যাকার (Transformed for Engineers)
    triggerError: function(moduleName, friendlyMessage, rawError = null) {
        const errorBox = document.getElementById('cockpit-error-center');
        const errorText = document.getElementById('error-display-box');
        if (errorBox && errorText) {
            errorBox.style.display = 'block';
            errorText.innerHTML = `<strong>SOURCE:</strong> [${moduleName}]<br><strong>ISSUE:</strong> ${friendlyMessage}`;
            
            // মডিউলটাকে লাল করে দেওয়া
            this.updateModuleState(moduleName.toLowerCase(), 'error');
            
            // র-এরর ব্যাকগ্রাউন্ডে সেভ রাখা
            if (rawError) console.error(`[RAW ERROR - ${moduleName}]:`, rawError);
        }
    },

    clearError: function() {
        const errorBox = document.getElementById('cockpit-error-center');
        if (errorBox) errorBox.style.display = 'none';
    },

    // 📜 লগ ফিল্টার ইঞ্জিন
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
                if (log.innerText.includes(`${filter}:`) || log.innerText.includes(`[${filter}]`)) {
                    log.style.display = 'block';
                } else {
                    log.style.display = 'none';
                }
            }
        });
    }
};

// ==========================================
// 🎧 EVENT BUS LISTENERS (The Nervous System)
// ==========================================
if (window.EventBus) {
    window.EventBus.on('WorkflowStarted', () => {
        window.Dashboard.clearError();
        window.Dashboard.updateWorkflow('wf-user');
        window.Dashboard.updateModuleState('router', 'busy');
    });

    window.EventBus.on('RouterDispatched', () => {
        window.Dashboard.updateWorkflow('wf-router');
        window.Dashboard.updateMetric('router-last', 'CHAT');
    });

    // 🟢 আগের File Processing ইভেন্টটাও এখানে রাখা হলো
    window.EventBus.on('FileProcessingStarted', (data) => {
        window.printLog('INFO', `Dashboard: Monitoring storage activity for ${data.fileName}`);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    window.Dashboard.init();
});
