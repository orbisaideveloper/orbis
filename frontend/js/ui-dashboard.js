// js/ui-dashboard.js - Mission Control Hub
window.Dashboard = {
    updatePanel: function(panelId, status) {
        const panel = document.getElementById(panelId);
        if (panel) {
            panel.innerText = status;
            panel.style.background = status === 'ACTIVE' ? '#dcfce7' : '#f3e8ff';
        }
    }
};

// Event Bus-এর সাথে কানেক্ট করছি (এটিই আমাদের ব্রেইন)
window.EventBus.on('FileProcessingStarted', (data) => {
    window.printLog('INFO', `Dashboard: Monitoring storage activity for ${data.fileName}`);
    window.Dashboard.updatePanel('tel-wf', 'STORING');
});

document.addEventListener('DOMContentLoaded', () => {
    window.printLog('OK', 'Mission Control Dashboard Initialized.');
});
