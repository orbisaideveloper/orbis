// js/ui-core.js - Global System Bridge
window.printLog = function(level, msg) {
    const logBox = document.getElementById('log-box');
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logEntry = document.createElement('div');
    logEntry.innerHTML = `<span style="opacity:0.6">[${time}]</span> <strong style="color:${level === 'ERR' ? 'red' : 'green'}">${level}:</strong> ${msg}`;
    logBox.appendChild(logEntry);
    logBox.scrollTop = logBox.scrollHeight;
};

window.toggleSidebar = function() {
    document.getElementById('dev-sidebar').classList.toggle('active');
};

document.addEventListener('DOMContentLoaded', () => {
    window.printLog('OK', 'System Core Initialized.');
});
