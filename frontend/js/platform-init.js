// File: frontend/js/platform-init.js
// ORBIS Platform Initialization & PWA Logic

window.globalEventBus?.on('TelemetryUpdated', (data) => {
    if (data.ramUsage) document.getElementById('sys-ram').innerText = data.ramUsage + ' MB';
    if (data.latency) document.getElementById('prov-gemini-latency')?.innerText = data.latency + ' ms';
    if (data.memoryNodes) document.getElementById('mem-nodes').innerText = data.memoryNodes;
    if(window.updateXRay) window.updateXRay(data);
});

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('cockpit_mode') === 'true';

    if (isAdmin) {
        const devSidebar = document.getElementById('dev-sidebar');
        if (devSidebar) devSidebar.style.display = 'flex';
        console.log('[ORBIS SECURITY] Admin Mode Authenticated. Cockpit Unlocked.');
    } else {
        const menuBtn = document.getElementById('mobile-menu-btn');
        if (menuBtn) menuBtn.style.display = 'none';
        
        const devSidebar = document.getElementById('dev-sidebar');
        if (devSidebar) devSidebar.style.display = 'none';
        console.log('[ORBIS SECURITY] Admin Cockpit Locked for Public View.');
    }
    
    const originalToggleSidebar = window.toggleSidebar;
    window.toggleSidebar = function() {
        const isCockpit = new URLSearchParams(window.location.search).get('cockpit_mode') === 'true';
        if (isCockpit) {
            if (typeof originalToggleSidebar === 'function') {
                originalToggleSidebar();
            } else {
                const sidebar = document.getElementById('dev-sidebar');
                if (sidebar) sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
            }
        } else {
            console.warn('[SECURITY] Unauthorized Cockpit sidebar request blocked.');
        }
    };
});

let deferredPrompt;
const installBanner = document.getElementById('pwa-install-banner');

function hideInstallBanner() {
    if (installBanner) installBanner.style.display = 'none';
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}
