// js/ui-dashboard.js - Engineering Cockpit Controller
window.Dashboard = {
    startTime: Date.now(),
    
    init: function() {
        this.startUptimeCounter();
        this.setupLogFilters();
        this.setupCardInteractions(); // নতুন লজিক যোগ করা হলো
        window.printLog('OK', 'Engineering Cockpit Initialized.');
    },

    // 🟢 নতুন: অরিজিনাল ডিজাইন নষ্ট না করে কার্ড ক্লিক লজিক
    setupCardInteractions: function() {
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            panel.addEventListener('click', () => {
                const header = panel.querySelector('.panel-header')?.innerText || 'System Details';
                this.showDetailModal(header, panel.innerHTML);
            });
        });
    },

    showDetailModal: function(title, content) {
        let modal = document.getElementById('log-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'log-modal';
            modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; justify-content:center; align-items:center; padding:20px;";
            modal.innerHTML = `<div style="background:white; width:100%; max-width:500px; max-height:80vh; overflow-y:auto; border-radius:10px; padding:20px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                                <h3 style="color:var(--navy-blue); margin-bottom:10px; border-bottom: 1px solid var(--border); padding-bottom: 5px;">${title}</h3>
                                <div id="modal-body"></div>
                                <button onclick="document.getElementById('log-modal').style.display='none'" style="margin-top:15px; width:100%; padding:10px; background:var(--saffron); color:white; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">CLOSE</button>
                               </div>`;
            document.body.appendChild(modal);
        }
        document.getElementById('modal-body').innerHTML = content;
        modal.style.display = 'flex';
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

    // 🚨 সেন্ট্রাল এরর ট্র্যাকার 
    triggerError: function(moduleName, friendlyMessage, rawError = null) {
        const errorBox = document.getElementById('cockpit-error-center');
        const errorText = document.getElementById('error-display-box');
        if (errorBox && errorText) {
            errorBox.style.display = 'block';
            errorText.innerHTML = `<strong>SOURCE:</strong> [${moduleName}]<br><strong>ISSUE:</strong> ${friendlyMessage}`;
            
            this.updateModuleState(moduleName.toLowerCase(), 'error');
            
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
// 🎧 EVENT BUS LISTENERS
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

    window.EventBus.on('FileProcessingStarted', (data) => {
        window.printLog('INFO', `Dashboard: Monitoring storage activity for ${data.fileName}`);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    window.Dashboard.init();
});
