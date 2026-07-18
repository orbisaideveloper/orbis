// frontend/js/platform-init.js
// ORBIS Platform Initialization & PWA Logic
// * FINAL CLEANUP DONE: Legacy Admin (cockpit_mode) & sidebar override completely removed.

document.addEventListener('DOMContentLoaded', () => {
    // Public platform default behaviors (if any) can remain here.
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (menuBtn) menuBtn.style.display = 'inline-block'; 
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
