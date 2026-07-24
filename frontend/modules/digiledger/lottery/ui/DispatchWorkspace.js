// DigiLedger: Lottery Dispatch Workspace (ORBIS Integrated with Glassmorphism)
// (নিশ্চিত করবেন যে আপনার HTML/JS ফাইলে LotteryCalcEngine ইম্পোর্ট করা আছে)

// ডেমো ডাটাবেস
const partiesDB = [
    { id: 'P01', name: 'Rahul Agency', category: 'Lottery', rate: 4.5, tds: 2, prevBal: 1500 },
    { id: 'P02', name: 'Bikash Traders', category: 'Lottery', rate: 5.0, tds: 2, prevBal: -500 },
    { id: 'P03', name: 'Mayer Doa Lottery', category: 'Lottery', rate: 4.8, tds: 2, prevBal: 0 },
    { id: 'P04', name: 'Raju Grocery', category: 'Grocery', rate: 10, tds: 0, prevBal: 200 }
];

window.LotteryDispatchApp = {
    mount: function(container) {
        const topNavBar = window.LotteryUserUI ? window.LotteryUserUI.getTopNavBar("🚀 Dispatch & Bulk Entry") : "";

        container.innerHTML = `
        <style>
          /* Futuristic Tricolor Glass Theme */
          .lottery-workspace { font-family: 'Segoe UI', system-ui, sans-serif; padding: 20px; color: #333; background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%); min-height: 100vh; border-radius: 12px; }
          .glass-card { background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 16px; box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07); padding: 20px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
          .glass-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.1); }
          .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px; margin-top: 15px; }
          .metric-value { font-size: 28px; font-weight: 700; color: #0052cc; margin-top: 8px; }
          .party-search-section { display: flex; gap: 15px; margin-bottom: 24px; align-items: center; }
          .glass-input { flex: 1; background: rgba(255, 255, 255, 0.9); border: 1px solid #d1d5db; padding: 14px 20px; border-radius: 12px; font-size: 16px; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
          .glass-input:focus { border-color: #0052cc; box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1); }
          .btn-primary { background: linear-gradient(135deg, #0052cc, #0047b3); color: white; border: none; padding: 14px 28px; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(0, 82, 204, 0.3); }
          .btn-secondary { background: rgba(0, 82, 204, 0.1); color: #0052cc; border: 2px dashed #0052cc; padding: 12px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 12px; transition: all 0.2s; }
          .btn-secondary:hover { background: rgba(0, 82, 204, 0.2); }
          .btn-save { background: linear-gradient(135deg, #000080, #00004d); color: white; border: none; padding: 16px; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 10px; box-shadow: 0 6px 20px rgba(0, 0, 128, 0.25); transition: transform 0.2s; }
          .btn-save:hover { transform: translateY(-2px); }
          .spreadsheet-container { width: 100%; overflow-x: auto; overflow-y: visible; }
          .spreadsheet-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 1200px; }
          .spreadsheet-table th { text-align: left; padding: 14px 10px; color: #6b7280; font-weight: 600; font-size: 13px; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; white-space: nowrap; }
          .spreadsheet-table td { padding: 8px; border-bottom: 1px solid #f3f4f6; }
          .spreadsheet-input { width: 100%; border: 1px solid transparent; background: rgba(255, 255, 255, 0.5); padding: 10px; font-size: 15px; border-radius: 6px; font-weight: 500; transition: all 0.2s; box-sizing: border-box; }
          .spreadsheet-input:focus { background: white; border: 1px solid #0052cc; outline: none; box-shadow: 0 0 5px rgba(0, 82, 204, 0.2); }
          .calc-field { font-weight: 700; background: transparent !important; pointer-events: none; }
          .text-success { color: #10b981; } .text-warning { color: #f59e0b; } .negative-val { color: #ef4444 !important; }
          .autocomplete-dropdown { position: absolute; top: 100%; left: 8px; right: 8px; z-index: 9999; background: white; border: 1px solid #d1d5db; border-radius: 6px; max-height: 150px; overflow-y: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.15); display: none; }
          .autocomplete-item { padding: 10px 12px; cursor: pointer; border-bottom: 1px solid #f3f4f6; font-size: 14px; font-weight: 500; }
          .autocomplete-item:hover { background: #e0f2fe; color: #0052cc; }
        </style>
        
        <div class="lottery-workspace">
          ${topNavBar}

          <div class="metrics-grid">
            <div class="glass-card"><div style="color: #6b7280; font-size: 14px; font-weight: 600;">TODAY'S DISPATCH</div><div class="metric-value" id="val-dispatch">0</div></div>
            <div class="glass-card"><div style="color: #6b7280; font-size: 14px; font-weight: 600;">TOTAL RETURN</div><div class="metric-value" id="val-return" style="color: #ef4444;">0</div></div>
            <div class="glass-card"><div style="color: #6b7280; font-size: 14px; font-weight: 600;">NET SALES</div><div class="metric-value" id="val-net">₹ 0.00</div></div>
            <div class="glass-card"><div style="color: #6b7280; font-size: 14px; font-weight: 600;">LIVE OUTSTANDING</div><div class="metric-value" id="val-outstanding" style="color: #f59e0b;">₹ 0.00</div></div>
          </div>
        
          <div class="glass-card" style="margin-bottom: 24px;">
            <div class="party-search-section">
              <input type="tel" class="glass-input" placeholder="🔍 Quick Lookup: Mobile Number / ORB-ID..." id="party-mobile-input">
              <button class="btn-primary" id="btn-fetch-party">Check Profile</button>
            </div>
          </div>
        
          <div class="glass-card">
            <div class="spreadsheet-container">
              <table class="spreadsheet-table">
                <thead>
                  <tr>
                    <th style="width: 15%">Party Name</th>
                    <th style="width: 8%">Rate (₹)</th>
                    <th style="width: 9%">Dispatch</th>
                    <th style="width: 9%">Return</th>
                    <th style="width: 9%">Net Tkt</th>
                    <th style="width: 8%">Comm (₹)</th>
                    <th style="width: 8%">TDS (%)</th>
                    <th style="width: 11%">Net Pay</th>
                    <th style="width: 11%">Prev Bal</th>
                    <th style="width: 12%">Curr Bal</th>
                  </tr>
                </thead>
                <tbody id="lottery-grid-body">
                  <tr>
                    <td style="position: relative;">
                        <input type="text" class="spreadsheet-input party-input" placeholder="Party Name" autocomplete="off">
                        <div class="autocomplete-dropdown"></div>
                    </td>
                    <td><input type="number" class="spreadsheet-input rate-input" placeholder="0"></td>
                    <td><input type="number" class="spreadsheet-input dispatch-input" placeholder="0"></td>
                    <td><input type="number" class="spreadsheet-input return-input" placeholder="0"></td>
                    <td><input type="text" class="spreadsheet-input calc-field net-tkt-output" readonly value="0"></td>
                    <td><input type="number" class="spreadsheet-input comm-input" placeholder="0"></td>
                    <td><input type="number" class="spreadsheet-input tds-input" placeholder="0"></td>
                    <td><input type="text" class="spreadsheet-input calc-field net-pay-output text-success" readonly value="₹ 0.00"></td>
                    <td><input type="number" class="spreadsheet-input prev-bal-input" placeholder="0"></td>
                    <td><input type="text" class="spreadsheet-input calc-field curr-bal-output text-warning" readonly value="₹ 0.00"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button class="btn-secondary" id="btn-add-row">+ Add More Party</button>
          </div>
          <button class="btn-save" id="btn-save-dispatch">💾 Save All Dispatch Data</button>
        </div>
        `;

        this.initLogic();
    },

    initLogic: function() {
        const gridBody = document.getElementById('lottery-grid-body');
        if (!gridBody) return;

        gridBody.addEventListener('input', function(e) {
            if (e.target.classList.contains('party-input')) {
                const inputVal = e.target.value.toLowerCase();
                const dropdown = e.target.nextElementSibling;
                
                if (inputVal.length < 1) {
                    dropdown.style.display = 'none';
                    return;
                }

                const filteredParties = partiesDB.filter(p => 
                    p.category === 'Lottery' && p.name.toLowerCase().includes(inputVal)
                );

                if (filteredParties.length > 0) {
                    dropdown.innerHTML = filteredParties.map(p => 
                        `<div class="autocomplete-item" data-rate="${p.rate}" data-tds="${p.tds}" data-bal="${p.prevBal}">${p.name}</div>`
                    ).join('');
                    dropdown.style.display = 'block';
                } else {
                    dropdown.style.display = 'none';
                }
            } 
            else if (e.target.classList.contains('spreadsheet-input')) {
                const row = e.target.closest('tr');
                if (row) calculateRowUI(row);
                calculateTotalsUI();
            }
        });

        gridBody.addEventListener('click', function(e) {
            if (e.target.classList.contains('autocomplete-item')) {
                const row = e.target.closest('tr');
                row.querySelector('.party-input').value = e.target.innerText;
                row.querySelector('.rate-input').value = e.target.getAttribute('data-rate');
                row.querySelector('.tds-input').value = e.target.getAttribute('data-tds');
                row.querySelector('.prev-bal-input').value = e.target.getAttribute('data-bal');

                e.target.parentElement.style.display = 'none'; 
                calculateRowUI(row);
                calculateTotalsUI();
            }
        });

        document.addEventListener('click', function(e) {
            if (!e.target.classList.contains('party-input')) {
                document.querySelectorAll('.autocomplete-dropdown').forEach(d => d.style.display = 'none');
            }
        });

        document.getElementById('btn-add-row')?.addEventListener('click', () => {
            const newRow = `
                <tr>
                    <td style="position: relative;">
                        <input type="text" class="spreadsheet-input party-input" placeholder="Party Name" autocomplete="off">
                        <div class="autocomplete-dropdown"></div>
                    </td>
                    <td><input type="number" class="spreadsheet-input rate-input" placeholder="0"></td>
                    <td><input type="number" class="spreadsheet-input dispatch-input" placeholder="0"></td>
                    <td><input type="number" class="spreadsheet-input return-input" placeholder="0"></td>
                    <td><input type="text" class="spreadsheet-input calc-field net-tkt-output" readonly value="0"></td>
                    <td><input type="number" class="spreadsheet-input comm-input" placeholder="0"></td>
                    <td><input type="number" class="spreadsheet-input tds-input" placeholder="0"></td>
                    <td><input type="text" class="spreadsheet-input calc-field net-pay-output text-success" readonly value="₹ 0.00"></td>
                    <td><input type="number" class="spreadsheet-input prev-bal-input" placeholder="0"></td>
                    <td><input type="text" class="spreadsheet-input calc-field curr-bal-output text-warning" readonly value="₹ 0.00"></td>
                </tr>
            `;
            gridBody.insertAdjacentHTML('beforeend', newRow);
        });

        const fetchPartyBtn = document.getElementById('btn-fetch-party');
        const partyInput = document.getElementById('party-mobile-input');
        if (fetchPartyBtn && partyInput) {
            fetchPartyBtn.addEventListener('click', () => {
                const mobile = partyInput.value.trim();
                if (mobile.length >= 10) {
                    alert("Searching dispatch details for: " + mobile);
                } else {
                    alert("দয়া করে সঠিক মোবাইল নম্বর বা আইডি দিন।");
                }
            });
        }

        const saveBtn = document.getElementById('btn-save-dispatch');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                saveBtn.innerText = "⏳ Saving...";
                setTimeout(() => {
                    alert("✅ Dispatch Data Successfully Saved to Server!");
                    saveBtn.innerText = "💾 Save All Dispatch Data";
                }, 800);
            });
        }

        // 🟢 UPDATE: সম্পূর্ণ ক্যালকুলেশন লজিক LotteryCalcEngine-এ পাঠানো হলো
        function calculateRowUI(row) {
            // ১. UI থেকে ডেটা নিয়ে একটি অবজেক্ট তৈরি করা
            const rowData = {
                rate: row.querySelector('.rate-input').value,
                dispatchQty: row.querySelector('.dispatch-input').value,
                returnQty: row.querySelector('.return-input').value,
                commissionAmount: row.querySelector('.comm-input').value, 
                tdsRate: row.querySelector('.tds-input').value,
                previousOutstanding: row.querySelector('.prev-bal-input').value
            };

            // ২. কোর ইঞ্জিনকে কল করে হিসাব করানো (LotteryCalcEngine অবজেক্টটি যেন স্কোপে থাকে)
            // এটি ফ্রন্টএন্ডে থাকা কোনো লজিক ছাড়াই কোর লজিক ফাইল থেকে ফলাফল নিয়ে আসবে।
            if (typeof LotteryCalcEngine !== 'undefined') {
                const result = LotteryCalcEngine.calculateRow(rowData);

                // ৩. রেজাল্ট UI-তে বসিয়ে দেওয়া
                row.querySelector('.net-tkt-output').value = result.netTickets;
                row.querySelector('.net-pay-output').value = '₹ ' + result.finalAmount.toFixed(2);
                row.querySelector('.curr-bal-output').value = '₹ ' + result.currentBalance.toFixed(2);
            } else {
                console.error("LotteryCalcEngine is missing! Make sure it is imported.");
            }
        }

        // Total Calculation
        function calculateTotalsUI() {
            let tDisp = 0, tRet = 0, tNet = 0, tOut = 0;
            document.querySelectorAll('#lottery-grid-body tr').forEach(row => {
                tDisp += parseInt(row.querySelector('.dispatch-input').value) || 0;
                tRet += parseInt(row.querySelector('.return-input').value) || 0;
                tNet += parseFloat(row.querySelector('.net-pay-output').value.replace('₹ ', '')) || 0;
                tOut += parseFloat(row.querySelector('.curr-bal-output').value.replace('₹ ', '')) || 0;
            });
            document.getElementById('val-dispatch').innerText = tDisp;
            document.getElementById('val-return').innerText = tRet;
            document.getElementById('val-net').innerText = '₹ ' + tNet.toFixed(2);
            document.getElementById('val-outstanding').innerText = '₹ ' + tOut.toFixed(2);
        }
    }
};
