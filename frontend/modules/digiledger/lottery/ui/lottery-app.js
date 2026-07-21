// DigiLedger: Lottery Workspace Controller (Frontend Logic)
import { LotteryCalcEngine } from '../services/LotteryCalcEngine.js';

export function initLotteryWorkspace() {
    console.log("[ORBIS] Lottery Workspace Engine Initialized.");

    const gridBody = document.getElementById('lottery-grid-body');
    if (!gridBody) {
        console.warn("[ORBIS] Lottery Grid Body not found, skipping grid events.");
        return;
    }

    // 🟢 ১. Event Delegation: টেবিলে যেকোনো ইনপুট দিলেই লাইভ ক্যালকুলেশন হবে
    gridBody.addEventListener('input', function(e) {
        if (e.target.classList.contains('spreadsheet-input')) {
            const currentRow = e.target.closest('tr');
            if (currentRow) {
                calculateRowUI(currentRow);
                calculateTotalsUI();
            }
        }
    });

    // 🟢 ২. Add New Row: "Add More Party" বাটনে ক্লিক করলে নতুন ফাঁকা লাইন যোগ হবে
    const addRowBtn = document.getElementById('btn-add-row');
    if (addRowBtn) {
        addRowBtn.addEventListener('click', () => {
            const newRowHTML = `
                <tr>
                    <td><input type="text" class="spreadsheet-input party-input" placeholder="Search/Select Party"></td>
                    <td><input type="number" class="spreadsheet-input rate-input" placeholder="0"></td>
                    <td><input type="number" class="spreadsheet-input dispatch-input" placeholder="0"></td>
                    <td><input type="number" class="spreadsheet-input return-input" placeholder="0"></td>
                    <td><input type="text" class="spreadsheet-input calc-field net-tkt-output" readonly value="0"></td>
                    <td><input type="number" class="spreadsheet-input comm-input" placeholder="0"></td>
                    <td><input type="number" class="spreadsheet-input tds-input" placeholder="0"></td>
                    <td><input type="text" class="spreadsheet-input calc-field net-pay-output text-success" readonly value="₹ 0.00"></td>
                    <td><input type="number" class="spreadsheet-input prev-bal-input" placeholder="0.00"></td>
                    <td><input type="text" class="spreadsheet-input calc-field curr-bal-output text-warning" readonly value="₹ 0.00"></td>
                </tr>
            `;
            gridBody.insertAdjacentHTML('beforeend', newRowHTML);
        });
    }

    // 🟢 ৩. Party Search Module (ORB-ID Lookup) - (আপনার আগের কোড অপরিবর্তিত রাখা হয়েছে)
    const fetchPartyBtn = document.getElementById('btn-fetch-party');
    const partyInput = document.getElementById('party-mobile-input');
    
    if (fetchPartyBtn && partyInput) {
        fetchPartyBtn.addEventListener('click', () => {
            const mobile = partyInput.value.trim();
            if (mobile.length >= 10) {
                // ... (আপনার আগের সিমুলেশন কোড) ...
                console.log("Searching Party: " + mobile);
            } else {
                alert("দয়া করে সঠিক ১০ ডিজিটের মোবাইল নম্বর দিন।");
            }
        });
    }
}

// 🟢 প্রতিটি লাইনের (Row) ডাটা ইঞ্জিনে পাঠানো এবং রেজাল্ট UI-তে আপডেট করা
function calculateRowUI(row) {
    // ১. UI ইনপুট থেকে ডাটা সংগ্রহ করে অবজেক্ট তৈরি
    const rowData = {
        rate: row.querySelector('.rate-input')?.value,
        dispatchQty: row.querySelector('.dispatch-input')?.value,
        returnQty: row.querySelector('.return-input')?.value,
        commissionRate: row.querySelector('.comm-input')?.value,
        tdsRate: row.querySelector('.tds-input')?.value,
        previousOutstanding: row.querySelector('.prev-bal-input')?.value
    };

    // ২. Core Engine-কে কল করে সঠিক হিসাব নিয়ে আসা (ফ্রন্টএন্ডে কোনো জটিল ম্যাথ নেই)
    const result = LotteryCalcEngine.calculateRow(rowData);

    // ৩. আউটপুট ফিল্ডগুলো ধরা
    const netTktOutput = row.querySelector('.net-tkt-output');
    const netPayOutput = row.querySelector('.net-pay-output');
    const currBalOutput = row.querySelector('.curr-bal-output');

    // ৪. রেজাল্ট বসানো এবং নেগেটিভ ভ্যালু হলে লাল রঙ (CSS Class) করা
    if (netTktOutput) {
        netTktOutput.value = result.netTickets;
        result.netTickets < 0 
            ? netTktOutput.classList.add('negative-val') 
            : netTktOutput.classList.remove('negative-val');
    }

    if (netPayOutput) {
        netPayOutput.value = `₹ ${result.finalAmount.toFixed(2)}`;
        if (result.finalAmount < 0) {
            netPayOutput.classList.remove('text-success');
            netPayOutput.classList.add('negative-val');
        } else {
            netPayOutput.classList.add('text-success');
            netPayOutput.classList.remove('negative-val');
        }
    }

    if (currBalOutput) {
        currBalOutput.value = `₹ ${result.currentBalance.toFixed(2)}`;
        if (result.currentBalance < 0) {
            currBalOutput.classList.remove('text-warning');
            currBalOutput.classList.add('negative-val');
        } else {
            currBalOutput.classList.add('text-warning');
            currBalOutput.classList.remove('negative-val');
        }
    }
}

// 🟢 উপরের লাইভ কার্ডগুলোর (Metrics) টোটাল হিসাব আপডেট করা
function calculateTotalsUI() {
    const rows = document.querySelectorAll('#lottery-grid-body tr');
    let totalDispatch = 0;
    let totalReturn = 0;
    let totalNetPayable = 0;
    let totalOutstanding = 0;

    // টোটাল নির্ভুল রাখার জন্য আবার কোর ইঞ্জিনের সাহায্য নেওয়া
    rows.forEach(row => {
        const rowData = {
            rate: row.querySelector('.rate-input')?.value,
            dispatchQty: row.querySelector('.dispatch-input')?.value,
            returnQty: row.querySelector('.return-input')?.value,
            commissionRate: row.querySelector('.comm-input')?.value,
            tdsRate: row.querySelector('.tds-input')?.value,
            previousOutstanding: row.querySelector('.prev-bal-input')?.value
        };

        const result = LotteryCalcEngine.calculateRow(rowData);

        totalDispatch += result.dispatchQty;
        totalReturn += result.returnQty;
        totalNetPayable += result.finalAmount;
        totalOutstanding += result.currentBalance;
    });

    // কার্ডগুলোতে ভ্যালু পুশ করা
    document.getElementById('val-dispatch').innerText = totalDispatch;
    document.getElementById('val-return').innerText = totalReturn;
    
    // কারেন্সি ফরম্যাটে (Indian Rupee) সাজানো
    document.getElementById('val-net').innerText = `₹ ${totalNetPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('val-outstanding').innerText = `₹ ${totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
