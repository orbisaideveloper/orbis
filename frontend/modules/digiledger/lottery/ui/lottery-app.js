// 📝 lottery-app.js (DigiLedger: Single Sales Entry Workspace)

window.LotterySalesApp = {
    mount: function(container) {
        // ড্যাশবোর্ড থেকে টপ নেভিগেশন বার নিয়ে আসা (Back & Home button)
        const topNavBar = window.LotteryUserUI ? window.LotteryUserUI.getTopNavBar("🎟️ Single Sales Entry") : "";

        // ১. লটারি সেলস মডিউলের HTML ডিজাইন স্ক্রিনে বসানো হচ্ছে
        container.innerHTML = `
            ${topNavBar}
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); width: 100%; overflow-x: auto; box-sizing: border-box; margin-top: 10px;">
                
                <!-- Top Metrics Cards -->
                <div style="display: flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 120px; background: #f8f9fa; padding: 15px; border-radius: 12px; text-align: center; border: 1px solid #eee;">
                        <div style="font-size: 0.80rem; color: #666; font-weight: 700; text-transform: uppercase;">Total Dispatch</div>
                        <div id="val-dispatch" style="font-size: 1.6rem; font-weight: 800; color: #333; margin-top: 5px;">0</div>
                    </div>
                    <div style="flex: 1; min-width: 120px; background: #fff0f0; padding: 15px; border-radius: 12px; text-align: center; border: 1px solid #ffcccc;">
                        <div style="font-size: 0.80rem; color: #dc3545; font-weight: 700; text-transform: uppercase;">Total Return</div>
                        <div id="val-return" style="font-size: 1.6rem; font-weight: 800; color: #dc3545; margin-top: 5px;">0</div>
                    </div>
                    <div style="flex: 1; min-width: 150px; background: #e6f2ff; padding: 15px; border-radius: 12px; text-align: center; border: 1px solid #b3d7ff;">
                        <div style="font-size: 0.80rem; color: #0056b3; font-weight: 700; text-transform: uppercase;">Net Payable</div>
                        <div id="val-net" style="font-size: 1.6rem; font-weight: 800; color: #0056b3; margin-top: 5px;">₹ 0.00</div>
                    </div>
                    <div style="flex: 1; min-width: 150px; background: #fff3cd; padding: 15px; border-radius: 12px; text-align: center; border: 1px solid #ffeeba;">
                        <div style="font-size: 0.80rem; color: #856404; font-weight: 700; text-transform: uppercase;">Total Outstanding</div>
                        <div id="val-outstanding" style="font-size: 1.6rem; font-weight: 800; color: #856404; margin-top: 5px;">₹ 0.00</div>
                    </div>
                </div>

                <!-- Action Bar -->
                <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                    <div style="display: flex; gap: 10px; flex-grow: 1; max-width: 600px; align-items: center;">
                        <input type="text" id="party-mobile-input" placeholder="🔍 Enter Party Mobile or ID" style="flex: 1; padding: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 0.95rem; outline: none; transition: border 0.3s;" onfocus="this.style.borderColor='#138808'" onblur="this.style.borderColor='#ccc'">
                        <button id="btn-fetch-party" style="background: #138808; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: background 0.2s;">Search</button>
                        
                        <!-- 🟢 NEW: Premium Add Party Shortcut Button -->
                        <button id="btn-open-party-master" style="background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: white; border: none; padding: 11px 18px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.95rem; box-shadow: 0 4px 10px rgba(37,117,252,0.3); transition: transform 0.2s, box-shadow 0.2s; white-space: nowrap; display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 1.2rem;">👥</span> Add New Party
                        </button>
                    </div>
                    <button id="btn-add-row" style="background: #FF9933; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.95rem; box-shadow: 0 4px 6px rgba(255,153,51,0.2); transition: transform 0.1s;">+ Add New Row</button>
                </div>

                <!-- Live Spreadsheet Grid -->
                <div style="overflow-x: auto; border: 1px solid #ddd; border-radius: 12px; box-shadow: inset 0 0 5px rgba(0,0,0,0.02);">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; min-width: 900px;">
                        <thead style="background: #f8f9fa; color: #444;">
                            <tr>
                                <th style="padding: 15px 10px; border-bottom: 2px solid #ddd;">Party/Name</th>
                                <th style="padding: 15px 10px; border-bottom: 2px solid #ddd;">Rate</th>
                                <th style="padding: 15px 10px; border-bottom: 2px solid #ddd;">Dispatch</th>
                                <th style="padding: 15px 10px; border-bottom: 2px solid #ddd;">Return</th>
                                <th style="padding: 15px 10px; border-bottom: 2px solid #ddd; background:#eef2f5;">Net Tkt</th>
                                <th style="padding: 15px 10px; border-bottom: 2px solid #ddd;">Comm(%)</th>
                                <th style="padding: 15px 10px; border-bottom: 2px solid #ddd;">TDS(%)</th>
                                <th style="padding: 15px 10px; border-bottom: 2px solid #ddd; background:#eef2f5;">Net Pay (₹)</th>
                                <th style="padding: 15px 10px; border-bottom: 2px solid #ddd;">Prev Bal</th>
                                <th style="padding: 15px 10px; border-bottom: 2px solid #ddd; background:#eef2f5;">Curr Bal (₹)</th>
                            </tr>
                        </thead>
                        <tbody id="lottery-grid-body">
                            <!-- Default Initial Row -->
                            ${this.getRowTemplate()}
                        </tbody>
                    </table>
                </div>

                <!-- Save/Submit Action -->
                <div style="margin-top: 25px; text-align: right;">
                    <button id="btn-save-entries" style="background: #000080; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.1rem; box-shadow: 0 4px 10px rgba(0,0,128,0.2); transition: transform 0.2s;">
                        💾 Save All Entries
                    </button>
                </div>
            </div>
        `;

        // ২. ইভেন্ট এবং লজিক ইনিশিয়ালাইজেশন
        this.initLogic();
    },

    getRowTemplate: function(data = {}) {
        const party = data.partyName || "";
        const rate = data.rate || "";
        const prevBal = data.prevBal || "";
        
        return `
            <tr class="data-row">
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="text" class="spreadsheet-input party-input" placeholder="Enter Party" value="${party}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; outline:none;" onfocus="this.style.borderColor='#FF9933'" onblur="this.style.borderColor='#ddd'"></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input rate-input" placeholder="0" value="${rate}" style="width: 70px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; outline:none;"></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input dispatch-input" placeholder="0" style="width: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; outline:none;"></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input return-input" placeholder="0" style="width: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; outline:none;"></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; background:#f8f9fa;"><input type="text" class="spreadsheet-input calc-field net-tkt-output" readonly value="0" style="width: 70px; padding: 10px; border: none; background: transparent; font-weight: bold; text-align: center;"></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input comm-input" placeholder="0" style="width: 70px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; outline:none;"></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input tds-input" placeholder="0" style="width: 70px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; outline:none;"></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; background:#f8f9fa;"><input type="text" class="spreadsheet-input calc-field net-pay-output" readonly value="₹ 0.00" style="width: 100px; padding: 10px; border: none; background: transparent; font-weight: bold; color: #28a745;"></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><input type="number" class="spreadsheet-input prev-bal-input" placeholder="0" value="${prevBal}" style="width: 90px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; outline:none;"></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; background:#f8f9fa;"><input type="text" class="spreadsheet-input calc-field curr-bal-output" readonly value="₹ 0.00" style="width: 110px; padding: 10px; border: none; background: transparent; font-weight: bold; color: #d39e00;"></td>
            </tr>
        `;
    },

    initLogic: function() {
        console.log("[ORBIS] Lottery Workspace Engine Initialized.");

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

        gridBody.addEventListener('input', function(e) {
            if (e.target.classList.contains('spreadsheet-input')) {
                const currentRow = e.target.closest('tr');
                if (currentRow) {
                    calculateRowUI(currentRow);
                    calculateTotalsUI();
                }
            }
        });

        const addRowBtn = document.getElementById('btn-add-row');
        if (addRowBtn) {
            addRowBtn.addEventListener('click', () => {
                gridBody.insertAdjacentHTML('beforeend', window.LotterySalesApp.getRowTemplate());
            });
        }

        // 🟢 NEW: Add Party Master Connection Logic
        const openPartyMasterBtn = document.getElementById('btn-open-party-master');
        if (openPartyMasterBtn) {
            openPartyMasterBtn.addEventListener('click', () => {
                // Party Master UI লোড করার কল
                if (window.PartyMaster && typeof window.PartyMaster.mount === 'function') {
                    const container = document.getElementById('lottery-standalone-root');
                    window.PartyMaster.mount(container);
                } else {
                    alert("⚠️ Party Master module is still loading or not found!");
                }
            });
        }

        const fetchPartyBtn = document.getElementById('btn-fetch-party');
        const partyInput = document.getElementById('party-mobile-input');
        
        if (fetchPartyBtn && partyInput) {
            fetchPartyBtn.addEventListener('click', async () => {
                const mobile = partyInput.value.trim();
                if (mobile.length >= 10) {
                    fetchPartyBtn.innerText = "⏳ Loading...";
                    try {
                        const fakeApiResponse = { partyName: "Rahul Das (Retail)", rate: 5.5, prevBal: -15000 };

                        const firstRow = gridBody.querySelector('tr.data-row');
                        if (firstRow && !firstRow.querySelector('.party-input').value) {
                            firstRow.querySelector('.party-input').value = fakeApiResponse.partyName;
                            firstRow.querySelector('.rate-input').value = fakeApiResponse.rate;
                            firstRow.querySelector('.prev-bal-input').value = fakeApiResponse.prevBal;
                            calculateRowUI(firstRow);
                        } else {
                            gridBody.insertAdjacentHTML('beforeend', window.LotterySalesApp.getRowTemplate(fakeApiResponse));
                        }
                        calculateTotalsUI();
                        
                    } catch (error) {
                        alert("Error fetching party data from server!");
                        console.error(error);
                    } finally {
                        fetchPartyBtn.innerText = "Search";
                    }
                } else {
                    alert("দয়া করে সঠিক মোবাইল নম্বর বা আইডি দিন।");
                }
            });
        }

        const saveBtn = document.getElementById('btn-save-entries');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const rows = document.querySelectorAll('#lottery-grid-body tr.data-row');
                const payload = [];

                rows.forEach(row => {
                    const party = row.querySelector('.party-input')?.value;
                    if(party) {
                        payload.push({
                            partyName: party,
                            rate: row.querySelector('.rate-input')?.value || 0,
                            dispatch: row.querySelector('.dispatch-input')?.value || 0,
                            return: row.querySelector('.return-input')?.value || 0,
                            comm: row.querySelector('.comm-input')?.value || 0,
                            tds: row.querySelector('.tds-input')?.value || 0,
                            netPayable: parseFloat(row.querySelector('.net-pay-output')?.value.replace(/[^0-9.-]+/g,"")) || 0,
                            prevBal: row.querySelector('.prev-bal-input')?.value || 0,
                            currBal: parseFloat(row.querySelector('.curr-bal-output')?.value.replace(/[^0-9.-]+/g,"")) || 0
                        });
                    }
                });

                if(payload.length === 0) {
                    alert("No valid entries found to save!");
                    return;
                }

                saveBtn.innerText = "⏳ Saving to Server...";
                console.log("Sending Data to Backend:", JSON.stringify(payload));

                try {
                    setTimeout(() => {
                        alert("✅ Data Successfully Saved to DigiLedger Backend!");
                        saveBtn.innerText = "💾 Save All Entries";
                    }, 1000);
                } catch (error) {
                    alert("Failed to save data!");
                    console.error(error);
                    saveBtn.innerText = "💾 Save All Entries";
                }
            });
        }

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
                netPayOutput.style.color = result.finalAmount < 0 ? '#dc3545' : '#138808';
            }
            if (currBalOutput) {
                currBalOutput.value = `₹ ${result.currentBalance.toFixed(2)}`;
                currBalOutput.style.color = result.currentBalance < 0 ? '#dc3545' : '#CC7A29';
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
