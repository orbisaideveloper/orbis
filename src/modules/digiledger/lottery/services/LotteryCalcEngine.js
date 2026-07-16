/**
 * LotteryCalcEngine: Handles all autonomous financial calculations for the Lottery Module.
 * Strictly follows DigiLedger and Accounting Foundation rules.
 */

export class LotteryCalcEngine {
    /**
     * Automatically calculates the entire statement for a single transaction row.
     * @param {Object} rowData - Contains rate, dispatchQty, returnQty, and commissionRate
     */
    static calculateRow(rowData) {
        const rate = parseFloat(rowData.rate) || 0;
        const dispatchQty = parseInt(rowData.dispatchQty) || 0;
        const returnQty = parseInt(rowData.returnQty) || 0;
        const commRate = parseFloat(rowData.commissionRate) || 0; // e.g., 10 for 10%

        // 1. Net Tickets Calculation
        const netTickets = dispatchQty - returnQty;
        const validNetTickets = netTickets > 0 ? netTickets : 0;

        // 2. Gross/Net Sales Calculation
        const grossSales = validNetTickets * rate;

        // 3. Commission Calculation
        const commissionAmount = grossSales * (commRate / 100);

        // 4. TDS Calculation (Standard 5% on Commission amount as per rule)
        const tdsRate = 5; 
        const tdsAmount = commissionAmount * (tdsRate / 100);

        // 5. Final Net Payable Amount to Platform
        // Formula: Gross Sales - (Commission - TDS)
        const netPayable = grossSales - (commissionAmount - tdsAmount);

        return {
            rate,
            dispatchQty,
            returnQty,
            netTickets: validNetTickets,
            grossSales: Math.round(grossSales * 100) / 100,
            commission: Math.round(commissionAmount * 100) / 100,
            tds: Math.round(tdsAmount * 100) / 100,
            finalAmount: Math.round(netPayable * 100) / 100
        };
    }

    /**
     * Aggregates multiple rows to generate a master ledger payload for the Accounting Engine.
     * @param {Array} rows - Array of calculated row objects
     */
    static calculateBatchTotal(rows) {
        let totalDispatch = 0;
        let totalReturn = 0;
        let totalGrossSales = 0;
        let totalCommission = 0;
        let totalTds = 0;
        let totalFinalAmount = 0;

        rows.forEach(row => {
            const res = this.calculateRow(row);
            totalDispatch += res.dispatchQty;
            totalReturn += res.returnQty;
            totalGrossSales += res.grossSales;
            totalCommission += res.commission;
            totalTds += res.tds;
            totalFinalAmount += res.finalAmount;
        });

        return {
            totalDispatch,
            totalReturn,
            totalGrossSales,
            totalCommission,
            totalTds,
            totalFinalAmount,
            timestamp: new Date().toISOString()
        };
    }
}

