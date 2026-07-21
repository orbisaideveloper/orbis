// DigiLedger: Payment Workspace Controller (ORBIS Integrated)

window.LotteryPaymentApp = {
    mount: function(container) {
        // ১. পেমেন্ট মডিউলের HTML ডিজাইন স্ক্রিনে বসানো হচ্ছে
        container.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; text-align: left;">
                <h3 style="color: #138808; margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px;">💰 Payment Settlement</h3>
                
                <!-- Search Section -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #555;">Enter Mobile No / ORB-ID</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="settle-mobile-input" placeholder="e.g. 9876543210" style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 1rem;">
                        <button id="btn-fetch-dues" style="background: #0056b3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">Fetch Dues</button>
                    </div>
                </div>

                <!-- Settlement Panel (Hidden initially) -->
                <div id="settlement-panel" style="display: none; border-top: 2px dashed #ccc; padding-top: 20px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e9ecef;">
                        <p style="margin: 0 0 5px 0;"><strong>Party:</strong> <span id="settle-party-name" style="color: #0056b3;"></span></p>
                        <p style="margin: 0 0 5px 0;"><strong>ID:</strong> <span id="settle-orb-id"></span></p>
                        <p style="margin: 0; font-size: 1.2rem;"><strong>Current Dues:</strong> <span id="display-due-amount" style="color: #dc3545; font-weight: bold;"></span></p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; font-weight: bold; font-size: 0.9rem; margin-bottom: 5px; color: #555;">Type</label>
                            <select id="input-payment-type" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 1rem;">
                                <option value="RECEIPT">Receipt (টাকা পেলাম)</option>
                                <option value="PAYMENT">Payment (টাকা দিলাম)</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-weight: bold; font-size: 0.9rem; margin-bottom: 5px; color: #555;">Mode</label>
                            <select id="input-payment-mode" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 1rem;">
                                <option value="CASH">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="BANK">Bank Transfer</option>
                            </select>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; font-weight: bold; font-size: 0.9rem; margin-bottom: 5px; color: #555;">Amount (₹)</label>
                            <input type="number" id="input-payment-amount" placeholder="0.00" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; font-size: 1rem;">
                        </div>
                        <div>
                            <label style="display: block; font-weight: bold; font-size: 0.9rem; margin-bottom: 5px; color: #555;">Discount (₹)</label>
                            <input type="number" id="input-payment-discount" placeholder="0.00" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; font-size: 1rem;">
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-weight: bold; font-size: 0.9rem; margin-bottom: 5px; color: #555;">Remarks</label>
                        <input type="text" id="input-payment-remarks" placeholder="Any note..." style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; font-size: 1rem;">
                    </div>

                    <div id="display-new-balance" style="font-weight: bold; text-align: center; margin-bottom: 15px; font-size: 1.1rem; color: #f59e0b;">
                        Balance After Transaction: ₹ 0.00
                    </div>

                    <button id="btn-process-payment" style="width: 100%; background: #138808; color: white; border: none; padding: 12px; font-size: 1.1rem; border-radius: 5px; font-weight: bold; cursor: pointer; transition: 0.3s;">
                        Process Transaction
                    </button>
                </div>
            </div>
        `;

        // ২. ডিজাইন বসানোর পর আপনার অরিজিনাল লজিক ফায়ার করা হচ্ছে
        this.initLogic();
    },

    initLogic: function() {
        console.log("[ORBIS] Payment Settlement Engine Initialized.");

        const fetchDuesBtn = document.getElementById('btn-fetch-dues');
        const processPaymentBtn = document.getElementById('btn-process-payment');
        const settlementPanel = document.getElementById('settlement-panel');
        
        let currentOutstanding = 0; 

        if (fetchDuesBtn) {
            fetchDuesBtn.addEventListener('click', () => {
                const mobile = document.getElementById('settle-mobile-input').value.trim();
                
                if (mobile.length >= 10) {
                    document.getElementById('settle-party-name').innerText = "Verified Stockist " + mobile.slice(-4);
                    document.getElementById('settle-orb-id').innerText = "ORB-LOT-" + mobile.slice(-4);
                    
                    currentOutstanding = 45500.00;
                    document.getElementById('display-due-amount').innerText = `₹ ${currentOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`; 
                    
                    updateLiveBalance(); 
                    settlementPanel.style.display = 'block';
                } else {
                    alert("দয়া করে সঠিক ১০ ডিজিটের মোবাইল নম্বর বা ORB-ID দিন।");
                }
            });
        }

        const payTypeEl = document.getElementById('input-payment-type');
        const payAmountEl = document.getElementById('input-payment-amount');
        const payDiscountEl = document.getElementById('input-payment-discount');

        function updateLiveBalance() {
            const type = payTypeEl?.value || 'RECEIPT';
            const amount = parseFloat(payAmountEl?.value) || 0;
            const discount = parseFloat(payDiscountEl?.value) || 0;

            let newBalance = currentOutstanding;

            if (type === 'RECEIPT') {
                newBalance = currentOutstanding - (amount + discount);
            } else if (type === 'PAYMENT') {
                newBalance = currentOutstanding + amount - discount; 
            }

            const newBalanceEl = document.getElementById('display-new-balance');
            if (newBalanceEl) {
                newBalanceEl.innerText = `Balance After Transaction: ₹ ${newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                newBalanceEl.style.color = newBalance <= 0 ? '#10b981' : '#f59e0b'; 
            }
        }

        if (payTypeEl) payTypeEl.addEventListener('change', updateLiveBalance);
        if (payAmountEl) payAmountEl.addEventListener('input', updateLiveBalance);
        if (payDiscountEl) payDiscountEl.addEventListener('input', updateLiveBalance);

        if (processPaymentBtn) {
            processPaymentBtn.addEventListener('click', () => {
                const type = payTypeEl?.value;
                const mode = document.getElementById('input-payment-mode')?.value;
                const amount = parseFloat(payAmountEl?.value) || 0;
                const discount = parseFloat(payDiscountEl?.value) || 0;
                const remarks = document.getElementById('input-payment-remarks')?.value || "";
                
                if (amount > 0 || discount > 0) {
                    const transactionPayload = {
                        transactionType: type,
                        paymentMode: mode,
                        amount: amount,
                        discount: discount,
                        remarks: remarks,
                        previousBalance: currentOutstanding
                    };

                    console.log("[ORBIS] Ready to Sync with Database:", transactionPayload);

                    alert(`✅ সফলভাবে ₹ ${amount} (${mode}) লেনদেন প্রসেস করা হয়েছে!`);
                    
                    if(payAmountEl) payAmountEl.value = '';
                    if(payDiscountEl) payDiscountEl.value = '';
                    const remarksEl = document.getElementById('input-payment-remarks');
                    if(remarksEl) remarksEl.value = '';
                    document.getElementById('settle-mobile-input').value = '';
                    settlementPanel.style.display = 'none';
                    
                    currentOutstanding = 0; 
                } else {
                    alert("দয়া করে সঠিক অ্যামাউন্ট বা ডিসকাউন্ট দিন।");
                }
            });
        }
    }
};
