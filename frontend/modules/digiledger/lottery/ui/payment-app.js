// ORBIS ERP: Unified Master Payment App (Merged with Premium UI & 3-Wallet Split)
// Features: Party Lookup, Discount, Live Balance, 3-Wallet Split (Cash/Bank/PWT), Expense Module

window.LotteryPaymentApp = {
    mount: function(container) {
        container.innerHTML = `
        <style>
          .payment-workspace { font-family: 'Segoe UI', system-ui, sans-serif; padding: 20px; color: #333; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); min-height: 80vh; border-radius: 12px; }
          .glass-card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.9); border-radius: 16px; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05); padding: 24px; margin-bottom: 20px; }
          
          /* Transaction Tabs */
          .txn-types { display: flex; gap: 15px; margin-bottom: 20px; background: rgba(0,0,0,0.05); padding: 6px; border-radius: 12px; }
          .txn-btn { flex: 1; padding: 12px; border: none; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.3s; background: transparent; color: #64748b; }
          .txn-btn.active-receive { background: #10b981; color: white; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
          .txn-btn.active-payment { background: #3b82f6; color: white; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); }
          .txn-btn.active-expense { background: #f59e0b; color: white; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3); }

          /* Inputs & Search */
          .search-row { display: flex; gap: 15px; align-items: center; flex-wrap: wrap; }
          .glass-input { flex: 1; padding: 14px 20px; border-radius: 12px; border: 1px solid #cbd5e1; font-size: 16px; outline: none; background: #fff; transition: 0.2s; min-width: 250px;}
          .glass-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
          .btn-primary { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; border: none; padding: 14px 28px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(15, 23, 42, 0.3); transition: 0.2s; white-space: nowrap; }
          .btn-primary:hover { transform: translateY(-2px); }

          /* Ledger Summary */
          .ledger-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
          .ledger-box { padding: 20px; border-radius: 12px; background: #fff; border: 1px solid #e2e8f0; text-align: center; display: flex; flex-direction: column; justify-content: center; }
          .due-amount { font-size: 36px; font-weight: 800; color: #ef4444; margin: 10px 0; }
          .new-balance { font-size: 18px; font-weight: 700; color: #10b981; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #cbd5e1; }
          
          /* Payment Area */
          .payment-entry-area { background: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; }
          .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
          .form-label { display: block; text-align: left; font-size: 13px; color: #64748b; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; }
          .pay-input { font-size: 24px; font-weight: bold; color: #0f172a; text-align: right; width: 100%; padding: 12px 15px; border-radius: 8px; border: 2px solid #cbd5e1; outline: none; background: #fff; box-sizing: border-box; transition: 0.3s; }
          .pay-input:focus { border-color: #3b82f6; }

          /* 3-Wallet Split */
          .wallet-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; padding: 15px; background: #fff; border-radius: 10px; border: 1px dashed #cbd5e1; }
          .wallet-card { text-align: center; }
          .wallet-icon { font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #475569; }
          .wallet-input { width: 100%; text-align: center; font-size: 18px; font-weight: bold; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; outline: none;}
          .wallet-input:focus { border-color: #10b981; }

          /* Validation Bar */
          .match-indicator { padding: 12px; border-radius: 8px; text-align: center; font-weight: bold; font-size: 14px; background: #f1f5f9; color: #64748b; margin-bottom: 20px; transition: 0.3s; }
          .match-success { background: #d1fae5; color: #047857; border: 1px solid #10b981; }
          .match-error { background: #fee2e2; color: #b91c1c; border: 1px solid #ef4444; }

          .btn-submit { background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 16px; border-radius: 12px; font-size: 18px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); transition: 0.2s; width: 100%; }
          .btn-submit:disabled { background: #cbd5e1; box-shadow: none; cursor: not-allowed; transform: none; }
        </style>

        <div class="payment-workspace">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap: wrap; gap: 10px;">
                <h2 style="margin:0; color:#0f172a;">💸 Master Settlement Engine</h2>
                <span style="background:#e0f2fe; color:#0369a1; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:bold;">UNIFIED 3-WALLET SYSTEM</span>
            </div>

            <!-- Transaction Type Selection -->
            <div class="glass-card" style="padding: 15px 24px;">
                <div class="txn-types" id="txn-type-container">
                    <button class="txn-btn active-receive" data-type="RECEIPT">⬇️ Receive (Customer)</button>
                    <button class="txn-btn" data-type="PAYMENT">⬆️ Payment (Mohajon)</button>
                    <button class="txn-btn" data-type="EXPENSE">🔥 Expense (Kharcha)</button>
                </div>

                <div class="search-row">
                    <input type="text" class="glass-input" id="settle-party-input" placeholder="🔍 Enter Mobile / ORB-ID / Expense Head...">
                    <button class="btn-primary" id="btn-fetch-dues">Fetch Ledger</button>
                </div>
            </div>

            <!-- Settlement Panel (Hidden initially) -->
            <div class="glass-card" id="settlement-panel" style="display: none;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:15px; flex-wrap: wrap;">
                    <h3 style="margin:0; color:#0f172a;" id="settle-party-name">Party Name</h3>
                    <span id="settle-orb-id" style="color:#64748b; font-family:monospace; font-weight:bold;">ID: ----</span>
                </div>

                <div class="ledger-summary">
                    <!-- Live Balance Display -->
                    <div class="ledger-box">
                        <div style="color:#64748b; font-weight:600; font-size:14px;">CURRENT OUTSTANDING</div>
                        <div class="due-amount" id="display-due-amount">₹ 0.00</div>
                        <div class="new-balance" id="display-new-balance">Balance After Txn: ₹ 0.00</div>
                    </div>
                    
                    <!-- Unified Payment Form -->
                    <div class="payment-entry-area">
                        <div class="input-grid">
                            <div>
                                <label class="form-label">Total Amount (₹)</label>
                                <input type="number" class="pay-input" id="input-total-amount" placeholder="0.00">
                            </div>
                            <div>
                                <label class="form-label">Discount / Adj (₹)</label>
                                <input type="number" class="pay-input" id="input-discount" style="color: #64748b;" placeholder="0.00">
                            </div>
                        </div>

                        <!-- 3 Wallet Split -->
                        <label class="form-label">Fund Split (Where is the money moving?)</label>
                        <div class="wallet-grid">
                            <div class="wallet-card">
                                <div class="wallet-icon">💵 Cash</div>
                                <input type="number" class="wallet-input split-input" id="split-cash" placeholder="0">
                            </div>
                            <div class="wallet-card">
                                <div class="wallet-icon">🏦 Bank/UPI</div>
                                <input type="number" class="wallet-input split-input" id="split-bank" placeholder="0">
                            </div>
                            <div class="wallet-card">
                                <div class="wallet-icon">🎟️ PWT</div>
                                <input type="number" class="wallet-input split-input" id="split-pwt" placeholder="0">
                            </div>
                        </div>

                        <div class="match-indicator" id="match-status">Enter amount to verify wallet split.</div>

                        <div style="margin-bottom: 20px;">
                            <label class="form-label">Remarks / Reference</label>
                            <input type="text" class="glass-input" id="input-remarks" style="width: 100%; box-sizing: border-box;" placeholder="Optional note...">
                        </div>

                        <button class="btn-submit" id="btn-process-payment" disabled>Process Transaction ✓</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        this.initLogic();
    },

    initLogic: function() {
        let currentOutstanding = 0;
        let activeType = 'RECEIPT';

        const typeBtns = document.querySelectorAll('.txn-btn');
        const fetchDuesBtn = document.getElementById('btn-fetch-dues');
        const processPaymentBtn = document.getElementById('btn-process-payment');
        const settlementPanel = document.getElementById('settlement-panel');
        
        const totalAmountEl = document.getElementById('input-total-amount');
        const discountEl = document.getElementById('input-discount');
        const splitInputs = document.querySelectorAll('.split-input');
        const matchStatus = document.getElementById('match-status');

        // 1. Tab Switch Logic
        typeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                typeBtns.forEach(b => b.classList.remove('active-receive', 'active-payment', 'active-expense'));
                activeType = e.target.getAttribute('data-type');
                
                if(activeType === 'RECEIPT') e.target.classList.add('active-receive');
                if(activeType === 'PAYMENT') e.target.classList.add('active-payment');
                if(activeType === 'EXPENSE') {
                    e.target.classList.add('active-expense');
                    currentOutstanding = 0; // Expenses don't usually have outstanding dues
                    updateLiveBalance();
                }
                
                // Trigger re-calculation on tab change
                updateLiveBalance();
            });
        });

        // 2. Fetch Party Data
        if (fetchDuesBtn) {
            fetchDuesBtn.addEventListener('click', () => {
                const inputVal = document.getElementById('settle-party-input').value.trim();
                
                if (inputVal.length > 0) {
                    document.getElementById('settle-party-name').innerText = activeType === 'EXPENSE' ? "Expense: " + inputVal : "Party: " + inputVal;
                    document.getElementById('settle-orb-id').innerText = activeType === 'EXPENSE' ? "EXP-01" : "ORB-ID-" + Math.floor(Math.random()*9000 + 1000);
                    
                    // Mock DB fetch
                    currentOutstanding = activeType === 'EXPENSE' ? 0 : 45500.00;
                    document.getElementById('display-due-amount').innerText = `₹ ${currentOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`; 
                    
                    updateLiveBalance(); 
                    settlementPanel.style.display = 'block';
                } else {
                    alert("Please enter a valid Party or Expense Head.");
                }
            });
        }

        // 3. Live Balance Calculator
        function updateLiveBalance() {
            const amount = parseFloat(totalAmountEl.value) || 0;
            const discount = parseFloat(discountEl.value) || 0;

            let newBalance = currentOutstanding;

            // Live calculation logic
            if (activeType === 'RECEIPT') {
                newBalance = currentOutstanding - (amount + discount);
            } else if (activeType === 'PAYMENT') {
                newBalance = currentOutstanding + amount - discount; 
            } else if (activeType === 'EXPENSE') {
                newBalance = 0; // NA for expense
            }

            const newBalanceEl = document.getElementById('display-new-balance');
            if (activeType === 'EXPENSE') {
                newBalanceEl.innerText = `Balance: Not Applicable for Expense`;
                newBalanceEl.style.color = '#64748b';
            } else {
                newBalanceEl.innerText = `Balance After Txn: ₹ ${newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                newBalanceEl.style.color = newBalance <= 0 ? '#10b981' : '#f59e0b'; 
            }
            
            validateSplit(); // Check wallet match whenever amounts change
        }

        // 4. Wallet Match Validator
        function validateSplit() {
            const total = parseFloat(totalAmountEl.value) || 0;
            let splitSum = 0;
            splitInputs.forEach(input => splitSum += parseFloat(input.value) || 0);

            if (total === 0) {
                matchStatus.className = 'match-indicator';
                matchStatus.innerText = "Enter Total Amount and Split to verify.";
                processPaymentBtn.disabled = true;
                return;
            }

            const diff = total - splitSum;

            if (diff === 0) {
                matchStatus.className = 'match-indicator match-success';
                matchStatus.innerHTML = "✅ Split matches perfectly!";
                processPaymentBtn.disabled = false;
            } else if (diff > 0) {
                matchStatus.className = 'match-indicator match-error';
                matchStatus.innerHTML = `❌ Short by ₹ ${diff.toFixed(2)}`;
                processPaymentBtn.disabled = true;
            } else {
                matchStatus.className = 'match-indicator match-error';
                matchStatus.innerHTML = `❌ Over by ₹ ${Math.abs(diff).toFixed(2)}`;
                processPaymentBtn.disabled = true;
            }
        }

        totalAmountEl.addEventListener('input', updateLiveBalance);
        discountEl.addEventListener('input', updateLiveBalance);
        splitInputs.forEach(input => input.addEventListener('input', validateSplit));

        // 5. Final Submission
        if (processPaymentBtn) {
            processPaymentBtn.addEventListener('click', () => {
                const amount = parseFloat(totalAmountEl.value) || 0;
                
                if (amount > 0) {
                    const payload = {
                        type: activeType,
                        party: document.getElementById('settle-party-name').innerText,
                        totalAmount: amount,
                        discount: parseFloat(discountEl.value) || 0,
                        cashSplit: parseFloat(document.getElementById('split-cash').value) || 0,
                        bankSplit: parseFloat(document.getElementById('split-bank').value) || 0,
                        pwtSplit: parseFloat(document.getElementById('split-pwt').value) || 0,
                        remarks: document.getElementById('input-remarks').value
                    };

                    console.log("[ORBIS DB Payload]", payload);

                    alert(`✅ ₹ ${amount} Transaction Saved Successfully! Wallets & Ledgers Updated.`);
                    
                    // Reset Form
                    totalAmountEl.value = '';
                    discountEl.value = '';
                    document.getElementById('input-remarks').value = '';
                    splitInputs.forEach(i => i.value = '');
                    document.getElementById('settle-party-input').value = '';
                    settlementPanel.style.display = 'none';
                    
                    currentOutstanding = 0; 
                }
            });
        }
    }
};
