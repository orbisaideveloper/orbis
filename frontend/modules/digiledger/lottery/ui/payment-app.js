// DigiLedger: Payment Workspace Controller (Frontend Logic)

export function initPaymentWorkspace() {
    console.log("[ORBIS] Payment Settlement Engine Initialized.");

    const fetchDuesBtn = document.getElementById('btn-fetch-dues');
    const processPaymentBtn = document.getElementById('btn-process-payment');
    const settlementPanel = document.getElementById('settlement-panel');
    
    // বর্তমান বকেয়া স্টোর করার জন্য একটি ভেরিয়েবল
    let currentOutstanding = 0; 

    // 🟢 ১. বকেয়া (Dues) চেক করার লজিক
    if (fetchDuesBtn) {
        fetchDuesBtn.addEventListener('click', () => {
            const mobile = document.getElementById('settle-mobile-input').value.trim();
            
            if (mobile.length >= 10) {
                // 🟢 Future: এখানে ব্যাকএন্ড API কল হবে আসল বকেয়া আনার জন্য। 
                // আপাতত টেস্টিংয়ের জন্য ডামি ডেটা দেখাচ্ছি।
                document.getElementById('settle-party-name').innerText = "Verified Stockist " + mobile.slice(-4);
                document.getElementById('settle-orb-id').innerText = "ORB-LOT-" + mobile.slice(-4);
                
                // ডামি বকেয়া (যেমন ৪৫,৫০০ টাকা)
                currentOutstanding = 45500.00;
                document.getElementById('display-due-amount').innerText = `₹ ${currentOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`; 
                
                // নতুন ব্যালেন্স ফিল্ড রিসেট করা
                updateLiveBalance(); 
                
                // প্যানেলটা স্লাইড করে দেখিয়ে দেওয়া
                settlementPanel.style.display = 'block';
            } else {
                alert("দয়া করে সঠিক ১০ ডিজিটের মোবাইল নম্বর বা ORB-ID দিন।");
            }
        });
    }

    // 🟢 ২. লাইভ ব্যালেন্স ক্যালকুলেশন (Live New Balance Calculation)
    const payTypeEl = document.getElementById('input-payment-type');
    const payAmountEl = document.getElementById('input-payment-amount');
    const payDiscountEl = document.getElementById('input-payment-discount');

    function updateLiveBalance() {
        const type = payTypeEl?.value || 'RECEIPT';
        const amount = parseFloat(payAmountEl?.value) || 0;
        const discount = parseFloat(payDiscountEl?.value) || 0;

        let newBalance = currentOutstanding;

        if (type === 'RECEIPT') {
            // টাকা পেলে বকেয়া কমবে (Amount + Discount দুটোই বকেয়া কমায়)
            newBalance = currentOutstanding - (amount + discount);
        } else if (type === 'PAYMENT') {
            // টাকা দিলে বকেয়া বাড়বে (অথবা রিফান্ড দিলে)
            newBalance = currentOutstanding + amount - discount; 
        }

        const newBalanceEl = document.getElementById('display-new-balance');
        if (newBalanceEl) {
            newBalanceEl.innerText = `Balance After Transaction: ₹ ${newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
            // মাইনাস বা অ্যাডভান্স হলে সবুজ, বকেয়া থাকলে ওয়ার্নিং কালার
            newBalanceEl.style.color = newBalance <= 0 ? '#10b981' : '#f59e0b'; 
        }
    }

    // ইনপুটগুলোতে ইভেন্ট লিসেনার অ্যাড করা যাতে টাইপ করার সাথে সাথে ব্যালেন্স বদলায়
    if (payTypeEl) payTypeEl.addEventListener('change', updateLiveBalance);
    if (payAmountEl) payAmountEl.addEventListener('input', updateLiveBalance);
    if (payDiscountEl) payDiscountEl.addEventListener('input', updateLiveBalance);


    // 🟢 ৩. পেমেন্ট রিসিভ/প্রসেস করার লজিক (Unified Engine Payload)
    if (processPaymentBtn) {
        processPaymentBtn.addEventListener('click', () => {
            const type = payTypeEl?.value;
            const mode = document.getElementById('input-payment-mode')?.value;
            const amount = parseFloat(payAmountEl?.value) || 0;
            const discount = parseFloat(payDiscountEl?.value) || 0;
            const remarks = document.getElementById('input-payment-remarks')?.value || "";
            
            if (amount > 0 || discount > 0) {
                // ডাটাবেসে পাঠানোর জন্য পেলোড তৈরি
                const transactionPayload = {
                    transactionType: type,
                    paymentMode: mode,
                    amount: amount,
                    discount: discount,
                    remarks: remarks,
                    previousBalance: currentOutstanding
                };

                console.log("[ORBIS] Ready to Sync with Database:", transactionPayload);

                // 🟢 Future: এখানে পেমেন্ট API (LotteryDatabase.js) কল হয়ে লেজার আপডেট হবে।
                
                alert(`✅ সফলভাবে ₹ ${amount} (${mode}) লেনদেন প্রসেস করা হয়েছে!`);
                
                // পেমেন্ট সাকসেসফুল হওয়ার পর স্ক্রিন রিফ্রেশ/ক্লিন করা
                if(payAmountEl) payAmountEl.value = '';
                if(payDiscountEl) payDiscountEl.value = '';
                const remarksEl = document.getElementById('input-payment-remarks');
                if(remarksEl) remarksEl.value = '';
                document.getElementById('settle-mobile-input').value = '';
                settlementPanel.style.display = 'none';
                
                currentOutstanding = 0; // মেমরি ক্লিন
            } else {
                alert("দয়া করে সঠিক অ্যামাউন্ট বা ডিসকাউন্ট দিন।");
            }
        });
    }
}
