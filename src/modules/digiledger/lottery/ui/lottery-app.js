// DigiLedger: Lottery Workspace Controller (Frontend Logic)

export function initLotteryWorkspace() {
    console.log("[ORBIS] Lottery Workspace Engine Initialized.");

    const gridBody = document.getElementById('lottery-grid-body');
    if (!gridBody) {
        console.warn("[ORBIS] Lottery Grid Body not found, skipping grid events.");
        return;
    }

    // 🟢 1. Event Delegation for Auto-Calculation
    gridBody.addEventListener('input', function(e) {
        if (e.target.classList.contains('spreadsheet-input')) {
            const currentRow = e.target.closest('tr');
            if (currentRow) {
                calculateRow(currentRow);
                calculateTotals();
            }
        }
    });

    // 🟢 2. Party Search Module (ORB-ID Lookup)
    const fetchPartyBtn = document.getElementById('btn-fetch-party');
    const partyInput = document.getElementById('party-mobile-input');
    
    if (fetchPartyBtn && partyInput) {
        fetchPartyBtn.addEventListener('click', () => {
            const mobile = partyInput.value.trim();
            if (mobile.length >= 10) {
                const infoDisplay = document.getElementById('party-info-display');
                const partyNameSpan = document.getElementById('active-party-name');
                
                if (infoDisplay) infoDisplay.style.display = 'block';
                if (partyNameSpan) {
                    partyNameSpan.style.color = '#f59e0b';
                    partyNameSpan.innerText = "Searching ORB-ID Data...";
                }
                
                // Backend API Call Simulation
                setTimeout(() => {
                    if (partyNameSpan) {
                        partyNameSpan.style.color = '#059669';
                        partyNameSpan.innerText = "Verified Party - " + mobile;
                    }
                }, 600);
            } else {
                alert("দয়া করে সঠিক ১০ ডিজিটের মোবাইল নম্বর দিন।");
            }
        });
    }
}

// 🟢 প্রতিটি লাইনের (Row) হিসাব করার ইঞ্জিন
function calculateRow(row) {
    const rate = parseFloat(row.querySelector('.rate-input')?.value) || 0;
    const dispatch = parseInt(row.querySelector('.dispatch-input')?.value) || 0;
    const returnQty = parseInt(row.querySelector('.return-input')?.value) || 0;
    
    // কমিশন থেকে % চিহ্ন সরিয়ে শুধু সংখ্যাটা নেওয়া
    const commStr = row.querySelector('.comm-input')?.value || "0";
    const commPercent = parseFloat(commStr.replace('%', '')) || 0;

    // মূল লজিক: (Dispatch - Return) * Rate
    const netQty = Math.max(0, dispatch - returnQty);
    const grossAmount = netQty * rate;
    
    // কমিশন মাইনাস করা
    const commAmount = grossAmount * (commPercent / 100);
    let netPay = grossAmount - commAmount;
    
    // রেজাল্ট ডিসপ্লে করা
    const outputField = row.querySelector('.net-pay-output');
    if (outputField) {
        outputField.value = `₹ ${netPay.toFixed(2)}`;
    }
}

// 🟢 উপরের লাইভ কার্ডগুলোর (Metrics) হিসাব করার ইঞ্জিন
function calculateTotals() {
    const rows = document.querySelectorAll('#lottery-grid-body tr');
    let totalDispatch = 0;
    let totalReturn = 0;
    let totalNet = 0;

    rows.forEach(row => {
        totalDispatch += parseInt(row.querySelector('.dispatch-input')?.value) || 0;
        totalReturn += parseInt(row.querySelector('.return-input')?.value) || 0;
        
        const netPayStr = row.querySelector('.net-pay-output')?.value || "0";
        // Clean currency format: ₹ 1,200.00 -> 1200
        const netPay = parseFloat(netPayStr.replace(/[₹ ,]/g, '')) || 0;
        totalNet += netPay;
    });

    // কার্ডগুলোতে ভ্যালু পুশ করা
    const elDispatch = document.getElementById('val-dispatch');
    const elReturn = document.getElementById('val-return');
    const elNet = document.getElementById('val-net');

    if (elDispatch) elDispatch.innerText = totalDispatch;
    if (elReturn) elReturn.innerText = totalReturn;
    
    if (elNet) {
        elNet.innerText = `₹ ${totalNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
}
