import express from 'express';
import { fetchInventory } from '../controllers/inventory.controller.js';

const router = express.Router();

// GET: /api/inventory
router.get('/', fetchInventory);

export default router;
