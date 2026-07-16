// DigiLedger: Payment Workspace Controller (Frontend Logic)

export function initPaymentWorkspace() {
    console.log("[ORBIS] Payment Settlement Engine Initialized.");

    const fetchDuesBtn = document.getElementById('btn-fetch-dues');
    const processPaymentBtn = document.getElementById('btn-process-payment');
    const settlementPanel = document.getElementById('settlement-panel');

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
                document.getElementById('display-due-amount').innerText = "₹ 45,500.00"; 
                
                // প্যানেলটা স্লাইড করে দেখিয়ে দেওয়া
                settlementPanel.style.display = 'block';
            } else {
                alert("দয়া করে সঠিক ১০ ডিজিটের মোবাইল নম্বর দিন।");
            }
        });
    }

    // 🟢 ২. পেমেন্ট রিসিভ করার লজিক
    if (processPaymentBtn) {
        processPaymentBtn.addEventListener('click', () => {
            const payAmount = document.getElementById('input-payment-amount').value;
            
            if (payAmount && parseFloat(payAmount) > 0) {
                // 🟢 Future: এখানে পেমেন্ট API (Supabase) কল হয়ে লেজার আপডেট হবে।
                
                alert(`✅ সফলভাবে ₹ ${payAmount} পেমেন্ট রিসিভ করা হয়েছে এবং লেজার আপডেট হয়েছে!`);
                
                // পেমেন্ট সাকসেসফুল হওয়ার পর স্ক্রিন রিফ্রেশ/ক্লিন করা
                document.getElementById('input-payment-amount').value = '';
                document.getElementById('settle-mobile-input').value = '';
                settlementPanel.style.display = 'none';
            } else {
                alert("দয়া করে সঠিক পেমেন্ট অ্যামাউন্ট দিন।");
            }
        });
    }
}
