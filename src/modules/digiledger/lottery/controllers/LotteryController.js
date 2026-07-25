/**
 * LotteryController: The Brain of the Lottery Module.                                                                                                  
 * Connects UI payloads, triggers CalcEngine, and manages Ledger entries.
 * Lego Architecture: Fully isolated from main server routes.                                                                                           
 */

import { LotteryCalcEngine } from '../services/LotteryCalcEngine.js';

export class LotteryController {

    // ==========================================
    // 🟢 PARTY & LEDGER MANAGEMENT
    // ==========================================

    // ১. পার্টি ভেরিফাই এবং ব্যালেন্স চেক (ORB-ID Lookup)
    static async verifyParty(req, res) {
        try {
            const { mobile } = req.body;

            if (!mobile || mobile.length < 10) {
                return res.status(400).json({ success: false, message: "সঠিক মোবাইল নম্বর দিন।" });
            }

            // 🟢 Future: এখানে গ্লোবাল Supabase DB থেকে ORB-ID এবং লেজার চেক করা হবে।
            // লাইভ UI টেস্টিংয়ের জন্য 'Prev Bal' কলামে দেখানোর উদ্দেশ্যে ২৫০০ টাকা ব্যালেন্স পাঠানো হলো।
            const mockPartyData = {
                orb_id: `ORB-LOT-${mobile.slice(-4)}`,
                mobile: mobile,
                name: "Verified Party " + mobile.slice(-4),
                role: "STOCKIST",
                live_outstanding: 2500.00
            };

            return res.status(200).json({ success: true, data: mockPartyData });
        } catch (error) {
            console.error("[LotteryController] Party Lookup Error:", error);
            return res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }

    // ২. নির্দিষ্ট পার্টির সম্পূর্ণ লেজার স্টেটমেন্ট (Full Ledger)
    static async getPartyLedger(req, res) {
        try {
            const { partyId } = req.params;
            // 🟢 Future: Supabase থেকে নির্দিষ্ট পার্টির purchase, sale, payment ডাটা ফেচ হবে।
            return res.status(200).json({ success: true, message: `Ledger loaded for ${partyId}`, data: [] });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }


    // ==========================================
    // 🟢 DISPATCH & SALES (BULK ENTRY)
    // ==========================================

    // ৩. বাল্ক ডেসপ্যাচ এন্ট্রি সেভ করা (একাধিক পার্টির ডেটা একসাথে)
    static async processBulkDispatch(req, res) {
        try {
            // UI থেকে Array of Rows আসবে, যেখানে প্রতিটা Row-এর ভেতরে নিজস্ব partyId থাকবে।
            const { rows } = req.body;

            if (!rows || !Array.isArray(rows) || rows.length === 0) {
                return res.status(400).json({ success: false, message: "ডেসপ্যাচ ডেটা ফাঁকা!" });
            }

            // CalcEngine দিয়ে পুরো ব্যাচের অটোমেটিক হিসাব বের করা (Dashboard-এর জন্য)
            const ledgerSummary = LotteryCalcEngine.calculateBatchTotal(rows);

            // 🟢 Future: এখানে লুপ (Loop) চালিয়ে প্রতিটি Row-এর partyId ধরে আলাদা আলাদা করে
            // Supabase-এর 'accounting_ledger' টেবিলে লেজার এবং স্টক আপডেট করা হবে।

            console.log(`[LotteryController] Bulk Entry Saved. Total Net Payable: ₹${ledgerSummary.totalFinalAmount}`);

            const responsePayload = {
                success: true,
                message: "Bulk Dispatch Saved Successfully",
                transactionId: `TXN-LOT-BLK-${Date.now()}`,
                summary: ledgerSummary,
                processedRows: rows.length
            };

            return res.status(200).json(responsePayload);
        } catch (error) {
            console.error("[LotteryController] Bulk Dispatch Error:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }


    // ==========================================
    // 🟢 BACKGROUND SYNC & AUTOSAVE
    // ==========================================

    // ৪. ব্যাকগ্রাউন্ড সিঙ্ক (Offline to Online Autosave)
    static async backgroundSync(req, res) {
        try {
            const { offlineData } = req.body;
            // 🟢 Future: মোবাইল অফলাইনে থাকার সময় হওয়া ট্রানজাকশনগুলো অনলাইনে এলে সার্ভারে সিঙ্ক হবে।
            console.log(`[LotteryController] Background Sync Completed for ${offlineData?.length || 0} records.`);
            return res.status(200).json({ success: true, message: "Sync Successful" });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }


    // ==========================================
    // 🟢 STOCK MANAGEMENT
    // ==========================================

    // ৫. আজকের লাইভ টিকিট এবং রেট ফেচ করা
    static async getActiveTickets(req, res) {
        try {
            // 🟢 Future: ডাটাবেস থেকে লাইভ স্টক ফেচ হবে যাতে UI-তে ড্রপডাউনে রেট অটোমেটিক বসে যায়।
            const mockTickets = [
                { name: "Morning Star", rate: 5.00 },
                { name: "Evening Gold", rate: 10.00 }
            ];
            return res.status(200).json({ success: true, data: mockTickets });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // ==========================================
    // 🟢 PURCHASE ENTRY (NEW)
    // ==========================================
    
    // ৬. লটারি পারচেজ (স্টক ইন) এন্ট্রি সেভ করা
    static async processPurchaseEntry(req, res) {
        try {
            const { partyId, tickets, totalAmount, paymentStatus } = req.body;

            if (!partyId || !tickets || tickets.length === 0) {
                return res.status(400).json({ success: false, message: "পারচেজ ডেটা অসম্পূর্ণ!" });
            }

            // 🟢 Future: এখানে Supabase-এর 'inventory' এবং 'accounting_ledger' আপডেট হবে।
            // Stockist থেকে মাল কেনা হলে স্টক বাড়বে।

            console.log(`[LotteryController] Purchase Saved. Party: ${partyId}, Amount: ₹${totalAmount}`);

            return res.status(200).json({ 
                success: true, 
                message: "Purchase Entry Saved Successfully",
                transactionId: `TXN-PUR-${Date.now()}`,
                status: paymentStatus
            });
        } catch (error) {
            console.error("[LotteryController] Purchase Entry Error:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // ==========================================
    // 🟢 CARD ACTIVATION (NEW)
    // ==========================================

    // ৭. লটারি কার্ড অ্যাক্টিভ করা
    static async activateLotteryCard(req, res) {
        try {
            const { cardNumber, series } = req.body;

            if (!cardNumber) {
                return res.status(400).json({ success: false, message: "কার্ড নম্বর দেওয়া হয়নি!" });
            }

            // 🟢 Future: Supabase-এ কার্ডের স্ট্যাটাস 'Inactive' থেকে 'Active' করা হবে।
            console.log(`[LotteryController] Card Activated. Series: ${series}, Card: ${cardNumber}`);

            return res.status(200).json({ 
                success: true, 
                message: `Card ${cardNumber} Activated Successfully`,
                status: "ACTIVE"
            });
        } catch (error) {
            console.error("[LotteryController] Card Activation Error:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}
