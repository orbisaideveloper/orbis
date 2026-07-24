import express from 'express';
import { fetchAudit } from '../controllers/audit.controller.js';

const router = express.Router();
router.get('/', fetchAudit);

export default router;
