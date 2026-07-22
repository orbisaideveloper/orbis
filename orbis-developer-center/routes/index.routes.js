import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// এটি ড্যাশবোর্ডের ফ্রন্টএন্ড লোড করবে
router.use('/', express.static(path.join(__dirname, '../public')));

// এটি সিস্টেম স্ট্যাটাস চেক করার জন্য
router.get('/api/core-status', (req, res) => {
    res.status(200).json({
        system: 'ORBIS Developer Center',
        status: 'ONLINE',
        architecture: 'LEGO Modular',
        timestamp: new Date().toISOString()
    });
});

export default router;
