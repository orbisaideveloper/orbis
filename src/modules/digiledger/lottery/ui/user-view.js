// File: src/modules/digiledger/lottery/ui/user-view.js
// 📒 DigiLedger: Accounting & Ledger Micro-Frontend

window.LotteryUserUI = {
    // 🟢 এই ফাংশনটা কল হলেই লেজার মডিউল স্ক্রিনে ভেসে উঠবে
    mount: function() {
        // ১. মেইন ড্যাশবোর্ড লুকিয়ে ফেলা (সেফটি চেক)
        const platformRoot = document.getElementById('orbis-platform-root');
        if (platformRoot) platformRoot.style.display = 'none';

        // ২. লেজারের জন্য নিজস্ব ওয়ার্কস্পেস তৈরি করা (যদি না থাকে)
        let workspace = document.getElementById('lottery-user-workspace');
        if (!workspace) {
            workspace = document.createElement('div');
            workspace.id = 'lottery-user-workspace';
            document.body.appendChild(workspace);
        }
        
        // ৩. ওয়ার্কস্পেস ভিজিবল করা এবং নতুন লেজার ডিজাইন ইনজেক্ট করা
        workspace.style.display = 'block';
        workspace.innerHTML = `
            <style>
                /* 🎨 সম্পূর্ণ স্বাধীন CSS */
                .lottery-app-container { 
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
                    background: #f8fafc; z-index: 99999; overflow-y: auto; 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .lottery-top-nav { 
                    background: #ffffff; padding: 15px 20px; display: flex; 
                    align-items: center; justify-content: space-between; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 10;
                }
                .btn-back-dash { 
                    background: #e2e8f0; color: #0f172a; border: none; padding: 8px 16px; 
                    border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.9rem;
                    transition: background 0.2s;
                }
                .btn-back-dash:hover { background: #cbd5e1; }
                .lottery-main-content { padding: 20px; max-width: 600px; margin: 0 auto; }
                
                /* New Ledger Card Design */
                .ledger-card { 
                    background: white; padding: 25px; border-radius: 12px; 
                    box-shadow: 0 10px 25px rgba(0,0,0,0.05); border-top: 4px solid #138808; 
                }
                .input-group { margin-bottom: 18px; text-align: left; }
                .input-group label { display: block; font-size: 0.9rem; font-weight: 700; margin-bottom: 6px; color: #475569; }
                .input-group input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; box-sizing: border-box; background: #f8fafc; }
                .input-group input:focus { outline: none; border-color: #138808; background: white; }
                
                .calc-box { background: #f1f5f9; padding: 18px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #FF9933; }
                .calc-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.95rem; color: #334155; }
                .calc-total { font-weight: 900; font-size: 1.3rem; color: #0f172a; margin-top: 12px; border-top: 1px solid #cbd5e1; padding-top: 12px; }
                
                .btn-save { 
                    background: #138808; color: white; border: none; padding: 15px; width: 100%; 
                    border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; 
                    transition: 0.2s; box-shadow: 0 4px 6px rgba(19, 136, 8, 0.2); 
                }
                .btn-save:hover { background: #0f6c06; transform: translateY(-2px); }
            </style>

            <div class="lottery-app-container">
                <div class="lottery-top-nav">
                    <button class="btn-back-dash" onclick="window.LotteryUserUI.unmount()">← Back</button>
                    <h2 style="margin:0; color: #0f172a; font-size: 1.3rem;">📒 DigiLedger Entry</h2>
                    <div style="width: 60px;"></div> <!-- লেআউট ব্যালেন্সের জন্য -->
                </div>

                <div class="lottery-main-content">
                    <div class="ledger-card">
                        
                        <div class="input-group">
                            <label>Party Name / Agent 👤</label>
                            <input type="text" id="party-name" placeholder="Enter party name or ORB-ID">
                        </div>
                        
                        <div class="input-group">
                            <label>Ticket Rate (Per Ticket) 💵</label>
                            <input type="number" id="ticket-rate" value="10" placeholder="Rs. 10" oninput="window.LotteryUserUI.calculate()">
                        </div>
                        
                        <div style="display:flex; gap:15px;">
                            <div class="input-group" style="flex:1;">
                                <label>Dispatched 📦</label>
                                <input type="number" id="qty-dispatch" placeholder="0" oninput="window.LotteryUserUI.calculate()">
                            </div>
                            <div class="input-group" style="flex:1;">
                                <label>Returned ↩️</label>
                                <input type="number" id="qty-return" placeholder="0" oninput="window.LotteryUserUI.calculate()">
                            </div>
                        </div>
                        
                        <div class="input-group">
                            <label>Agent Commission (%) 💸</label>
                            <input type="number" id="commission-rate" value="5" placeholder="5%" oninput="window.LotteryUserUI.calculate()">
                        </div>

                        <!-- রিয়েল-টাইম ক্যালকুলেশন প্যানেল -->
                        <div class="calc-box">
                            <div class="calc-row"><span>Total Tickets Sold:</span> <span id="display-sold" style="font-weight:bold;">0</span></div>
                            <div class="calc-row"><span>Gross Amount:</span> <span id="display-gross">₹ 0.00</span></div>
                            <div class="calc-row"><span>Commission Amount:</span> <span id="display-comm" style="color:#ef4444;">- ₹ 0.00</span></div>
                            <div class="calc-row calc-total"><span>Net Payable:</span> <span id="display-net" style="color:#138808;">₹ 0.00</span></div>
                        </div>

                        <button class="btn-save" onclick="window.LotteryUserUI.saveData()">💾 Save Ledger Entry</button>
                    </div>
                </div>
            </div>
        `;

        // UI লোড হওয়ার সাথে সাথে একবার হিসাব আপডেট করা
        setTimeout(() => this.calculate(), 100);
    },

    // 🟢 রিয়েল-টাইম ক্যালকুলেশন লজিক
    calculate: function() {
        const rate = parseFloat(document.getElementById('ticket-rate').value) || 0;
        const dispatch = parseInt(document.getElementById('qty-dispatch').value) || 0;
        const returns = parseInt(document.getElementById('qty-return').value) || 0;
        const commRate = parseFloat(document.getElementById('commission-rate').value) || 0;

        let sold = dispatch - returns;
        if (sold < 0) sold = 0; // মাইনাস যাতে না হয়

        const gross = sold * rate;
        const commAmount = (gross * commRate) / 100;
        const net = gross - commAmount;

        // UI তে ডাটা বসানো
        document.getElementById('display-sold').innerText = sold;
        document.getElementById('display-gross').innerText = '₹ ' + gross.toFixed(2);
        document.getElementById('display-comm').innerText = '- ₹ ' + commAmount.toFixed(2);
        document.getElementById('display-net').innerText = '₹ ' + net.toFixed(2);
    },

    // 🟢 সেভ বাটন ক্লিক ইভেন্ট (ভবিষ্যতে ডাটাবেস এখানে কানেক্ট হবে)
    saveData: function() {
        const party = document.getElementById('party-name').value.trim();
        const net = document.getElementById('display-net').innerText;
        const sold = document.getElementById('display-sold').innerText;
        
        if(!party) {
            alert("⚠️ Please enter a Party Name!");
            return;
        }
        if(sold == 0) {
            alert("⚠️ No tickets sold to save!");
            return;
        }
        
        // ডামি অ্যালার্ট (ডাটাবেস যুক্ত হওয়ার আগ পর্যন্ত)
        alert(`✅ Ledger Entry Ready for: "${party}"\n\nTotal Sold: ${sold} tickets\nAmount to collect: ${net}\n\n(Supabase Backend will connect here!)`);
    },

    // 🔴 এই ফাংশনটা কল হলে মডিউল বন্ধ হয়ে আবার ড্যাশবোর্ডে ফিরে যাবে
    unmount: function() {
        const workspace = document.getElementById('lottery-user-workspace');
        if (workspace) workspace.style.display = 'none';

        if (window.orbisPlatform && typeof window.orbisPlatform.unmountModule === 'function') {
            window.orbisPlatform.unmountModule();
        } else {
            const platformRoot = document.getElementById('orbis-platform-root');
            if (platformRoot) platformRoot.style.display = 'flex'; 
        }
    }
};

// 🟢 স্ক্রিপ্টটি ইনজেক্ট হওয়ামাত্রই যেন UI অটোমেটিক চালু হয়
window.LotteryUserUI.mount();

// 🟢 প্ল্যাটফর্ম কোর-এর আগের রেন্ডার কমান্ডের সাথে সংযোগ রাখার জন্য (Bridge)
window.LotteryApp = { render: window.LotteryUserUI.mount };
