// ==================================================================
// ORBIS ADMIN WORKSPACE ROUTES (Sprint-1)
// Completely Isolated from Public Workspace
// ==================================================================

import express from 'express';
const router = express.Router();

// 🟢 Mock Admin Middleware (Sprint-1 Security)
const adminAuth = (req, res, next) => {
    // ভবিষ্যতে এখানে JWT বা Supabase Admin Token ভেরিফাই হবে
    // আপাতত আমরা সব রিকোয়েস্টকে অ্যাডমিন হিসেবে ধরে নিচ্ছি
    const isAdmin = true; 
    if (isAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Admin access required.' });
    }
};

// 🟢 Platform Health & Statistics API
router.get('/health', adminAuth, (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        version: process.env.FINAL_VERSION || '10.0-STABLE'
    });
});

// 🟢 Module Manager API
router.get('/modules', adminAuth, (req, res) => {
    // হার্ডকোডেড মডিউল লিস্ট (ভবিষ্যতে ডাটাবেস থেকে আসবে)
    const modules = [
        { id: 'orchestrator', name: 'AI Orchestrator', version: '1.0', status: 'Active', visibility: 'Public' },
        { id: 'farmer', name: 'Farmer Brain', version: '0.1-beta', status: 'Coming Soon', visibility: 'Hidden' },
        { id: 'ledger', name: 'DigiLedger', version: '0.1-alpha', status: 'Coming Soon', visibility: 'Hidden' }
    ];
    res.json({ success: true, data: modules });
});

// 🟢 Publish Control API (Mock)
router.post('/publish', adminAuth, (req, res) => {
    const { moduleId, action } = req.body;
    console.log(`[Admin] Module: ${moduleId} action: ${action}`);
    res.json({ success: true, message: `Module ${moduleId} successfully updated to ${action}.` });
});

export default router;
