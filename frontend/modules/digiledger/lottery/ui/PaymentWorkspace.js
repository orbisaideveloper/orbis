// DigiLedger: Payment Workspace Controller (ORBIS Integrated - Premium Glass Design)

window.LotteryPaymentApp = {
    mount: function(container) {
        // ১. আপনার দেওয়া প্রিমিয়াম HTML ডিজাইন
        container.innerHTML = `
        <style>
          .payment-workspace {
            font-family: 'Segoe UI', system-ui, sans-serif;
            padding: 20px;
            color: #333;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 80vh;
            border-radius: 12px;
          }
          
          .glass-card {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.9);
            border-radius: 16px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
            padding: 24px;
            margin-bottom: 20px;
          }

          /* Party Search Box */
          .search-row { display: flex; gap: 15px; align-items: center; flex-wrap: wrap; }
          .glass-input { flex: 1; padding: 16px 20px; border-radius: 12px; border: 1px solid #cbd5e1; font-size: 16px; outline: none; background: #fff; transition: 0.2s; min-width: 250px;}
          .glass-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
          
          .btn-success { background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 14px 28px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); transition: 0.2s; width: 100%; white-space: nowrap; }
          .btn-success:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4); }

          /* Ledger Summary */
          .ledger-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
          .ledger-box { padding: 20px; border-radius: 12px; background: #fff; border: 1px solid #e2e8f0; text-align: center; display: flex; flex-direction: column; justify-content: center; }
          .due-amount { font-size: 36px; font-weight: 800; color: #ef4444; margin: 10px 0; }
          .new-balance { font-size: 18px; font-weight: 700; color: #10b981; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #cbd5e1; }
          
          /* Payment Input Area */
          .payment-entry-area { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 24px; border-radius: 12px; }
          
          .input-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-bottom: 15px; }
          
          .pay-input { font-size: 20px; font-weight: bold; color: #065f46; text-align: center; width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #10b981; outline: none; background: #fff; box-sizing: border-box; }
          .pay-select { font-size: 16px; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; background: #fff; width: 100%; color: #334155; font-weight: 600; box-sizing: border-box; }
          
          .form-label { display: block; text-align: left; font-size: 13px; color: #64748b; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; }
        </style>

        <div class="payment-workspace">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap: wrap; gap: 10px;">
                <h2 style="margin:0; color:#0f172a;">💸 Account Settlement Workspace</h2>
                <span style="background:#fef3c7; color:#d97706; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:bold;">UNIFIED PAYMENT ENGINE</span>
            </div>

            <!-- 1. Party Lookup -->
            <div class="glass-card">
                <h4 style="margin-top:0; color:#64748b;">1. Locate Party Ledger</h4>
                <div class="search-row">
                    <input type="tel" class="glass-input" id="settle-mobile-input" placeholder="🔍 Enter Mobile Number / ORB-ID...">
                    <button class="btn-success" id="btn-fetch-dues" style="width: auto;">Check Ledger</button>
                </div>
            </div>

            <!-- 2. Settlement Panel (Hidden initially) -->
            <div class="glass-card" id="settlement-panel" style="display: none;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:15px; flex-wrap: wrap;">
                    <h3 style="margin:0; color:#0f172a;" id="settle-party-name">Party Name</h3>
                    <span id="settle-orb-id" style="color:#64748b; font-family:monospace; font-weight:bold;">ORB-ID: ----</span>
                </div>

                <div class="ledger-summary">
                    <!-- Live Balance Display -->
                    <div class="ledger-box">
                        <div style="color:#64748b; font-weight:600; font-size:14px;">CURRENT OUTSTANDING</div>
                        <div class="due-amount" id="display-due-amount">₹ 0.00</div>
                        <div class="new-balance" id="display-new-balance">Balance After Payment: ₹ 0.00</div>
                    </div>
                    
                    <!-- Unified Payment Form -->
                    <div class="payment-entry-area">
                        <div class="input-grid">
                            <div>
                                <label class="form-label">Transaction Type</label>
                                <select class="pay-select" id="input-payment-type">
                                    <option value="RECEIPT">⬇️ Receipt (Money In)</option>
                                    <option value="PAYMENT">⬆️ Payment (Money Out)</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Payment Mode</label>
                                <select class="pay-select" id="input-payment-mode">
                                    <option value="CASH">💵 Cash</option>
                                    <option value="UPI">📱 UPI / PhonePe</option>
                                    <option value="BANK">🏦 Bank Transfer</option>
                                </select>
                            </div>
                        </div>

                        <div class="input-grid">
                            <div>
                                <label class="form-label">Amount (₹)</label>
                                <input type="number" class="pay-input" id="input-payment-amount" placeholder="0.00">
                            </div>
                            <div>
                                <label class="form-label">Discount / Adj (₹)</label>
                                <input type="number" class="pay-input" id="input-payment-discount" style="border-color: #cbd5e1; color: #64748b;" placeholder="0.00">
                            </div>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <label class="form-label">Remarks / Reference</label>
                            <input type="text" class="glass-input" id="input-payment-remarks" style="width: 100%; padding: 12px; box-sizing: border-box;" placeholder="E.g., Transaction ID, Notes for Supervisor...">
                        </div>

                        <button class="btn-success" id="btn-process-payment">Process Transaction ✓</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        // ২. আপনার অরিজিনাল লজিক ফায়ার করা হচ্ছে
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
                newBalanceEl.innerText = `Balance After Payment: ₹ ${newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
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
                
                if (amount > 0 || discount > 0) {
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
