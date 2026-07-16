/**
 * LotteryController: The Brain of the Lottery Module.
 * Connects UI payloads, triggers CalcEngine, and manages Ledger entries.
 */

import { LotteryCalcEngine } from '../services/LotteryCalcEngine.js';

export class LotteryController {
    
    // 🟢 ১. পার্টি খোঁজা (ORB-ID Lookup)
    static async verifyParty(req, res) {
        try {
            const { mobile } = req.body;
            
            if (!mobile || mobile.length < 10) {
                return res.status(400).json({ success: false, message: "সঠিক মোবাইল নম্বর দিন।" });
            }
            
            // 🟢 Future: এখানে আমাদের গ্লোবাল Supabase DB থেকে ORB-ID চেক করা হবে।
            // আপাতত সিস্টেম টেস্ট করার জন্য আমরা একটা অটো-জেনারেটেড প্রোফাইল পাঠাচ্ছি।
            const mockPartyData = {
                orb_id: `ORB-LOT-${mobile.slice(-4)}`,
                mobile: mobile,
                name: "Verified Stockist " + mobile.slice(-4),
                role: "STOCKIST",
                live_outstanding: 0
            };
            
            return res.status(200).json({ success: true, data: mockPartyData });
        } catch (error) {
            console.error("[LotteryController] Party Lookup Error:", error);
            return res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }

    // 🟢 ২. ডেসপ্যাচ/রিটার্ন এন্ট্রি সেভ করা
    static async processDispatchEntry(req, res) {
        try {
            const { partyId, rows } = req.body;
            
            if (!partyId || !rows || rows.length === 0) {
                return res.status(400).json({ success: false, message: "ডেসপ্যাচ ডেটা ফাঁকা!" });
            }

            // CalcEngine দিয়ে পুরো ব্যাচের অটোমেটিক হিসাব বের করা
            const ledgerSummary = LotteryCalcEngine.calculateBatchTotal(rows);
            
            // 🟢 Future: এখানে Supabase-এর 'accounting_ledger' বা 'lottery_transactions' টেবিলে ডেটা সেভ হবে।
            
            console.log(`[LotteryController] Entry Saved for ${partyId}. Net Payable: ₹${ledgerSummary.totalFinalAmount}`);

            const responsePayload = {
                success: true,
                message: "Dispatch & Return Entry Saved Successfully",
                transactionId: `TXN-LOT-${Date.now()}`,
                summary: ledgerSummary
            };

            return res.status(200).json(responsePayload);
        } catch (error) {
            console.error("[LotteryController] Dispatch Process Error:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}
