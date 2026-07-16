// DigiLedger: Lottery Workspace Controller (Frontend Logic)

export function initLotteryWorkspace() {
    console.log("[ORBIS] Lottery Workspace Engine Initialized.");

    const gridBody = document.getElementById('lottery-grid-body');
    if (!gridBody) return;

    // 🟢 1. Event Delegation for Auto-Calculation
    // স্প্রেডশিটের যেকোনো ঘরে কিছু লিখলেই এই ইভেন্ট নিজে নিজে ফায়ার হবে
    gridBody.addEventListener('input', function(e) {
        if (e.target.classList.contains('spreadsheet-input')) {
            const currentRow = e.target.closest('tr');
            calculateRow(currentRow);
            calculateTotals();
        }
    });

    // 🟢 2. Party Search Module (ORB-ID Lookup)
    const fetchPartyBtn = document.getElementById('btn-fetch-party');
    const partyInput = document.getElementById('party-mobile-input');
    
    if (fetchPartyBtn) {
        fetchPartyBtn.addEventListener('click', () => {
            const mobile = partyInput.value.trim();
            if (mobile.length >= 10) {
                const infoDisplay = document.getElementById('party-info-display');
                const partyNameSpan = document.getElementById('active-party-name');
                
                infoDisplay.style.display = 'block';
                partyNameSpan.style.color = '#f59e0b';
                partyNameSpan.innerText = "Searching ORB-ID Data...";
                
                // 🟢 Future: এখানে ব্যাকএন্ড API কল হবে। আপাতত UI টেস্টের জন্য ডামি রেসপন্স।
                setTimeout(() => {
                    partyNameSpan.style.color = '#059669';
                    partyNameSpan.innerText = "Verified Party - " + mobile;
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
    const netQty = dispatch - returnQty;
    const grossAmount = netQty * rate;
    
    // কমিশন মাইনাস করা
    const commAmount = grossAmount * (commPercent / 100);
    let netPay = grossAmount - commAmount;
    
    // যদি রিটার্ন ডেসপ্যাচের চেয়ে বেশি হয়, তাহলে মাইনাস ফিগার এড়ানোর জন্য
    if (netPay < 0) netPay = 0; 

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
        const netPay = parseFloat(netPayStr.replace('₹ ', '').replace(/,/g, '')) || 0;
        totalNet += netPay;
    });

    // কার্ডগুলোতে ভ্যালু পুশ করা
    document.getElementById('val-dispatch').innerText = totalDispatch;
    document.getElementById('val-return').innerText = totalReturn;
    
    // টাকাকে সুন্দর ফরম্যাটে দেখানোর জন্য (যেমন: 1,500.00)
    document.getElementById('val-net').innerText = `₹ ${totalNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // 🟢 Future: লাইভ আউটস্ট্যান্ডিং (বকেয়া) ব্যাকএন্ড থেকে আসবে।
}
