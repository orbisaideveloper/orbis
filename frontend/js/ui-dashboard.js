// js/ui-dashboard.js - Engineering Cockpit Controller (Updated Phase 7.9)
window.Dashboard = {
    startTime: Date.now(),
    
    init: function() {
        this.startUptimeCounter();
        this.setupLogFilters();
        this.setupCardInteractions(); // 🟢 নতুন: কার্ড ক্লিক সিস্টেম
        window.printLog('OK', 'Engineering Cockpit Initialized.');
    },

    // 🟢 নতুন: কার্ড ক্লিক করলে ডিটেইলস দেখানোর লজিক
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
        // যদি মডাল না থাকে, তৈরি করে নিবে
        let modal = document.getElementById('log-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'log-modal';
            modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; justify-content:center; align-items:center; padding:20px;";
            modal.innerHTML = `<div style="background:white; width:100%; max-width:500px; max-height:80vh; overflow-y:auto; border-radius:10px; padding:20px;">
                                <h3 style="color:var(--navy-blue); margin-bottom:10px;">${title}</h3>
                                <div id="modal-body"></div>
                                <button onclick="document.getElementById('log-modal').style.display='none'" style="margin-top:15px; width:100%; padding:10px; background:var(--saffron); border:none; border-radius:5px; font-weight:bold;">CLOSE</button>
                               </div>`;
            document.body.appendChild(modal);
        }
        document.getElementById('modal-body').innerHTML = content;
        modal.style.display = 'flex';
    },

    startUptimeCounter: function() {
        setInterval(() => {
            const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);
            const el = document.getElementById('sys-uptime');
            if (el) el.innerText = `${uptimeSec} s`;
        }, 1000);
    },

    updateMetric: function(elementId, value) {
        const el = document.getElementById(elementId);
        if (el) el.innerText = value;
    },

    updateModuleState: function(moduleId, state) {
        const el = document.getElementById(`mod-${moduleId}`);
        if (el) el.className = `mod-pill ${state.toLowerCase()}`;
    },

    updateWorkflow: function(activeStep) {
        const steps = ['wf-user', 'wf-router', 'wf-core', 'wf-provider'];
        steps.forEach(step => {
            const el = document.getElementById(step);
            if (el) step === activeStep ? el.classList.add('active') : el.classList.remove('active');
        });
    },

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
            log.style.display = (filter === 'ALL' || log.innerText.includes(`[${filter}]`)) ? 'block' : 'none';
        });
    }
};

// Event Bus remains the same...
