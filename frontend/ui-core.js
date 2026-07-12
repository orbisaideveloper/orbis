// ui-core.js - Shared UI utilities
const getEl = (id) => document.getElementById(id);

window.toggleSidebar = function() {
    const sidebar = getEl('dev-sidebar');
    if (!sidebar) return;
    if (sidebar.style.display === 'none' || sidebar.style.display === '') {
        sidebar.style.display = 'flex';
        sidebar.style.position = 'absolute';
        sidebar.style.zIndex = '100';
        sidebar.style.height = '100%';
        sidebar.style.boxShadow = '5px 0 15px rgba(0,0,0,0.1)';
    } else {
        sidebar.style.display = 'none';
    }
};

window.printLog = function(type, msg) {
    try {
        const logBox = getEl('log-box');
        if (!logBox) return;
        const time = new Date().toLocaleTimeString();
        let color = type === 'OK' ? '#138808' : type === 'ERR' ? '#FF9933' : type === 'INFO' ? '#3b82f6' : '#ffffff';
        logBox.innerHTML += `<div><span style="color:#aaa;">[${time}]</span> <strong style="color:${color};">${type}</strong>: ${msg}</div>`;
        logBox.scrollTop = logBox.scrollHeight;
    } catch(e) {}
};

document.addEventListener('DOMContentLoaded', () => {
    window.printLog('OK', 'UI Core Initialized.');
});
