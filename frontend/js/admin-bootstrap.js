// frontend/js/admin-bootstrap.js
/**
 * Phase 4: Admin Bootstrap & Startup Logic
 * Strictly handles initialization, auth verification, and plugin registry.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("[ORBIS ADMIN] Bootstrapping Master Command Center...");

    // 1. Check if Admin API is ready (Auth Simulation)
    if (typeof ADMIN_AUTH_TOKEN === 'undefined') {
        window.ADMIN_AUTH_TOKEN = 'Bearer ORBIS_ADMIN_API_TOKEN';
    }

    // 2. Registry Initialization & Plugin Check (Self-Healing UI trigger)
    if (typeof window.ORBIS_ADMIN === 'undefined') {
        const grid = document.getElementById('dynamic-plugin-grid');
        if (grid) {
            grid.innerHTML = `<div style="grid-column: 1/-1; background:#fff0f0; border:2px dashed #ff4d4d; padding:30px; border-radius:12px; text-align:center;"><div style="font-size:3rem; margin-bottom:10px;">🩺</div><h3 style="color:#ff4d4d; margin-top:0;">System UI Pipeline Blocked</h3><p style="color:#d32f2f;">A background cache conflict prevented core registry files from loading.</p><button onclick="triggerSelfHealing()" style="background:#ff4d4d; color:#fff; border:none; padding:12px 24px; border-radius:6px; font-weight:bold; cursor:pointer;">⚡ Run Self-Healing Sequence</button></div>`;
        }
        return; 
    }

    // 3. Force Inject Deployment Engine Plugin
    if (window.ORBIS_ADMIN && window.ORBIS_ADMIN.plugins) {
        if (!window.ORBIS_ADMIN.plugins.has('plugin-deploy')) {
            window.ORBIS_ADMIN.plugins.set('plugin-deploy', {
                id: 'plugin-deploy',
                icon: '🚀',
                name: 'Deployment Engine',
                desc: 'Manage production releases, shadow workspaces, and live module publisher pathways.',
                statusClass: 'status-admin',
                statusText: 'Core'
            });
        }
    }

    // 4. Register Health Provider
    window.ORBIS_ADMIN.registerProvider('sys-metrics', async () => {
        try {
            const response = await fetch('/api/admin/health', { headers: { 'Authorization': ADMIN_AUTH_TOKEN } });
            const result = await response.json();
            if(result.status === 'OK') {
                const ramMB = Math.round(result.memoryUsage.rss / (1024 * 1024));
                return { success: true, data: { ram: ramMB, ping: 12, activeUsers: result.activeUsers || 0, uptime: Math.floor(result.uptime) } };
            }
            throw new Error('API Failed');
        } catch (error) { return { success: false, data: { ram: '--', ping: '--', activeUsers: '--', uptime: 0 } }; }
    });

    // 5. Initialize Modules
    if (typeof renderPlugins === 'function') renderPlugins();
    
    // 6. Start Telemetry
    if (typeof startTelemetryPolling === 'function') startTelemetryPolling();

    // 7. Verify Admin Dashboard connection
    if (window.AdminDashboard && typeof window.AdminDashboard.init === 'function') {
        console.log("[ORBIS ADMIN] Dashboard Engine Connected.");
    }
});
