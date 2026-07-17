/**
 * LotteryCalcEngine: Handles all autonomous financial calculations for the Lottery Module.
 * Strictly follows DigiLedger and Accounting Foundation rules.
 */

export class LotteryCalcEngine {
    /**
     * Automatically calculates the entire statement for a single transaction row.
     * @param {Object} rowData - Contains rate, dispatchQty, returnQty, commissionRate, tdsRate, previousOutstanding, and partyId
     */
    static calculateRow(rowData) {
        // ১. Party ID এবং ডিফল্ট ভ্যালু সেট করা
        const partyId = rowData.partyId || null;
        const rate = parseFloat(rowData.rate) || 0;
        const dispatchQty = parseInt(rowData.dispatchQty) || 0;
        const returnQty = parseInt(rowData.returnQty) || 0;
        const commRate = parseFloat(rowData.commissionRate) || 0; 
        
        // ডাইনামিক TDS এবং Previous Outstanding (ম্যানুয়াল এন্ট্রির জন্য)
        const tdsRateInput = parseFloat(rowData.tdsRate) || 0; 
        const prevOutstanding = parseFloat(rowData.previousOutstanding) || 0;

        // ২. Net Tickets Calculation (এখন আর জিরো ফিল্টার নেই, রিটার্ন বেশি হলে মাইনাস শো করবে)
        const netTickets = dispatchQty - returnQty;

        // ৩. Gross/Net Sales Calculation
        const grossSales = netTickets * rate;

        // ৪. Commission Calculation
        const commissionAmount = grossSales * (commRate / 100);

        // ৫. TDS Calculation (ডাইনামিক রেট অনুযায়ী)
        const tdsAmount = commissionAmount * (tdsRateInput / 100);

        // ৬. Final Net Payable Amount for the transaction
        // Formula: Gross Sales - (Commission - TDS)
        const netPayable = grossSales - (commissionAmount - tdsAmount);

        // ৭. Current Balance Calculation
        const currentBalance = prevOutstanding + netPayable;

        return {
            partyId,
            rate,
            dispatchQty,
            returnQty,
            netTickets,
            grossSales: Math.round(grossSales * 100) / 100,
            commission: Math.round(commissionAmount * 100) / 100,
            tds: Math.round(tdsAmount * 100) / 100,
            finalAmount: Math.round(netPayable * 100) / 100,
            previousOutstanding: Math.round(prevOutstanding * 100) / 100,
            currentBalance: Math.round(currentBalance * 100) / 100
        };
    }

    /**
     * Aggregates multiple rows to generate a master ledger payload for the Accounting Engine.
     * @param {Array} rows - Array of calculated row objects
     */
    static calculateBatchTotal(rows) {
        let totalDispatch = 0;
        let totalReturn = 0;
        let totalNetTickets = 0;
        let totalGrossSales = 0;
        let totalCommission = 0;
        let totalTds = 0;
        let totalFinalAmount = 0;

        rows.forEach(row => {
            const res = this.calculateRow(row);
            totalDispatch += res.dispatchQty;
            totalReturn += res.returnQty;
            totalNetTickets += res.netTickets; // মাইনাস ভ্যালুও ঠিকভাবে ক্যালকুলেট হবে
            totalGrossSales += res.grossSales;
            totalCommission += res.commission;
            totalTds += res.tds;
            totalFinalAmount += res.finalAmount;
        });

        return {
            totalDispatch,
            totalReturn,
            totalNetTickets,
            totalGrossSales,
            totalCommission,
            totalTds,
            totalFinalAmount,
            timestamp: new Date().toISOString() // সার্ভারে নির্ভুলভাবে সেভ হওয়ার জন্য টাইমস্ট্যাম্প
        };
    }
}
