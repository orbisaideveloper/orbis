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

// ==========================================
// 🟢 NEW (Priority 2): API ROUTE PROTECTION
// ==========================================
const adminAuth = (req, res, next) => {
    const token = req.headers['authorization'];
    
    // টোকেন ভ্যালিডেশন (ভবিষ্যতে JWT দিয়ে রিপ্লেস হবে)
    const isValidAdmin = token === 'Bearer ORBIS_ADMIN_API_TOKEN' || token === 'ORBIS_ADMIN_API_TOKEN'; 

    if (isValidAdmin) {
        next();
    } else {
        console.warn(`[Security] Blocked unauthorized admin API access from ${req.ip}`);
        res.status(403).json({ success: false, error: 'Forbidden: Admin authorization required.' });
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

// 🟢 Get Current System State for Admin Panel
router.get('/system-state', adminAuth, (req, res) => {
    res.json({ success: true, state: globalSystemState });
});

// 🟢 Update System Version (Publish)
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

// 🟢 Toggle Module Status
router.post('/toggle-module', adminAuth, (req, res) => {
    const { moduleId, status } = req.body;
    
    // 🟢 ফিক্স: Prevent Prototype Pollution (Security Blocker)
    if (typeof moduleId !== 'string' || moduleId === '__proto__' || moduleId === 'constructor' || moduleId === 'prototype') {
        return res.status(400).json({ success: false, message: "Invalid Module ID" });
    }

    // 🟢 ফিক্স: সরাসরি অবজেক্ট মডিফিকেশন ব্লক করে Object.hasOwn ব্যবহার করা হলো
    if(Object.hasOwn(globalSystemState.modules, moduleId)) {
        globalSystemState.modules[moduleId] = status;
        console.log(`[Admin] Module ${moduleId} changed to:${status}`);
        res.json({ success: true, modules: globalSystemState.modules });
    } else {
        res.status(400).json({ success: false, message: "Invalid Module" });
    }
});

export default router;
