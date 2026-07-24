import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import inventoryRoutes from './inventory.routes.js';
import auditRoutes from './audit.routes.js';
import rcaRoutes from './rca.routes.js'; // 🟢 NEW: Root Cause Engine (RCA) কানেক্ট করা হলো

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ==========================================
// 1. SERVE UNIQUE DEVELOPER UI
// ==========================================
router.use('/', express.static(path.join(__dirname, '../public')));

// ==========================================
// 2. HEALTH CHECK API (Core Engine Status)
// ==========================================
router.get('/api/core-status', (req, res) => {
    res.status(200).json({
        system: 'ORBIS Developer Center',
        status: 'ONLINE',
        architecture: 'LEGO Modular',
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// 3. MOUNTING LEGO BLOCKS (APIs)
// ==========================================
router.use('/api/inventory', inventoryRoutes);
router.use('/api/audit', auditRoutes);
router.use('/api/rca', rcaRoutes); // 🟢 NEW: RCA API রাউট

export default router;
