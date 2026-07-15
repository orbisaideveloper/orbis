// ==================================================================
// ORBIS ADMIN WORKSPACE ROUTES (Sprint-1)
// Completely Isolated from Public Workspace
// ==================================================================

import express from 'express';
const router = express.Router();

// 🟢 LIVE RADAR STORE (In-Memory Tracking)
const activeUsersStore = new Map();

// 🟢 GLOBAL SYSTEM STATE (Versioning & Modules)
let globalSystemState = {
    version: '1.4.2', // Current Live Version
    modules: {
        orchestrator: 'Active',
        farmer: 'Coming Soon',
        ledger: 'Coming Soon'
    }
};

const adminAuth = (req, res, next) => {
    const isAdmin = true; 
    if (isAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Admin access required.' });
    }
};

// ==========================================
// 📡 PHASE 2: HEARTBEAT & RADAR SYSTEM
// ==========================================

router.post('/heartbeat', (req, res) => {
    const { mobile, name, currentModule } = req.body;
    if (mobile && name) {
        activeUsersStore.set(mobile, {
            name: name,
            module: currentModule || 'Dashboard',
            lastSeen: Date.now()
        });
    }
    // 🟢 Send the global state back to the user on every heartbeat
    res.json({ success: true, systemState: globalSystemState });
});

router.get('/radar', adminAuth, (req, res) => {
    const now = Date.now();
    const activeList = [];
    
    for (const [mobile, data] of activeUsersStore.entries()) {
        if (now - data.lastSeen > 45000) {
            activeUsersStore.delete(mobile);
        } else {
            activeList.push({ mobile, ...data });
        }
    }
    
    res.json({ success: true, count: activeList.length, users: activeList });
});

// ==========================================
// 🟢 PLATFORM HEALTH & STATE MANAGEMENT
// ==========================================

router.get('/health', adminAuth, (req, res) => {
    const now = Date.now();
    for (const [mobile, data] of activeUsersStore.entries()) {
        if (now - data.lastSeen > 45000) activeUsersStore.delete(mobile);
    }

    res.json({
        status: 'OK',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        version: globalSystemState.version,
        activeUsers: activeUsersStore.size
    });
});

// 🟢 NEW: Get Current System State for Admin Panel
router.get('/system-state', adminAuth, (req, res) => {
    res.json({ success: true, state: globalSystemState });
});

// 🟢 NEW: Update System Version (Publish)
router.post('/publish-version', adminAuth, (req, res) => {
    const { newVersion } = req.body;
    if(newVersion) {
        globalSystemState.version = newVersion;
        console.log(`[Admin] System Updated to Version: ${newVersion}`);
        res.json({ success: true, version: newVersion });
    } else {
        res.status(400).json({ success: false, message: "Version missing" });
    }
});

// 🟢 NEW: Toggle Module Status
router.post('/toggle-module', adminAuth, (req, res) => {
    const { moduleId, status } = req.body;
    if(globalSystemState.modules[moduleId] !== undefined) {
        globalSystemState.modules[moduleId] = status;
        console.log(`[Admin] Module ${moduleId} changed to:${status}`);
        res.json({ success: true, modules: globalSystemState.modules });
    } else {
        res.status(400).json({ success: false, message: "Invalid Module" });
    }
});

export default router;
