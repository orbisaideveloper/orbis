import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import inventoryRoutes from './inventory.routes.js'; // 🟢 NEW INVENTORY ROUTE

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Frontend Load
router.use('/', express.static(path.join(__dirname, '../public')));

// Core API Status
router.get('/api/core-status', (req, res) => {
    res.status(200).json({
        system: 'ORBIS Developer Center',
        status: 'ONLINE',
        architecture: 'LEGO Modular',
        timestamp: new Date().toISOString()
    });
});

// 🟢 MOUNTING INVENTORY LEGO BLOCK
router.use('/api/inventory', inventoryRoutes);

export default router;
