/**
 * Lottery Routes: Connects external API calls to the LotteryController.
 * Lego Architecture: Fully isolated from main server routes.
 */

import express from 'express';
import { LotteryController } from '../controllers/LotteryController.js';

const router = express.Router();

// ==========================================
// 🟢 PARTY & LEDGER MANAGEMENT
// ==========================================

// ১. পার্টি ভেরিফিকেশন এবং লেজার ফেচ রাউট (ORB-ID / Mobile)
// এটি শুধুমাত্র পার্টি ভেরিফাই করবে না, বরং তার 'Previous Outstanding' ব্যালেন্সও ফ্রন্টএন্ডে পাঠাবে।
router.post('/party/verify', LotteryController.verifyParty);

// ২. নির্দিষ্ট পার্টির সম্পূর্ণ লেজার স্টেটমেন্ট দেখার রাউট (Architecture: "Full Ledger")
router.get('/party/ledger/:partyId', LotteryController.getPartyLedger);


// ==========================================
// 🟢 DISPATCH & SALES (BULK ENTRY)
// ==========================================

// ৩. ডেসপ্যাচ এন্ট্রি সেভ করার রাউট (বাল্ক এন্ট্রির জন্য)
// যেহেতু আমরা UI-তে একসাথে অনেক পার্টির ডেটা এন্ট্রি করার অপশন রেখেছি, এটি Array of Objects রিসিভ করবে।
router.post('/dispatch/bulk-save', LotteryController.processBulkDispatch);


// ==========================================
// 🟢 BACKGROUND SYNC & AUTOSAVE
// ==========================================

// ৪. ব্যাকগ্রাউন্ড সিঙ্ক রাউট (Architecture: "Background synchronization updates the server")
// ইন্টারনেট কানেকশন এলে লোকাল স্টোরেজ থেকে ডেটা নিয়ে সার্ভারে পুশ করবে।
router.post('/sync/autosave', LotteryController.backgroundSync);


// ==========================================
// 🟢 STOCK MANAGEMENT
// ==========================================

// ৫. আজকের লাইভ টিকিট এবং রেট ফেচ করার রাউট
// ফ্রন্টএন্ডে টিকিট নেম এবং রেট অটো-ফিল করার জন্য।
router.get('/stock/active-tickets', LotteryController.getActiveTickets);

export default router;
