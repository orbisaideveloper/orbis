// ==================================================================
// ORBIS ADMIN WORKSPACE ROUTES (Sprint-1)
// Completely Isolated from Public Workspace
// ==================================================================

import express from 'express';
const router = express.Router();

// 🟢 LIVE RADAR STORE (In-Memory Tracking)
const activeUsersStore = new Map();

// 🟢 Mock Admin Middleware (Sprint-1 Security)
const adminAuth = (req, res, next) => {
    // ভবিষ্যতে এখানে JWT বা Supabase Admin Token ভেরিফাই হবে
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

// 1. Receive Pulse from Public Users (No Admin Auth required for this)
router.post('/heartbeat', (req, res) => {
    const { mobile, name, currentModule } = req.body;
    if (mobile && name) {
        activeUsersStore.set(mobile, {
            name: name,
            module: currentModule || 'Dashboard',
            lastSeen: Date.now()
        });
    }
    res.json({ success: true });
});

// 2. Serve Live Radar Data to Admin Panel
router.get('/radar', adminAuth, (req, res) => {
    const now = Date.now();
    const activeList = [];
    
    // Clean up dead sessions (Inactive for more than 45 seconds)
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
// 🟢 PLATFORM HEALTH & MODULES
// ==========================================

router.get('/health', adminAuth, (req, res) => {
    // Clean up before reporting total active users
    const now = Date.now();
    for (const [mobile, data] of activeUsersStore.entries()) {
        if (now - data.lastSeen > 45000) activeUsersStore.delete(mobile);
    }

    res.json({
        status: 'OK',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        version: process.env.FINAL_VERSION || '10.0-STABLE',
        activeUsers: activeUsersStore.size // 🟢 Dynamically reporting live users
    });
});

router.get('/modules', adminAuth, (req, res) => {
    const modules = [
        { id: 'orchestrator', name: 'AI Orchestrator', version: '1.0', status: 'Active', visibility: 'Public' },
        { id: 'farmer', name: 'Farmer Brain', version: '0.1-beta', status: 'Coming Soon', visibility: 'Hidden' },
        { id: 'ledger', name: 'DigiLedger', version: '0.1-alpha', status: 'Coming Soon', visibility: 'Hidden' }
    ];
    res.json({ success: true, data: modules });
});

router.post('/publish', adminAuth, (req, res) => {
    const { moduleId, action } = req.body;
    console.log(`[Admin] Module: ${moduleId} action: ${action}`);
    res.json({ success: true, message: `Module ${moduleId} successfully updated to ${action}.` });
});

export default router;
