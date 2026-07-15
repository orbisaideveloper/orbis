// 🟢 File: frontend/js/admin-plugins.js
// Defines all dynamic modules for the ORBIS Master Admin

document.addEventListener('DOMContentLoaded', () => {
    if (!window.ORBIS_ADMIN) return;

    // 1. AI Core Cockpit (Existing)
    window.ORBIS_ADMIN.registerPlugin('plugin-cockpit', {
        name: '🧠 AI Core Cockpit',
        icon: '🧠',
        desc: 'Your main engineering space. Access Visual Tree, Memory Bus, and live AI chats here.',
        statusClass: 'status-ok',
        statusText: 'Ready to Inject'
    });

    // 2. Real-Time User Radar (NEW - Futuristic)
    window.ORBIS_ADMIN.registerPlugin('plugin-radar', {
        name: '📡 Live User Radar',
        icon: '📡',
        desc: 'Real-time telemetry of active users. Track sessions, module usage, and network load instantly.',
        statusClass: 'status-ok',
        statusText: 'Live Tracking'
    });

    // 3. Shadow Deployment Manager (NEW - Version Control)
    window.ORBIS_ADMIN.registerPlugin('plugin-deploy', {
        name: '🚀 Deployment Engine',
        icon: '🚀',
        desc: 'Manage Production (Live) vs Shadow (Test) branches. Review old vs new versions safely.',
        statusClass: 'status-warn',
        statusText: 'v2.0 Pending'
    });

    // 4. Token & Cost Economy (Existing)
    window.ORBIS_ADMIN.registerPlugin('plugin-economy', {
        name: '🪙 AI Token Economy',
        icon: '🪙',
        desc: 'Monitor API usage, Gemini token burns, and daily calculated costs.',
        statusClass: 'status-ok',
        statusText: '$1.24 Spent Today'
    });

    // 5. Central Logs (Existing)
    window.ORBIS_ADMIN.registerPlugin('plugin-logs', {
        name: '📜 Central Terminal Logs',
        icon: '📜',
        desc: 'Real-time error tracking, router payload monitoring, and system warnings.',
        statusClass: 'status-ok',
        statusText: 'Monitoring...'
    });
});
