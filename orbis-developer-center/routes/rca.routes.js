import express from 'express';
import { fetchRCA } from '../controllers/rca.controller.js';

const router = express.Router();
// POST মেথড কারণ আমরা ফ্রন্টএন্ড থেকে query পাঠাব
router.post('/', fetchRCA);

export default router;
