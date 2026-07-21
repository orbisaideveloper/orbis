// DigiLedger: Lottery Workspace Controller (ORBIS Integrated)

window.LotterySalesApp = {
    mount: function(container) {
        // ১. লটারি সেলস মডিউলের HTML ডিজাইন স্ক্রিনে বসানো হচ্ছে (Spreadsheet Style)
        container.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 100%; overflow-x: auto; box-sizing: border-box;">
                <h3 style="color: #0056b3; margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px;">🎟️ Lottery Sales Entry</h3>

                <!-- Top Metrics Cards -->
                <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 120px; background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #ddd;">
                        <div style="font-size: 0.85rem; color: #666; font-weight: bold;">Total Dispatch</div>
                        <div id="val-dispatch" style="font-size: 1.5rem; font-weight: bold; color: #333;">0</div>
                    </div>
                    <div style="flex: 1; min-width: 120px; background: #fff0f0; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #ffcccc;">
                        <div style="font-size: 0.85rem; color: #dc3545; font-weight: bold;">Total Return</div>
                        <div id="val-return" style="font-size: 1.5rem; font-weight: bold; color: #dc3545;">0</div>
                    </div>
                    <div style="flex: 1; min-width: 150px; background: #e6f2ff; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #b3d7ff;">
                        <div style="font-size: 0.85rem; color: #0056b3; font-weight: bold;">Net Payable</div>
                        <div id="val-net" style="font-size: 1.5rem; font-weight: bold; color: #0056b3;">₹ 0.00</div>
                    </div>
                    <div style="flex: 1; min-width: 150px; background: #fff3cd; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #ffeeba;">
                        <div style="font-size: 0.85rem; color: #856404; font-weight: bold;">Total Outstanding</div>
                        <div id="val-outstanding" style="font-size: 1.5rem; font-weight: bold; color: #856404;">₹ 0.00</div>
                    </div>
                </div>

                <!-- Action Bar -->
                <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="party-mobile-input" placeholder="Party Mobile/ID" style="padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 0.95rem;">
                        <button id="btn-fetch-party" style="background: #17a2b8; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">Search Party</button>
                    </div>
                    <button id="btn-add-row" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">+ Add New Row</button>
                </div>

                <!-- Live Spreadsheet Grid -->
                <div style="overflow-x: auto; border: 1px solid #ddd; border-radius: 8px;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; min-width: 800px;">
                        <thead style="background: #f1f1f1; color: #333;">
                            <tr>
                                <th style="padding: 12px 10px; border-bottom: 2px solid #ccc;">Party/Name</th>
                                <th style="padding: 12px 10px; border-bottom: 2px solid #ccc;">Rate</th>
                                <th style="padding: 12px 10px; border-bottom: 2px solid #ccc;">Dispatch</th>
                                <th style="padding: 12px 10px; border-bottom: 2px solid #ccc;">Return</th>
                                <th style="padding: 12px 10px; border-bottom: 2px solid #ccc; background:#e9ecef;">Net Tkt</th>
                                <th style="padding: 12px 10px; border-bottom: 2px solid #ccc;">Comm(%)</th>
                                <th style="padding: 12px 10px; border-bottom: 2px solid #ccc;">TDS(%)</th>
                                <th style="padding: 12px 10px; border-bottom: 2px solid #ccc; background:#e9ecef;">Net Pay (₹)</th>
                                <th style="padding: 12px 10px; border-bottom: 2px solid #ccc;">Prev Bal</th>
                                <th style="padding: 12px 10px; border-bottom: 2px solid #ccc; background:#e9ecef;">Curr Bal (₹)</th>
                            </tr>
                        </thead>
                        <tbody id="lottery-grid-body">
                            <!-- Default Row -->
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="text" class="spreadsheet-input party-input" placeholder="Enter Party" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;"></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input rate-input" placeholder="0" style="width: 70px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input dispatch-input" placeholder="0" style="width: 80px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input return-input" placeholder="0" style="width: 80px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee; background:#f8f9fa;"><input type="text" class="spreadsheet-input calc-field net-tkt-output" readonly value="0" style="width: 70px; padding: 8px; border: none; background: transparent; font-weight: bold; text-align: center;"></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input comm-input" placeholder="0" style="width: 70px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input tds-input" placeholder="0" style="width: 70px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee; background:#f8f9fa;"><input type="text" class="spreadsheet-input calc-field net-pay-output" readonly value="₹ 0.00" style="width: 100px; padding: 8px; border: none; background: transparent; font-weight: bold; color: #28a745;"></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input prev-bal-input" placeholder="0" style="width: 90px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee; background:#f8f9fa;"><input type="text" class="spreadsheet-input calc-field curr-bal-output" readonly value="₹ 0.00" style="width: 110px; padding: 8px; border: none; background: transparent; font-weight: bold; color: #d39e00;"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // ২. ডিজাইন বসানোর পর আপনার অরিজিনাল লজিক ফায়ার করা হচ্ছে
        this.initLogic();
    },

    initLogic: function() {
        console.log("[ORBIS] Lottery Workspace Engine Initialized.");

        // 🟢 Fallback Engine: যদি কোনো কারণে বাইরের ইঞ্জিন কাজ না করে, এটা লাইভ হিসাব করে দেবে!
        const CalcEngine = window.LotteryCalcEngine || {
            calculateRow: function(data) {
                const rate = parseFloat(data.rate) || 0;
                const dispatchQty = parseInt(data.dispatchQty) || 0;
                const returnQty = parseInt(data.returnQty) || 0;
                const commRate = parseFloat(data.commissionRate) || 0;
                const tdsRate = parseFloat(data.tdsRate) || 0;
                const prevBal = parseFloat(data.previousOutstanding) || 0;

                const netTickets = dispatchQty - returnQty;
                const gross = netTickets * rate;
                const commAmount = gross * (commRate / 100);
                const tdsAmount = commAmount * (tdsRate / 100);
                const finalAmount = gross - commAmount - tdsAmount;
                const currentBalance = prevBal + finalAmount;

                return { dispatchQty, returnQty, netTickets, finalAmount, currentBalance };
            }
        };

        const gridBody = document.getElementById('lottery-grid-body');
        if (!gridBody) return;

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

        // 🟢 ২. Add New Row: "Add New Row" বাটনে ক্লিক করলে নতুন ফাঁকা লাইন যোগ হবে
        const addRowBtn = document.getElementById('btn-add-row');
        if (addRowBtn) {
            addRowBtn.addEventListener('click', () => {
                const newRowHTML = `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="text" class="spreadsheet-input party-input" placeholder="Enter Party" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;"></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input rate-input" placeholder="0" style="width: 70px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input dispatch-input" placeholder="0" style="width: 80px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input return-input" placeholder="0" style="width: 80px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee; background:#f8f9fa;"><input type="text" class="spreadsheet-input calc-field net-tkt-output" readonly value="0" style="width: 70px; padding: 8px; border: none; background: transparent; font-weight: bold; text-align: center;"></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input comm-input" placeholder="0" style="width: 70px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input tds-input" placeholder="0" style="width: 70px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee; background:#f8f9fa;"><input type="text" class="spreadsheet-input calc-field net-pay-output" readonly value="₹ 0.00" style="width: 100px; padding: 8px; border: none; background: transparent; font-weight: bold; color: #28a745;"></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input prev-bal-input" placeholder="0" style="width: 90px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee; background:#f8f9fa;"><input type="text" class="spreadsheet-input calc-field curr-bal-output" readonly value="₹ 0.00" style="width: 110px; padding: 8px; border: none; background: transparent; font-weight: bold; color: #d39e00;"></td>
                    </tr>
                `;
                gridBody.insertAdjacentHTML('beforeend', newRowHTML);
            });
        }

        // 🟢 ৩. Party Search Module
        const fetchPartyBtn = document.getElementById('btn-fetch-party');
        const partyInput = document.getElementById('party-mobile-input');
        
        if (fetchPartyBtn && partyInput) {
            fetchPartyBtn.addEventListener('click', () => {
                const mobile = partyInput.value.trim();
                if (mobile.length >= 10) {
                    console.log("Searching Party: " + mobile);
                    alert("Searching details for: " + mobile);
                } else {
                    alert("দয়া করে সঠিক ১০ ডিজিটের মোবাইল নম্বর দিন।");
                }
            });
        }

        // 🟢 ৪. Core calculation functions
        function calculateRowUI(row) {
            const rowData = {
                rate: row.querySelector('.rate-input')?.value,
                dispatchQty: row.querySelector('.dispatch-input')?.value,
                returnQty: row.querySelector('.return-input')?.value,
                commissionRate: row.querySelector('.comm-input')?.value,
                tdsRate: row.querySelector('.tds-input')?.value,
                previousOutstanding: row.querySelector('.prev-bal-input')?.value
            };

            const result = CalcEngine.calculateRow(rowData);

            const netTktOutput = row.querySelector('.net-tkt-output');
            const netPayOutput = row.querySelector('.net-pay-output');
            const currBalOutput = row.querySelector('.curr-bal-output');

            if (netTktOutput) {
                netTktOutput.value = result.netTickets;
                netTktOutput.style.color = result.netTickets < 0 ? '#dc3545' : '#333';
            }

            if (netPayOutput) {
                netPayOutput.value = `₹ ${result.finalAmount.toFixed(2)}`;
                netPayOutput.style.color = result.finalAmount < 0 ? '#dc3545' : '#28a745';
            }

            if (currBalOutput) {
                currBalOutput.value = `₹ ${result.currentBalance.toFixed(2)}`;
                currBalOutput.style.color = result.currentBalance < 0 ? '#dc3545' : '#d39e00';
            }
        }

        function calculateTotalsUI() {
            const rows = document.querySelectorAll('#lottery-grid-body tr');
            let totalDispatch = 0, totalReturn = 0, totalNetPayable = 0, totalOutstanding = 0;

            rows.forEach(row => {
                const rowData = {
                    rate: row.querySelector('.rate-input')?.value,
                    dispatchQty: row.querySelector('.dispatch-input')?.value,
                    returnQty: row.querySelector('.return-input')?.value,
                    commissionRate: row.querySelector('.comm-input')?.value,
                    tdsRate: row.querySelector('.tds-input')?.value,
                    previousOutstanding: row.querySelector('.prev-bal-input')?.value
                };
                const result = CalcEngine.calculateRow(rowData);
                
                totalDispatch += result.dispatchQty;
                totalReturn += result.returnQty;
                totalNetPayable += result.finalAmount;
                totalOutstanding += result.currentBalance;
            });

            document.getElementById('val-dispatch').innerText = totalDispatch;
            document.getElementById('val-return').innerText = totalReturn;
            document.getElementById('val-net').innerText = `₹ ${totalNetPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            document.getElementById('val-outstanding').innerText = `₹ ${totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    }
};
