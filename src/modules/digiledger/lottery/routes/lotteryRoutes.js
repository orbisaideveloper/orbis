/**
 * Lottery Routes: Connects external API calls to the LotteryController.
 * Lego Architecture: Fully isolated from main server routes.
 */

import express from 'express';
import { LotteryController } from '../controllers/LotteryController.js';

const router = express.Router();

// 🟢 ১. পার্টি ভেরিফিকেশন রাউট (ORB-ID)
// Endpoint: POST /api/lottery/party/verify
router.post('/party/verify', LotteryController.verifyParty);

// 🟢 ২. ডেসপ্যাচ এন্ট্রি সেভ করার রাউট
// Endpoint: POST /api/lottery/dispatch/save
router.post('/dispatch/save', LotteryController.processDispatchEntry);

export default router;
